-- Migration avec des requêtes de vérification pour tester les relations et le système d'approvisionnement

-- Vue pour vérifier les relations marchands-coopératives
CREATE OR REPLACE VIEW public.verification_merchant_cooperative_relations AS
SELECT
    r.id,
    r.relation_type,
    r.status,
    r.join_date,
    r.membership_number,
    r.credit_limit,
    r.credit_used,
    r.discount_rate,
    r.payment_terms,
    m.business_name as merchant_name,
    m.user_id as merchant_user_id,
    u_m.email as merchant_email,
    c.name as cooperative_name,
    c.id as cooperative_id,
    u_c.email as cooperative_manager_email
FROM public.merchant_cooperative_relations r
JOIN public.merchant_profiles m ON r.merchant_id = m.id
JOIN public.users u_m ON m.user_id = u_m.id
JOIN public.cooperatives c ON r.cooperative_id = c.id
LEFT JOIN public.cooperative_members cm ON c.id = cm.cooperative_id AND cm.role = 'gestionnaire'
LEFT JOIN public.users u_c ON cm.user_id = u_c.id
ORDER BY r.join_date DESC;

-- Vue pour vérifier les commandes d'approvisionnement
CREATE OR REPLACE VIEW public.verification_supply_orders AS
SELECT
    so.id,
    so.order_number,
    so.total_amount,
    so.final_amount,
    so.status,
    so.payment_status,
    so.payment_method,
    so.delivery_method,
    so.requested_delivery_date,
    so.priority,
    so.is_recurring,
    so.created_at,
    buyer.business_name as buyer_merchant,
    buyer.user_id as buyer_user_id,
    u_buyer.email as buyer_email,
    seller.name as seller_cooperative,
    seller.id as seller_cooperative_id,
    u_seller.email as seller_email,
    r.discount_rate as applicable_discount,
    r.credit_limit as credit_limit_available
FROM public.supply_orders so
LEFT JOIN public.merchant_profiles buyer ON so.buyer_id = buyer.user_id AND so.buyer_type = 'merchant'
LEFT JOIN public.cooperatives seller ON so.seller_id IN (SELECT user_id FROM public.cooperative_members WHERE cooperative_id = seller.id) AND so.seller_type = 'cooperative'
LEFT JOIN public.users u_buyer ON so.buyer_id = u_buyer.id
LEFT JOIN public.users u_seller ON so.seller_id = u_seller.id
LEFT JOIN public.merchant_cooperative_relations r ON so.cooperative_relation_id = r.id
ORDER BY so.created_at DESC;

-- Vue pour vérifier les contrats d'approvisionnement
CREATE OR REPLACE VIEW public.verification_supply_contracts AS
SELECT
    sc.id,
    sc.contract_number,
    sc.contract_type,
    sc.start_date,
    sc.end_date,
    sc.total_value,
    sc.minimum_commitment,
    sc.payment_terms,
    sc.status,
    sc.created_at,
    c.name as cooperative_name,
    m.business_name as merchant_name,
    u_creator.email as created_by_email,
    u_approver.email as approved_by_email
FROM public.supply_contracts sc
JOIN public.cooperatives c ON sc.cooperative_id = c.id
JOIN public.merchant_profiles m ON sc.merchant_id = m.id
LEFT JOIN public.users u_creator ON sc.created_by = u_creator.id
LEFT JOIN public.users u_approver ON sc.approved_by = u_approver.id
ORDER BY sc.created_at DESC;

-- Vue pour vérifier les livraisons
CREATE OR REPLACE VIEW public.verification_supply_deliveries AS
SELECT
    sd.id,
    sd.delivery_number,
    sd.delivery_date,
    sd.status,
    sd.tracking_number,
    so.order_number,
    so.total_amount as order_amount,
    buyer.business_name as buyer_name,
    seller.name as seller_name,
    u_delivered_by.email as delivered_by_email,
    u_received_by.email as received_by_email
