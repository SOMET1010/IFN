-- Migration pour créer des commandes d'approvisionnement de test et démontrer le fonctionnement du système

-- Création de commandes d'approvisionnement test
INSERT INTO public.supply_orders (
    buyer_id, buyer_type, seller_id, seller_type, cooperative_relation_id, total_amount, delivery_fee, tax_amount, discount_amount, status, payment_status, payment_method, payment_terms, delivery_method, delivery_address, requested_delivery_date, priority, notes
) VALUES
-- Commande 1: Supermarché Kouamé vers Coopérative Agricole de Yamoussoukro
((SELECT id FROM public.users WHERE email = 'marchand1@example.com'), 'merchant',
 (SELECT id FROM public.users WHERE email = 'gestion1@example.com'), 'cooperative',
 (SELECT id FROM public.merchant_cooperative_relations WHERE merchant_id = (SELECT id FROM public.merchant_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com'))),
 250000.00, 15000.00, 25000.00, 12500.00, 'confirmed', 'paid', 'bank_transfer', '15_days', 'coop_deliver',
 '{"address": "Abidjan, Plateau, Rue des Prêtres", "contact": "+225 07 11 11 11", "instructions": "Livraison le matin avant 8h"}',
 '2024-01-20', 'high', 'Commande hebdomadaire de fruits et légumes frais'),

-- Commande 2: Épicerie Touré vers Union des Producteurs d''Abidjan
((SELECT id FROM public.users WHERE email = 'marchand2@example.com'), 'merchant',
 (SELECT id FROM public.users WHERE email = 'gestion2@example.com'), 'cooperative',
 (SELECT id FROM public.merchant_cooperative_relations WHERE merchant_id = (SELECT id FROM public.merchant_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'marchand2@example.com'))),
 85000.00, 5000.00, 8500.00, 2550.00, 'confirmed', 'pending', 'mobile_money', '7_days', 'pickup',
 NULL, '2024-01-18', 'normal', 'Commande bi-hebdomadaire de légumes frais'),

-- Commande 3: Marché Yao vers Alliance des Éleveurs de Volaille
((SELECT id FROM public.users WHERE email = 'marchand3@example.com'), 'merchant',
 (SELECT id FROM public.users WHERE email = 'producer3@example.com'), 'cooperative',
 (SELECT id FROM public.merchant_cooperative_relations WHERE merchant_id = (SELECT id FROM public.merchant_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'marchand3@example.com'))),
 450000.00, 25000.00, 45000.00, 36000.00, 'preparing', 'partially_paid', 'bank_transfer', '30_days', 'delivery',
 '{"address": "Yamoussoukro, Centre Ville, Marché Municipal", "contact": "+225 07 33 33 33", "instructions": "Livraison en caisses spécialisées"}',
 '2024-01-25', 'high', 'Commande mensuelle de volaille pour le marché de gros'),

-- Commande 4: Boutique Fatima vers Coopérative des Pêcheurs de Grand-Bassam
((SELECT id FROM public.users WHERE email = 'marchand4@example.com'), 'merchant',
 (SELECT id FROM public.users WHERE email = 'gestion3@example.com'), 'cooperative',
 (SELECT id FROM public.merchant_cooperative_relations WHERE merchant_id = (SELECT id FROM public.merchant_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'marchand4@example.com'))),
 120000.00, 8000.00, 12000.00, 4800.00, 'shipped', 'paid', 'mobile_money', 'immediate', 'pickup',
 NULL, '2024-01-17', 'normal', 'Commande hebdomadaire de poissons frais'),

