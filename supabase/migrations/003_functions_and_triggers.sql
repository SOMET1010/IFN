-- Fonctions et triggers avancés pour la plateforme d'inclusion numérique

-- Fonction pour créer un profil utilisateur après l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        status,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'merchant')::user_role,
        'pending',
        NOW(),
        NOW()
    );

    -- Créer le panier pour le nouvel utilisateur
    INSERT INTO public.carts (user_id, total_items, total_amount, created_at, updated_at)
    VALUES (NEW.id, 0, 0, NOW(), NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil utilisateur après l'inscription
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour le profil utilisateur dans auth.users
CREATE OR REPLACE FUNCTION public.update_auth_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
        'role', NEW.role,
        'name', NEW.name,
        'status', NEW.status,
        'location', NEW.location,
        'phone', NEW.phone
    )
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_auth_user_metadata_trigger
    AFTER UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_auth_user_metadata();

-- Fonction pour calculer les statistiques du dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_user_id UUID)
RETURNS TABLE(
    offers INTEGER,
    harvests INTEGER,
    sales INTEGER,
    revenue DECIMAL(15,2),
    stocks INTEGER,
    orders INTEGER,
    payments INTEGER,
    members INTEGER,
    distribution_rate DECIMAL(5,2)
) AS $$
DECLARE
    user_role user_role;
BEGIN
    SELECT role INTO user_role FROM public.users WHERE id = p_user_id;

    IF user_role = 'producer' THEN
        RETURN QUERY
        SELECT
            COALESCE((SELECT COUNT(*) FROM public.producer_offers WHERE producer_id =
                     (SELECT id FROM public.producer_profiles WHERE user_id = p_user_id)), 0) AS offers,
            COALESCE((SELECT COUNT(*) FROM public.producer_harvests WHERE producer_id =
                     (SELECT id FROM public.producer_profiles WHERE user_id = p_user_id)), 0) AS harvests,
            COALESCE((SELECT COUNT(*) FROM public.producer_sales WHERE producer_id =
                     (SELECT id FROM public.producer_profiles WHERE user_id = p_user_id)), 0) AS sales,
            COALESCE((SELECT COALESCE(SUM(total_price), 0) FROM public.producer_sales WHERE producer_id =
                     (SELECT id FROM public.producer_profiles WHERE user_id = p_user_id)), 0) AS revenue,
            COALESCE((SELECT COUNT(*) FROM public.products WHERE producer_id =
                     (SELECT id FROM public.producer_profiles WHERE user_id = p_user_id) AND is_active = true), 0) AS stocks,
            COALESCE((SELECT COUNT(*) FROM public.orders WHERE seller_id = p_user_id), 0) AS orders,
            COALESCE((SELECT COUNT(*) FROM public.payments WHERE
                     order_id IN (SELECT id FROM public.orders WHERE seller_id = p_user_id)), 0) AS payments,
            0 AS members,
            0 AS distribution_rate;

    ELSIF user_role = 'merchant' THEN
        RETURN QUERY
        SELECT
            0 AS offers,
            0 AS harvests,
            COALESCE((SELECT COUNT(*) FROM public.orders WHERE buyer_id = p_user_id AND status = 'delivered'), 0) AS sales,
            COALESCE((SELECT COALESCE(SUM(final_amount), 0) FROM public.orders WHERE buyer_id = p_user_id AND status = 'delivered'), 0) AS revenue,
            COALESCE((SELECT COUNT(*) FROM public.products WHERE merchant_id =
                     (SELECT id FROM public.merchant_profiles WHERE user_id = p_user_id) AND is_active = true), 0) AS stocks,
            COALESCE((SELECT COUNT(*) FROM public.orders WHERE buyer_id = p_user_id), 0) AS orders,
            COALESCE((SELECT COUNT(*) FROM public.payments WHERE
                     order_id IN (SELECT id FROM public.orders WHERE buyer_id = p_user_id)), 0) AS payments,
            0 AS members,
            0 AS distribution_rate;

    ELSIF user_role = 'cooperative' THEN
        RETURN QUERY
        SELECT
            0 AS offers,
            0 AS harvests,
            COALESCE((SELECT COUNT(*) FROM public.orders WHERE seller_id = p_user_id AND status = 'delivered'), 0) AS sales,
            COALESCE((SELECT COALESCE(SUM(final_amount), 0) FROM public.orders WHERE seller_id = p_user_id AND status = 'delivered'), 0) AS revenue,
            COALESCE((SELECT COUNT(*) FROM public.products WHERE cooperative_id =
                     (SELECT id FROM public.cooperatives WHERE id IN
                     (SELECT cooperative_id FROM public.cooperative_members WHERE user_id = p_user_id))), 0) AS stocks,
            COALESCE((SELECT COUNT(*) FROM public.orders WHERE seller_id = p_user_id), 0) AS orders,
            COALESCE((SELECT COUNT(*) FROM public.payments WHERE
                     order_id IN (SELECT id FROM public.orders WHERE seller_id = p_user_id)), 0) AS payments,
            COALESCE((SELECT COUNT(*) FROM public.cooperative_members
                     WHERE cooperative_id = (SELECT id FROM public.cooperatives WHERE id IN
                     (SELECT cooperative_id FROM public.cooperative_members WHERE user_id = p_user_id))), 0) AS members,
            COALESCE((SELECT CASE WHEN COUNT(*) > 0 THEN
                     (SELECT COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM public.cooperative_members WHERE cooperative_id =
                     (SELECT id FROM public.cooperatives WHERE id IN
                     (SELECT cooperative_id FROM public.cooperative_members WHERE user_id = p_user_id))) * 100
                     ELSE 0 END FROM public.orders WHERE seller_id = p_user_id AND status = 'delivered'), 0) AS distribution_rate;

    ELSIF user_role = 'admin' THEN
        RETURN QUERY
        SELECT
            (SELECT COUNT(*) FROM public.producer_offers WHERE status = 'en_cours') AS offers,
            (SELECT COUNT(*) FROM public.producer_harvests) AS harvests,
            (SELECT COUNT(*) FROM public.orders WHERE status = 'delivered') AS sales,
            (SELECT COALESCE(SUM(final_amount), 0) FROM public.orders WHERE status = 'delivered') AS revenue,
            (SELECT COUNT(*) FROM public.products WHERE is_active = true) AS stocks,
            (SELECT COUNT(*) FROM public.orders) AS orders,
            (SELECT COUNT(*) FROM public.payments) AS payments,
            (SELECT COUNT(*) FROM public.users WHERE role IN ('merchant', 'producer', 'cooperative')) AS members,
            0 AS distribution_rate;

    ELSE
        RETURN QUERY SELECT 0, 0, 0, 0, 0, 0, 0, 0, 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour gérer le stock automatiquement
