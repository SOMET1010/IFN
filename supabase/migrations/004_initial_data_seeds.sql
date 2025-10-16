-- Données initiales et seeds pour la plateforme d'inclusion numérique

-- Insertion des coopératives exemples
INSERT INTO public.cooperatives (
    name, description, registration_number, address, phone, email, established_date, legal_structure, sector, number_of_members
) VALUES
(
    'Coopérative Agricole de Yamoussoukro',
    'Coopérative regroupant les producteurs agricoles de la région de Yamoussoukro',
    'COOP-AGR-001-2024',
    'Yamoussoukro, Quartier Administratif',
    '+225 27 20 00 00',
    'contact@coopagroyam.ci',
    '2020-03-15',
    'Coopérative Agricole',
    'Agriculture',
    150
),
(
    'Union des Producteurs d''Abidjan',
    'Union des petits producteurs maraîchers de la zone d''Abidjan',
    'UPA-002-2024',
    'Abidjan, Cocody',
    '+225 27 21 00 00',
    'info@upa-abidjan.ci',
    '2019-07-20',
    'Association',
    'Maraîchage',
    85
),
(
    'Coopérative des Pêcheurs de Grand-Bassam',
    'Coopérative des pêcheurs artisanaux de la côte de Grand-Bassam',
    'COOP-PECHE-003-2024',
    'Grand-Bassam, Quartier Pêcheur',
    '+225 27 23 00 00',
    'peche@grandbassam.ci',
    '2021-01-10',
    'Coopérative de Pêche',
    'Pêche',
    45
),
(
    'Alliance des Éleveurs de Volaille',
    'Regroupement des éleveurs de volaille de Côte d''Ivoire',
    'AEV-004-2024',
    'Bouaké, Zone Industrielle',
    '+225 27 22 00 00',
    'contact@elevagevolaille.ci',
    '2022-05-30',
    'Coopérative d''Élevage',
    'Élevage',
    120
);

-- Insertion des produits exemples
INSERT INTO public.products (
    name, description, category, price, unit, stock_quantity, minimum_stock, is_organic, is_featured, images, tags
) VALUES
-- Fruits
('Mangue', 'Mangues fraîches de qualité supérieure', 'fruits', 500.00, 'kg', 1000, 100, true, true, '{"/images/mango.jpg"}', '{"fruit", "tropical", "saison"}'),
('Ananas', 'Ananas Victoria juteux et sucrés', 'fruits', 800.00, 'piece', 500, 50, true, true, '{"/images/pineapple.jpg"}', '{"fruit", "exotique", "populaire"}'),
('Banane', 'Bananes plantain locales', 'fruits', 300.00, 'kg', 2000, 200, false, false, '{"/images/banana.jpg"}', '{"fruit", "local", "basique"}'),
('Papaye', 'Papayes mûres et savoureuses', 'fruits', 400.00, 'piece', 300, 30, true, false, '{"/images/papaya.jpg"}', '{"fruit", "santé", "vitamine"}'),
('Orange', 'Oranges juteuses de Bingerville', 'fruits', 600.00, 'kg', 800, 80, true, false, '{"/images/orange.jpg"}', '{"fruit", "agrumes", "vitamineC"}'),

-- Légumes
('Tomate', 'Tomates fraîches locales', 'legumes', 400.00, 'kg', 1500, 150, false, true, '{"/images/tomato.jpg"}', '{"legume", "local", "salade"}'),
('Oignon', 'Oignons blancs de qualité', 'legumes', 600.00, 'kg', 2000, 200, false, false, '{"/images/onion.jpg"}', '{"legume", "condiment", "conservation"}'),
('Gombo', 'Gombo frais de la région', 'legumes', 800.00, 'kg', 500, 50, true, false, '{"/images/okra.jpg"}', '{"legume", "local", "traditionnel"}'),
('Aubergine', 'Aubergines violettes', 'legumes', 500.00, 'kg', 400, 40, false, false, '{"/images/eggplant.jpg"}', '{"legume", "solanacées"}'),
('Piment', 'Piment fort local', 'legumes', 1200.00, 'kg', 200, 20, true, false, '{"/images/pepper.jpg"}', '{"legume", "épice", "fort"}'),