-- Commande 5: Alimentation Koné vers Coopérative Agricole de Yamoussoukro (commande récurrente)
((SELECT id FROM public.users WHERE email = 'marchand5@example.com'), 'merchant',
 (SELECT id FROM public.users WHERE email = 'gestion1@example.com'), 'cooperative',
 (SELECT id FROM public.merchant_cooperative_relations WHERE merchant_id = (SELECT id FROM public.merchant_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'marchand5@example.com'))),
 180000.00, 12000.00, 18000.00, 10800.00, 'confirmed', 'pending', 'bank_transfer', '15_days', 'delivery',
 '{"address": "San-Pédro, Port de Pêche", "contact": "+225 07 55 55 55", "instructions": "Livraison conditionnée pour la revente"}',
 '2024-01-22', 'normal', 'Commande bi-mensuelle de produits transformés', '2024-01-22', '2024-06-30', true, 'biweekly');

-- Création des éléments de commande d'approvisionnement
INSERT INTO public.supply_order_items (
    order_id, product_id, product_name, product_description, quantity, unit_price, notes
) VALUES
-- Éléments pour la commande 1 (Supermarché Kouamé)
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Mangue'), 'Mangue Premium', 'Mangues fraîches de qualité supérieure', 100, 450.00, 'Variété : Amélie'),
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Tomate'), 'Tomate Fraîche', 'Tomates locales de première qualité', 150, 400.00, 'Tomates cerises et rondes'),
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Ananas'), 'Ananas Victoria', 'Ananas juteux et sucrés', 80, 800.00, 'Calibre : Extra'),
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Oignon'), 'Oignon Blanc', 'Oignons blancs de qualité', 50, 600.00, 'Oignons nouveaux'),

-- Éléments pour la commande 2 (Épicerie Touré)
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand2@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion2@example.com')),
 (SELECT id FROM public.products WHERE name = 'Tomate'), 'Tomate Fraîche', 'Tomates pour épicerie de quartier', 80, 400.00, 'Tomates fermes et mûres'),
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand2@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion2@example.com')),
 (SELECT id FROM public.products WHERE name = 'Aubergine'), 'Aubergine Violette', 'Aubergines fraîches', 40, 500.00, 'Calibre moyen'),
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand2@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion2@example.com')),
 (SELECT id FROM public.products WHERE name = 'Piment'), 'Piment Fort', 'Piment local', 10, 1200.00, 'Piment frais et fort'),

-- Éléments pour la commande 3 (Marché Yao)
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand3@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'producer3@example.com')),
 (SELECT id FROM public.products WHERE name = 'Poulet'), 'Poulet Fermier', 'Poulets entiers de 2kg', 100, 2500.00, 'Poulets Label Rouge'),
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand3@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'producer3@example.com')),
 (SELECT id FROM public.products WHERE name = 'Dinde'), 'Dinde Premium', 'Dindes de 4kg', 50, 4500.00, 'Dindes fermières'),

-- Éléments pour la commande 4 (Boutique Fatima)
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand4@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion3@example.com')),
 (SELECT id FROM public.products WHERE name = 'Tilapia'), 'Tilapia Frais', 'Tilapia entier 500-700g', 60, 1200.00, 'Pêché ce matin'),
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand4@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion3@example.com')),
 (SELECT id FROM public.products WHERE name = 'Carpe'), 'Carpe d''Eau Douce', 'Carpe 1-2kg', 40, 1000.00, 'Carpe fraîche du lac'),

-- Éléments pour la commande 5 (Alimentation Koné)
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand5@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Riz local'), 'Riz Ivoirien', 'Riz local de qualité', 200, 600.00, 'Riz blanc local'),
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand5@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Maïs'), 'Maïs Grain', 'Maïs grain pour transformation', 150, 400.00, 'Maïs jaune'),
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand5@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Igname Blanc'), 'Igname Premium', 'Igname blanc de première qualité', 80, 800.00, 'Igname frais');

-- Création des paiements pour les commandes d'approvisionnement
INSERT INTO public.payments (
    order_id, amount, currency, method, provider, status, payment_date, transaction_reference, metadata
) VALUES
-- Paiement pour la commande 1
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')),
 277500.00, 'FCFA', 'bank_transfer', 'Ecobank', 'paid', '2024-01-16', 'TXN-SUP-2024-001-001',
 '{"payment_terms": "15_days", "due_date": "2024-01-31", "contract_reference": "CONT-2024-001"}'),

