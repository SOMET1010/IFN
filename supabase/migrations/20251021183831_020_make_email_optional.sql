/*
  # Make Email Optional for Phone-Only Authentication

  1. Changes
    - Make email column nullable in users table
    - Add constraint to ensure either email OR phone is present
    - Update user_profiles table to support phone-only users
    - Add index on phone for faster lookups

  2. Security
    - Maintain unique constraint on email when provided
    - Add unique constraint on phone when provided
    - Update RLS policies to work with phone-only users

  3. Notes
    - Supports Mobile Money and WhatsApp authentication without email
    - Backward compatible with existing email-based users
    - Email format validation maintained when email is provided
*/

-- Make email nullable in users table
ALTER TABLE public.users
ALTER COLUMN email DROP NOT NULL;

-- Add constraint to ensure either email or phone is present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_email_or_phone_required'
  ) THEN
    ALTER TABLE public.users
    ADD CONSTRAINT users_email_or_phone_required
    CHECK (email IS NOT NULL OR phone IS NOT NULL);
  END IF;
END $$;

-- Add unique constraint on phone when not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique
ON public.users(phone)
WHERE phone IS NOT NULL;

-- Ensure user_profiles table exists and has necessary columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    CREATE TABLE public.user_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
      phone TEXT,
      email TEXT,
      mobile_money_operator TEXT,
      mobile_money_verified BOOLEAN DEFAULT FALSE,
      whatsapp_phone TEXT,
      whatsapp_verified BOOLEAN DEFAULT FALSE,
      primary_auth_method TEXT DEFAULT 'email',
      auth_methods_used TEXT[] DEFAULT ARRAY[]::TEXT[],
      role TEXT DEFAULT 'merchant',
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    
    ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Add columns to user_profiles if they don't exist
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS mobile_money_operator TEXT,
ADD COLUMN IF NOT EXISTS mobile_money_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'merchant';

-- Update existing user_profiles to sync with users table
UPDATE public.user_profiles up
SET
  phone = u.phone,
  email = u.email
FROM public.users u
WHERE up.user_id = u.id
AND (up.phone IS NULL OR up.email IS NULL);

-- Add index on phone for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON public.user_profiles(phone);

-- Update RLS policies to work with phone-only users
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create new policies that work with both email and phone
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON CONSTRAINT users_email_or_phone_required ON public.users IS
  'Ensures each user has at least email or phone for authentication';

COMMENT ON INDEX idx_users_phone_unique IS
  'Ensures phone numbers are unique when provided';

COMMENT ON INDEX idx_user_profiles_phone IS
  'Improves performance for phone-based user lookups';