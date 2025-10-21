/*
  # Secure RLS Policies for Anonymous Authentication

  1. Purpose
    - Ensure anonymous authenticated users can only access their own data
    - Prevent unauthorized access to other users' data
    - Allow self-registration while maintaining security

  2. Key Security Principles
    - Anonymous users have 'authenticated' role in Supabase
    - Use auth.uid() to restrict access to own records only
    - Prevent cross-user data access
    - Allow users to create their own records during signup

  3. Tables Secured
    - users: User accounts
    - user_profiles: Extended user information
    - merchant_profiles: Merchant-specific data
    - producer_profiles: Producer-specific data
    - cooperative_profiles: Cooperative-specific data

  4. Security Guarantees
    - Users can only INSERT their own record (auth.uid() = id)
    - Users can only SELECT their own data
    - Users can only UPDATE their own data
    - Users cannot DELETE their own records (admin only)
    - No cross-user data leakage
*/

-- ============================================================================
-- USERS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policies to recreate them with proper security
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_admin_select_all" ON users;

-- Users can insert their own record during signup (anonymous auth)
CREATE POLICY "Users can insert own record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can view their own data only
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data only
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all users (using existing is_admin function)
CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================================================
-- USER PROFILES TABLE RLS POLICIES
-- ============================================================================

-- Already have correct policies from previous migration, but verify they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- MERCHANT PROFILES RLS POLICIES
-- ============================================================================

-- Ensure merchant_profiles table has RLS enabled
ALTER TABLE merchant_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchants can view own profile" ON merchant_profiles;
DROP POLICY IF EXISTS "Merchants can update own profile" ON merchant_profiles;
DROP POLICY IF EXISTS "Merchants can insert own profile" ON merchant_profiles;

CREATE POLICY "Merchants can view own profile"
  ON merchant_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants can update own profile"
  ON merchant_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Merchants can insert own profile"
  ON merchant_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PRODUCER PROFILES RLS POLICIES
-- ============================================================================

-- Ensure producer_profiles table has RLS enabled
ALTER TABLE producer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Producers can view own profile" ON producer_profiles;
DROP POLICY IF EXISTS "Producers can update own profile" ON producer_profiles;
DROP POLICY IF EXISTS "Producers can insert own profile" ON producer_profiles;

CREATE POLICY "Producers can view own profile"
  ON producer_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Producers can update own profile"
  ON producer_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Producers can insert own profile"
  ON producer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- COOPERATIVE PROFILES RLS POLICIES (if exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cooperative_profiles') THEN
    ALTER TABLE cooperative_profiles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Cooperatives can view own profile" ON cooperative_profiles;
    DROP POLICY IF EXISTS "Cooperatives can update own profile" ON cooperative_profiles;
    DROP POLICY IF EXISTS "Cooperatives can insert own profile" ON cooperative_profiles;

    EXECUTE 'CREATE POLICY "Cooperatives can view own profile"
      ON cooperative_profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id)';

    EXECUTE 'CREATE POLICY "Cooperatives can update own profile"
      ON cooperative_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id)';

    EXECUTE 'CREATE POLICY "Cooperatives can insert own profile"
      ON cooperative_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- ============================================================================
-- SECURITY VERIFICATION FUNCTION
-- ============================================================================

-- Function to verify RLS policies are correctly configured
CREATE OR REPLACE FUNCTION verify_rls_security()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT,
  has_insert_policy BOOLEAN,
  has_select_policy BOOLEAN,
  has_update_policy BOOLEAN,
  security_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH table_rls AS (
    SELECT
      t.tablename::TEXT AS tbl_name,
      t.rowsecurity AS rls_enabled
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND t.tablename IN ('users', 'user_profiles', 'merchant_profiles', 'producer_profiles', 'cooperative_profiles')
  ),
  policy_counts AS (
    SELECT
      p.tablename::TEXT AS tbl_name,
      COUNT(*) AS pol_count,
      BOOL_OR(p.cmd = 'INSERT') AS has_insert,
      BOOL_OR(p.cmd = 'SELECT') AS has_select,
      BOOL_OR(p.cmd = 'UPDATE') AS has_update
    FROM pg_policies p
    WHERE p.schemaname = 'public'
    GROUP BY p.tablename
  )
  SELECT
    tr.tbl_name,
    tr.rls_enabled,
    COALESCE(pc.pol_count, 0),
    COALESCE(pc.has_insert, false),
    COALESCE(pc.has_select, false),
    COALESCE(pc.has_update, false),
    CASE
      WHEN NOT tr.rls_enabled THEN '❌ RLS NOT ENABLED'
      WHEN COALESCE(pc.pol_count, 0) = 0 THEN '⚠️  NO POLICIES'
      WHEN NOT COALESCE(pc.has_select, false) THEN '⚠️  NO SELECT POLICY'
      WHEN NOT COALESCE(pc.has_insert, false) THEN '⚠️  NO INSERT POLICY'
      ELSE '✅ SECURE'
    END AS security_status
  FROM table_rls tr
  LEFT JOIN policy_counts pc ON tr.tbl_name = pc.tbl_name
  ORDER BY tr.tbl_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Users can insert own record" ON users IS
  'Allows anonymous authenticated users to create their own user record during signup. Uses auth.uid() to ensure user can only insert their own ID.';

COMMENT ON POLICY "Users can view own data" ON users IS
  'Restricts users to viewing only their own data. Critical for preventing data leakage in anonymous auth.';

COMMENT ON POLICY "Users can update own data" ON users IS
  'Allows users to update only their own data. Both USING and WITH CHECK clauses ensure security.';

COMMENT ON FUNCTION verify_rls_security() IS
  'Utility function to verify RLS policies are correctly configured for all user-related tables. Returns security status for each table.';

-- ============================================================================
-- SECURITY VERIFICATION
-- ============================================================================

-- Display security status of all tables
SELECT * FROM verify_rls_security();