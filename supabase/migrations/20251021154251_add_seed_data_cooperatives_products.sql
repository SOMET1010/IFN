/*
  # Ajout de Données Seed - Coopératives et Produits
  
  1. Données ajoutées
    - 3 Coopératives ivoiriennes réalistes
    - Produits supplémentaires typiques de Côte d'Ivoire
    
  2. But
    - Permettre des tests complets
    - Données réalistes pour démonstration
*/

-- Insérer des coopératives d'exemple pour la Côte d'Ivoire
INSERT INTO cooperatives (
    id,
    name,
    description,
    slogan,
    location,
    region,
    gps_lat,
    gps_lng,
    phone,
    email,
    status,
    total_members,
    total_volume,
    satisfaction_rating,
    certifications
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Coopérative des Planteurs de Cacao du Sud',
    'Coopérative regroupant plus de 500 planteurs de cacao dans la région du Sud-Comoé. Nous produisons du cacao de qualité supérieure certifié équitable.',
    'L''union fait la force - Ensemble pour un cacao de qualité',
    'Aboisso',
    'Sud-Comoé',
    5.4714,
    -3.2074,
    '+225 07 00 00 01',
    'contact@cacao-sud.ci',
    'active',
    500,
    250000.00,
    4.5,
    '["Fairtrade", "Rainforest Alliance", "Bio"]'::jsonb
),
(
    '22222222-2222-2222-2222-222222222222',
    'Union des Producteurs de Café et Cacao de Daloa',
    'Union regroupant 800 producteurs de café et cacao dans la région du Haut-Sassandra. Production durable et commerce équitable.',
    'Notre café, votre fierté',
    'Daloa',
    'Haut-Sassandra',
    6.8770,
    -6.4503,
    '+225 07 00 00 02',
    'info@upcc-daloa.ci',
    'active',
    800,
    400000.00,
    4.7,
    '["UTZ Certified", "Organic"]'::jsonb
),
(
    '33333333-3333-3333-3333-333333333333',
    'Coopérative des Maraîchers d''Abidjan',
    'Regroupement de 300 maraîchers produisant des légumes frais pour le marché d''Abidjan. Production locale et circuits courts.',
    'Du champ à l''assiette',
    'Abidjan',
    'Abidjan',
    5.3600,
    -4.0083,
    '+225 07 00 00 03',
    'maraicher@abidjan.ci',
    'active',
    300,
    50000.00,
    4.3,
    '["Agriculture Locale"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Ajouter des produits typiques de Côte d'Ivoire
INSERT INTO products (id, name, category, unit, description, image_url)
SELECT 
    gen_random_uuid(),
    name,
    category,
    unit,
    description,
    image_url
FROM (VALUES
    ('Cacao Premium', 'cereales', 'kg', 'Cacao de qualité supérieure certifié Fairtrade', 'https://images.unsplash.com/photo-1511381939415-e44015466834'),
    ('Café Robusta', 'cereales', 'kg', 'Café Robusta de haute qualité', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e'),
    ('Mangues Kent', 'fruits', 'kg', 'Mangues Kent juteuses et sucrées', 'https://images.unsplash.com/photo-1553279768-865429fa0078'),
    ('Ananas Victoria', 'fruits', 'piece', 'Ananas Victoria très sucré', 'https://images.unsplash.com/photo-1550828520-4e1d0e2f46b5'),
    ('Aubergines', 'legumes', 'kg', 'Aubergines fraîches du jour', 'https://images.unsplash.com/photo-1586189980898-c9c5f9c7e0e6'),
    ('Gombos', 'legumes', 'kg', 'Gombos frais pour sauce', 'https://images.unsplash.com/photo-1599940778198-c5f5d6a6e4b4'),
    ('Poulet Bicyclette', 'volaille', 'kg', 'Poulet élevé en liberté', 'https://images.unsplash.com/photo-1587593810167-a84920ea0781'),
    ('Capitaine Fumé', 'poissons', 'kg', 'Capitaine fumé traditionnellement', 'https://images.unsplash.com/photo-1560155477-f72660c3bb8d'),
    ('Ignames', 'cereales', 'kg', 'Ignames de qualité', 'https://images.unsplash.com/photo-1568584711271-e0e4e7a4b2e5'),
    ('Bananes Plantain', 'fruits', 'kg', 'Bananes plantain mûres', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e'),
    ('Attiéké', 'cereales', 'kg', 'Attiéké traditionnel', 'https://images.unsplash.com/photo-1625938145312-594d1b496c8e'),
    ('Piment Frais', 'legumes', 'kg', 'Piment frais local', 'https://images.unsplash.com/photo-1583852151198-fb5602bf4de5')
) AS new_products(name, category, unit, description, image_url)
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE products.name = new_products.name
);
