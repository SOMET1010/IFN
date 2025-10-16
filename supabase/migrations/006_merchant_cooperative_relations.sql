-- Migration pour créer les relations entre marchands et coopératives
-- et configurer le système d'approvisionnement

-- Table pour les relations marchands-coopératives
CREATE TABLE public.merchant_cooperative_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES public.merchant_profiles(id) ON DELETE CASCADE NOT NULL,
    cooperative_id UUID REFERENCES public.cooperatives(id) ON DELETE CASCADE NOT NULL,
    relation_type TEXT NOT NULL DEFAULT 'member' CHECK (relation_type IN ('member', 'supplier', 'buyer', 'partner')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    leave_date DATE,
    membership_number TEXT,
    credit_limit DECIMAL(15,2) DEFAULT 0,
    credit_used DECIMAL(15,2) DEFAULT 0,
    payment_terms TEXT DEFAULT 'immediate' CHECK (payment_terms IN ('immediate', '7_days', '15_days', '30_days')),
    discount_rate DECIMAL(5,2) DEFAULT 0,
    minimum_order_amount DECIMAL(15,2) DEFAULT 0,
    preferred_delivery_method TEXT DEFAULT 'pickup',
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(merchant_id, cooperative_id)
);

-- Table pour les commandes d'approvisionnement (B2B)
CREATE TABLE public.supply_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    buyer_type user_role NOT NULL CHECK (buyer_type IN ('merchant', 'cooperative')),
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    seller_type user_role NOT NULL CHECK (seller_type IN ('cooperative', 'producer')),
    cooperative_relation_id UUID REFERENCES public.merchant_cooperative_relations(id) ON DELETE SET NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_amount + delivery_fee + tax_amount - discount_amount) STORED,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'partially_delivered')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'failed', 'refunded')),
    payment_method payment_method,
    payment_terms TEXT DEFAULT 'immediate',
    due_date TIMESTAMPTZ,
    delivery_method delivery_method NOT NULL DEFAULT 'pickup',
    delivery_address JSONB,
    delivery_instructions TEXT,
    estimated_delivery TIMESTAMPTZ,
    actual_delivery TIMESTAMPTZ,
    requested_delivery_date DATE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT, -- daily, weekly, monthly
    recurring_end_date DATE,
    parent_order_id UUID REFERENCES public.supply_orders(id) ON DELETE SET NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    notes TEXT,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des éléments de commandes d'approvisionnement
CREATE TABLE public.supply_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.supply_orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT NOT NULL,
    product_description TEXT,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    delivered_quantity DECIMAL(10,2) DEFAULT 0,
    backorder_quantity DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table pour les contrats d'approvisionnement
CREATE TABLE public.supply_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cooperative_id UUID REFERENCES public.cooperatives(id) ON DELETE CASCADE NOT NULL,
    merchant_id UUID REFERENCES public.merchant_profiles(id) ON DELETE CASCADE NOT NULL,
    contract_number TEXT UNIQUE NOT NULL,
    contract_type TEXT NOT NULL CHECK (contract_type IN ('framework', 'specific', 'recurring')),
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT FALSE,
    renewal_terms TEXT,
    total_value DECIMAL(15,2) DEFAULT 0,
    minimum_commitment DECIMAL(15,2) DEFAULT 0,
    payment_terms TEXT DEFAULT '30_days',
    delivery_terms TEXT DEFAULT 'coop_deliver',
    quality_standards JSONB DEFAULT '{}'::jsonb,
    termination_conditions TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'suspended')),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(cooperative_id, merchant_id, contract_number)
);

-- Table pour les livraisons partielles
CREATE TABLE public.supply_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.supply_orders(id) ON DELETE CASCADE NOT NULL,
    delivery_number TEXT NOT NULL,
    delivery_date TIMESTAMPTZ NOT NULL,
    delivered_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    received_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled', 'returned')),
    tracking_number TEXT,
    carrier_name TEXT,
    carrier_contact TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des éléments de livraison
CREATE TABLE public.supply_delivery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID REFERENCES public.supply_deliveries(id) ON DELETE CASCADE NOT NULL,
    order_item_id UUID REFERENCES public.supply_order_items(id) ON DELETE CASCADE NOT NULL,
    quantity_delivered DECIMAL(10,2) NOT NULL,
    quantity_received DECIMAL(10,2) DEFAULT 0,
    quantity_rejected DECIMAL(10,2) DEFAULT 0,
    rejection_reason TEXT,
    quality_check_passed BOOLEAN DEFAULT TRUE,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour optimiser les performances
CREATE INDEX idx_merchant_cooperative_merchant ON public.merchant_cooperative_relations(merchant_id);
CREATE INDEX idx_merchant_cooperative_cooperative ON public.merchant_cooperative_relations(cooperative_id);
CREATE INDEX idx_merchant_cooperative_status ON public.merchant_cooperative_relations(status);
CREATE INDEX idx_merchant_cooperative_type ON public.merchant_cooperative_relations(relation_type);

CREATE INDEX idx_supply_orders_buyer ON public.supply_orders(buyer_id);
CREATE INDEX idx_supply_orders_seller ON public.supply_orders(seller_id);
CREATE INDEX idx_supply_orders_status ON public.supply_orders(status);
CREATE INDEX idx_supply_orders_payment_status ON public.supply_orders(payment_status);
CREATE INDEX idx_supply_orders_relation ON public.supply_orders(cooperative_relation_id);
CREATE INDEX idx_supply_orders_recurring ON public.supply_orders(is_recurring);
CREATE INDEX idx_supply_orders_dates ON public.supply_orders(requested_delivery_date, due_date);