FROM public.supply_deliveries sd
JOIN public.supply_orders so ON sd.order_id = so.id
LEFT JOIN public.merchant_profiles buyer ON so.buyer_id = buyer.user_id AND so.buyer_type = 'merchant'
LEFT JOIN public.cooperatives seller ON so.seller_id IN (SELECT user_id FROM public.cooperative_members WHERE cooperative_id = seller.id) AND so.seller_type = 'cooperative'
LEFT JOIN public.users u_delivered_by ON sd.delivered_by = u_delivered_by.id
LEFT JOIN public.users u_received_by ON sd.received_by = u_received_by.id
ORDER BY sd.delivery_date DESC;

-- Fonction pour générer un rapport de test complet
CREATE OR REPLACE FUNCTION public.generate_test_report()
RETURNS TABLE(
    test_name TEXT,
    test_category TEXT,
    result TEXT,
    details TEXT,
    count_value INTEGER,
    amount_value DECIMAL(15,2)
) AS $$
BEGIN
    -- Test 1: Vérification des utilisateurs créés
    RETURN QUERY SELECT
        'Total utilisateurs' as test_name,
        'Utilisateurs' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.users) >= 20 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre total d''utilisateurs créés' as details,
        (SELECT COUNT(*) FROM public.users) as count_value,
        NULL as amount_value;

    -- Test 2: Vérification des marchands
    RETURN QUERY SELECT
        'Marchands actifs' as test_name,
        'Marchands' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.merchant_profiles) >= 5 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de marchands avec profil actif' as details,
        (SELECT COUNT(*) FROM public.merchant_profiles) as count_value,
        NULL as amount_value;

    -- Test 3: Vérification des producteurs
    RETURN QUERY SELECT
        'Producteurs actifs' as test_name,
        'Producteurs' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.producer_profiles) >= 4 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de producteurs avec profil actif' as details,
        (SELECT COUNT(*) FROM public.producer_profiles) as count_value,
        NULL as amount_value;

    -- Test 4: Vérification des coopératives
    RETURN QUERY SELECT
        'Coopératives actives' as test_name,
        'Coopératives' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.cooperatives WHERE status = 'active') >= 4 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de coopératives actives' as details,
        (SELECT COUNT(*) FROM public.cooperatives WHERE status = 'active') as count_value,
        NULL as amount_value;

    -- Test 5: Vérification des relations marchands-coopératives
    RETURN QUERY SELECT
        'Relations marchands-coopératives' as test_name,
        'Relations' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.merchant_cooperative_relations) >= 5 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de relations marchands-coopératives actives' as details,
        (SELECT COUNT(*) FROM public.merchant_cooperative_relations WHERE status = 'active') as count_value,
        NULL as amount_value;

    -- Test 6: Vérification des commandes d'approvisionnement
    RETURN QUERY SELECT
        'Commandes d''approvisionnement' as test_name,
        'Commandes' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.supply_orders) >= 5 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de commandes d''approvisionnement créées' as details,
        (SELECT COUNT(*) FROM public.supply_orders) as count_value,
        NULL as amount_value;

    -- Test 7: Vérification des contrats d'approvisionnement
    RETURN QUERY SELECT
        'Contrats d''approvisionnement' as test_name,
        'Contrats' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.supply_contracts WHERE status = 'active') >= 2 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de contrats actifs' as details,
        (SELECT COUNT(*) FROM public.supply_contracts WHERE status = 'active') as count_value,
        NULL as amount_value;

    -- Test 8: Vérification des livraisons
    RETURN QUERY SELECT
        'Livraisons effectuées' as test_name,
        'Livraisons' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.supply_deliveries WHERE status = 'delivered') >= 1 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de livraisons complétées' as details,
        (SELECT COUNT(*) FROM public.supply_deliveries WHERE status = 'delivered') as count_value,
        NULL as amount_value;

    -- Test 9: Vérification des paiements
    RETURN QUERY SELECT
        'Paiements traités' as test_name,
        'Paiements' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.payments WHERE status = 'paid') >= 3 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de paiements complétés' as details,
        (SELECT COUNT(*) FROM public.payments WHERE status = 'paid') as count_value,
        NULL as amount_value;

    -- Test 10: Vérification du montant total des transactions
    RETURN QUERY SELECT
        'Montant total des transactions' as test_name,
        'Transactions' as test_category,
        CASE WHEN (SELECT COALESCE(SUM(final_amount), 0) FROM public.supply_orders) > 1000000 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Montant total des commandes d''approvisionnement' as details,
        NULL as count_value,
        (SELECT COALESCE(SUM(final_amount), 0) FROM public.supply_orders) as amount_value;

    -- Test 11: Vérification des notifications
    RETURN QUERY SELECT
        'Notifications créées' as test_name,
        'Notifications' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.notifications) >= 15 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de notifications générées' as details,
        (SELECT COUNT(*) FROM public.notifications) as count_value,
        NULL as amount_value;

    -- Test 12: Vérification des produits disponibles
    RETURN QUERY SELECT
        'Produits actifs' as test_name,
        'Produits' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.products WHERE is_active = true) >= 20 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de produits actifs' as details,
        (SELECT COUNT(*) FROM public.products WHERE is_active = true) as count_value,
        NULL as amount_value;

    -- Test 13: Vérification des membres de coopératives
    RETURN QUERY SELECT
        'Membres de coopératives' as test_name,
        'Coopératives' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.cooperative_members) >= 8 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre total de membres dans toutes les coopératives' as details,
        (SELECT COUNT(*) FROM public.cooperative_members) as count_value,
        NULL as amount_value;

    -- Test 14: Vérification des commandes récurrentes
    RETURN QUERY SELECT
        'Commandes récurrentes' as test_name,
        'Commandes' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.supply_orders WHERE is_recurring = true) >= 1 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de commandes récurrentes configurées' as details,
        (SELECT COUNT(*) FROM public.supply_orders WHERE is_recurring = true) as count_value,
        NULL as amount_value;

    -- Test 15: Vérification des relations par type
    RETURN QUERY SELECT
        'Types de relations variés' as test_name,
        'Relations' as test_category,
        CASE WHEN (SELECT COUNT(DISTINCT relation_type) FROM public.merchant_cooperative_relations) >= 3 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de types de relations différents' as details,
        (SELECT COUNT(DISTINCT relation_type) FROM public.merchant_cooperative_relations) as count_value,
        NULL as amount_value;

    -- Test 16: Vérification des statuts de commande variés
    RETURN QUERY SELECT
        'Statuts de commande variés' as test_name,
        'Commandes' as test_category,
        CASE WHEN (SELECT COUNT(DISTINCT status) FROM public.supply_orders) >= 4 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de statuts de commande différents' as details,
        (SELECT COUNT(DISTINCT status) FROM public.supply_orders) as count_value,
        NULL as amount_value;

    -- Test 17: Vérification des produits par catégorie
    RETURN QUERY SELECT
        'Catégories de produits variées' as test_name,
        'Produits' as test_category,
        CASE WHEN (SELECT COUNT(DISTINCT category) FROM public.products WHERE is_active = true) >= 5 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de catégories de produits différentes' as details,
        (SELECT COUNT(DISTINCT category) FROM public.products WHERE is_active = true) as count_value,
        NULL as amount_value;

    -- Test 18: Vérification des discounts appliqués
    RETURN QUERY SELECT
        'Discounts appliqués' as test_name,
        'Pricing' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.supply_orders WHERE discount_amount > 0) >= 3 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de commandes avec remise appliquée' as details,
        (SELECT COUNT(*) FROM public.supply_orders WHERE discount_amount > 0) as count_value,
        (SELECT COALESCE(SUM(discount_amount), 0) FROM public.supply_orders WHERE discount_amount > 0) as amount_value;

    -- Test 19: Vérification des crédits utilisés
    RETURN QUERY SELECT
        'Crédits utilisés' as test_name,
        'Financement' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.merchant_cooperative_relations WHERE credit_used > 0) >= 1 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de marchands utilisant leur crédit' as details,
        (SELECT COUNT(*) FROM public.merchant_cooperative_relations WHERE credit_used > 0) as count_value,
        (SELECT COALESCE(SUM(credit_used), 0) FROM public.merchant_cooperative_relations WHERE credit_used > 0) as amount_value;

    -- Test 20: Vérification des livraisons partielles
    RETURN QUERY SELECT
        'Livraisons partielles' as test_name,
        'Livraisons' as test_category,
        CASE WHEN (SELECT COUNT(*) FROM public.supply_orders WHERE status = 'partially_delivered') >= 1 THEN 'SUCCESS' ELSE 'FAILED' END as result,
        'Nombre de commandes partiellement livrées' as details,
        (SELECT COUNT(*) FROM public.supply_orders WHERE status = 'partially_delivered') as count_value,
        NULL as amount_value;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir un résumé du système
