-- Script de vérification des relations marchands-coopératives et commandes d'approvisionnement
-- Ce script peut être exécuté manuellement dans l'éditeur SQL de Supabase

-- 1. Vérification des utilisateurs créés
SELECT
    'Vérification des utilisateurs' as test,
    COUNT(*) as total_utilisateurs,
    COUNT(CASE WHEN role = 'merchant' THEN 1 END) as marchands,
    COUNT(CASE WHEN role = 'cooperative' THEN 1 END) as cooperatives,
    COUNT(CASE WHEN role = 'producer' THEN 1 END) as producteurs,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as administrateurs
FROM public.users
WHERE email LIKE '%@example.com';

-- 2. Vérification des profils marchands
SELECT
    'Vérification des profils marchands' as test,
    COUNT(*) as total_profils_marchands
FROM public.merchant_profiles mp
JOIN public.users u ON mp.user_id = u.id
WHERE u.role = 'merchant';

-- 3. Vérification des coopératives
SELECT
    'Vérification des coopératives' as test,
    COUNT(*) as total_cooperatives
FROM public.cooperatives;

-- 4. Vérification des relations marchands-coopératives
SELECT
    'Vérification des relations marchands-coopératives' as test,
    COUNT(*) as total_relations,
    COUNT(CASE WHEN relation_type = 'member' THEN 1 END) as membres,
    COUNT(CASE WHEN relation_type = 'supplier' THEN 1 END) as fournisseurs,
    COUNT(CASE WHEN relation_type = 'buyer' THEN 1 END) as acheteurs
FROM public.merchant_cooperative_relations;

-- 5. Vérification des commandes d'approvisionnement
SELECT
    'Vérification des commandes d''approvisionnement' as test,
    COUNT(*) as total_commandes,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as en_attente,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmees,
    COUNT(CASE WHEN status = 'preparing' THEN 1 END) as en_preparation,
    COUNT(CASE WHEN status = 'shipped' THEN 1 END) as expediees,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as livrees,
    COUNT(CASE WHEN is_recurring = true THEN 1 END) as recurrentes
FROM public.supply_orders;

-- 6. Vérification des éléments de commande
SELECT
    'Vérification des éléments de commande' as test,
    COUNT(*) as total_elements,
    SUM(quantity) as quantite_totale,
    SUM(quantity * unit_price) as montant_total
FROM public.supply_order_items;

-- 7. Vérification des paiements
SELECT
    'Vérification des paiements' as test,
    COUNT(*) as total_paiements,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as payes,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as en_attente,
    COUNT(CASE WHEN status = 'partially_paid' THEN 1 END) as partiellement_payes,
    SUM(amount) as montant_total_paiements
FROM public.payments;

-- 8. Vérification des livraisons
SELECT
    'Vérification des livraisons' as test,
    COUNT(*) as total_livraisons,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as livrees,
    COUNT(CASE WHEN status = 'in_transit' THEN 1 END) as en_transit
FROM public.supply_deliveries;

-- 9. Vérification des éléments de livraison
SELECT
    'Vérification des éléments de livraison' as test,
    COUNT(*) as total_elements_livraison,
    SUM(quantity_delivered) as quantite_totale_livree,
    SUM(quantity_received) as quantite_totale_recue,
    SUM(quantity_rejected) as quantite_totale_rejetee
FROM public.supply_delivery_items;

-- 10. Vérification des notifications
SELECT
    'Vérification des notifications' as test,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN type = 'new_supply_order' THEN 1 END) as nouvelles_commandes,
    COUNT(CASE WHEN type = 'supply_order_confirmed' THEN 1 END) as commandes_confirmees,
    COUNT(CASE WHEN type = 'supply_payment_received' THEN 1 END) as paiements_recus,
    COUNT(CASE WHEN type = 'supply_delivery_in_transit' THEN 1 END) as livraisons_en_cours
FROM public.notifications
WHERE created_at >= NOW() - INTERVAL '7 days';

