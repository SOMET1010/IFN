-- Politiques Row Level Security (RLS) pour la plateforme d'inclusion numérique

-- Politiques pour la table users
-- Tout le monde peut voir les utilisateurs, mais seulement les admins peuvent tout voir
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour la table merchant_profiles
CREATE POLICY "Merchants can view own profile" ON public.merchant_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND user_id = public.merchant_profiles.user_id
        )
    );

CREATE POLICY "Everyone can view merchant profiles" ON public.merchant_profiles
    FOR SELECT USING (true);

CREATE POLICY "Merchants can update own profile" ON public.merchant_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND user_id = public.merchant_profiles.user_id
        )
    );

CREATE POLICY "Admins can manage merchant profiles" ON public.merchant_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour la table producer_profiles
CREATE POLICY "Producers can view own profile" ON public.producer_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND user_id = public.producer_profiles.user_id
        )
    );

CREATE POLICY "Everyone can view producer profiles" ON public.producer_profiles
    FOR SELECT USING (true);

CREATE POLICY "Producers can update own profile" ON public.producer_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND user_id = public.producer_profiles.user_id
        )
    );

CREATE POLICY "Admins can manage producer profiles" ON public.producer_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour la table cooperatives
CREATE POLICY "Everyone can view cooperatives" ON public.cooperatives
    FOR SELECT USING (true);

CREATE POLICY "Cooperative members can view their cooperative" ON public.cooperatives
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.cooperative_members
            WHERE user_id = auth.uid() AND cooperative_id = public.cooperatives.id
        )
    );

CREATE POLICY "Admins can manage cooperatives" ON public.cooperatives
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour la table cooperative_members
CREATE POLICY "Cooperative members can view member list" ON public.cooperative_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.cooperative_members
            WHERE user_id = auth.uid() AND cooperative_id = public.cooperative_members.cooperative_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can view own membership" ON public.cooperative_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage cooperative members" ON public.cooperative_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour la table products
CREATE POLICY "Everyone can view active products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Product owners can manage their products" ON public.products
    FOR ALL USING (
        (producer_id IN (
            SELECT id FROM public.producer_profiles
            WHERE user_id = auth.uid()
        )) OR
        (cooperative_id IN (
            SELECT id FROM public.cooperatives
            WHERE id IN (
                SELECT cooperative_id FROM public.cooperative_members
                WHERE user_id = auth.uid()
            )
        )) OR
        (merchant_id IN (
            SELECT id FROM public.merchant_profiles
            WHERE user_id = auth.uid()
        ))
    );

CREATE POLICY "Admins can manage all products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour la table producer_offers
CREATE POLICY "Everyone can view active offers" ON public.producer_offers
    FOR SELECT USING (status = 'en_cours');

CREATE POLICY "Producers can manage their offers" ON public.producer_offers
    FOR ALL USING (
        producer_id IN (
            SELECT id FROM public.producer_profiles
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all offers" ON public.producer_offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour la table orders
CREATE POLICY "Users can view their orders" ON public.orders
    FOR SELECT USING (
        buyer_id = auth.uid() OR seller_id = auth.uid()
    );

CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update their orders" ON public.orders
    FOR UPDATE USING (
        buyer_id = auth.uid() OR seller_id = auth.uid()
    );

CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour la table order_items
CREATE POLICY "Users can view their order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

CREATE POLICY "Users can create order items" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id AND buyer_id = auth.uid()
        )
    );

-- Politiques pour la table payments
CREATE POLICY "Users can view their payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
        )
    );

CREATE POLICY "Users can create payments" ON public.payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id AND buyer_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour la table carts
CREATE POLICY "Users can view their cart" ON public.carts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their cart" ON public.carts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their cart" ON public.carts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their cart" ON public.carts
    FOR DELETE USING (user_id = auth.uid());

-- Politiques pour la table cart_items
CREATE POLICY "Users can view their cart items" ON public.cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their cart items" ON public.cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

-- Politiques pour la table reviews
CREATE POLICY "Everyone can view approved reviews" ON public.reviews
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their reviews" ON public.reviews
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their reviews" ON public.reviews
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews" ON public.reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour la table merchant_enrollments
CREATE POLICY "Users can view their enrollment" ON public.merchant_enrollments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their enrollment" ON public.merchant_enrollments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their enrollment" ON public.merchant_enrollments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all enrollments" ON public.merchant_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour la table enrollment_documents
CREATE POLICY "Users can view their enrollment documents" ON public.enrollment_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.merchant_enrollments
            WHERE id = enrollment_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload their enrollment documents" ON public.enrollment_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.merchant_enrollments
            WHERE id = enrollment_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all enrollment documents" ON public.enrollment_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour la table notifications
CREATE POLICY "Users can view their notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Politique par défaut pour la table users (permettre l'insertion lors de l'inscription)
CREATE POLICY "Enable insert for users" ON public.users
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre aux utilisateurs de voir leur propre profil dans auth.users
CREATE POLICY "Users can view their auth profile" ON auth.users
    FOR SELECT USING (auth.uid() = id);

-- Activer RLS sur auth.users si ce n'est pas déjà fait
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;