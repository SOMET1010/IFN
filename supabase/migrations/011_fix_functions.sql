-- Migration pour corriger les fonctions défectueuses et ajouter la gestion d'erreurs

-- 1. Correction de la fonction get_dashboard_stats pour gérer les tables manquantes
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_user_id UUID)
RETURNS TABLE(
    total_orders INTEGER,
    completed_orders INTEGER,
    total_products INTEGER,
    active_products INTEGER,
    total_revenue DECIMAL(15,2),
    avg_order_value DECIMAL(15,2),
    total_harvests INTEGER,
    total_sales INTEGER,
    harvest_quantity DECIMAL(15,2),
    low_stock_count INTEGER
) AS $$
BEGIN
    -- Vérifier si les tables existent avant de les interroger
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'producer_harvests' AND table_schema = 'public') THEN
        RETURN QUERY
        SELECT
            COALESCE(COUNT(DISTINCT o.id), 0)::INTEGER,
            COALESCE(COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END), 0)::INTEGER,
            COALESCE(COUNT(DISTINCT p.id), 0)::INTEGER,
            COALESCE(COUNT(DISTINCT CASE WHEN p.is_active = true THEN p.id END), 0)::INTEGER,
            COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.final_amount ELSE 0 END), 0)::DECIMAL(15,2),
            COALESCE(AVG(CASE WHEN o.status = 'delivered' THEN o.final_amount ELSE NULL END), 0)::DECIMAL(15,2),
            COALESCE((SELECT COUNT(*) FROM public.producer_harvests ph WHERE ph.producer_id = pp.id), 0)::INTEGER,
            COALESCE((SELECT COUNT(*) FROM public.producer_sales ps WHERE ps.producer_id = pp.id), 0)::INTEGER,
            COALESCE((SELECT COALESCE(SUM(ph.quantity), 0) FROM public.producer_harvests ph WHERE ph.producer_id = pp.id), 0)::DECIMAL(15,2),
            COALESCE(COUNT(DISTINCT CASE WHEN p.stock_quantity <= p.low_stock_threshold THEN p.id END), 0)::INTEGER
        FROM public.producer_profiles pp
        LEFT JOIN public.products p ON pp.id = p.producer_id
        LEFT JOIN public.orders o ON p.id = o.product_id AND o.seller_id = p_user_id
        WHERE pp.user_id = p_user_id;
    ELSE
        -- Fallback si les tables n'existent pas encore
        RETURN QUERY
        SELECT
            COALESCE(COUNT(DISTINCT o.id), 0)::INTEGER,
            COALESCE(COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END), 0)::INTEGER,
            COALESCE(COUNT(DISTINCT p.id), 0)::INTEGER,
            COALESCE(COUNT(DISTINCT CASE WHEN p.is_active = true THEN p.id END), 0)::INTEGER,
            COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.final_amount ELSE 0 END), 0)::DECIMAL(15,2),
            COALESCE(AVG(CASE WHEN o.status = 'delivered' THEN o.final_amount ELSE NULL END), 0)::DECIMAL(15,2),
            0::INTEGER,
            0::INTEGER,
            0::DECIMAL(15,2),
            COALESCE(COUNT(DISTINCT CASE WHEN p.stock_quantity <= p.low_stock_threshold THEN p.id END), 0)::INTEGER
        FROM public.producer_profiles pp
        LEFT JOIN public.products p ON pp.id = p.producer_id
        LEFT JOIN public.orders o ON p.id = o.product_id AND o.seller_id = p_user_id
        WHERE pp.user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Amélioration de la fonction de gestion des stocks avec meilleure gestion d'erreurs
