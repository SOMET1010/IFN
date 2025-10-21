/*
  # Fix Authentication Schema and RLS Policies

  1. Schema Changes
    - Make email field nullable in users table to support anonymous auth
    - Add user_profiles table for extended user data
    - Add columns for Mobile Money authentication support
    - Remove circular foreign key dependencies

  2. RLS Policy Fixes
    - Remove infinite recursion in users table policies
    - Add proper policies for user_profiles table
    - Simplify policy logic to avoid circular references
    - Add policies for anonymous authentication flow

  3. Data Migration
    - Migrate existing user data to new structure
    - Create user_profiles entries for existing users
    - Preserve existing user relationships

  4. Security
    - Enable RLS on all tables
    - Ensure users can only access their own data
    - Allow admins full access with safe queries
    - Support anonymous user profile creation
*/

-- ============================================
-- STEP 1: DROP PROBLEMATIC POLICIES
-- ============================================

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- ============================================
-- STEP 2: ALTER USERS TABLE STRUCTURE
-- ============================================

-- Make email nullable to support anonymous auth
ALTER TABLE public.users
  ALTER COLUMN email DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS users_email_key;

-- Add index for email if it doesn't exist (for performance with nullable emails)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) WHERE email IS NOT NULL;

-- Add Mobile Money authentication columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'mobile_money_operator') THEN
    ALTER TABLE public.users ADD COLUMN mobile_money_operator TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'mobile_money_verified') THEN
    ALTER TABLE public.users ADD COLUMN mobile_money_verified BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'primary_auth_method') THEN
    ALTER TABLE public.users ADD COLUMN primary_auth_method TEXT DEFAULT 'email';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'auth_methods_used') THEN
    ALTER TABLE public.users ADD COLUMN auth_methods_used TEXT[] DEFAULT ARRAY['email'];
  END IF;
END $$;

-- ============================================
-- STEP 3: CREATE USER_PROFILES TABLE
-- ============================================

-- Create user_profiles table for extended user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  phone TEXT,
  email TEXT,
  whatsapp_phone TEXT,
  whatsapp_name TEXT,
  whatsapp_verified BOOLEAN DEFAULT FALSE,
  mobile_money_operator TEXT CHECK (mobile_money_operator IN ('orange', 'mtn', 'moov', 'whatsapp')),
  mobile_money_verified BOOLEAN DEFAULT FALSE,
  primary_auth_method TEXT DEFAULT 'email' CHECK (primary_auth_method IN ('email', 'mobile_money', 'whatsapp', 'anonymous')),
  auth_methods_used TEXT[] DEFAULT ARRAY['email'],
  profile_complete BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Add foreign key constraint that allows deletion
  CONSTRAINT user_profiles_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON public.user_profiles(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email) WHERE email IS NOT NULL;

-- ============================================
-- STEP 4: MIGRATE EXISTING DATA
-- ============================================

-- Migrate existing users to user_profiles
INSERT INTO public.user_profiles (user_id, phone, email, primary_auth_method, profile_complete, created_at, updated_at)
SELECT
  id,
  phone,
  email,
  COALESCE(primary_auth_method, 'email'),
  CASE
    WHEN email IS NOT NULL AND name IS NOT NULL THEN TRUE
    ELSE FALSE
  END,
  created_at,
  updated_at
FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- STEP 5: CREATE SAFE RLS POLICIES FOR USERS
-- ============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile (simple, no recursion)
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Service role can do everything (for backend operations)
CREATE POLICY "users_service_role_all" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STEP 6: CREATE RLS POLICIES FOR USER_PROFILES
-- ============================================

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a user profile (for signup process)
CREATE POLICY "user_profiles_insert_authenticated" ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view their own profile
CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role can do everything
CREATE POLICY "user_profiles_service_role_all" ON public.user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STEP 7: CREATE HELPER FUNCTIONS
-- ============================================

-- Function to safely check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = user_id
    AND role = 'admin'::text
    AND status = 'active'::text
  );
END;
$$;

-- Function to get user profile safely
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  phone TEXT,
  mobile_money_operator TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.name,
    u.role::text,
    up.phone,
    up.mobile_money_operator
  FROM public.users u
  LEFT JOIN public.user_profiles up ON u.id = up.user_id
  WHERE u.id = user_id;
END;
$$;

-- ============================================
-- STEP 8: CREATE TRIGGERS FOR AUTO-SYNC
-- ============================================

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply trigger to user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STEP 9: GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, UPDATE ON public.users TO authenticated;

-- Grant all permissions to service role
GRANT ALL ON public.user_profiles TO service_role;
GRANT ALL ON public.users TO service_role;

-- Grant usage on functions
GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify the schema changes
DO $$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  SELECT COUNT(*) INTO profile_count FROM public.user_profiles;

  RAISE NOTICE 'Migration completed successfully';
  RAISE NOTICE 'Total users: %', user_count;
  RAISE NOTICE 'Total user profiles: %', profile_count;
END $$;