CREATE OR REPLACE FUNCTION public.get_system_summary()
RETURNS TABLE(
    metric_name TEXT,
    metric_value INTEGER,
    metric_amount DECIMAL(15,2),
    category TEXT
) AS $$
BEGIN
    -- Utilisateurs
    RETURN QUERY SELECT
        'Total utilisateurs' as metric_name,
        (SELECT COUNT(*) FROM public.users) as metric_value,
        NULL as metric_amount,
        'Utilisateurs' as category;

    -- Profils marchands
    RETURN QUERY SELECT
        'Profils marchands' as metric_name,
        (SELECT COUNT(*) FROM public.merchant_profiles) as metric_value,
        NULL as metric_amount,
        'Marchands' as category;

    -- Profils producteurs
    RETURN QUERY SELECT
        'Profils producteurs' as metric_name,
        (SELECT COUNT(*) FROM public.producer_profiles) as metric_value,
        NULL as metric_amount,
        'Producteurs' as category;

    -- Coopératives
    RETURN QUERY SELECT
        'Coopératives actives' as metric_name,
        (SELECT COUNT(*) FROM public.cooperatives WHERE status = 'active') as metric_value,
        NULL as metric_amount,
        'Coopératives' as category;

    -- Relations marchands-coopératives
    RETURN QUERY SELECT
        'Relations actives' as metric_name,
        (SELECT COUNT(*) FROM public.merchant_cooperative_relations WHERE status = 'active') as metric_value,
        NULL as metric_amount,
        'Relations' as category;

    -- Commandes d'approvisionnement
    RETURN QUERY SELECT
        'Commandes créées' as metric_name,
        (SELECT COUNT(*) FROM public.supply_orders) as metric_value,
        NULL as metric_amount,
        'Commandes' as category;

    -- Montant total des commandes
    RETURN QUERY SELECT
        'Montant total commandes' as metric_name,
        NULL as metric_value,
        (SELECT COALESCE(SUM(final_amount), 0) FROM public.supply_orders) as metric_amount,
        'Commandes' as category;

    -- Contrats actifs
    RETURN QUERY SELECT
        'Contrats actifs' as metric_name,
        (SELECT COUNT(*) FROM public.supply_contracts WHERE status = 'active') as metric_value,
        NULL as metric_amount,
        'Contrats' as category;

    -- Livraisons complétées
    RETURN QUERY SELECT
        'Livraisons complétées' as metric_name,
        (SELECT COUNT(*) FROM public.supply_deliveries WHERE status = 'delivered') as metric_value,
        NULL as metric_amount,
        'Livraisons' as category;

    -- Paiements complétés
    RETURN QUERY SELECT
        'Paiements complétés' as metric_name,
        (SELECT COUNT(*) FROM public.payments WHERE status = 'paid') as metric_value,
        NULL as metric_amount,
        'Paiements' as category;

    -- Produits actifs
    RETURN QUERY SELECT
        'Produits actifs' as metric_name,
        (SELECT COUNT(*) FROM public.products WHERE is_active = true) as metric_value,
        NULL as metric_amount,
        'Produits' as category;

    -- Notifications
    RETURN QUERY SELECT
        'Notifications créées' as metric_name,
        (SELECT COUNT(*) FROM public.notifications) as metric_value,
        NULL as metric_amount,
        'Notifications' as category;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier l'accès aux données