CREATE OR REPLACE FUNCTION public.update_product_stock_after_order()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Réduire le stock lors de la création d'une commande
        UPDATE public.products
        SET stock_quantity = stock_quantity - (SELECT COALESCE(SUM(quantity), 0) FROM public.order_items WHERE order_id = NEW.id),
            updated_at = NOW()
        WHERE id IN (SELECT product_id FROM public.order_items WHERE order_id = NEW.id);

    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
            -- Restituer le stock lors de l'annulation d'une commande
            UPDATE public.products
            SET stock_quantity = stock_quantity + (SELECT COALESCE(SUM(quantity), 0) FROM public.order_items WHERE order_id = NEW.id),
                updated_at = NOW()
            WHERE id IN (SELECT product_id FROM public.order_items WHERE order_id = NEW.id);

        ELSIF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
            -- Réduire à nouveau le stock si la commande est réactivée
            UPDATE public.products
            SET stock_quantity = stock_quantity - (SELECT COALESCE(SUM(quantity), 0) FROM public.order_items WHERE order_id = NEW.id),
                updated_at = NOW()
            WHERE id IN (SELECT product_id FROM public.order_items WHERE order_id = NEW.id);
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        -- Restituer le stock lors de la suppression d'une commande
        UPDATE public.products
        SET stock_quantity = stock_quantity + (SELECT COALESCE(SUM(quantity), 0) FROM public.order_items WHERE order_id = OLD.id),
            updated_at = NOW()
        WHERE id IN (SELECT product_id FROM public.order_items WHERE order_id = OLD.id);
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER manage_product_stock_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_product_stock_after_order();