-- Volaille
('Poulet', 'Poulet fermier élevé en plein air', 'volaille', 2500.00, 'piece', 100, 10, true, true, '{"/images/chicken.jpg"}', '{"volaille", "fermier", "bio"}'),
('Dinde', 'Dinde de qualité supérieure', 'volaille', 4500.00, 'piece', 30, 5, false, false, '{"/images/turkey.jpg"}', '{"volaille", "fête", "gros"}'),
('Caille', 'Caille locale', 'volaille', 1500.00, 'piece', 50, 5, true, false, '{"/images/quail.jpg"}', '{"volaille", "petit", "delicat"}'),

-- Poissons
('Tilapia', 'Tilapia frais du lac', 'poissons', 1200.00, 'kg', 200, 20, false, true, '{"/images/tilapia.jpg"}', '{"poisson", "lac", "populaire"}'),
('Carpe', 'Carpe d''élevage', 'poissons', 1000.00, 'kg', 150, 15, false, false, '{"/images/carp.jpg"}', '{"poisson", "eau douce"}'),
('Thon', 'Thon frais du golfe de Guinée', 'poissons', 2500.00, 'kg', 80, 8, false, false, '{"/images/tuna.jpg"}', '{"poisson", "mer", "haut de gamme"}'),

-- Céréales
('Riz local', 'Riz ivoirien de qualité', 'cereales', 600.00, 'kg', 3000, 300, false, true, '{"/images/rice.jpg"}', '{"cereale", "local", "base"}'),
('Maïs', 'Maïs grain de la région', 'cereales', 400.00, 'kg', 5000, 500, false, false, '{"/images/maize.jpg"}', '{"cereale", "local", "tropical"}'),
('Mil', 'Mil petit grain', 'cereales', 800.00, 'kg', 1000, 100, true, false, '{"/images/millet.jpg"}', '{"cereale", "sahel", "traditionnel"}');

-- Insertion des offres des producteurs
INSERT INTO public.producer_offers (
    product_id, quantity, unit, price, description, harvest_date, location, quality, minimum_order_quantity
) VALUES
(
    (SELECT id FROM public.products WHERE name = 'Mangue'),
    500, 'kg', 450.00, 'Mangues de première qualité, récoltées ce matin', '2024-01-15', 'Yamoussoukro', 'Premium', 50
),
(
    (SELECT id FROM public.products WHERE name = 'Tomate'),
    1000, 'kg', 350.00, 'Tomates locales fraîches', '2024-01-15', 'Abidjan', 'Standard', 100
),
(
    (SELECT id FROM public.products WHERE name = 'Poulet'),
    50, 'piece', 2400.00, 'Poulets fermiers engraissés naturellement', '2024-01-14', 'Bouaké', 'Bio', 5
),
(
    (SELECT id FROM public.products WHERE name = 'Tilapia'),
    100, 'kg', 1100.00, 'Tilapia frais pêché ce matin', '2024-01-15', 'Grand-Bassam', 'Standard', 20
),
(
    (SELECT id FROM public.products WHERE name = 'Riz local'),
    2000, 'kg', 550.00, 'Riz ivoirien de nouvelle récolte', '2024-01-10', 'Yamoussoukro', 'Standard', 100
);

-- Insertion des enrôlements de marchands exemples
INSERT INTO public.merchant_enrollments (
    user_id, first_name, last_name, date_of_birth, nationality, phone, email, address, commune, market, market_type,
    cni_number, business_name, business_type, status, submitted_at
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Kouame', 'Konan', '1985-05-15', 'Ivoirienne', '+225 07 00 00 00', 'kouame.konan@email.com',
    'Abidjan, Cocody', 'Cocody', 'Marché de Cocody', 'modern',
    'CI123456789', 'Supermarché Konan', 'Épicerie', 'approved', '2024-01-10'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Touré', 'Fatoumata', '1990-08-20', 'Ivoirienne', '+225 07 11 11 11', 'fatou.toure@email.com',
    'Bouaké, Zone Commerciale', 'Bouaké', 'Marché Central', 'traditional',
    'CI987654321', 'Boutique Fatou', 'Épicerie générale', 'approved', '2024-01-12'
),
(
    '00000000-0000-0000-0000-000000000003',
    'Diabaté', 'Mamadou', '1988-12-03', 'Ivoirienne', '+225 07 22 22 22', 'mamadou.diabate@email.com',
    'Yamoussoukro, Centre Ville', 'Yamoussoukro', 'Marché Municipal', 'traditional',
    'CI456789123', 'Alimentation Diabaté', 'Produits alimentaires', 'under_review', '2024-01-14'
);