CREATE OR REPLACE FUNCTION public.verify_data_access(p_user_id UUID)
RETURNS TABLE(
    table_name TEXT,
    can_access BOOLEAN,
    access_type TEXT,
    row_count_estimate INTEGER
) AS $$
BEGIN
    -- Vérification des tables principales
    RETURN QUERY SELECT
        'users' as table_name,
        EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) as can_access,
        'own_profile' as access_type,
        1 as row_count_estimate;

    RETURN QUERY SELECT
        'merchant_profiles' as table_name,
        EXISTS (SELECT 1 FROM public.merchant_profiles WHERE user_id = p_user_id) as can_access,
        CASE WHEN EXISTS (SELECT 1 FROM public.merchant_profiles WHERE user_id = p_user_id) THEN 'own_merchant_profile' ELSE 'no_access' END as access_type,
        (SELECT COUNT(*) FROM public.merchant_profiles WHERE user_id = p_user_id) as row_count_estimate;

    RETURN QUERY SELECT
        'cooperative_members' as table_name,
        EXISTS (SELECT 1 FROM public.cooperative_members WHERE user_id = p_user_id) as can_access,
        CASE WHEN EXISTS (SELECT 1 FROM public.cooperative_members WHERE user_id = p_user_id) THEN 'cooperative_membership' ELSE 'no_access' END as access_type,
        (SELECT COUNT(*) FROM public.cooperative_members WHERE user_id = p_user_id) as row_count_estimate;

    RETURN QUERY SELECT
        'merchant_cooperative_relations' as table_name,
        EXISTS (
            SELECT 1 FROM public.merchant_cooperative_relations r
            JOIN public.merchant_profiles mp ON r.merchant_id = mp.id
            WHERE mp.user_id = p_user_id
        ) as can_access,
        CASE WHEN EXISTS (
            SELECT 1 FROM public.merchant_cooperative_relations r
            JOIN public.merchant_profiles mp ON r.merchant_id = mp.id
            WHERE mp.user_id = p_user_id
        ) THEN 'merchant_relations' ELSE 'no_access' END as access_type,
        (SELECT COUNT(*) FROM public.merchant_cooperative_relations r
         JOIN public.merchant_profiles mp ON r.merchant_id = mp.id
         WHERE mp.user_id = p_user_id) as row_count_estimate;

    RETURN QUERY SELECT
        'supply_orders' as table_name,
        EXISTS (
            SELECT 1 FROM public.supply_orders
            WHERE buyer_id = p_user_id OR seller_id = p_user_id
        ) as can_access,
        'orders_involved' as access_type,
        (SELECT COUNT(*) FROM public.supply_orders
         WHERE buyer_id = p_user_id OR seller_id = p_user_id) as row_count_estimate;

    RETURN QUERY SELECT
        'notifications' as table_name,
        EXISTS (SELECT 1 FROM public.notifications WHERE user_id = p_user_id) as can_access,
        'user_notifications' as access_type,
        (SELECT COUNT(*) FROM public.notifications WHERE user_id = p_user_id) as row_count_estimate;

    RETURN QUERY SELECT
        'carts' as table_name,
        EXISTS (SELECT 1 FROM public.carts WHERE user_id = p_user_id) as can_access,
        'user_cart' as access_type,
        (SELECT COUNT(*) FROM public.carts WHERE user_id = p_user_id) as row_count_estimate;
END;
$$ LANGUAGE plpgsql;