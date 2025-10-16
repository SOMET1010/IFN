-- Vues et index supplémentaires pour optimiser les performances

-- Vues pour les rapports et statistiques

-- Vue pour les statistiques de vente par mois
CREATE OR REPLACE VIEW public.monthly_sales_stats AS
SELECT
    TO_CHAR(created_at, 'YYYY-MM') as month,
    COUNT(*) as total_orders,
    COALESCE(SUM(final_amount), 0) as total_revenue,
    COALESCE(AVG(final_amount), 0) as average_order_value,
    COUNT(DISTINCT buyer_id) as unique_customers
FROM public.orders
WHERE status IN ('delivered', 'shipped')
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month;

-- Vue pour les produits populaires
CREATE OR REPLACE VIEW public.popular_products AS
SELECT
    p.id,
    p.name,
    p.category,
    p.price,
    p.rating,
    p.total_reviews,
    COUNT(oi.id) as times_ordered,
    COALESCE(SUM(oi.quantity), 0) as total_quantity_sold
FROM public.products p
LEFT JOIN public.order_items oi ON p.id = oi.product_id
LEFT JOIN public.orders o ON oi.order_id = o.id
WHERE o.status IN ('delivered', 'shipped')
GROUP BY p.id, p.name, p.category, p.price, p.rating, p.total_reviews
ORDER BY times_ordered DESC, total_quantity_sold DESC;

-- Vue pour les performances des vendeurs
CREATE OR REPLACE VIEW public.seller_performance AS
SELECT
    u.id as user_id,
    u.name,
    u.role,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.final_amount), 0) as total_revenue,
    COALESCE(AVG(o.final_amount), 0) as average_order_value,
    COUNT(DISTINCT o.buyer_id) as unique_customers,
    COALESCE(AVG(
        CASE
            WHEN o.status = 'delivered' THEN 1
            WHEN o.status = 'cancelled' THEN 0
            ELSE 0.5
        END
    ), 0) as success_rate
FROM public.users u
LEFT JOIN public.orders o ON u.id = o.seller_id
WHERE u.role IN ('producer', 'merchant', 'cooperative')
GROUP BY u.id, u.name, u.role
ORDER BY total_revenue DESC;

-- Vue pour l'inventaire avec alertes
CREATE OR REPLACE VIEW public.inventory_alerts AS
SELECT
    p.id,
    p.name,
    p.category,
    p.stock_quantity,
    p.minimum_stock,
    p.unit,
    CASE
        WHEN p.stock_quantity = 0 THEN 'OUT_OF_STOCK'
        WHEN p.stock_quantity <= p.minimum_stock THEN 'LOW_STOCK'
        WHEN p.stock_quantity <= p.minimum_stock * 2 THEN 'MEDIUM_STOCK'
        ELSE 'GOOD_STOCK'
    END as stock_status,
    (p.minimum_stock - p.stock_quantity) as needed_quantity,
    COALESCE(mp.user_id, pp.user_id, cm.user_id) as owner_id
FROM public.products p
LEFT JOIN public.merchant_profiles mp ON p.merchant_id = mp.id
LEFT JOIN public.producer_profiles pp ON p.producer_id = pp.id
LEFT JOIN public.cooperatives c ON p.cooperative_id = c.id
LEFT JOIN public.cooperative_members cm ON c.id = cm.cooperative_id
WHERE p.is_active = true
ORDER BY
    CASE
        WHEN p.stock_quantity = 0 THEN 1
        WHEN p.stock_quantity <= p.minimum_stock THEN 2
        WHEN p.stock_quantity <= p.minimum_stock * 2 THEN 3
        ELSE 4
    END,
    p.name;

-- Vue pour les récentes activités
CREATE OR REPLACE VIEW public.recent_activities AS
SELECT
    'order' as activity_type,
    o.id as reference_id,
    o.order_number as reference_number,
    u.name as user_name,
    o.status as status,
    o.final_amount as amount,
    o.created_at as timestamp
FROM public.orders o
JOIN public.users u ON o.buyer_id = u.id

UNION ALL

SELECT
    'review' as activity_type,
    r.id as reference_id,
    p.name as reference_number,
    u.name as user_name,
    r.status as status,
    NULL as amount,
    r.created_at as timestamp
FROM public.reviews r
JOIN public.users u ON r.user_id = u.id
JOIN public.products p ON r.product_id = p.id

UNION ALL

SELECT
    'enrollment' as activity_type,
    e.id as reference_id,
    e.business_name as reference_number,
    u.name as user_name,
    e.status as status,
    NULL as amount,
    e.submitted_at as timestamp
FROM public.merchant_enrollments e
JOIN public.users u ON e.user_id = u.id

ORDER BY timestamp DESC
LIMIT 50;

