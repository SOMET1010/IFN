-- Migration pour corriger les tables manquantes et erreurs critiques
-- Cette migration corrige les problèmes identifiés dans l'analyse

-- 1. Création des tables manquantes

-- Table des récoltes des producteurs
CREATE TABLE public.producer_harvests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    harvest_date DATE NOT NULL,
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    unit product_unit NOT NULL DEFAULT 'kg',
    quality_grade TEXT CHECK (quality_grade IN ('A', 'B', 'C', 'premium', 'standard', 'economy')),
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des ventes des producteurs
CREATE TABLE public.producer_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    sale_date DATE NOT NULL,
    quality_grade TEXT CHECK (quality_grade IN ('A', 'B', 'C', 'premium', 'standard', 'economy')),
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Correction des erreurs de syntaxe

-- Correction de la faute de frappe dans languages
ALTER TABLE public.merchant_profiles
ALTER COLUMN languages SET DEFAULT '{'français'}';

-- Mise à jour des données existantes avec la faute de frappe
UPDATE public.merchant_profiles
SET languages = '{'français'}'
WHERE languages = '{'francois'}';

-- 3. Ajout des contraintes de validation manquantes

-- Contraintes pour les éléments de commande
ALTER TABLE public.order_items
ADD CONSTRAINT IF NOT EXISTS check_positive_quantity CHECK (quantity > 0),
ADD CONSTRAINT IF NOT EXISTS check_positive_price CHECK (unit_price > 0);

-- Contraintes pour les éléments de commande d'approvisionnement
ALTER TABLE public.supply_order_items
ADD CONSTRAINT IF NOT EXISTS check_positive_quantity CHECK (quantity > 0),
ADD CONSTRAINT IF NOT EXISTS check_positive_price CHECK (unit_price > 0),
ADD CONSTRAINT IF NOT EXISTS check_positive_delivered CHECK (delivered_quantity >= 0),
ADD CONSTRAINT IF NOT EXISTS check_positive_backorder CHECK (backorder_quantity >= 0);

-- Contraintes pour les produits
ALTER TABLE public.products
ADD CONSTRAINT IF NOT EXISTS check_positive_price CHECK (unit_price > 0 AND wholesale_price > 0 AND retail_price > 0),
ADD CONSTRAINT IF NOT EXISTS check_stock_quantity CHECK (stock_quantity >= 0);

-- Contraintes pour les commandes
ALTER TABLE public.orders
ADD CONSTRAINT IF NOT EXISTS check_delivery_date CHECK (estimated_delivery >= created_at OR estimated_delivery IS NULL),
ADD CONSTRAINT IF NOT EXISTS check_positive_amount CHECK (total_amount >= 0 AND final_amount >= 0);

-- Contraintes pour les commandes d'approvisionnement
ALTER TABLE public.supply_orders
ADD CONSTRAINT IF NOT EXISTS check_positive_amount CHECK (total_amount >= 0 AND final_amount >= 0),
ADD CONSTRAINT IF NOT EXISTS check_positive_fees CHECK (delivery_fee >= 0 AND tax_amount >= 0 AND discount_amount >= 0);

-- 4. Ajout des index manquants pour la performance

-- Index composites pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_products_owner_active ON public.products
(COALESCE(producer_id, cooperative_id, merchant_id), is_active);

CREATE INDEX IF NOT EXISTS idx_supply_orders_composite ON public.supply_orders
(buyer_id, seller_id, status);

CREATE INDEX IF NOT EXISTS idx_producer_harvests_composite ON public.producer_harvests
(producer_id, product_id, harvest_date);

CREATE INDEX IF NOT EXISTS idx_producer_sales_composite ON public.producer_sales
(producer_id, product_id, sale_date);

CREATE INDEX IF NOT EXISTS idx_orders_composite ON public.orders
(buyer_id, seller_id, status);

-- 5. Activer RLS sur les nouvelles tables
ALTER TABLE public.producer_harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_sales ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS pour les nouvelles tables