-- Paiement partiel pour la commande 3
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand3@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'producer3@example.com')),
 250000.00, 'FCFA', 'bank_transfer', 'NSIA Banque', 'partially_paid', '2024-01-16', 'TXN-SUP-2024-003-001',
 '{"payment_terms": "30_days", "due_date": "2024-02-15", "installment": 1, "total_amount": 484000.00}'),

-- Paiement pour la commande 4
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand4@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion3@example.com')),
 135200.00, 'FCFA', 'mobile_money', 'Orange Money', 'paid', '2024-01-16', 'TXN-SUP-2024-004-001',
 '{"payment_terms": "immediate", "provider": "Orange Money", "confirmation_code": "123456"}');

-- Création des livraisons pour certaines commandes
INSERT INTO public.supply_deliveries (
    order_id, delivery_number, delivery_date, delivered_by, received_by, status, tracking_number, carrier_name, carrier_contact, notes
) VALUES
-- Livraison pour la commande 4 (Boutique Fatima)
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand4@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion3@example.com')),
 'DLV-2024-001', '2024-01-17 08:00:00', (SELECT id FROM public.users WHERE email = 'gestion3@example.com'), (SELECT id FROM public.users WHERE email = 'marchand4@example.com'), 'delivered',
 'TRK-2024-001', 'Transports Express', '+225 07 99 99 99', 'Livraison effectuée dans les temps, produits frais'),

