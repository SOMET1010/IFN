-- Script de Validation Finale du Système
-- Ce script vérifie que tous les problèmes critiques ont été résolus

-- 1. Vérification de la santé du système
SELECT '=== VÉRIFICATION DE LA SANTÉ DU SYSTÈME ===' as section;

SELECT * FROM public.system_health_check();

-- 2. Vérification de l'intégrité des données
SELECT '' as separator;
SELECT '=== VÉRIFICATION DE L'INTÉGRITÉ DES DONNÉES ===' as section;

SELECT * FROM public.verify_data_integrity();

-- 3. Vérification des tables créées
SELECT '' as separator;
SELECT '=== VÉRIFICATION DES TABLES CRÉÉES ===' as section;

SELECT
    table_name,
    CASE WHEN table_type = 'BASE TABLE' THEN '✅ TABLE' ELSE '📋 VUE' END as type,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = table_name
    ) THEN '🔒 RLS' ELSE '🔓 OUVERT' END as security
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_type, table_name;

-- 4. Vérification des fonctions disponibles
SELECT '' as separator;
SELECT '=== VÉRIFICATION DES FONCTIONS DISPONIBLES ===' as section;

SELECT
    routine_name,
    CASE WHEN routine_type = 'FUNCTION' THEN '🔧 FONCTION' ELSE '⚙️ PROCÉDURE' END as type,
    CASE WHEN external_language IS NULL THEN '📄 SQL' ELSE '🐍 PL/' || external_language END as language
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 5. Vérification des utilisateurs de test
SELECT '' as separator;
SELECT '=== VÉRIFICATION DES UTILISATEURS DE TEST ===' as section;

SELECT
    role,
    COUNT(*) as total_utilisateurs,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as actifs,
    COUNT(CASE WHEN email LIKE '%@example.com' THEN 1 END) as test_accounts
FROM public.users
GROUP BY role
ORDER BY role;

-- 6. Vérification des profils marchands
SELECT '' as separator;
SELECT '=== VÉRIFICATION DES PROFILS MARCHANDS ===' as section;

SELECT
    u.email,
    u.name,
    mp.business_name,
    mp.business_type,
    mp.is_verified,
    mp.languages
FROM public.users u
JOIN public.merchant_profiles mp ON u.id = mp.user_id
WHERE u.role = 'merchant'
ORDER BY u.email;

-- 7. Vérification des coopératives
SELECT '' as separator;
SELECT '=== VÉRIFICATION DES COOPÉRATIVES ===' as section;

SELECT
    c.name,
    c.type,
    c.registration_number,
    COUNT(cm.user_id) as membres_count,
    c.status
FROM public.cooperatives c
LEFT JOIN public.cooperative_members cm ON c.id = cm.cooperative_id
GROUP BY c.id, c.name, c.type, c.registration_number, c.status
ORDER BY c.name;

-- 8. Vérification des producteurs
SELECT '' as separator;
SELECT '=== VÉRIFICATION DES PRODUCTEURS ===' as section;

SELECT
    u.email,
    u.name,
    pp.farm_name,
    pp.farm_size,
    pp.certification_type
FROM public.users u
JOIN public.producer_profiles pp ON u.id = pp.user_id
WHERE u.role = 'producer'
ORDER BY u.email;

-- 9. Vérification des relations marchands-coopératives
SELECT '' as separator;
SELECT '=== VÉRIFICATION DES RELATIONS MARCHANDS-COOPÉRATIVES ===' as section;

SELECT
    u.email as marchand_email,
    c.name as cooperative_name,
    r.relation_type,
    r.status,
    r.credit_limit,
    r.discount_rate,
    r.payment_terms
FROM public.merchant_cooperative_relations r
JOIN public.merchant_profiles mp ON r.merchant_id = mp.id
JOIN public.users u ON mp.user_id = u.id
JOIN public.cooperatives c ON r.cooperative_id = c.id
ORDER BY u.email, c.name;

-- 10. Vérification des produits
SELECT '' as separator;
SELECT '=== VÉRIFICATION DES PRODUITS ===' as section;

SELECT
    p.name,
    p.category,
    p.unit,
    p.unit_price,
    p.stock_quantity,
    p.is_active,
    CASE
        WHEN p.producer_id IS NOT NULL THEN '🌾 Producteur'
        WHEN p.cooperative_id IS NOT NULL THEN '🏢 Coopérative'
        WHEN p.merchant_id IS NOT NULL THEN '🏪 Marchand'
        ELSE '❓ Inconnu'
    END as owner_type
FROM public.products p
ORDER BY p.category, p.name
LIMIT 20;

-- 11. Vérification des commandes d'approvisionnement
SELECT '' as separator;
SELECT '=== VÉRIFICATION DES COMMANDES D''APPROVISIONNEMENT ===' as section;

SELECT
    so.order_number,
    buyer.email as acheteur,
    seller.email as vendeur,
    so.status,
    so.payment_status,
    so.total_amount,
    so.final_amount,
    so.is_recurring,
    so.recurring_frequency
FROM public.supply_orders so
JOIN public.users buyer ON so.buyer_id = buyer.id
JOIN public.users seller ON so.seller_id = seller.id
ORDER BY so.created_at DESC;

