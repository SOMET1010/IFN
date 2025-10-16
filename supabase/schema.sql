-- ============================================
-- SCHÉMA COMPLET SUPABASE - INCLUSION NUMÉRIQUE
-- ============================================
-- Ce fichier contient le schéma complet de la base de données
-- pour la plateforme d'inclusion numérique en Côte d'Ivoire
-- ============================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour la recherche floue

-- ============================================
-- 1. TABLES DE BASE - UTILISATEURS ET PROFILS
-- ============================================

-- Table des utilisateurs (liée à auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('merchant', 'producer', 'cooperative', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. COOPÉRATIVES ET MEMBRES
-- ============================================

-- Table des coopératives
CREATE TABLE IF NOT EXISTS public.cooperatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  slogan TEXT,
  logo_url TEXT,
  banner_url TEXT,
  location TEXT NOT NULL,
  region TEXT NOT NULL,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  created_by UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  total_members INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  total_volume DECIMAL(15, 2) DEFAULT 0,
  satisfaction_rating DECIMAL(3, 2) DEFAULT 0,
  certifications JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des membres de coopératives
CREATE TABLE IF NOT EXISTS public.cooperative_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  id_number TEXT,
  id_type TEXT CHECK (id_type IN ('cni', 'passport', 'attestation')),
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  location TEXT NOT NULL,
  region TEXT NOT NULL,
  activity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive', 'suspended')),
  join_date DATE DEFAULT CURRENT_DATE,
  cnps_number TEXT,
  cmu_number TEXT,
  cnam_number TEXT,
  cnps_status TEXT DEFAULT 'not_enrolled' CHECK (cnps_status IN ('not_enrolled', 'up_to_date', 'late')),
  cmu_status TEXT DEFAULT 'not_enrolled' CHECK (cmu_status IN ('not_enrolled', 'up_to_date', 'late')),
  cnam_status TEXT DEFAULT 'not_enrolled' CHECK (cnam_status IN ('not_enrolled', 'up_to_date', 'late')),
  total_contributions DECIMAL(15, 2) DEFAULT 0,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour la recherche de membres
CREATE INDEX IF NOT EXISTS idx_members_cooperative ON public.cooperative_members(cooperative_id);
CREATE INDEX IF NOT EXISTS idx_members_search ON public.cooperative_members USING gin(to_tsvector('french', first_name || ' ' || last_name));

-- ============================================
-- 3. COTISATIONS SOCIALES
-- ============================================

-- Table des cotisations
CREATE TABLE IF NOT EXISTS public.social_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.cooperative_members(id) ON DELETE CASCADE,
  cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  organism TEXT NOT NULL CHECK (organism IN ('cnps', 'cmu', 'cnam')),
  amount DECIMAL(10, 2) NOT NULL,
  period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year INTEGER NOT NULL CHECK (period_year >= 2020),
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT CHECK (payment_method IN ('cash', 'mobile-money', 'bank-transfer')),
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'late', 'cancelled')),
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, organism, period_month, period_year)
);

CREATE INDEX IF NOT EXISTS idx_contributions_member ON public.social_contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_contributions_cooperative ON public.social_contributions(cooperative_id);
CREATE INDEX IF NOT EXISTS idx_contributions_status ON public.social_contributions(status);

-- ============================================
-- 4. PRODUITS ET STOCKS
-- ============================================

-- Table des produits
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des stocks des membres
CREATE TABLE IF NOT EXISTS public.member_stocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.cooperative_members(id) ON DELETE CASCADE,
  cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity DECIMAL(10, 2) NOT NULL,
  quality TEXT NOT NULL CHECK (quality IN ('A', 'B', 'C')),
  location TEXT NOT NULL,
  harvest_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stocks_cooperative ON public.member_stocks(cooperative_id);
CREATE INDEX IF NOT EXISTS idx_stocks_product ON public.member_stocks(product_id);
CREATE INDEX IF NOT EXISTS idx_stocks_status ON public.member_stocks(status);

-- ============================================
-- 5. OFFRES GROUPÉES
-- ============================================

-- Table des offres groupées
CREATE TABLE IF NOT EXISTS public.grouped_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  total_quantity DECIMAL(10, 2) NOT NULL,
  quality TEXT NOT NULL CHECK (quality IN ('A', 'B', 'C', 'Mixed')),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,
  min_order_quantity DECIMAL(10, 2),
  delivery_location TEXT NOT NULL,
  delivery_deadline DATE NOT NULL,
  payment_terms TEXT NOT NULL,
  certifications JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'negotiating', 'sold', 'expired', 'cancelled')),
  views_count INTEGER DEFAULT 0,
  interests_count INTEGER DEFAULT 0,
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_offers_cooperative ON public.grouped_offers(cooperative_id);
CREATE INDEX IF NOT EXISTS idx_offers_product ON public.grouped_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.grouped_offers(status);

-- Table de contribution des membres aux offres
CREATE TABLE IF NOT EXISTS public.offer_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES public.grouped_offers(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.cooperative_members(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES public.member_stocks(id),
  quantity DECIMAL(10, 2) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. NÉGOCIATIONS
-- ============================================

-- Table des négociations
CREATE TABLE IF NOT EXISTS public.negotiations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES public.grouped_offers(id) ON DELETE CASCADE,
  cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.users(id),
  buyer_name TEXT NOT NULL,
  buyer_company TEXT,
  initial_price DECIMAL(15, 2) NOT NULL,
  proposed_price DECIMAL(15, 2),
  final_price DECIMAL(15, 2),
  quantity DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'accepted', 'rejected', 'expired', 'cancelled')),
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  unread_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE
);