-- Politiques pour producer_harvests
CREATE POLICY "Producers can view their harvests" ON public.producer_harvests
    FOR SELECT USING (
        producer_id IN (SELECT id FROM public.producer_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Producers can manage their harvests" ON public.producer_harvests
    FOR ALL USING (
        producer_id IN (SELECT id FROM public.producer_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Cooperatives can view member harvests" ON public.producer_harvests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.cooperative_members cm
            JOIN public.producer_profiles pp ON cm.user_id = pp.user_id
            WHERE cm.cooperative_id IN (
                SELECT cooperative_id FROM public.cooperative_members WHERE user_id = auth.uid()
            ) AND pp.id = public.producer_harvests.producer_id
        )
    );

CREATE POLICY "Admins can manage all harvests" ON public.producer_harvests
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour producer_sales
CREATE POLICY "Producers can view their sales" ON public.producer_sales
    FOR SELECT USING (
        producer_id IN (SELECT id FROM public.producer_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage all sales" ON public.producer_sales
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- 7. Trigger pour updated_at
CREATE TRIGGER update_producer_harvests_updated_at
    BEFORE UPDATE ON public.producer_harvests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Création de données de test pour les nouvelles tables

-- Insertion de récoltes de test pour les producteurs
INSERT INTO public.producer_harvests (
    producer_id, product_id, harvest_date, quantity, unit, quality_grade, notes
) VALUES
-- Récoltes pour Paul Amani (producteur1)
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Tomate'), '2024-01-10', 500.00, 'kg', 'A', 'Tomates cerises de première qualité'),
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Piment'), '2024-01-12', 50.00, 'kg', 'premium', 'Piment fort local'),
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Aubergine'), '2024-01-15', 300.00, 'kg', 'standard', 'Aubergines violettes'),

-- Récoltes pour Marie N'guessan (producteur2)
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur2@example.com')),
 (SELECT id FROM public.products WHERE name = 'Mangue'), '2024-01-08', 800.00, 'kg', 'premium', 'Mangues Amélie'),
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur2@example.com')),
 (SELECT id FROM public.products WHERE name = 'Ananas'), '2024-01-14', 200.00, 'kg', 'A', 'Ananas Victoria'),
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur2@example.com')),
 (SELECT id FROM public.products WHERE name = 'Oignon'), '2024-01-16', 400.00, 'kg', 'standard', 'Oignons blancs'),

-- Récoltes pour Isaac Ouattara (producteur3)
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur3@example.com')),
 (SELECT id FROM public.products WHERE name = 'Poulet'), '2024-01-05', 150, 'unit', 'premium', 'Poulets fermiers'),
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur3@example.com')),
 (SELECT id FROM public.products WHERE name = 'Dinde'), '2024-01-18', 80, 'unit', 'A', 'Dindes fermières');

-- Insertion de ventes de test pour les producteurs
INSERT INTO public.producer_sales (
    producer_id, product_id, order_id, quantity, unit_price, sale_date, quality_grade, notes
) VALUES
-- Ventes pour Paul Amani (producteur1)
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Tomate'),
 (SELECT id FROM public.orders WHERE order_number = 'ORD-20240115-0001'), 100.00, 400.00, '2024-01-15', 'A', 'Vente au marché de Treichville'),
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Piment'),
 (SELECT id FROM public.orders WHERE order_number = 'ORD-20240116-0002'), 20.00, 1200.00, '2024-01-16', 'premium', 'Vente en gros à un restaurant'),

-- Ventes pour Marie N'guessan (producteur2)
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur2@example.com')),
 (SELECT id FROM public.products WHERE name = 'Mangue'),
 (SELECT id FROM public.orders WHERE order_number = 'ORD-20240117-0003'), 200.00, 450.00, '2024-01-17', 'premium', 'Vente au supermarché Kouamé'),
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur2@example.com')),
 (SELECT id FROM public.products WHERE name = 'Ananas'),
 (SELECT id FROM public.orders WHERE order_number = 'ORD-20240118-0004'), 50.00, 800.00, '2024-01-18', 'A', 'Vente à l''épicerie Touré'),

-- Ventes pour Isaac Ouattara (producteur3)
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur3@example.com')),
 (SELECT id FROM public.products WHERE name = 'Poulet'),
 (SELECT id FROM public.orders WHERE order_number = 'ORD-20240119-0005'), 30, 2500.00, '2024-01-19', 'premium', 'Vente au marché Yao'),
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur3@example.com')),
 (SELECT id FROM public.products WHERE name = 'Dinde'),
 (SELECT id FROM public.orders WHERE order_number = 'ORD-20240120-0006'), 20, 4500.00, '2024-01-20', 'A', 'Vente à la boutique Fatima');