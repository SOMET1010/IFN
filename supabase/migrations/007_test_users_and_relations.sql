-- Migration pour créer des comptes utilisateurs de test et établir les relations marchands-coopératives

-- Création des utilisateurs supplémentaires pour les tests
INSERT INTO public.users (
    id, email, name, role, status, phone, location, created_at, updated_at
) VALUES
-- Marchands supplémentaires
('00000000-0000-0000-0000-000000000011', 'marchand1@example.com', 'Jean Kouamé', 'merchant', 'active', '+225 07 11 11 11', 'Abidjan, Plateau', '2024-01-15', '2024-01-15'),
('00000000-0000-0000-0000-000000000012', 'marchand2@example.com', 'Aminata Touré', 'merchant', 'active', '+225 07 22 22 22', 'Abidjan, Treichville', '2024-01-15', '2024-01-15'),
('00000000-0000-0000-0000-000000000013', 'marchand3@example.com', 'Koffi Yao', 'merchant', 'active', '+225 07 33 33 33', 'Yamoussoukro', '2024-01-15', '2024-01-15'),
('00000000-0000-0000-0000-000000000014', 'marchand4@example.com', 'Fatima Diallo', 'merchant', 'active', '+225 07 44 44 44', 'Bouaké', '2024-01-15', '2024-01-15'),
('00000000-0000-0000-0000-000000000015', 'marchand5@example.com', 'Mamadou Koné', 'merchant', 'active', '+225 07 55 55 55', 'San-Pédro', '2024-01-15', '2024-01-15'),

-- Producteurs supplémentaires
('00000000-0000-0000-0000-000000000016', 'producteur1@example.com', 'Paul Amani', 'producer', 'active', '+225 07 66 66 66', 'Daloa', '2024-01-15', '2024-01-15'),
('00000000-0000-0000-0000-000000000017', 'producteur2@example.com', 'Marie N guessan', 'producer', 'active', '+225 07 77 77 77', 'Gagnoa', '2024-01-15', '2024-01-15'),
('00000000-0000-0000-0000-000000000018', 'producteur3@example.com', 'Isaac Ouattara', 'producer', 'active', '+225 07 88 88 88', 'Korhogo', '2024-01-15', '2024-01-15'),

-- Gestionnaires de coopératives
('00000000-0000-0000-0000-000000000019', 'gestion1@example.com', 'Sophie Bamba', 'cooperative', 'active', '+225 07 99 99 99', 'Yamoussoukro', '2024-01-15', '2024-01-15'),
('00000000-0000-0000-0000-000000000020', 'gestion2@example.com', 'Michel Dosso', 'cooperative', 'active', '+225 07 10 10 10', 'Abidjan', '2024-01-15', '2024-01-15'),
('00000000-0000-0000-0000-000000000021', 'gestion3@example.com', 'Estelle Kouadio', 'cooperative', 'active', '+225 07 20 20 20', 'Grand-Bassam', '2024-01-15', '2024-01-15');

-- Création des profils marchands pour les nouveaux utilisateurs
INSERT INTO public.merchant_profiles (
    user_id, business_name, business_type, business_address, market_name, market_type, commune, description, business_hours, is_verified
) VALUES
-- Profil pour Jean Kouamé (marchand1)
((SELECT id FROM public.users WHERE email = 'marchand1@example.com'),
 'Supermarché Kouamé', 'Grande surface', 'Abidjan, Plateau, Rue des Prêtres', 'Marché de Plateau', 'modern', 'Plateau',
 'Supermarché moderne proposant des produits frais et locaux. Spécialisé dans les fruits et légumes.',
 '{"lundi": "08:00-20:00", "mardi": "08:00-20:00", "mercredi": "08:00-20:00", "jeudi": "08:00-20:00", "vendredi": "08:00-20:00", "samedi": "08:00-22:00", "dimanche": "09:00-18:00"}',
 true),