-- Création des profils marchands pour les enrôlements approuvés
INSERT INTO public.merchant_profiles (
    user_id, business_name, business_type, business_address, market_name, market_type, commune, is_verified
) VALUES
(
    (SELECT id FROM public.users WHERE email = 'kouame.konan@email.com'),
    'Supermarché Konan', 'Épicerie', 'Abidjan, Cocody', 'Marché de Cocody', 'modern', 'Cocody', true
),
(
    (SELECT id FROM public.users WHERE email = 'fatou.toure@email.com'),
    'Boutique Fatou', 'Épicerie générale', 'Bouaké, Zone Commerciale', 'Marché Central', 'traditional', 'Bouaké', true
);

-- Insertion des profils producteurs exemples
INSERT INTO public.producer_profiles (
    user_id, farm_name, farm_location, farm_size, main_products, experience_years, description, is_certified
) VALUES
(
    '00000000-0000-0000-0000-000000000004',
    'Ferme Tropical', 'Yamoussoukro, Zone Agricole', 5.5, '{'Mangue', 'Ananas', 'Banane'}', 8,
    'Ferme familiale spécialisée dans les fruits tropicaux, certifiée bio depuis 2020', true
),
(
    '00000000-0000-0000-0000-000000000005',
    'Élevage de la Vallée', 'Bouaké, Zone d''Élevage', 2.0, '{'Poulet', 'Dinde'}', 5,
    'Élevage de volaille en plein air, respectueux du bien-être animal', true
),
(
    '00000000-0000-0000-0000-000000000006',
    'Pêche Maritime', 'Grand-Bassam, Côte', 1.0, '{'Tilapia', 'Carpe'}', 12,
    'Pêche artisanale traditionnelle, respect des saisons de pêche', false
);

-- Mise à jour des produits avec les IDs des producteurs
UPDATE public.products SET producer_id = (SELECT id FROM public.producer_profiles WHERE farm_name = 'Ferme Tropical') WHERE name IN ('Mangue', 'Ananas', 'Banane');
UPDATE public.products SET producer_id = (SELECT id FROM public.producer_profiles WHERE farm_name = 'Élevage de la Vallée') WHERE name IN ('Poulet', 'Dinde');
UPDATE public.products SET producer_id = (SELECT id FROM public.producer_profiles WHERE farm_name = 'Pêche Maritime') WHERE name IN ('Tilapia', 'Carpe');

-- Insertion des membres de coopératives exemples
INSERT INTO public.cooperative_members (
    cooperative_id, user_id, role, join_date, contribution_type, contribution_amount
) VALUES
(
    (SELECT id FROM public.cooperatives WHERE name = 'Coopérative Agricole de Yamoussoukro'),
    (SELECT id FROM public.users WHERE email = 'kouame.konan@email.com'),
    'membre', '2024-01-10', 'mensuelle', 5000.00
),
(
    (SELECT id FROM public.cooperatives WHERE name = 'Coopérative Agricole de Yamoussoukro'),
    (SELECT id FROM public.producer_profiles WHERE farm_name = 'Ferme Tropical'),
    'producteur', '2024-01-12', 'mensuelle', 3000.00
),
(
    (SELECT id FROM public.cooperatives WHERE name = 'Alliance des Éleveurs de Volaille'),
    (SELECT id FROM public.producer_profiles WHERE farm_name = 'Élevage de la Vallée'),
    'éleveur', '2024-01-11', 'mensuelle', 4000.00
),
(
    (SELECT id FROM public.cooperatives WHERE name = 'Coopérative des Pêcheurs de Grand-Bassam'),
    (SELECT id FROM public.producer_profiles WHERE farm_name = 'Pêche Maritime'),
    'pêcheur', '2024-01-13', 'hebdomadaire', 2000.00
);