-- Vue pour les paiements en attente
CREATE OR REPLACE VIEW public.pending_payments AS
SELECT
    p.id,
    p.amount,
    p.currency,
    p.method,
    p.provider,
    p.due_date,
    o.order_number,
    u_buyer.name as buyer_name,
    u_seller.name as seller_name,
    CASE
        WHEN p.due_date < NOW() THEN 'OVERDUE'
        WHEN p.due_date <= NOW() + INTERVAL '3 days' THEN 'URGENT'
        ELSE 'PENDING'
    END as priority
FROM public.payments p
JOIN public.orders o ON p.order_id = o.id
JOIN public.users u_buyer ON o.buyer_id = u_buyer.id
JOIN public.users u_seller ON o.seller_id = u_seller.id
WHERE p.status = 'pending'
ORDER BY
    CASE
        WHEN p.due_date < NOW() THEN 1
        WHEN p.due_date <= NOW() + INTERVAL '3 days' THEN 2
        ELSE 3
    END,
    p.due_date;

-- Index supplémentaires pour optimiser les performances

-- Index composites pour les requêtes fréquentes
CREATE INDEX idx_orders_buyer_status ON public.orders (buyer_id, status);
CREATE INDEX idx_orders_seller_status ON public.orders (seller_id, status);
CREATE INDEX idx_orders_status_created ON public.orders (status, created_at);
CREATE INDEX idx_products_category_active ON public.products (category, is_active);
CREATE INDEX idx_products_producer_active ON public.products (producer_id, is_active);
CREATE INDEX idx_products_rating_active ON public.products (rating, is_active);
CREATE INDEX idx_reviews_product_approved ON public.reviews (product_id, status);
CREATE INDEX idx_reviews_user_approved ON public.reviews (user_id, status);
CREATE INDEX idx_reviews_rating_approved ON public.reviews (rating, status);
CREATE INDEX idx_enrollments_user_status ON public.merchant_enrollments (user_id, status);
CREATE INDEX idx_enrollments_status_submitted ON public.merchant_enrollments (status, submitted_at);
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, is_read);
CREATE INDEX idx_notifications_type_created ON public.notifications (type, created_at);
CREATE INDEX idx_payments_status_method ON public.payments (status, method);
CREATE INDEX idx_payments_order_id ON public.payments (order_id);
CREATE INDEX idx_cart_items_product ON public.cart_items (product_id);
CREATE INDEX idx_order_items_product ON public.order_items (product_id);
CREATE INDEX idx_cooperative_members_cooperative ON public.cooperative_members (cooperative_id, status);
CREATE INDEX idx_cooperative_members_user ON public.cooperative_members (user_id, status);
CREATE INDEX idx_producer_offers_producer_status ON public.producer_offers (producer_id, status);
CREATE INDEX idx_producer_offers_product_status ON public.producer_offers (product_id, status);

-- Index pour les recherches textuelles
CREATE INDEX idx_products_name_search ON public.products USING gin(to_tsvector('french', name));
CREATE INDEX idx_products_description_search ON public.products USING gin(to_tsvector('french', COALESCE(description, '')));
CREATE INDEX idx_users_name_search ON public.users USING gin(to_tsvector('french', name));
CREATE INDEX idx_cooperatives_name_search ON public.cooperatives USING gin(to_tsvector('french', name));

-- Index pour les dates
CREATE INDEX idx_orders_month_year ON public.orders (DATE_PART('month', created_at), DATE_PART('year', created_at));
CREATE INDEX idx_users_created_month ON public.users (DATE_PART('month', created_at), DATE_PART('year', created_at));
CREATE INDEX idx_producer_harvests_date ON public.producer_harvests (date);
CREATE INDEX idx_producer_offers_harvest_date ON public.producer_offers (harvest_date);
CREATE INDEX idx_products_expiry_date ON public.products (expiry_date) WHERE expiry_date IS NOT NULL;

-- Index pour les coordonnées géographiques
CREATE INDEX idx_producer_profiles_location ON public.producer_profiles USING gist(coordinates);