CREATE INDEX idx_supply_order_items_order ON public.supply_order_items(order_id);
CREATE INDEX idx_supply_order_items_product ON public.supply_order_items(product_id);

CREATE INDEX idx_supply_contracts_cooperative ON public.supply_contracts(cooperative_id);
CREATE INDEX idx_supply_contracts_merchant ON public.supply_contracts(merchant_id);
CREATE INDEX idx_supply_contracts_status ON public.supply_contracts(status);
CREATE INDEX idx_supply_contracts_dates ON public.supply_contracts(start_date, end_date);

CREATE INDEX idx_supply_deliveries_order ON public.supply_deliveries(order_id);
CREATE INDEX idx_supply_deliveries_status ON public.supply_deliveries(status);
CREATE INDEX idx_supply_deliveries_dates ON public.supply_deliveries(delivery_date);

-- Activer RLS
ALTER TABLE public.merchant_cooperative_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_delivery_items ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour merchant_cooperative_relations
CREATE POLICY "Users can view their relations" ON public.merchant_cooperative_relations
    FOR SELECT USING (
        merchant_id IN (SELECT id FROM public.merchant_profiles WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.cooperative_members WHERE user_id = auth.uid() AND cooperative_id = public.merchant_cooperative_relations.cooperative_id) OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Cooperatives can manage their relations" ON public.merchant_cooperative_relations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.cooperative_members WHERE user_id = auth.uid() AND cooperative_id = public.merchant_cooperative_relations.cooperative_id)
    );

CREATE POLICY "Merchants can view their relations" ON public.merchant_cooperative_relations
    FOR SELECT USING (
        merchant_id IN (SELECT id FROM public.merchant_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage all relations" ON public.merchant_cooperative_relations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques RLS pour supply_orders
CREATE POLICY "Users can view their supply orders" ON public.supply_orders
    FOR SELECT USING (
        buyer_id = auth.uid() OR seller_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.merchant_cooperative_relations r
                JOIN public.merchant_profiles mp ON r.merchant_id = mp.id
                WHERE r.id = cooperative_relation_id AND mp.user_id = auth.uid())
    );

CREATE POLICY "Users can create supply orders" ON public.supply_orders
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update their supply orders" ON public.supply_orders
    FOR UPDATE USING (
        buyer_id = auth.uid() OR seller_id = auth.uid()
    );

CREATE POLICY "Cooperatives can approve supply orders" ON public.supply_orders
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.cooperative_members WHERE user_id = auth.uid() AND cooperative_id IN (
                SELECT c.id FROM public.cooperatives c
                JOIN public.users u ON c.id IN (SELECT cooperative_id FROM public.cooperative_members WHERE user_id = u.id)
                WHERE u.id = public.supply_orders.seller_id AND u.role = 'cooperative'
            ))
    );

CREATE POLICY "Admins can manage all supply orders" ON public.supply_orders
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques RLS pour supply_order_items
CREATE POLICY "Users can view their supply order items" ON public.supply_order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.supply_orders WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
    );

-- Politiques RLS pour supply_contracts
CREATE POLICY "Users can view their contracts" ON public.supply_contracts
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.merchant_profiles WHERE id = merchant_id AND user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.cooperative_members WHERE user_id = auth.uid() AND cooperative_id = public.supply_contracts.cooperative_id) OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques RLS pour supply_deliveries
CREATE POLICY "Users can view their deliveries" ON public.supply_deliveries
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.supply_orders WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
    );

-- Fonctions utilitaires
CREATE OR REPLACE FUNCTION public.generate_supply_order_number()
RETURNS TEXT AS $$
DECLARE
    order_number TEXT;
    counter INTEGER;
BEGIN
    -- Format: SUP-YYYYMMDD-XXXX
    SELECT COUNT(*) INTO counter FROM public.supply_orders WHERE DATE(created_at) = CURRENT_DATE;
    order_number := 'SUP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD((counter + 1)::TEXT, 4, '0');
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer le numéro de commande
CREATE OR REPLACE FUNCTION public.set_supply_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := public.generate_supply_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_supply_order_number_trigger
    BEFORE INSERT ON public.supply_orders
    FOR EACH ROW EXECUTE FUNCTION public.set_supply_order_number();

-- Fonction pour mettre à jour le statut de livraison
CREATE OR REPLACE FUNCTION public.update_supply_delivery_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Mettre à jour les quantités livrées dans les éléments de commande
        UPDATE public.supply_order_items soi
        SET
            delivered_quantity = COALESCE((SELECT SUM(COALESCE(sdi.quantity_received, 0))
                                         FROM public.supply_delivery_items sdi
                                         WHERE sdi.order_item_id = soi.id), 0),
            backorder_quantity = GREATEST(0, soi.quantity - COALESCE((SELECT SUM(COALESCE(sdi.quantity_received, 0))
                                                                    FROM public.supply_delivery_items sdi
                                                                    WHERE sdi.order_item_id = soi.id), 0))
        WHERE soi.id IN (SELECT order_item_id FROM public.supply_delivery_items WHERE delivery_id = NEW.id);

        -- Mettre à jour le statut de la commande
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
        WHERE so.id = NEW.order_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_supply_delivery_status_trigger
    AFTER INSERT OR UPDATE ON public.supply_delivery_items
    FOR EACH ROW EXECUTE FUNCTION public.update_supply_delivery_status();

-- Trigger pour updated_at
CREATE TRIGGER update_merchant_cooperative_relations_updated_at
    BEFORE UPDATE ON public.merchant_cooperative_relations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supply_orders_updated_at
    BEFORE UPDATE ON public.supply_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supply_contracts_updated_at
    BEFORE UPDATE ON public.supply_contracts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supply_deliveries_updated_at
    BEFORE UPDATE ON public.supply_deliveries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();