-- Mise à jour du nombre de membres dans les coopératives
UPDATE public.cooperatives SET number_of_members = (
    SELECT COUNT(*) FROM public.cooperative_members WHERE cooperative_id = public.cooperatives.id
);

-- Insertion des notifications exemples
INSERT INTO public.notifications (
    user_id, type, title, message, data, priority, is_read, created_at
) VALUES
(
    (SELECT id FROM public.users WHERE email = 'kouame.konan@email.com'),
    'welcome', 'Bienvenue sur la plateforme', 'Bienvenue sur la plateforme d''inclusion numérique !',
    '{"type": "welcome"}', 'normal', false, '2024-01-15 10:00:00'
),
(
    (SELECT id FROM public.users WHERE email = 'fatou.toure@email.com'),
    'new_offer', 'Nouvelle offre disponible', 'De nouvelles offres de produits sont disponibles dans votre région',
    '{"type": "offers", "count": 5}', 'normal', false, '2024-01-15 11:00:00'
),
(
    (SELECT id FROM public.producer_profiles WHERE farm_name = 'Ferme Tropical'),
    'low_stock', 'Stock faible', 'Votre stock de mangue est faible (100 kg restant)',
    '{"type": "stock", "product": "Mangue", "current": 100, "minimum": 100}', 'high', false, '2024-01-15 12:00:00'
);

-- Insertion des révisions exemples
INSERT INTO public.reviews (
    product_id, user_id, rating, title, comment, status, created_at
) VALUES
(
    (SELECT id FROM public.products WHERE name = 'Mangue'),
    (SELECT id FROM public.users WHERE email = 'kouame.konan@email.com'),
    5, 'Excellentes mangues !', 'Les mangues sont très fraîches et délicieuses. Je recommande vivement !',
    'approved', '2024-01-14'
),
(
    (SELECT id FROM public.products WHERE name = 'Poulet'),
    (SELECT id FROM public.users WHERE email = 'fatou.toure@email.com'),
    4, 'Bon poulet fermier', 'Le poulet est de bonne qualité, bien engraissé et savoureux',
    'approved', '2024-01-13'
),
(
    (SELECT id FROM public.products WHERE name = 'Tilapia'),
    (SELECT id FROM public.users WHERE email = 'kouame.konan@email.com'),
    3, 'Poisson correct', 'Le tilapia est frais mais un peu petit pour le prix',
    'pending', '2024-01-12'
);

-- Mise à jour des statistiques de notation des produits
UPDATE public.products p SET
    rating = COALESCE((SELECT AVG(r.rating) FROM public.reviews r WHERE r.product_id = p.id AND r.status = 'approved'), 0),
    total_reviews = COALESCE((SELECT COUNT(*) FROM public.reviews r WHERE r.product_id = p.id AND r.status = 'approved'), 0)
WHERE p.id IN (SELECT product_id FROM public.reviews);

-- Création des commandes exemples
INSERT INTO public.orders (
    order_number, buyer_id, seller_id, seller_type, total_amount, delivery_fee, tax_amount, discount_amount, status, payment_status, payment_method, delivery_method, created_at
) VALUES
(
    'ORD-20240115-0001',
    (SELECT id FROM public.users WHERE email = 'kouame.konan@email.com'),
    (SELECT id FROM public.producer_profiles WHERE farm_name = 'Ferme Tropical'),
    'producer', 2250.00, 500.00, 225.00, 0.00, 'delivered', 'paid', 'mobile_money', 'delivery', '2024-01-14'
),
(
    'ORD-20240115-0002',
    (SELECT id FROM public.users WHERE email = 'fatou.toure@email.com'),
    (SELECT id FROM public.producer_profiles WHERE farm_name = 'Élevage de la Vallée'),
    'producer', 5000.00, 300.00, 500.00, 0.00, 'confirmed', 'pending', 'bank_transfer', 'pickup', '2024-01-15'
);