-- 12. Vérification des récoltes (nouvelle table)
SELECT '' as separator;
SELECT '=== VÉRIFICATION DES RÉCOLTES ===' as section;

SELECT
    u.email as producteur,
    p.name as produit,
    ph.harvest_date,
    ph.quantity,
    ph.unit,
    ph.quality_grade
FROM public.producer_harvests ph
JOIN public.producer_profiles pp ON ph.producer_id = pp.id
JOIN public.users u ON pp.user_id = u.id
JOIN public.products p ON ph.product_id = p.id
ORDER BY ph.harvest_date DESC;

-- 13. Vérification des ventes producteurs (nouvelle table)
SELECT '' as separator;
SELECT '=== VÉRIFICATION DES VENTES PRODUCTEURS ===' as section;

SELECT
    u.email as producteur,
    p.name as produit,
    ps.quantity,
    ps.unit_price,
    ps.total_price,
    ps.sale_date,
    ps.quality_grade
FROM public.producer_sales ps
JOIN public.producer_profiles pp ON ps.producer_id = pp.id
JOIN public.users u ON pp.user_id = u.id
JOIN public.products p ON ps.product_id = p.id
ORDER BY ps.sale_date DESC;

-- 14. Vérification des contraintes
SELECT '' as separator;
SELECT '=== VÉRIFICATION DES CONTRAINTES ===' as section;

SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    CASE WHEN tc.is_deferrable = 'YES' THEN 'OUI' ELSE 'NON' END as deferrable
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 15. Vérification des index
SELECT '' as separator;
SELECT '=== VÉRIFICATION DES INDEX ===' as section;

SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 16. Test des fonctions critiques
SELECT '' as separator;
SELECT '=== TEST DES FONCTIONS CRITIQUES ===' as section;

-- Test de génération de numéro de commande
SELECT
    'generate_order_number' as fonction,
    CASE WHEN public.generate_order_number() LIKE 'ORD-________-____' THEN '✅ SUCCÈS' ELSE '❌ ÉCHEC' END as resultat;

-- Test de génération de numéro de commande d'approvisionnement
SELECT
    'generate_supply_order_number' as fonction,
    CASE WHEN public.generate_supply_order_number() LIKE 'SUP-________-____' THEN '✅ SUCCÈS' ELSE '❌ ÉCHEC' END as resultat;

-- Test de la fonction de vérification de données
SELECT
    'verify_data_integrity' as fonction,
    CASE WHEN (SELECT COUNT(*) FROM public.verify_data_integrity() WHERE status = 'FAILED') = 0
          THEN '✅ SUCCÈS'
          ELSE '❌ ' || (SELECT COUNT(*) FROM public.verify_data_integrity() WHERE status = 'FAILED') || ' problèmes' END as resultat;

-- Test de la fonction de santé du système
SELECT
    'system_health_check' as fonction,
    CASE WHEN (SELECT COUNT(*) FROM public.system_health_check() WHERE status = 'ERROR') = 0
          THEN '✅ SUCCÈS'
          ELSE '❌ Erreurs détectées' END as resultat;

-- 17. Résumé final
SELECT '' as separator;
SELECT '=== RÉSUMÉ FINAL ===' as section;

SELECT
    'Statut Global' as metrique,
    CASE
        WHEN (SELECT COUNT(*) FROM public.verify_data_integrity() WHERE status = 'FAILED') = 0
        AND (SELECT COUNT(*) FROM public.system_health_check() WHERE status = 'ERROR') = 0
        THEN '✅ SYSTÈME PRÊT'
        ELSE '❌ PROBLÈMES DÉTECTÉS'
    END as valeur
UNION ALL
SELECT
    'Utilisateurs de test' as metrique,
    (SELECT COUNT(*) FROM public.users WHERE email LIKE '%@example.com')::TEXT || ' comptes' as valeur
UNION ALL
SELECT
    'Relations marchands-coopératives' as metrique,
    (SELECT COUNT(*) FROM public.merchant_cooperative_relations)::TEXT || ' relations' as valeur
UNION ALL
SELECT
    'Commandes d''approvisionnement' as metrique,
    (SELECT COUNT(*) FROM public.supply_orders)::TEXT || ' commandes' as valeur
UNION ALL
SELECT
    'Récoltes enregistrées' as metrique,
    (SELECT COUNT(*) FROM public.producer_harvests)::TEXT || ' récoltes' as valeur
UNION ALL
SELECT
    'Ventes producteurs' as metrique,
    (SELECT COUNT(*) FROM public.producer_sales)::TEXT || ' ventes' as valeur
UNION ALL
SELECT
    'Produits actifs' as metrique,
    (SELECT COUNT(*) FROM public.products WHERE is_active = true)::TEXT || ' produits' as valeur;

-- 18. Instructions finales
SELECT '' as separator;
SELECT '=== INSTRUCTIONS FINALES ===' as section;
SELECT 'Si tous les tests sont en SUCCÈS, le système est prêt pour les tests d''intégration.' as instructions;
SELECT 'Sinon, consultez les erreurs ci-dessus et corrigez-les avant de procéder.' as avertissement;
SELECT '' as separator;