-- Fonction pour envoyer des notifications automatiques
CREATE OR REPLACE FUNCTION public.send_order_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Notifier le vendeur d'une nouvelle commande
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority,
            created_at
        )
        VALUES (
            NEW.seller_id,
            'new_order',
            'Nouvelle commande reçue',
            'Vous avez reçu une nouvelle commande #' || NEW.order_number,
            jsonb_build_object(
                'order_id', NEW.id,
                'order_number', NEW.order_number,
                'total_amount', NEW.final_amount
            ),
            'high',
            NOW()
        );

        -- Notifier l'acheteur de la confirmation de commande
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority,
            created_at
        )
        VALUES (
            NEW.buyer_id,
            'order_confirmation',
            'Commande confirmée',
            'Votre commande #' || NEW.order_number || ' a été confirmée',
            jsonb_build_object(
                'order_id', NEW.id,
                'order_number', NEW.order_number,
                'total_amount', NEW.final_amount
            ),
            'normal',
            NOW()
        );

    ELSIF TG_OP = 'UPDATE' THEN
        -- Notifier du changement de statut de la commande
        IF OLD.status != NEW.status THEN
            INSERT INTO public.notifications (
                user_id,
                type,
                title,
                message,
                data,
                priority,
                created_at
            )
            VALUES (
                NEW.buyer_id,
                'order_status_update',
                'Mise à jour de commande',
                'Votre commande #' || NEW.order_number || ' est maintenant ' || NEW.status,
                jsonb_build_object(
                    'order_id', NEW.id,
                    'order_number', NEW.order_number,
                    'old_status', OLD.status,
                    'new_status', NEW.status
                ),
                'normal',
                NOW()
            );
        END IF;

        -- Notifier du changement de statut de paiement
        IF OLD.payment_status != NEW.payment_status THEN
            INSERT INTO public.notifications (
                user_id,
                type,
                title,
                message,
                data,
                priority,
                created_at
            )
            VALUES (
                NEW.buyer_id,
                'payment_status_update',
                'Mise à jour de paiement',
                'Le paiement pour votre commande #' || NEW.order_number || ' est ' || NEW.payment_status,
                jsonb_build_object(
                    'order_id', NEW.id,
                    'order_number', NEW.order_number,
                    'old_payment_status', OLD.payment_status,
                    'new_payment_status', NEW.payment_status
                ),
                'high',
                NOW()
            );
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER send_order_notification_trigger
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.send_order_notification();

-- Fonction pour vérifier le stock minimum et envoyer des alertes
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS VOID AS $$
DECLARE
    low_stock_products RECORD;
BEGIN
    FOR low_stock_products IN
        SELECT p.id, p.name, p.stock_quantity, p.minimum_stock,
               COALESCE(mp.user_id, pp.user_id, cp.user_id) as owner_id
        FROM public.products p
        LEFT JOIN public.merchant_profiles mp ON p.merchant_id = mp.id
        LEFT JOIN public.producer_profiles pp ON p.producer_id = pp.id
        LEFT JOIN public.cooperatives c ON p.cooperative_id = c.id
        LEFT JOIN public.cooperative_members cm ON c.id = cm.cooperative_id
        LEFT JOIN public.users cp ON cm.user_id = cp.id
        WHERE p.stock_quantity <= p.minimum_stock
        AND p.is_active = true
        AND p.stock_quantity > 0
    LOOP
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority,
            created_at
        )
        VALUES (
            low_stock_products.owner_id,
            'low_stock',
            'Stock faible',
            'Le produit "' || low_stock_products.name || '" a un stock faible (' || low_stock_products.stock_quantity || ' ' ||
            (SELECT unit FROM public.products WHERE id = low_stock_products.id) || ' restant)',
            jsonb_build_object(
                'product_id', low_stock_products.id,
                'product_name', low_stock_products.name,
                'current_stock', low_stock_products.stock_quantity,
                'minimum_stock', low_stock_products.minimum_stock
            ),
            'high',
            NOW()
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer un profil marchand après approbation de l'enrôlement
CREATE OR REPLACE FUNCTION public.create_merchant_profile_after_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO public.merchant_profiles (
            user_id,
            business_name,
            business_type,
            business_address,
            market_name,
            market_type,
            commune,
            created_at,
            updated_at
        )
        VALUES (
            NEW.user_id,
            NEW.business_name,
            NEW.business_type,
            NEW.address,
            NEW.market,
            NEW.market_type,
            NEW.commune,
            NOW(),
            NOW()
        );

        -- Mettre à jour le statut de l'utilisateur
        UPDATE public.users
        SET status = 'active',
            updated_at = NOW()
        WHERE id = NEW.user_id;

        -- Notifier l'utilisateur de l'approbation
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority,
            created_at
        )
        VALUES (
            NEW.user_id,
            'enrollment_approved',
            'Enrôlement approuvé',
            'Félicitations ! Votre enrôlement a été approuvé. Vous pouvez maintenant commencer à utiliser la plateforme.',
            jsonb_build_object(
                'enrollment_id', NEW.id,
                'business_name', NEW.business_name
            ),
            'high',
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_merchant_profile_trigger
    AFTER UPDATE ON public.merchant_enrollments
    FOR EACH ROW EXECUTE FUNCTION public.create_merchant_profile_after_approval();

-- Fonction pour archiver les anciennes notifications
CREATE OR REPLACE FUNCTION public.archive_old_notifications()
RETURNS VOID AS $$
BEGIN
    -- Marquer comme lues les notifications non lues de plus de 30 jours
    UPDATE public.notifications
    SET is_read = true,
        read_at = NOW()
    WHERE is_read = false
    AND created_at < NOW() - INTERVAL '30 days';

    -- Supprimer les notifications lues de plus de 90 jours
    DELETE FROM public.notifications
    WHERE is_read = true
    AND read_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les statistiques de vente par période
CREATE OR REPLACE FUNCTION public.get_sales_stats(
    p_user_id UUID,
    p_start_date TIMESTAMP,
    p_end_date TIMESTAMP
)
RETURNS TABLE(
    total_orders INTEGER,
    total_revenue DECIMAL(15,2),
    average_order_value DECIMAL(15,2),
    total_products_sold INTEGER,
    top_selling_product TEXT,
    conversion_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.final_amount), 0) as total_revenue,
        COALESCE(AVG(o.final_amount), 0) as average_order_value,
        COALESCE(SUM(oi.quantity), 0) as total_products_sold,
        (SELECT p.name FROM public.products p
         JOIN public.order_items oi2 ON p.id = oi2.product_id
         WHERE oi2.order_id IN (SELECT id FROM public.orders WHERE seller_id = p_user_id)
         GROUP BY p.id, p.name
         ORDER BY SUM(oi2.quantity) DESC
         LIMIT 1) as top_selling_product,
        CASE
            WHEN (SELECT COUNT(*) FROM public.carts WHERE user_id = p_user_id) > 0
            THEN (SELECT COUNT(DISTINCT o.id)::DECIMAL /
                 (SELECT COUNT(*) FROM public.carts WHERE user_id = p_user_id) * 100
                 FROM public.orders o WHERE o.buyer_id = p_user_id)
            ELSE 0
        END as conversion_rate
    FROM public.orders o
    WHERE o.seller_id = p_user_id
    AND o.created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer des rapports mensuels
