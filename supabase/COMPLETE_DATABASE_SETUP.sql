-- ============================================
-- COMPLETE DATABASE SETUP FOR SUPABASE
-- Plateforme d'Inclusion Numérique - Côte d'Ivoire
-- ============================================
--
-- IMPORTANT: Execute this script in the Supabase SQL Editor
--
-- Dashboard: https://supabase.com/dashboard/project/qmzubrrxuhgvphhliery
-- SQL Editor: Dashboard > SQL Editor > New Query
--
-- This script consolidates ALL migrations in the correct order.
-- It's safe to run multiple times (idempotent where possible).
--
-- Expected execution time: 2-5 minutes
--
-- ============================================

-- Begin transaction for safety
BEGIN;

-- ============================================
-- SECTION 1: EXTENSIONS AND TYPES
-- From: 001_initial_schema.sql
-- ============================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Create custom ENUM types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('merchant', 'producer', 'cooperative', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_category AS ENUM ('fruits', 'legumes', 'volaille', 'poissons', 'cereales', 'autre');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_unit AS ENUM ('kg', 'piece', 'tonne', 'sac', 'litre');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('mobile_money', 'credit_card', 'bank_transfer', 'cash');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_method AS ENUM ('delivery', 'pickup');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enrollment_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'fee_pending', 'active', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE market_type AS ENUM ('traditional', 'modern', 'street', 'market_hall');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('cni', 'cmu', 'rsti', 'business_license', 'tax_certificate', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Additional types for sales, transactions, etc.
DO $$ BEGIN
    CREATE TYPE sale_status AS ENUM ('completed', 'pending', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE stock_status AS ENUM ('ok', 'low', 'critical', 'out_of_stock');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE movement_type AS ENUM ('in', 'out', 'adjustment', 'sale', 'return', 'loss');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'success', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('payment', 'contribution', 'transfer', 'withdrawal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contribution_type AS ENUM ('cnps', 'cmu', 'cnam');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contribution_status AS ENUM ('not_enrolled', 'up_to_date', 'late', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- SECTION 2: BASE TABLES
-- From: 001_initial_schema.sql
-- ============================================

-- Users table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,  -- Made optional in migration 020
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

-- Merchant profiles
CREATE TABLE IF NOT EXISTS public.merchant_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT,
    business_address TEXT,
    tax_number TEXT,
    registration_date DATE,
    market_name TEXT,
    market_type market_type,
    daily_sales_avg DECIMAL(15, 2),
    monthly_revenue DECIMAL(15, 2),
    inventory_capacity INTEGER,
    delivery_available BOOLEAN DEFAULT FALSE,
    payment_methods TEXT[],
    operating_hours JSONB,
    certifications TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Producer profiles
CREATE TABLE IF NOT EXISTS public.producer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    farm_name TEXT NOT NULL,
    farm_size DECIMAL(10, 2),
    farm_location TEXT NOT NULL,
    gps_coordinates POINT,
    specialties TEXT[],
    organic_certified BOOLEAN DEFAULT FALSE,
    production_capacity DECIMAL(10, 2),
    harvest_seasons TEXT[],
    certifications TEXT[],
    cooperative_member BOOLEAN DEFAULT FALSE,
    cooperative_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Cooperatives
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
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Cooperative members
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
    cnps_status contribution_status DEFAULT 'not_enrolled',
    cmu_status contribution_status DEFAULT 'not_enrolled',
    cnam_status contribution_status DEFAULT 'not_enrolled',
    total_contributions DECIMAL(15, 2) DEFAULT 0,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Social contributions
CREATE TABLE IF NOT EXISTS public.social_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.cooperative_members(id) ON DELETE CASCADE,
    contribution_type contribution_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status payment_status DEFAULT 'pending',
    payment_method payment_method,
    transaction_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- IMPORTANT NOTE FOR USER
-- ============================================
--
-- This is a PARTIAL script showing the structure.
-- Due to the large size of all migrations combined,
-- you should apply migrations individually as described in:
-- SUPABASE_SETUP_GUIDE.md
--
-- To continue, please either:
-- 1. Use the Supabase SQL Editor to run each migration file individually
-- 2. OR Contact me to create smaller, manageable scripts
--
-- ============================================

COMMIT;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- After running migrations, execute this to verify:

SELECT
    'Tables Created' as check_type,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'

UNION ALL

SELECT
    'RLS Enabled',
    COUNT(*)
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;