-- Profil pour Aminata Touré (marchand2)
((SELECT id FROM public.users WHERE email = 'marchand2@example.com'),
 'Épicerie Touré', 'Épicerie générale', 'Abidjan, Treichville, Rue 12', 'Marché de Treichville', 'traditional', 'Treichville',
 'Épicerie de quartier proposant des produits de première nécessité et des produits frais.',
 '{"lundi": "07:00-19:00", "mardi": "07:00-19:00", "mercredi": "07:00-19:00", "jeudi": "07:00-19:00", "vendredi": "07:00-19:00", "samedi": "07:00-14:00", "dimanche": "fermé"}',
 true),

-- Profil pour Koffi Yao (marchand3)
((SELECT id FROM public.users WHERE email = 'marchand3@example.com'),
 'Marché Yao', 'Marché de gros', 'Yamoussoukro, Centre Ville', 'Marché Municipal', 'traditional', 'Yamoussoukro',
 'Marché de gros spécialisé dans les produits agricoles et alimentaires.',
 '{"lundi": "06:00-18:00", "mardi": "06:00-18:00", "mercredi": "06:00-18:00", "jeudi": "06:00-18:00", "vendredi": "06:00-18:00", "samedi": "06:00-15:00", "dimanche": "fermé"}',
 true),

-- Profil pour Fatima Diallo (marchand4)
((SELECT id FROM public.users WHERE email = 'marchand4@example.com'),
 'Boutique Fatima', 'Boutique alimentaire', 'Bouaké, Zone Commerciale', 'Marché Central', 'modern', 'Bouaké',
 'Boutique moderne proposant des produits locaux et importés de qualité.',
 '{"lundi": "08:00-20:00", "mardi": "08:00-20:00", "mercredi": "08:00-20:00", "jeudi": "08:00-20:00", "vendredi": "08:00-20:00", "samedi": "08:00-22:00", "dimanche": "10:00-16:00"}',
 true),

-- Profil pour Mamadou Koné (marchand5)
((SELECT id FROM public.users WHERE email = 'marchand5@example.com'),
 'Alimentation Koné', 'Distribution alimentaire', 'San-Pédro, Port de Pêche', 'Marché de Poisson', 'traditional', 'San-Pédro',
 'Spécialisé dans la vente de produits de la mer et produits frais de la région.',
 '{"lundi": "06:00-18:00", "mardi": "06:00-18:00", "mercredi": "06:00-18:00", "jeudi": "06:00-18:00", "vendredi": "06:00-18:00", "samedi": "06:00-15:00", "dimanche": "07:00-12:00"}',
 true);

-- Création des profils producteurs pour les nouveaux utilisateurs
INSERT INTO public.producer_profiles (
    user_id, farm_name, farm_location, farm_size, main_products, experience_years, description, is_certified
) VALUES
-- Profil pour Paul Amani (producteur1)
((SELECT id FROM public.users WHERE email = 'producteur1@example.com'),
 'Ferme Amani', 'Daloa, Zone Agricole', 8.5, '{'Cacao', 'Café', 'Ananas'}', 15,
 'Ferme familiale spécialisée dans le cacao et le café de qualité supérieure. Production certifiée BIO.',
 true),

-- Profil pour Marie N guessan (producteur2)
((SELECT id FROM public.users WHERE email = 'producteur2@example.com'),
 'Ferme N guessan', 'Gagnoa, Planteurs', 3.2, '{'Banane Plantain', 'Igname', 'Manioc'}', 8,
 'Petite ferme familiale produisant des tubercules et bananes plantain de qualité.',
 false),

-- Profil pour Isaac Ouattara (producteur3)
((SELECT id FROM public.users WHERE email = 'producteur3@example.com'),
 'Ferme Ouattara', 'Korhogo, Nord', 12.0, '{'Coton', 'Arachide', 'Sésame'}', 20,
 'Grande exploitation agricole spécialisée dans les cultures industrielles du nord de la Côte d''Ivoire.',
 true);