CREATE OR REPLACE FUNCTION public.generate_monthly_report(p_month INTEGER, p_year INTEGER)
RETURNS TABLE(
    month INTEGER,
    year INTEGER,
    total_orders INTEGER,
    total_revenue DECIMAL(15,2),
    active_users INTEGER,
    new_users INTEGER,
    top_product_category TEXT,
    average_order_value DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p_month,
        p_year,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.final_amount), 0) as total_revenue,
        COUNT(DISTINCT o.buyer_id) as active_users,
        (SELECT COUNT(*) FROM public.users
         WHERE DATE_PART('month', created_at) = p_month
         AND DATE_PART('year', created_at) = p_year) as new_users,
        (SELECT p.category FROM public.products p
         JOIN public.order_items oi ON p.id = oi.product_id
         WHERE DATE_PART('month', oi.created_at) = p_month
         AND DATE_PART('year', oi.created_at) = p_year
         GROUP BY p.category
         ORDER BY SUM(oi.quantity) DESC
         LIMIT 1) as top_product_category,
        COALESCE(AVG(o.final_amount), 0) as average_order_value
    FROM public.orders o
    WHERE DATE_PART('month', o.created_at) = p_month
    AND DATE_PART('year', o.created_at) = p_year;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider et nettoyer les données
CREATE OR REPLACE FUNCTION public.validate_and_clean_data()
RETURNS VOID AS $$
BEGIN
    -- Nettoyer les paniers vides
    DELETE FROM public.cart_items
    WHERE cart_id IN (
        SELECT id FROM public.carts
        WHERE (SELECT COUNT(*) FROM public.cart_items WHERE cart_id = public.carts.id) = 0
        AND updated_at < NOW() - INTERVAL '7 days'
    );

    -- Mettre à jour les commandes en attente depuis plus de 7 jours
    UPDATE public.orders
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '7 days';

    -- Archiver les offres expirées
    UPDATE public.producer_offers
    SET status = 'terminee',
        updated_at = NOW()
    WHERE expiry_date < NOW()
    AND status = 'en_cours';

    -- Supprimer les notifications expirées
    DELETE FROM public.notifications
    WHERE expires_at < NOW()
    AND expires_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;