CREATE OR REPLACE FUNCTION public.update_product_stock_after_order()
RETURNS TRIGGER AS $$
DECLARE
    product_record RECORD;
    new_stock DECIMAL(10,2);
    stock_alert_triggered BOOLEAN := FALSE;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Pour les nouvelles commandes, vérifier et mettre à jour le stock
        SELECT * INTO product_record FROM public.products WHERE id = NEW.product_id;

        IF product_record IS NOT NULL THEN
            -- Calculer le nouveau stock avec protection contre les valeurs négatives
            new_stock := GREATEST(0, product_record.stock_quantity - NEW.quantity);

            -- Mettre à jour le stock
            UPDATE public.products
            SET stock_quantity = new_stock,
                updated_at = NOW()
            WHERE id = NEW.product_id;

            -- Vérifier si le stock est bas et déclencher une alerte si nécessaire
            IF new_stock <= product_record.low_stock_threshold AND product_record.low_stock_threshold > 0 THEN
                stock_alert_triggered := TRUE;

                -- Créer une notification de stock bas
                INSERT INTO public.notifications (
                    user_id,
                    type,
                    title,
                    message,
                    data,
                    priority,
                    created_at
                ) VALUES (
                    (SELECT COALESCE(producer_id, cooperative_id, merchant_id) FROM public.products WHERE id = NEW.product_id),
                    'low_stock',
                    'Stock bas pour ' || product_record.name,
                    'Le stock de ' || product_record.name || ' est bas. Stock actuel: ' || new_stock || ' ' || product_record.unit,
                    jsonb_build_object(
                        'product_id', NEW.product_id,
                        'current_stock', new_stock,
                        'low_threshold', product_record.low_stock_threshold,
                        'unit', product_record.unit
                    ),
                    'high',
                    NOW()
                ) ON CONFLICT DO NOTHING;
            END IF;
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Pour les mises à jour de commande, calculer la différence de quantité
        IF OLD.quantity IS DISTINCT FROM NEW.quantity THEN
            SELECT * INTO product_record FROM public.products WHERE id = NEW.product_id;

            IF product_record IS NOT NULL THEN
                -- Calculer la différence et ajuster le stock en conséquence
                DECLARE
                    quantity_diff DECIMAL(10,2) := COALESCE(NEW.quantity, 0) - COALESCE(OLD.quantity, 0);
                BEGIN
                    -- Ajuster le stock (protégé contre les valeurs négatives)
                    new_stock := GREATEST(0, product_record.stock_quantity - quantity_diff);

                    UPDATE public.products
                    SET stock_quantity = new_stock,
                        updated_at = NOW()
                    WHERE id = NEW.product_id;

                    -- Vérifier le stock bas
                    IF new_stock <= product_record.low_stock_threshold AND product_record.low_stock_threshold > 0 THEN
                        stock_alert_triggered := TRUE;

                        INSERT INTO public.notifications (
                            user_id,
                            type,
                            title,
                            message,
                            data,
                            priority,
                            created_at
                        ) VALUES (
                            (SELECT COALESCE(producer_id, cooperative_id, merchant_id) FROM public.products WHERE id = NEW.product_id),
                            'low_stock',
                            'Stock bas pour ' || product_record.name,
                            'Le stock de ' || product_record.name || ' est bas. Stock actuel: ' || new_stock || ' ' || product_record.unit,
                            jsonb_build_object(
                                'product_id', NEW.product_id,
                                'current_stock', new_stock,
                                'low_threshold', product_record.low_stock_threshold,
                                'unit', product_record.unit
                            ),
                            'high',
                            NOW()
                        ) ON CONFLICT DO NOTHING;
                    END IF;
                END;
            END IF;
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        -- Pour les suppressions de commande, restaurer le stock
        SELECT * INTO product_record FROM public.products WHERE id = OLD.product_id;

        IF product_record IS NOT NULL THEN
            UPDATE public.products
            SET stock_quantity = product_record.stock_quantity + OLD.quantity,
                updated_at = NOW()
            WHERE id = OLD.product_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
EXCEPTION
    WHEN OTHERS THEN
        -- Logger l'erreur mais ne pas bloquer la transaction
        RAISE WARNING 'Erreur dans update_product_stock_after_order: %', SQLERRM;
        RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 3. Amélioration de la fonction de calcul des statistiques de marketplace