-- Ajout des nouveaux gestionnaires comme membres des coopératives existantes
INSERT INTO public.cooperative_members (
    cooperative_id, user_id, role, join_date, contribution_type, contribution_amount, status
) VALUES
-- Gestionnaires pour la Coopérative Agricole de Yamoussoukro
((SELECT id FROM public.cooperatives WHERE name = 'Coopérative Agricole de Yamoussoukro'),
 (SELECT id FROM public.users WHERE email = 'gestion1@example.com'),
 'gestionnaire', '2024-01-15', 'mensuelle', 8000.00, 'active'),

-- Gestionnaires pour l''Union des Producteurs d''Abidjan
((SELECT id FROM public.cooperatives WHERE name = 'Union des Producteurs d''Abidjan'),
 (SELECT id FROM public.users WHERE email = 'gestion2@example.com'),
 'gestionnaire', '2024-01-15', 'mensuelle', 6000.00, 'active'),

-- Gestionnaires pour la Coopérative des Pêcheurs de Grand-Bassam
((SELECT id FROM public.cooperatives WHERE name = 'Coopérative des Pêcheurs de Grand-Bassam'),
 (SELECT id FROM public.users WHERE email = 'gestion3@example.com'),
 'gestionnaire', '2024-01-15', 'mensuelle', 5000.00, 'active');

-- Création des relations marchands-coopératives pour les tests
INSERT INTO public.merchant_cooperative_relations (
    merchant_id, cooperative_id, relation_type, status, join_date, membership_number, credit_limit, credit_used, payment_terms, discount_rate, minimum_order_amount, preferred_delivery_method, notes
) VALUES
-- Jean Kouamé (Supermarché Kouamé) - Coopérative Agricole de Yamoussoukro
((SELECT id FROM public.merchant_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com')),
 (SELECT id FROM public.cooperatives WHERE name = 'Coopérative Agricole de Yamoussoukro'),
 'member', 'active', '2024-01-15', 'COOP-YAM-001', 500000.00, 0.00, '15_days', 5.0, 10000.00, 'coop_deliver',
 'Membre fondateur, commandes hebdomadaires importantes de fruits et légumes'),

-- Aminata Touré (Épicerie Touré) - Union des Producteurs d''Abidjan
((SELECT id FROM public.merchant_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'marchand2@example.com')),
 (SELECT id FROM public.cooperatives WHERE name = 'Union des Producteurs d''Abidjan'),
 'member', 'active', '2024-01-15', 'UPA-ABI-001', 200000.00, 0.00, '7_days', 3.0, 5000.00, 'pickup',
 'Membre depuis 2024, commande principalement des légumes frais'),

-- Koffi Yao (Marché Yao) - Alliance des Éleveurs de Volaille
((SELECT id FROM public.merchant_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'marchand3@example.com')),
 (SELECT id FROM public.cooperatives WHERE name = 'Alliance des Éleveurs de Volaille'),
 'buyer', 'active', '2024-01-15', 'AEV-YAM-001', 1000000.00, 0.00, '30_days', 8.0, 25000.00, 'delivery',
 'Client majeur pour la volaille, commandes mensuelles de gros volumes'),

-- Fatima Diallo (Boutique Fatima) - Coopérative des Pêcheurs de Grand-Bassam
((SELECT id FROM public.merchant_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'marchand4@example.com')),
 (SELECT id FROM public.cooperatives WHERE name = 'Coopérative des Pêcheurs de Grand-Bassam'),
 'member', 'active', '2024-01-15', 'COOP-PECHE-001', 150000.00, 0.00, 'immediate', 4.0, 8000.00, 'pickup',
 'Membre récente, spécialisée dans les produits de la mer'),