-- 11. Détail des marchands et leurs relations
SELECT
    u.email as marchand_email,
    u.name as marchand_nom,
    c.name as cooperative_nom,
    r.relation_type,
    r.status as relation_status,
    r.credit_limit,
    r.discount_rate
FROM public.users u
JOIN public.merchant_profiles mp ON u.id = mp.user_id
JOIN public.merchant_cooperative_relations r ON mp.id = r.merchant_id
JOIN public.cooperatives c ON r.cooperative_id = c.id
WHERE u.role = 'merchant'
ORDER BY u.email, c.name;

-- 12. Détail des commandes par marchand
SELECT
    u.email as marchand_email,
    so.order_number,
    so.status,
    so.payment_status,
    so.total_amount,
    so.final_amount,
    so.requested_delivery_date,
    so.is_recurring,
    so.recurring_frequency
FROM public.supply_orders so
JOIN public.users u ON so.buyer_id = u.id
WHERE u.role = 'merchant'
ORDER BY u.email, so.created_at;

-- 13. Détail des commandes par coopérative
SELECT
    u.email as cooperative_email,
    c.name as cooperative_nom,
    so.order_number,
    so.status,
    so.payment_status,
    so.total_amount,
    so.final_amount,
    so.requested_delivery_date
FROM public.supply_orders so
JOIN public.users u ON so.seller_id = u.id
JOIN public.cooperative_members cm ON u.id = cm.user_id
JOIN public.cooperatives c ON cm.cooperative_id = c.id
WHERE u.role = 'cooperative'
ORDER BY c.name, so.created_at;

-- 14. Statistiques de paiement par méthode
SELECT
    method as methode_paiement,
    COUNT(*) as nombre_paiements,
    SUM(amount) as montant_total,
    AVG(amount) as montant_moyen,
    COUNT(CASE WHEN status = 'paid' THEN 1 END) as payes,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as en_attente
FROM public.payments
GROUP BY method
ORDER BY montant_total DESC;

-- 15. Test des fonctions de vérification
SELECT
    'Test fonction generate_test_report' as test,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'generate_test_report'
        AND routine_schema = 'public'
    ) THEN 'SUCCESS' ELSE 'FAILED' END as result;

SELECT
    'Test fonction get_system_summary' as test,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'get_system_summary'
        AND routine_schema = 'public'
    ) THEN 'SUCCESS' ELSE 'FAILED' END as result;

SELECT
    'Test fonction verify_data_access' as test,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'verify_data_access'
        AND routine_schema = 'public'
    ) THEN 'SUCCESS' ELSE 'FAILED' END as result;

-- 16. Test des vues de vérification
SELECT
    'Test vue merchant_cooperative_relations_view' as test,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_name = 'merchant_cooperative_relations_view'
        AND table_schema = 'public'
    ) THEN 'SUCCESS' ELSE 'FAILED' END as result;

SELECT
    'Test vue supply_orders_verification_view' as test,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_name = 'supply_orders_verification_view'
        AND table_schema = 'public'
    ) THEN 'SUCCESS' ELSE 'FAILED' END as result;

-- 17. Résumé final
SELECT
    'RÉSUMÉ FINAL DE VÉRIFICATION' as test,
    (SELECT COUNT(*) FROM public.users WHERE email LIKE '%@example.com') as utilisateurs_crees,
    (SELECT COUNT(*) FROM public.merchant_profiles) as profils_marchands_crees,
    (SELECT COUNT(*) FROM public.cooperatives) as cooperatives_crees,
    (SELECT COUNT(*) FROM public.merchant_cooperative_relations) as relations_crees,
    (SELECT COUNT(*) FROM public.supply_orders) as commandes_crees,
    (SELECT COUNT(*) FROM public.supply_order_items) as elements_commande_crees,
    (SELECT COUNT(*) FROM public.payments) as paiements_crees,
    (SELECT COUNT(*) FROM public.supply_deliveries) as livraisons_crees,
    (SELECT COUNT(*) FROM public.notifications) as notifications_crees;