-- ============================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- ============================================
-- Ces politiques garantissent que chaque utilisateur
-- ne peut accéder qu'aux données auxquelles il a droit
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperative_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grouped_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. POLITIQUES POUR LES UTILISATEURS
-- ============================================

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 2. POLITIQUES POUR LES COOPÉRATIVES
-- ============================================

-- Tout le monde peut voir les coopératives actives
CREATE POLICY "Anyone can view active cooperatives" ON public.cooperatives
  FOR SELECT USING (status = 'active');

-- Les membres de la coopérative peuvent voir leur coopérative
CREATE POLICY "Members can view their cooperative" ON public.cooperatives
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cooperative_members
      WHERE cooperative_id = cooperatives.id
      AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
    )
  );

-- Les créateurs peuvent modifier leur coopérative
CREATE POLICY "Creators can update their cooperative" ON public.cooperatives
  FOR UPDATE USING (created_by = auth.uid());

-- ============================================
-- 3. POLITIQUES POUR LES MEMBRES
-- ============================================

-- Les membres de la coopérative peuvent voir les autres membres
CREATE POLICY "Cooperative members can view members" ON public.cooperative_members
  FOR SELECT USING (
    cooperative_id IN (
      SELECT cooperative_id FROM public.cooperative_members
      WHERE EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
    )
  );

-- Les admins de coopérative peuvent ajouter des membres
CREATE POLICY "Cooperative admins can insert members" ON public.cooperative_members
  FOR INSERT WITH CHECK (
    cooperative_id IN (
      SELECT id FROM public.cooperatives
      WHERE created_by = auth.uid()
    )
  );

-- Les admins de coopérative peuvent modifier les membres
CREATE POLICY "Cooperative admins can update members" ON public.cooperative_members
  FOR UPDATE USING (
    cooperative_id IN (
      SELECT id FROM public.cooperatives
      WHERE created_by = auth.uid()
    )
  );

-- ============================================
-- 4. POLITIQUES POUR LES COTISATIONS
-- ============================================

-- Les membres de la coopérative peuvent voir les cotisations
CREATE POLICY "Cooperative members can view contributions" ON public.social_contributions
  FOR SELECT USING (
    cooperative_id IN (
      SELECT cooperative_id FROM public.cooperative_members
      WHERE EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
    )
  );

-- Les admins de coopérative peuvent gérer les cotisations
CREATE POLICY "Cooperative admins can manage contributions" ON public.social_contributions
  FOR ALL USING (
    cooperative_id IN (
      SELECT id FROM public.cooperatives
      WHERE created_by = auth.uid()
    )
  );

-- ============================================
-- 5. POLITIQUES POUR LES PRODUITS
-- ============================================

-- Tout le monde peut voir les produits
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

-- Seuls les admins peuvent modifier les produits
CREATE POLICY "Only admins can modify products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 6. POLITIQUES POUR LES STOCKS
-- ============================================

-- Les membres de la coopérative peuvent voir les stocks
CREATE POLICY "Cooperative members can view stocks" ON public.member_stocks
  FOR SELECT USING (
    cooperative_id IN (
      SELECT cooperative_id FROM public.cooperative_members
      WHERE EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
    )
  );

-- Les membres peuvent ajouter leur propre stock
CREATE POLICY "Members can add own stock" ON public.member_stocks
  FOR INSERT WITH CHECK (
    member_id IN (
      SELECT id FROM public.cooperative_members
      WHERE EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
    )
  );

-- ============================================
-- 7. POLITIQUES POUR LES OFFRES GROUPÉES
-- ============================================

-- Tout le monde peut voir les offres actives
CREATE POLICY "Anyone can view active offers" ON public.grouped_offers
  FOR SELECT USING (status IN ('active', 'negotiating'));

-- Les membres de la coopérative peuvent voir toutes les offres de leur coopérative
CREATE POLICY "Cooperative members can view all cooperative offers" ON public.grouped_offers
  FOR SELECT USING (
    cooperative_id IN (
      SELECT cooperative_id FROM public.cooperative_members
      WHERE EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
    )
  );

-- Les admins de coopérative peuvent créer des offres
CREATE POLICY "Cooperative admins can create offers" ON public.grouped_offers
  FOR INSERT WITH CHECK (
    cooperative_id IN (
      SELECT id FROM public.cooperatives
      WHERE created_by = auth.uid()
    )
  );

-- Les admins de coopérative peuvent modifier leurs offres
CREATE POLICY "Cooperative admins can update offers" ON public.grouped_offers
  FOR UPDATE USING (
    cooperative_id IN (
      SELECT id FROM public.cooperatives
      WHERE created_by = auth.uid()
    )
  );

