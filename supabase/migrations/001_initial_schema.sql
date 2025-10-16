-- Migration initiale pour la plateforme d'inclusion numérique
-- Création des tables principales avec relations et contraintes

-- Extension pour les UUID et les fonctions avancées
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Types personnalisés
CREATE TYPE user_role AS ENUM ('merchant', 'producer', 'cooperative', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
CREATE TYPE product_category AS ENUM ('fruits', 'legumes', 'volaille', 'poissons', 'cereales', 'autre');
CREATE TYPE product_unit AS ENUM ('kg', 'piece', 'tonne', 'sac', 'litre');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('mobile_money', 'credit_card', 'bank_transfer', 'cash');
CREATE TYPE delivery_method AS ENUM ('delivery', 'pickup');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE enrollment_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'fee_pending', 'active', 'suspended');
CREATE TYPE market_type AS ENUM ('traditional', 'modern', 'street', 'market_hall');
CREATE TYPE document_type AS ENUM ('cni', 'cmu', 'rsti', 'business_license', 'tax_certificate', 'other');

-- Table des utilisateurs (utilisant le système d'authentification de Supabase)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'merchant',
    status user_status NOT NULL DEFAULT 'pending',
    avatar_url TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Table des profils des marchands
CREATE TABLE public.merchant_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT,
    business_address TEXT,
    tax_number TEXT,
    registration_date DATE,
    market_name TEXT,
    market_type market_type,
    commune TEXT,
    description TEXT,
    website TEXT,
    social_media JSONB DEFAULT '{}'::jsonb,
    business_hours JSONB DEFAULT '{}'::jsonb,
    specialties TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{'francois'}',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMPTZ,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des profils des producteurs
CREATE TABLE public.producer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    farm_name TEXT,
    farm_location TEXT NOT NULL,
    farm_size DECIMAL(10,2),
    farm_type TEXT,
    main_products TEXT[] DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    production_methods TEXT[] DEFAULT '{}',
    experience_years INTEGER,
    description TEXT,
    coordinates POINT,
    is_certified BOOLEAN DEFAULT FALSE,
    certification_date TIMESTAMPTZ,
    rating DECIMAL(3,2) DEFAULT 0,
    total_harvests INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des coopératives
CREATE TABLE public.cooperatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    registration_number TEXT UNIQUE,
    tax_number TEXT,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    established_date DATE,
    legal_structure TEXT,
    sector TEXT,
    number_of_members INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMPTZ,
    status user_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des membres des coopératives
CREATE TABLE public.cooperative_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cooperative_id UUID REFERENCES public.cooperatives(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    membership_number TEXT,
    join_date DATE NOT NULL,
    leave_date DATE,
    contribution_type TEXT DEFAULT 'mensuelle',
    contribution_amount DECIMAL(10,2) DEFAULT 0,
    status user_status NOT NULL DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(cooperative_id, user_id)
);

-- Table des produits
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category product_category NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'FCFA',
    unit product_unit NOT NULL,
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE SET NULL,
    cooperative_id UUID REFERENCES public.cooperatives(id) ON DELETE SET NULL,
    merchant_id UUID REFERENCES public.merchant_profiles(id) ON DELETE SET NULL,
    stock_quantity DECIMAL(10,2) DEFAULT 0,
    minimum_stock DECIMAL(10,2) DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_organic BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    origin TEXT,
    harvest_date DATE,
    expiry_date DATE,
    quality_grade TEXT,
    certifications TEXT[] DEFAULT '{}',
    barcode TEXT,
    sku TEXT,
    weight DECIMAL(10,2),
    dimensions JSONB,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CHECK (
        (producer_id IS NOT NULL AND cooperative_id IS NULL AND merchant_id IS NULL) OR
        (producer_id IS NULL AND cooperative_id IS NOT NULL AND merchant_id IS NULL) OR
        (producer_id IS NULL AND cooperative_id IS NULL AND merchant_id IS NOT NULL)
    )
);