CREATE OR REPLACE FUNCTION public.calculate_marketplace_stats()
RETURNS TABLE(
    total_products INTEGER,
    active_products INTEGER,
    total_merchants INTEGER,
    total_producers INTEGER,
    total_cooperatives INTEGER,
    avg_product_price DECIMAL(15,2),
    most_popular_category TEXT,
    total_reviews INTEGER,
    avg_rating DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH
    product_stats AS (
        SELECT
            COUNT(*) as total_count,
            COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
            AVG(unit_price) as avg_price
        FROM public.products
        WHERE is_active = true
    ),
    user_stats AS (
        SELECT
            COUNT(CASE WHEN role = 'merchant' THEN 1 END) as merchant_count,
            COUNT(CASE WHEN role = 'producer' THEN 1 END) as producer_count,
            COUNT(CASE WHEN role = 'cooperative' THEN 1 END) as cooperative_count
        FROM public.users
        WHERE status = 'active'
    ),
    category_stats AS (
        SELECT
            category,
            COUNT(*) as category_count
        FROM public.products
        WHERE is_active = true
        GROUP BY category
        ORDER BY category_count DESC
        LIMIT 1
    ),
    review_stats AS (
        SELECT
            COUNT(*) as review_count,
            AVG(rating) as avg_rating_val
        FROM public.reviews
        WHERE status = 'approved'
    )
    SELECT
        COALESCE(ps.total_count, 0)::INTEGER,
        COALESCE(ps.active_count, 0)::INTEGER,
        COALESCE(us.merchant_count, 0)::INTEGER,
        COALESCE(us.producer_count, 0)::INTEGER,
        COALESCE(us.cooperative_count, 0)::INTEGER,
        COALESCE(ps.avg_price, 0)::DECIMAL(15,2),
        COALESCE(cs.category, 'N/A')::TEXT,
        COALESCE(rs.review_count, 0)::INTEGER,
        COALESCE(rs.avg_rating_val, 0)::DECIMAL(3,2)
    FROM product_stats ps
    CROSS JOIN user_stats us
    CROSS JOIN category_stats cs
    CROSS JOIN review_stats rs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fonction améliorée pour la vérification des données avec gestion d'erreurs
CREATE OR REPLACE FUNCTION public.verify_data_integrity()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    issues_count INTEGER,
    details TEXT
) AS $$
BEGIN
    -- Vérification de l'intégrité des produits
    RETURN QUERY
    SELECT
        'Produits sans prix valide' as check_name,
        CASE WHEN COUNT(*) > 0 THEN 'FAILED' ELSE 'PASSED' END as status,
        COUNT(*) as issues_count,
        'Produits avec unit_price <= 0' as details
    FROM public.products
    WHERE unit_price <= 0 OR wholesale_price <= 0 OR retail_price <= 0;

    -- Vérification des quantités de stock
    RETURN QUERY
    SELECT
        'Stock négatif' as check_name,
        CASE WHEN COUNT(*) > 0 THEN 'FAILED' ELSE 'PASSED' END as status,
        COUNT(*) as issues_count,
        'Produits avec stock_quantity < 0' as details
    FROM public.products
    WHERE stock_quantity < 0;

    -- Vérification des commandes sans éléments
    RETURN QUERY
    SELECT
        'Commandes sans éléments' as check_name,
        CASE WHEN COUNT(*) > 0 THEN 'FAILED' ELSE 'PASSED' END as status,
        COUNT(*) as issues_count,
        'Commandes sans order_items associés' as details
    FROM public.orders o
    LEFT JOIN public.order_items oi ON o.id = oi.order_id
    WHERE oi.id IS NULL;

    -- Vérification des utilisateurs sans profils
    RETURN QUERY
    SELECT
        'Utilisateurs sans profils' as check_name,
        CASE WHEN COUNT(*) > 0 THEN 'FAILED' ELSE 'PASSED' END as status,
        COUNT(*) as issues_count,
        'Utilisateurs sans profil correspondant' as details
    FROM public.users u
    LEFT JOIN public.merchant_profiles mp ON u.id = mp.user_id
    LEFT JOIN public.producer_profiles pp ON u.id = pp.user_id
    WHERE u.role IN ('merchant', 'producer')
    AND mp.id IS NULL AND pp.id IS NULL;

    -- Vérification des relations marchands-coopératives
    RETURN QUERY
    SELECT
        'Relations marchands-coopératives invalides' as check_name,
        CASE WHEN COUNT(*) > 0 THEN 'FAILED' ELSE 'PASSED' END as status,
        COUNT(*) as issues_count,
        'Relations avec marchands ou coopératives inexistants' as details
    FROM public.merchant_cooperative_relations r
    LEFT JOIN public.merchant_profiles mp ON r.merchant_id = mp.id
    LEFT JOIN public.cooperatives c ON r.cooperative_id = c.id
    WHERE mp.id IS NULL OR c.id IS NULL;

    -- Vérification des commandes d'approvisionnement
    RETURN QUERY
    SELECT
        'Commandes d''approvisionnement invalides' as check_name,
        CASE WHEN COUNT(*) > 0 THEN 'FAILED' ELSE 'PASSED' END as status,
        COUNT(*) as issues_count,
        'Commandes sans acheteur ou vendeur valide' as details
    FROM public.supply_orders so
    LEFT JOIN public.users buyer ON so.buyer_id = buyer.id
    LEFT JOIN public.users seller ON so.seller_id = seller.id
    WHERE buyer.id IS NULL OR seller.id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Création d'une fonction de validation système complète