-- ============================================
-- 8. POLITIQUES POUR LES NÉGOCIATIONS
-- ============================================

-- Les coopératives peuvent voir leurs négociations
CREATE POLICY "Cooperatives can view their negotiations" ON public.negotiations
  FOR SELECT USING (
    cooperative_id IN (
      SELECT id FROM public.cooperatives
      WHERE created_by = auth.uid()
    )
  );

-- Les acheteurs peuvent voir leurs négociations
CREATE POLICY "Buyers can view their negotiations" ON public.negotiations
  FOR SELECT USING (buyer_id = auth.uid());

-- Les acheteurs peuvent créer des négociations
CREATE POLICY "Buyers can create negotiations" ON public.negotiations
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Les parties concernées peuvent modifier la négociation
CREATE POLICY "Parties can update negotiations" ON public.negotiations
  FOR UPDATE USING (
    buyer_id = auth.uid() OR
    cooperative_id IN (
      SELECT id FROM public.cooperatives
      WHERE created_by = auth.uid()
    )
  );

-- ============================================
-- 9. POLITIQUES POUR LES MESSAGES DE NÉGOCIATION
-- ============================================

-- Les parties de la négociation peuvent voir les messages
CREATE POLICY "Negotiation parties can view messages" ON public.negotiation_messages
  FOR SELECT USING (
    negotiation_id IN (
      SELECT id FROM public.negotiations
      WHERE buyer_id = auth.uid() OR
      cooperative_id IN (
        SELECT id FROM public.cooperatives
        WHERE created_by = auth.uid()
      )
    )
  );

-- Les parties peuvent envoyer des messages
CREATE POLICY "Negotiation parties can send messages" ON public.negotiation_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- ============================================
-- 10. POLITIQUES POUR LES COMMANDES
-- ============================================

-- Les coopératives peuvent voir leurs commandes
CREATE POLICY "Cooperatives can view their orders" ON public.orders
  FOR SELECT USING (
    cooperative_id IN (
      SELECT id FROM public.cooperatives
      WHERE created_by = auth.uid()
    )
  );

-- Les acheteurs peuvent voir leurs commandes
CREATE POLICY "Buyers can view their orders" ON public.orders
  FOR SELECT USING (buyer_id = auth.uid());

-- Les parties peuvent mettre à jour les commandes
CREATE POLICY "Parties can update orders" ON public.orders
  FOR UPDATE USING (
    buyer_id = auth.uid() OR
    cooperative_id IN (
      SELECT id FROM public.cooperatives
      WHERE created_by = auth.uid()
    )
  );

-- ============================================
-- 11. POLITIQUES POUR LES LITIGES
-- ============================================

-- Les parties du litige peuvent voir le litige
CREATE POLICY "Dispute parties can view disputes" ON public.disputes
  FOR SELECT USING (
    reported_by = auth.uid() OR
    order_id IN (
      SELECT id FROM public.orders
      WHERE buyer_id = auth.uid() OR
      cooperative_id IN (
        SELECT id FROM public.cooperatives
        WHERE created_by = auth.uid()
      )
    )
  );

-- Les parties peuvent créer des litiges
CREATE POLICY "Parties can create disputes" ON public.disputes
  FOR INSERT WITH CHECK (reported_by = auth.uid());

-- Les admins peuvent voir tous les litiges
CREATE POLICY "Admins can view all disputes" ON public.disputes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 12. POLITIQUES POUR LE SUPPORT
-- ============================================

-- Les utilisateurs peuvent voir leurs propres tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (user_id = auth.uid());

-- Les utilisateurs peuvent créer des tickets
CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Les agents de support peuvent voir tous les tickets
CREATE POLICY "Support agents can view all tickets" ON public.support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'support')
    )
  );

-- Les agents peuvent mettre à jour les tickets
CREATE POLICY "Support agents can update tickets" ON public.support_tickets
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'support')
    )
  );

-- ============================================
-- 13. POLITIQUES POUR L'AUDIT
-- ============================================

-- Les utilisateurs peuvent voir leurs propres logs
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- Les admins peuvent voir tous les logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seul le système peut insérer des logs (via service_role)
CREATE POLICY "Only system can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (false);

-- ============================================
-- FONCTIONS HELPER POUR LES POLITIQUES
-- ============================================

-- Vérifier si l'utilisateur est admin de coopérative
CREATE OR REPLACE FUNCTION is_cooperative_admin(coop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.cooperatives
    WHERE id = coop_id AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vérifier si l'utilisateur est membre de coopérative
CREATE OR REPLACE FUNCTION is_cooperative_member(coop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.cooperative_members
    WHERE cooperative_id = coop_id
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vérifier si l'utilisateur est admin système
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIN DES POLITIQUES RLS
-- ============================================