-- Table des messages de négociation
CREATE TABLE IF NOT EXISTS public.negotiation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  negotiation_id UUID NOT NULL REFERENCES public.negotiations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  sender_role TEXT NOT NULL CHECK (sender_role IN ('cooperative', 'buyer')),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_negotiation ON public.negotiation_messages(negotiation_id);

-- ============================================
-- 7. NOTATIONS DES ACHETEURS
-- ============================================

-- Table des notations
CREATE TABLE IF NOT EXISTS public.buyer_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  negotiation_id UUID REFERENCES public.negotiations(id),
  payment_rating INTEGER NOT NULL CHECK (payment_rating BETWEEN 1 AND 5),
  communication_rating INTEGER NOT NULL CHECK (communication_rating BETWEEN 1 AND 5),
  punctuality_rating INTEGER NOT NULL CHECK (punctuality_rating BETWEEN 1 AND 5),
  professionalism_rating INTEGER NOT NULL CHECK (professionalism_rating BETWEEN 1 AND 5),
  overall_rating DECIMAL(3, 2) NOT NULL,
  comment TEXT,
  evidence_urls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(negotiation_id, cooperative_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_buyer ON public.buyer_ratings(buyer_id);

-- ============================================
-- 8. PAIEMENTS COLLECTIFS
-- ============================================

-- Table des paiements reçus
CREATE TABLE IF NOT EXISTS public.collective_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  negotiation_id UUID REFERENCES public.negotiations(id),
  buyer_id UUID NOT NULL REFERENCES public.users(id),
  amount DECIMAL(15, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mobile-money', 'bank-transfer')),
  payment_reference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'redistributed', 'cancelled')),
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  redistributed_at TIMESTAMP WITH TIME ZONE,
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des redistributions aux membres
CREATE TABLE IF NOT EXISTS public.member_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES public.collective_payments(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.cooperative_members(id) ON DELETE CASCADE,
  cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mobile-money', 'bank-transfer')),
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_earnings_member ON public.member_earnings(member_id);
CREATE INDEX IF NOT EXISTS idx_earnings_payment ON public.member_earnings(payment_id);

-- ============================================
-- 9. COMMANDES ET LIVRAISONS
-- ============================================

-- Table des commandes
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  negotiation_id UUID NOT NULL REFERENCES public.negotiations(id),
  cooperative_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.users(id),
  total_amount DECIMAL(15, 2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  status TEXT NOT NULL DEFAULT 'preparation' CHECK (status IN ('preparation', 'in-transit', 'delivered', 'confirmed', 'cancelled')),
  expected_delivery_date DATE NOT NULL,
  actual_delivery_date DATE,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des événements de commande
CREATE TABLE IF NOT EXISTS public.order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des livraisons
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  transporter_name TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  tracking_number TEXT UNIQUE NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE,
  estimated_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'on-time' CHECK (status IN ('on-time', 'delayed', 'blocked')),
  current_location JSONB,
  route JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des confirmations de livraison
CREATE TABLE IF NOT EXISTS public.delivery_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  delivered_by TEXT NOT NULL,
  received_by TEXT NOT NULL,
  quantity_delivered DECIMAL(10, 2) NOT NULL,
  quantity_ordered DECIMAL(10, 2) NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('perfect', 'good', 'damaged', 'refused')),
  photos JSONB DEFAULT '[]'::jsonb,
  signature TEXT NOT NULL,
  notes TEXT,
  process_verbal_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. LITIGES
-- ============================================

-- Table des litiges
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_number TEXT UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('delay', 'quantity', 'quality', 'damage', 'incomplete')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'escalated', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  reported_by UUID NOT NULL REFERENCES public.users(id),
  reported_by_role TEXT NOT NULL CHECK (reported_by_role IN ('cooperative', 'buyer')),
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '[]'::jsonb,
  resolution JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des événements de litige
CREATE TABLE IF NOT EXISTS public.dispute_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id),
  user_role TEXT NOT NULL CHECK (user_role IN ('cooperative', 'buyer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 11. SUPPORT CLIENT
-- ============================================

-- Table des tickets de support
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('technical', 'order', 'payment', 'dispute', 'suggestion', 'other')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in-progress', 'waiting', 'resolved', 'closed')),
  assigned_to UUID REFERENCES public.users(id),
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Table des messages de ticket
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'agent', 'admin')),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 12. SÉCURITÉ ET AUDIT
-- ============================================

-- Table d'audit trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- ============================================
-- FONCTIONS ET TRIGGERS
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables avec updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cooperatives_updated_at BEFORE UPDATE ON public.cooperatives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.cooperative_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON public.member_stocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.grouped_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_negotiations_updated_at BEFORE UPDATE ON public.negotiations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'CMD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq;

-- Fonction pour générer un numéro de litige unique
CREATE OR REPLACE FUNCTION generate_dispute_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'LIT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('dispute_number_seq')::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS dispute_number_seq;

-- Fonction pour générer un numéro de ticket unique
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('ticket_number_seq')::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS ticket_number_seq;

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Insertion des produits de base
INSERT INTO public.products (name, category, unit) VALUES
('Cacao', 'Agriculture', 'kg'),
('Café', 'Agriculture', 'kg'),
('Anacarde', 'Agriculture', 'kg'),
('Karité', 'Agriculture', 'kg'),
('Mangues', 'Fruits', 'kg'),
('Bananes', 'Fruits', 'kg'),
('Ignames', 'Tubercules', 'kg'),
('Plantains', 'Fruits', 'kg')
ON CONFLICT DO NOTHING;

-- ============================================
-- FIN DU SCHÉMA
-- ============================================