-- Fonction pour la recherche全文
CREATE OR REPLACE FUNCTION public.search_products(p_query TEXT)
RETURNS TABLE(
    id UUID,
    name TEXT,
    category TEXT,
    price DECIMAL(10,2),
    rating DECIMAL(3,2),
    total_reviews INTEGER,
    similarity_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.category,
        p.price,
        p.rating,
        p.total_reviews,
        GREATEST(
            SIMILARITY(p.name, p_query),
            COALESCE(SIMILARITY(p.description, p_query), 0),
            CASE WHEN p.category ILIKE '%' || p_query || '%' THEN 0.8 ELSE 0 END
        ) as similarity_score
    FROM public.products p
    WHERE p.is_active = true
    AND (
        p.name ILIKE '%' || p_query || '%' OR
        COALESCE(p.description, '') ILIKE '%' || p_query || '%' OR
        p.category ILIKE '%' || p_query || '%'
    )
    ORDER BY similarity_score DESC, p.rating DESC, p.total_reviews DESC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les tendances du marché
CREATE OR REPLACE FUNCTION public.get_market_trends(p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    category TEXT,
    total_orders INTEGER,
    total_revenue DECIMAL(15,2),
        average_price DECIMAL(10,2),
    growth_rate DECIMAL(5,2)
) AS $$
DECLARE
    current_period_start TIMESTAMP := NOW() - INTERVAL '1 day' * p_days;
    previous_period_start TIMESTAMP := NOW() - INTERVAL '1 day' * p_days * 2;
    current_stats RECORD;
    previous_stats RECORD;
BEGIN
    -- Statistiques de la période actuelle
    FOR current_stats IN
        SELECT
            p.category,
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(o.final_amount), 0) as total_revenue,
            COALESCE(AVG(oi.unit_price), 0) as average_price
        FROM public.products p
        JOIN public.order_items oi ON p.id = oi.product_id
        JOIN public.orders o ON oi.order_id = o.id
        WHERE o.created_at >= current_period_start
        AND o.status IN ('delivered', 'shipped')
        GROUP BY p.category
    LOOP
        -- Statistiques de la période précédente
        FOR previous_stats IN
            SELECT
                p.category,
                COUNT(DISTINCT o.id) as total_orders,
                COALESCE(SUM(o.final_amount), 0) as total_revenue,
                COALESCE(AVG(oi.unit_price), 0) as average_price
            FROM public.products p
            JOIN public.order_items oi ON p.id = oi.product_id
            JOIN public.orders o ON oi.order_id = o.id
            WHERE o.created_at >= previous_period_start
            AND o.created_at < current_period_start
            AND o.status IN ('delivered', 'shipped')
            AND p.category = current_stats.category
            GROUP BY p.category
        LOOP
            RETURN QUERY SELECT
                current_stats.category,
                current_stats.total_orders,
                current_stats.total_revenue,
                current_stats.average_price,
                CASE
                    WHEN previous_stats.total_revenue > 0
                    THEN ((current_stats.total_revenue - previous_stats.total_revenue) / previous_stats.total_revenue * 100)
                    ELSE 0
                END as growth_rate;
        END LOOP;

        -- Si aucune donnée pour la période précédente
        IF NOT FOUND THEN
            RETURN QUERY SELECT
                current_stats.category,
                current_stats.total_orders,
                current_stats.total_revenue,
                current_stats.average_price,
                0 as growth_rate;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les recommandations de produits
CREATE OR REPLACE FUNCTION public.get_product_recommendations(p_user_id UUID)
RETURNS TABLE(
    product_id UUID,
    product_name TEXT,
    category TEXT,
    price DECIMAL(10,2),
    rating DECIMAL(3,2),
    recommendation_score DECIMAL(5,2),
    reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH user_preferences AS (
        SELECT category, COUNT(*) as preference_count
        FROM public.order_items oi
        JOIN public.orders o ON oi.order_id = o.id
        WHERE o.buyer_id = p_user_id
        AND o.status IN ('delivered', 'shipped')
        GROUP BY category
        ORDER BY preference_count DESC
        LIMIT 3
    ),
    popular_in_category AS (
        SELECT
            p.id,
            p.name,
            p.category,
            p.price,
            p.rating,
            COUNT(oi.id) as popularity_count
        FROM public.products p
        LEFT JOIN public.order_items oi ON p.id = oi.product_id
        LEFT JOIN public.orders o ON oi.order_id = o.id
        WHERE p.is_active = true
        AND p.category IN (SELECT category FROM user_preferences)
        GROUP BY p.id, p.name, p.category, p.price, p.rating
    )
    SELECT
        p.id,
        p.name,
        p.category,
        p.price,
        p.rating,
        (COALESCE(pic.popularity_count, 0) * 0.4 + COALESCE(p.rating, 0) * 20 + COALESCE(p.total_reviews, 0) * 0.1) as recommendation_score,
        'Produits populaires dans vos catégories préférées' as reason
    FROM public.products p
    LEFT JOIN popular_in_category pic ON p.id = pic.id
    WHERE p.is_active = true
    AND p.id NOT IN (
        SELECT DISTINCT product_id
        FROM public.order_items oi
        JOIN public.orders o ON oi.order_id = o.id
        WHERE o.buyer_id = p_user_id
        AND o.created_at > NOW() - INTERVAL '30 days'
    )
    ORDER BY recommendation_score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;