-- Table des offres des producteurs
CREATE TABLE public.producer_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit product_unit NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price) STORED,
    description TEXT,
    harvest_date DATE,
    expiry_date DATE,
    location TEXT,
    quality TEXT DEFAULT 'Standard',
    images TEXT[] DEFAULT '{}',
    is_negotiable BOOLEAN DEFAULT TRUE,
    minimum_order_quantity DECIMAL(10,2) DEFAULT 1,
    delivery_options TEXT[] DEFAULT '{'pickup'}',
    status TEXT DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'terminee', 'en_attente', 'annulee')),
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des commandes
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    seller_type user_role NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_amount + delivery_fee + tax_amount - discount_amount) STORED,
    status order_status NOT NULL DEFAULT 'pending',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_method payment_method,
    delivery_method delivery_method NOT NULL DEFAULT 'pickup',
    delivery_address JSONB,
    delivery_instructions TEXT,
    estimated_delivery TIMESTAMPTZ,
    actual_delivery TIMESTAMPTZ,
    tracking_number TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des éléments de commande
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des paiements
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    transaction_reference TEXT UNIQUE,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'FCFA',
    method payment_method NOT NULL,
    provider TEXT,
    status payment_status NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    confirmation_code TEXT,
    receipt_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des paniers
CREATE TABLE public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    total_items INTEGER DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des éléments du panier
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(cart_id, product_id)
);

-- Table des révisions
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    images TEXT[] DEFAULT '{}',
    helpful_count INTEGER DEFAULT 0,
    status review_status NOT NULL DEFAULT 'pending',
    response_text TEXT,
    responder_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    response_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, product_id, order_id)
);

-- Table des enrôlements des marchands
CREATE TABLE public.merchant_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    nationality TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    commune TEXT NOT NULL,
    market TEXT NOT NULL,
    market_type market_type NOT NULL,
    cni_number TEXT NOT NULL,
    cni_expiry_date DATE,
    cmu_number TEXT,
    rsti_number TEXT,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    registration_date DATE,
    tax_number TEXT,
    cooperative_id UUID REFERENCES public.cooperatives(id) ON DELETE SET NULL,
    status enrollment_status NOT NULL DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,
    notes TEXT,
    rejection_reason TEXT,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des documents d'enrôlement
CREATE TABLE public.enrollment_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES public.merchant_enrollments(id) ON DELETE CASCADE NOT NULL,
    type document_type NOT NULL,
    filename TEXT NOT NULL,
    file_url TEXT,
    file_size BIGINT,
    mime_type TEXT,
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    is_delivered BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    read_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- Indexes pour optimiser les performances
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_producer ON public.products(producer_id);
CREATE INDEX idx_products_status ON public.products(is_active);
CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller ON public.orders(seller_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_reviews_status ON public.reviews(status);
CREATE INDEX idx_enrollments_status ON public.merchant_enrollments(status);
CREATE INDEX idx_enrollments_submitted_at ON public.merchant_enrollments(submitted_at);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);

-- Fonctions utilitaires
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_merchant_profiles_updated_at BEFORE UPDATE ON public.merchant_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_producer_profiles_updated_at BEFORE UPDATE ON public.producer_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cooperatives_updated_at BEFORE UPDATE ON public.cooperatives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour générer des numéros de commande uniques
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_number TEXT;
    counter INTEGER;
BEGIN
    -- Format: ORD-YYYYMMDD-XXXX (où XXXX est un compteur)
    SELECT COUNT(*) INTO counter FROM public.orders WHERE DATE(created_at) = CURRENT_DATE;
    order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD((counter + 1)::TEXT, 4, '0');
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le numéro de commande
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := public.generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_order_number();

-- Fonction pour calculer les statistiques de notation
CREATE OR REPLACE FUNCTION public.update_product_rating(product_id UUID)
RETURNS VOID AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    total_reviews INTEGER;
BEGIN
    SELECT
        COALESCE(AVG(rating), 0)::DECIMAL(3,2),
        COUNT(*)
    INTO avg_rating, total_reviews
    FROM public.reviews
    WHERE product_id = product_id AND status = 'approved';

    UPDATE public.products
    SET rating = avg_rating,
        total_reviews = total_reviews,
        updated_at = NOW()
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour la notation du produit après une révision
CREATE OR REPLACE FUNCTION public.trigger_update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        PERFORM public.update_product_rating(NEW.product_id);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
            PERFORM public.update_product_rating(NEW.product_id);
        ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
            PERFORM public.update_product_rating(NEW.product_id);
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        PERFORM public.update_product_rating(OLD.product_id);
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.trigger_update_product_rating();

-- Activer Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperative_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;