-- Mamadou Koné (Alimentation Koné) - Coopérative Agricole de Yamoussoukro
((SELECT id FROM public.merchant_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'marchand5@example.com')),
 (SELECT id FROM public.cooperatives WHERE name = 'Coopérative Agricole de Yamoussoukro'),
 'supplier', 'active', '2024-01-15', 'COOP-YAM-002', 300000.00, 0.00, '15_days', 6.0, 15000.00, 'delivery',
 'Fournisseur de produits transformés pour la coopérative');

-- Ajout des producteurs comme membres des coopératives correspondantes
INSERT INTO public.cooperative_members (
    cooperative_id, user_id, role, join_date, contribution_type, contribution_amount, status
) VALUES
-- Producteurs pour la Coopérative Agricole de Yamoussoukro
((SELECT id FROM public.cooperatives WHERE name = 'Coopérative Agricole de Yamoussoukro'),
 (SELECT id FROM public.users WHERE email = 'producteur1@example.com'),
 'producteur', '2024-01-15', 'mensuelle', 4000.00, 'active'),

-- Producteurs pour l''Union des Producteurs d''Abidjan
((SELECT id FROM public.cooperatives WHERE name = 'Union des Producteurs d''Abidjan'),
 (SELECT id FROM public.users WHERE email = 'producteur2@example.com'),
 'producteur', '2024-01-15', 'mensuelle', 3000.00, 'active'),

-- Producteurs pour l''Alliance des Éleveurs de Volaille
((SELECT id FROM public.cooperatives WHERE name = 'Alliance des Éleveurs de Volaille'),
 (SELECT id FROM public.users WHERE email = 'producer3@example.com'),
 'producteur', '2024-01-15', 'mensuelle', 3500.00, 'active');

-- Mise à jour du nombre de membres dans les coopératives
UPDATE public.cooperatives SET number_of_members = (
    SELECT COUNT(*) FROM public.cooperative_members WHERE cooperative_id = public.cooperatives.id
);

-- Création des paniers pour les nouveaux utilisateurs
INSERT INTO public.carts (user_id, total_items, total_amount, created_at, updated_at)
SELECT id, 0, 0, NOW(), NOW()
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.carts);

-- Création de notifications de bienvenue pour les nouveaux utilisateurs
INSERT INTO public.notifications (
    user_id, type, title, message, data, priority, created_at
) VALUES
((SELECT id FROM public.users WHERE email = 'marchand1@example.com'), 'welcome', 'Bienvenue sur la plateforme !', 'Bienvenue Jean Kouamé ! Votre supermarché est maintenant connecté à notre réseau.', '{"type": "welcome", "business_type": "supermarket"}', 'normal', NOW()),
((SELECT id FROM public.users WHERE email = 'marchand2@example.com'), 'welcome', 'Bienvenue sur la plateforme !', 'Bienvenue Aminata Touré ! Votre épicerie est maintenant active sur la plateforme.', '{"type": "welcome", "business_type": "grocery"}', 'normal', NOW()),
((SELECT id FROM public.users WHERE email = 'marchand3@example.com'), 'welcome', 'Bienvenue sur la plateforme !', 'Bienvenue Koffi Yao ! Votre marché de gros est maintenant connecté à notre réseau.', '{"type": "welcome", "business_type": "wholesale"}', 'normal', NOW()),
((SELECT id FROM public.users WHERE email = 'marchand4@example.com'), 'welcome', 'Bienvenue sur la plateforme !', 'Bienvenue Fatima Diallo ! Votre boutique est maintenant active sur la plateforme.', '{"type": "welcome", "business_type": "retail"}', 'normal', NOW()),
((SELECT id FROM public.users WHERE email = 'marchand5@example.com'), 'welcome', 'Bienvenue sur la plateforme !', 'Bienvenue Mamadou Koné ! Votre alimentation est maintenant connectée à notre réseau.', '{"type": "welcome", "business_type": "food_distribution"}', 'normal', NOW()),
((SELECT id FROM public.users WHERE email = 'producteur1@example.com'), 'welcome', 'Bienvenue sur la plateforme !', 'Bienvenue Paul Amani ! Votre ferme est maintenant connectée à notre réseau.', '{"type": "welcome", "business_type": "farm"}', 'normal', NOW()),
((SELECT id FROM public.users WHERE email = 'producteur2@example.com'), 'welcome', 'Bienvenue sur la plateforme !', 'Bienvenue Marie N guessan ! Votre ferme est maintenant active sur la plateforme.', '{"type": "welcome", "business_type": "farm"}', 'normal', NOW()),
((SELECT id FROM public.users WHERE email = 'producteur3@example.com'), 'welcome', 'Bienvenue sur la plateforme !', 'Bienvenue Isaac Ouattara ! Votre ferme est maintenant connectée à notre réseau.', '{"type": "welcome", "business_type": "large_farm"}', 'normal', NOW());