-- Insertion des éléments de commande
INSERT INTO public.order_items (
    order_id, product_id, product_name, quantity, unit_price
) VALUES
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-20240115-0001'),
    (SELECT id FROM public.products WHERE name = 'Mangue'),
    'Mangue', 5, 450.00
),
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-20240115-0002'),
    (SELECT id FROM public.products WHERE name = 'Poulet'),
    'Poulet', 2, 2500.00
);

-- Insertion des paiements
INSERT INTO public.payments (
    order_id, amount, currency, method, status, payment_date, transaction_reference
) VALUES
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-20240115-0001'),
    2975.00, 'FCFA', 'mobile_money', 'paid', '2024-01-14', 'TXN-20240114-0001'
),
(
    (SELECT id FROM public.orders WHERE order_number = 'ORD-20240115-0002'),
    5800.00, 'FCFA', 'bank_transfer', 'pending', NULL, 'TXN-20240115-0002'
);

-- Création des paniers exemples
INSERT INTO public.carts (
    user_id, total_items, total_amount, created_at
) VALUES
(
    (SELECT id FROM public.users WHERE email = 'kouame.konan@email.com'),
    0, 0, '2024-01-15'
),
(
    (SELECT id FROM public.users WHERE email = 'fatou.toure@email.com'),
    0, 0, '2024-01-15'
);

-- Insertion des éléments de panier exemples
INSERT INTO public.cart_items (
    cart_id, product_id, quantity, unit_price, added_at
) VALUES
(
    (SELECT id FROM public.carts WHERE user_id = (SELECT id FROM public.users WHERE email = 'kouame.konan@email.com')),
    (SELECT id FROM public.products WHERE name = 'Tomate'),
    2, 400.00, '2024-01-15 14:00:00'
),
(
    (SELECT id FROM public.carts WHERE user_id = (SELECT id FROM public.users WHERE email = 'kouame.konan@email.com')),
    (SELECT id FROM public.products WHERE name = 'Oignon'),
    1, 600.00, '2024-01-15 14:05:00'
);

-- Mise à jour des totaux des paniers
UPDATE public.carts SET
    total_items = (SELECT COUNT(*) FROM public.cart_items WHERE cart_id = public.carts.id),
    total_amount = COALESCE((SELECT SUM(quantity * unit_price) FROM public.cart_items WHERE cart_id = public.carts.id), 0)
WHERE id IN (SELECT cart_id FROM public.cart_items);

-- Activation des coopératives
UPDATE public.cooperatives SET status = 'active', is_verified = true;

-- Activation des utilisateurs de test
UPDATE public.users SET status = 'active' WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
UPDATE public.users SET role = 'merchant' WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
UPDATE public.users SET role = 'producer' WHERE id IN ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006');

-- Création d'un utilisateur administrateur
INSERT INTO public.users (
    id, email, name, role, status, created_at, updated_at
) VALUES
('00000000-0000-0000-0000-000000000007', 'admin@inclusionnumerique.ci', 'Administrateur Système', 'admin', 'active', '2024-01-01', '2024-01-01');

-- Création d'un utilisateur producteur additionnel
INSERT INTO public.users (
    id, email, name, role, status, created_at, updated_at
) VALUES
('00000000-0000-0000-0000-000000000008', 'producer@example.com', 'Producteur Exemple', 'producer', 'active', '2024-01-01', '2024-01-01');

-- Création d'un utilisateur marchand additionnel
INSERT INTO public.users (
    id, email, name, role, status, created_at, updated_at
) VALUES
('00000000-0000-0000-0000-000000000009', 'merchant@example.com', 'Marchand Exemple', 'merchant', 'active', '2024-01-01', '2024-01-01');

-- Création d'un utilisateur coopérative
INSERT INTO public.users (
    id, email, name, role, status, created_at, updated_at
) VALUES
('00000000-0000-0000-0000-000000000010', 'cooperative@example.com', 'Gestionnaire Coopérative', 'cooperative', 'active', '2024-01-01', '2024-01-01');