-- Livraison partielle pour la commande 1
((SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')),
 'DLV-2024-002', '2024-01-18 07:30:00', (SELECT id FROM public.users WHERE email = 'gestion1@example.com'), NULL, 'in_transit',
 'TRK-2024-002', 'Logistique Yamoussoukro', '+225 07 88 88 88', 'En cours de livraison, arrivée estimée à 10h');

-- Création des éléments de livraison
INSERT INTO public.supply_delivery_items (
    delivery_id, order_item_id, quantity_delivered, quantity_received, quantity_rejected, rejection_reason, quality_check_passed, notes
) VALUES
-- Éléments pour la livraison 1 (commande 4)
((SELECT id FROM public.supply_deliveries WHERE delivery_number = 'DLV-2024-001'),
 (SELECT id FROM public.supply_order_items WHERE order_id = (SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand4@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion3@example.com')) AND product_id = (SELECT id FROM public.products WHERE name = 'Tilapia')),
 60, 58, 2, 'Taille insuffisante pour certains spécimens', true, '2 tilapias rejetés pour non-conformité au calibre'),
((SELECT id FROM public.supply_deliveries WHERE delivery_number = 'DLV-2024-001'),
 (SELECT id FROM public.supply_order_items WHERE order_id = (SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand4@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion3@example.com')) AND product_id = (SELECT id FROM public.products WHERE name = 'Carpe')),
 40, 40, 0, NULL, true, 'Toutes les carpes conformes');

-- Notifications pour les commandes d'approvisionnement
INSERT INTO public.notifications (
    user_id, type, title, message, data, priority, created_at
) VALUES
-- Notification pour le vendeur (commande 1)
((SELECT id FROM public.users WHERE email = 'gestion1@example.com'),
 'new_supply_order', 'Nouvelle commande d''approvisionnement', 'Le Supermarché Kouamé a passé une commande de 250,000 FCFA',
 '{"order_id": "' || (SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')) || '", "order_number": "' || (SELECT order_number FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')) || '", "amount": 250000}', 'high', NOW()),

-- Notification pour l''acheteur (commande 1)
((SELECT id FROM public.users WHERE email = 'marchand1@example.com'),
 'supply_order_confirmed', 'Commande confirmée', 'Votre commande d''approvisionnement #SUP-20240116-0001 a été confirmée par la coopérative',
 '{"order_id": "' || (SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')) || '", "order_number": "' || (SELECT order_number FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')) || '", "delivery_date": "2024-01-20"}', 'normal', NOW()),

-- Notification de paiement reçu (commande 1)
((SELECT id FROM public.users WHERE email = 'gestion1@example.com'),
 'supply_payment_received', 'Paiement reçu', 'Paiement de 277,500 FCFA reçu pour la commande #SUP-20240116-0001',
 '{"order_id": "' || (SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')) || '", "amount": 277500, "payment_method": "bank_transfer"}', 'normal', NOW()),

-- Notification de livraison en cours (commande 1)
((SELECT id FROM public.users WHERE email = 'marchand1@example.com'),
 'supply_delivery_in_transit', 'Livraison en cours', 'Votre commande est en cours de livraison. Arrivée estimée à 10h ce matin.',
 '{"order_id": "' || (SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')) || '", "delivery_number": "DLV-2024-002", "estimated_arrival": "10:00"}', 'normal', NOW()),

-- Notification de commande récurrente créée (commande 5)
((SELECT id FROM public.users WHERE email = 'marchand5@example.com'),
 'recurring_order_created', 'Commande récurrente créée', 'Votre commande bi-mensuelle a été créée et sera renouvelée automatiquement jusqu''au 30 juin 2024.',
 '{"order_id": "' || (SELECT id FROM public.supply_orders WHERE buyer_id = (SELECT id FROM public.users WHERE email = 'marchand5@example.com') AND seller_id = (SELECT id FROM public.users WHERE email = 'gestion1@example.com')) || '", "frequency": "biweekly", "end_date": "2024-06-30"}', 'normal', NOW());

-- Mise à jour des statistiques des marchands
UPDATE public.merchant_profiles SET
    total_sales = COALESCE((
        SELECT COUNT(*) FROM public.supply_orders
        WHERE buyer_id = public.merchant_profiles.user_id AND status = 'delivered'
    ), 0),
    total_revenue = COALESCE((
        SELECT COALESCE(SUM(final_amount), 0) FROM public.supply_orders
        WHERE buyer_id = public.merchant_profiles.user_id AND status = 'delivered'
    ), 0);

-- Mise à jour des statistiques des coopératives (en tant que vendeurs)
UPDATE public.cooperatives SET
    total_sales = COALESCE((
        SELECT COUNT(*) FROM public.supply_orders
        WHERE seller_id IN (SELECT user_id FROM public.cooperative_members WHERE cooperative_id = public.cooperatives.id) AND status = 'delivered'
    ), 0),
    total_revenue = COALESCE((
        SELECT COALESCE(SUM(final_amount), 0) FROM public.supply_orders
        WHERE seller_id IN (SELECT user_id FROM public.cooperative_members WHERE cooperative_id = public.cooperatives.id) AND status = 'delivered'
    ), 0);

-- Mise à jour des quantités livrées dans les éléments de commande
UPDATE public.supply_order_items soi
SET delivered_quantity = COALESCE((
    SELECT SUM(COALESCE(sdi.quantity_received, 0))
    FROM public.supply_delivery_items sdi
    WHERE sdi.order_item_id = soi.id
), 0),
backorder_quantity = GREATEST(0, soi.quantity - COALESCE((
    SELECT SUM(COALESCE(sdi.quantity_received, 0))
    FROM public.supply_delivery_items sdi
    WHERE sdi.order_item_id = soi.id
), 0))
WHERE soi.id IN (
    SELECT order_item_id FROM public.supply_delivery_items
);

-- Mise à jour du statut des commandes en fonction des livraisons
UPDATE public.supply_orders so
SET status =
    CASE
        WHEN (SELECT SUM(quantity) FROM public.supply_order_items WHERE order_id = so.id) =
             (SELECT SUM(COALESCE(delivered_quantity, 0)) FROM public.supply_order_items WHERE order_id = so.id)
        THEN 'delivered'
        WHEN (SELECT COUNT(*) FROM public.supply_order_items WHERE order_id = so.id AND delivered_quantity > 0) > 0
        THEN 'partially_delivered'
        ELSE so.status
    END
WHERE so.id IN (SELECT order_id FROM public.supply_deliveries);