-- Notifications pour les gestionnaires de coopératives
INSERT INTO public.notifications (
    user_id, type, title, message, data, priority, created_at
) VALUES
((SELECT id FROM public.users WHERE email = 'gestion1@example.com'), 'role_assignment', 'Nouveau rôle assigné', 'Vous avez été assigné comme gestionnaire de la Coopérative Agricole de Yamoussoukro.', '{"type": "role_assignment", "cooperative": "Coopérative Agricole de Yamoussoukro"}', 'high', NOW()),
((SELECT id FROM public.users WHERE email = 'gestion2@example.com'), 'role_assignment', 'Nouveau rôle assigné', 'Vous avez été assigné comme gestionnaire de l''Union des Producteurs d''Abidjan.', '{"type": "role_assignment", "cooperative": "Union des Producteurs d''Abidjan"}', 'high', NOW()),
((SELECT id FROM public.users WHERE email = 'gestion3@example.com'), 'role_assignment', 'Nouveau rôle assigné', 'Vous avez été assigné comme gestionnaire de la Coopérative des Pêcheurs de Grand-Bassam.', '{"type": "role_assignment", "cooperative": "Coopérative des Pêcheurs de Grand-Bassam"}', 'high', NOW());

-- Notifications pour les nouveaux membres des coopératives
INSERT INTO public.notifications (
    user_id, type, title, message, data, priority, created_at
) VALUES
((SELECT id FROM public.users WHERE email = 'marchand1@example.com'), 'cooperative_membership', 'Nouvelle adhésion coopérative', 'Vous êtes maintenant membre de la Coopérative Agricole de Yamoussoukro.', '{"type": "cooperative_membership", "cooperative": "Coopérative Agricole de Yamoussoukro", "discount_rate": 5.0}', 'normal', NOW()),
((SELECT id FROM public.users WHERE email = 'marchand2@example.com'), 'cooperative_membership', 'Nouvelle adhésion coopérative', 'Vous êtes maintenant membre de l''Union des Producteurs d''Abidjan.', '{"type": "cooperative_membership", "cooperative": "Union des Producteurs d''Abidjan", "discount_rate": 3.0}', 'normal', NOW()),
((SELECT id FROM public.users WHERE email = 'marchand3@example.com'), 'cooperative_membership', 'Nouvelle relation commerciale', 'Vous avez maintenant un accord d''approvisionnement avec l''Alliance des Éleveurs de Volaille.', '{"type": "supply_agreement", "cooperative": "Alliance des Éleveurs de Volaille", "discount_rate": 8.0}', 'normal', NOW()),
((SELECT id FROM public.users WHERE email = 'marchand4@example.com'), 'cooperative_membership', 'Nouvelle adhésion coopérative', 'Vous êtes maintenant membre de la Coopérative des Pêcheurs de Grand-Bassam.', '{"type": "cooperative_membership", "cooperative": "Coopérative des Pêcheurs de Grand-Bassam", "discount_rate": 4.0}', 'normal', NOW());