CREATE OR REPLACE FUNCTION public.system_health_check()
RETURNS TABLE(
    component TEXT,
    status TEXT,
    message TEXT,
    details JSONB
) AS $$
DECLARE
    table_count INTEGER;
    rls_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
    user_count INTEGER;
    product_count INTEGER;
    order_count INTEGER;
    issue_count INTEGER;
BEGIN
    -- Compter les tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

    -- Compter les tables avec RLS
    SELECT COUNT(*) INTO rls_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = tables.table_name
    );

    -- Compter les fonctions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public';

    -- Compter les triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public';

    -- Compter les utilisateurs
    SELECT COUNT(*) INTO user_count FROM public.users WHERE status = 'active';

    -- Compter les produits
    SELECT COUNT(*) INTO product_count FROM public.products WHERE is_active = true;

    -- Compter les commandes
    SELECT COUNT(*) INTO order_count FROM public.orders;

    -- Compter les problèmes d'intégrité
    SELECT COUNT(*) INTO issue_count FROM public.verify_data_integrity() WHERE status = 'FAILED';

    -- Retourner les résultats
    RETURN QUERY
    SELECT
        'Base de données' as component,
        CASE WHEN table_count >= 15 THEN 'HEALTHY' ELSE 'WARNING' END as status,
        table_count || ' tables trouvées, ' || rls_count || ' avec RLS' as message,
        jsonb_build_object(
            'tables', table_count,
            'rls_enabled', rls_count,
            'functions', function_count,
            'triggers', trigger_count
        ) as details
    UNION ALL
    SELECT
        'Données' as component,
        CASE WHEN user_count >= 10 AND product_count >= 5 THEN 'HEALTHY' ELSE 'WARNING' END as status,
        user_count || ' utilisateurs, ' || product_count || ' produits, ' || order_count || ' commandes' as message,
        jsonb_build_object(
            'users', user_count,
            'products', product_count,
            'orders', order_count
        ) as details
    UNION ALL
    SELECT
        'Intégrité' as component,
        CASE WHEN issue_count = 0 THEN 'HEALTHY' ELSE 'ERROR' END as status,
        CASE WHEN issue_count = 0 THEN 'Aucun problème détecté' ELSE issue_count || ' problèmes détectés' END as message,
        jsonb_build_object('issues', issue_count) as details
    UNION ALL
    SELECT
        'Sécurité' as component,
        CASE WHEN rls_count >= 10 THEN 'HEALTHY' ELSE 'WARNING' END as status,
        rls_count || ' tables protégées par RLS sur ' || table_count as message,
        jsonb_build_object('rls_coverage', ROUND((rls_count::FLOAT / table_count::FLOAT) * 100, 2)) as details;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;