-- Ajout de produits supplémentaires pour les nouveaux producteurs
INSERT INTO public.products (
    name, description, category, price, unit, stock_quantity, minimum_stock, producer_id, is_organic, is_featured, tags
) VALUES
-- Produits de Paul Amani (ferme de cacao)
('Cacao Premium', 'Fèves de cacao de qualité supérieure, fermentées et séchées', 'cereales', 3000.00, 'kg', 5000, 500, (SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur1@example.com')), true, true, '{'cacao', 'premium', 'bio', 'fermentation'}'),
('Café Arabica', 'Grains de café arabica de montagne, torréfaction moyenne', 'cereales', 4500.00, 'kg', 1000, 100, (SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur1@example.com')), true, true, '{'cafe', 'arabica', 'montagne', 'bio'}'),

-- Produits de Marie N guessan (ferme de tubercules)
('Igname Blanc', 'Igname blanc de qualité supérieure, récolté fraîchement', 'cereales', 800.00, 'kg', 2000, 200, (SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur2@example.com')), false, false, '{'igname', 'tubercule', 'local', 'frais'}'),
('Manioc', 'Manioc frais de la région de Gagnoa', 'cereales', 400.00, 'kg', 3000, 300, (SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur2@example.com')), false, false, '{'manioc', 'tubercule', 'local', 'frais'}'),

-- Produits d''Isaac Ouattara (ferme industrielle)
('Coton Graine', 'Coton graine de première qualité pour l''industrie textile', 'cereales', 600.00, 'kg', 10000, 1000, (SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur3@example.com')), false, false, '{'coton', 'industrie', 'textile', 'qualite'}'),
('Arachide', 'Arachide de qualité supérieure pour l''huile et la consommation', 'cereales', 1200.00, 'kg', 5000, 500, (SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur3@example.com')), true, true, '{'arachide', 'huile', 'alimentaire', 'bio'}');

-- Mise à jour des produits existants pour les assigner aux nouveaux producteurs
UPDATE public.products SET producer_id = (SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur1@example.com')) WHERE name IN ('Mangue', 'Ananas') AND producer_id IS NOT NULL;
UPDATE public.products SET producer_id = (SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur2@example.com')) WHERE name = 'Tomate' AND producer_id IS NOT NULL;

-- Mise à jour des statistiques des coopératives
UPDATE public.cooperatives SET number_of_members = (
    SELECT COUNT(*) FROM public.cooperative_members WHERE cooperative_id = public.cooperatives.id
) WHERE id IN (SELECT id FROM public.cooperatives);

-- Création des contrats d'approvisionnement pour les tests
INSERT INTO public.supply_contracts (
    cooperative_id, merchant_id, contract_number, contract_type, start_date, end_date, total_value, minimum_commitment, payment_terms, delivery_terms, status, created_by
) VALUES
-- Contrat entre Coopérative Agricole de Yamoussoukro et Supermarché Kouamé
((SELECT id FROM public.cooperatives WHERE name = 'Coopérative Agricole de Yamoussoukro'),
 (SELECT id FROM public.merchant_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'marchand1@example.com')),
 'CONT-2024-001', 'framework', '2024-01-15', '2024-12-31', 1000000.00, 100000.00, '15_days', 'coop_deliver', 'active',
 (SELECT id FROM public.users WHERE email = 'gestion1@example.com')),

-- Contrat entre Alliance des Éleveurs de Volaille et Marché Yao
((SELECT id FROM public.cooperatives WHERE name = 'Alliance des Éleveurs de Volaille'),
 (SELECT id FROM public.merchant_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'marchand3@example.com')),
 'CONT-2024-002', 'recurring', '2024-01-15', '2024-06-30', 500000.00, 50000.00, '30_days', 'delivery', 'active',
 (SELECT id FROM public.users WHERE email = 'producer3@example.com'));