# Authentication Database Fix - Implementation Guide

## Overview

This document explains the database schema and RLS policy fixes implemented to resolve authentication errors, particularly for Mobile Money authentication.

## Problems Identified

### 1. Infinite Recursion in RLS Policies
- **Issue**: The `users` table had RLS policies that referenced themselves, creating infinite recursion
- **Error**: `infinite recursion detected in policy for relation "users"`
- **Impact**: Users couldn't query their own profile data

### 2. Missing user_profiles Table
- **Issue**: Code expected a `user_profiles` table that didn't exist or had incorrect structure
- **Error**: `insert or update on table "user_profiles" violates foreign key constraint`
- **Impact**: Mobile Money user creation failed after authentication

### 3. Email Uniqueness Constraint
- **Issue**: `users.email` had a UNIQUE NOT NULL constraint incompatible with anonymous auth
- **Impact**: Multiple anonymous users with placeholder emails couldn't be created

## Solutions Implemented

### Migration File: `20251021190500_fix_auth_schema_and_rls.sql`

This migration performs the following changes:

#### 1. Users Table Modifications

```sql
-- Make email nullable
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;
DROP CONSTRAINT IF EXISTS users_email_key;

-- Add Mobile Money authentication columns
ALTER TABLE public.users ADD COLUMN mobile_money_operator TEXT;
ALTER TABLE public.users ADD COLUMN mobile_money_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN primary_auth_method TEXT DEFAULT 'email';
ALTER TABLE public.users ADD COLUMN auth_methods_used TEXT[] DEFAULT ARRAY['email'];
```

**Rationale**:
- Allows anonymous authentication without requiring unique emails
- Supports Mobile Money as a primary authentication method
- Tracks authentication methods used for security purposes

#### 2. New user_profiles Table

```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  phone TEXT,
  email TEXT,
  whatsapp_phone TEXT,
  whatsapp_name TEXT,
  whatsapp_verified BOOLEAN DEFAULT FALSE,
  mobile_money_operator TEXT,
  mobile_money_verified BOOLEAN DEFAULT FALSE,
  primary_auth_method TEXT DEFAULT 'email',
  auth_methods_used TEXT[] DEFAULT ARRAY['email'],
  profile_complete BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT user_profiles_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);
```

**Rationale**:
- Separates authentication data from extended profile data
- Properly references `auth.users` instead of `public.users` to avoid circular dependencies
- Supports multiple authentication methods per user
- Allows progressive profile completion

#### 3. Fixed RLS Policies

**Old Policy (Caused Infinite Recursion):**
```sql
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users  -- ❌ Queries same table!
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**New Policies (No Recursion):**
```sql
-- Simple, non-recursive policy
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Service role for admin operations
CREATE POLICY "users_service_role_all" ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

**New user_profiles Policies:**
```sql
CREATE POLICY "user_profiles_insert_authenticated" ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_profiles_select_own" ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_profiles_update_own" ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

**Rationale**:
- Removed circular table references
- Delegated admin checks to service role instead of RLS
- Added proper policies for user_profiles table
- Ensured users can only access their own data

#### 4. Helper Functions

```sql
-- Safe function to check admin status
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin' AND status = 'active'
  );
END;
$$;

-- Safe function to get user profile
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (...)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.name, ...
  FROM public.users u
  LEFT JOIN public.user_profiles up ON u.id = up.user_id
  WHERE u.id = user_id;
END;
$$;
```

**Rationale**:
- `SECURITY DEFINER` allows safe querying bypassing RLS
- Prevents infinite recursion by executing with elevated privileges
- Provides clean API for common operations

## Code Changes

### 1. socialAuthService.ts

**Updated user creation flow:**
```typescript
// 1. Create auth.users entry (via Supabase Auth)
const { data: anonData } = await supabase.auth.signInAnonymously({...});

// 2. Create public.users entry
await supabase.from('users').insert({
  id: anonData.user.id,
  email: email,  // Can be null or placeholder
  name: userName,
  role: 'merchant',
  ...
});

// 3. Create user_profiles entry
await supabase.from('user_profiles').insert({
  user_id: anonData.user.id,  // References auth.users
  phone: phoneNumber,
  mobile_money_operator: operator,
  ...
});
```

**Error handling:**
- Checks for duplicate key errors
- Attempts rollback if profile creation fails
- Provides clear error messages

### 2. supabaseClient.ts

**Updated authHelpers:**
```typescript
// Use maybeSingle() instead of single() to avoid errors
async getDatabaseUser(supabaseUser) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', supabaseUser.id)
    .maybeSingle();  // ✅ Returns null instead of throwing

  if (!data) {
    console.log('No user found');
    return null;
  }

  return data;
}
```

## Testing the Fix

### 1. Verify Migration Applied

```sql
-- Check users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('email', 'mobile_money_operator', 'primary_auth_method');

-- Check user_profiles table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'user_profiles'
);

-- Check RLS policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('users', 'user_profiles');
```

### 2. Test Mobile Money Authentication

```typescript
// 1. Request OTP
const { success, sessionId } = await socialAuthService
  .authenticateWithMobileMoney('0709753232', 'orange');

// 2. Verify OTP
const result = await socialAuthService
  .verifyMobileMoneyOTP(sessionId, '123456');

// Should succeed without errors:
// ✅ No "infinite recursion" error
// ✅ No "foreign key violation" error
// ✅ User created in all three tables
```

### 3. Verify User Profile Query

```typescript
// Should return user data without errors
const user = await SupabaseAuthService.getCurrentUser();
console.log(user); // Should have id, email, name, role, phone
```

## Rollback Procedure

If issues arise, you can rollback the migration:

```sql
-- 1. Drop new policies
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_service_role_all" ON public.users;
DROP POLICY IF EXISTS "user_profiles_insert_authenticated" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;

-- 2. Drop user_profiles table
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- 3. Restore email constraint (if needed)
ALTER TABLE public.users ALTER COLUMN email SET NOT NULL;
ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);

-- 4. Remove new columns
ALTER TABLE public.users DROP COLUMN IF EXISTS mobile_money_operator;
ALTER TABLE public.users DROP COLUMN IF EXISTS mobile_money_verified;
ALTER TABLE public.users DROP COLUMN IF EXISTS primary_auth_method;
ALTER TABLE public.users DROP COLUMN IF EXISTS auth_methods_used;

-- 5. Recreate original policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
-- ... (other original policies)
```

## Future Considerations

### 1. Data Migration for Existing Users
- Run a script to populate `user_profiles` for existing users
- Update any existing code that queries users table directly

### 2. Admin Dashboard Updates
- Update admin queries to use helper functions instead of direct queries
- Implement proper role checking using `is_user_admin()` function

### 3. Performance Optimization
- Monitor query performance on user_profiles table
- Add additional indexes if needed based on usage patterns

### 4. Security Audit
- Verify all RLS policies are working as expected
- Test with different user roles (merchant, producer, cooperative, admin)
- Ensure anonymous users have appropriate limited access

## Summary

This fix resolves critical authentication issues by:

1. **Eliminating infinite recursion** in RLS policies through simplified, non-recursive policies
2. **Adding proper table structure** with user_profiles to separate concerns
3. **Supporting anonymous authentication** by making email nullable
4. **Enabling Mobile Money authentication** with proper table relationships
5. **Providing safe helper functions** for admin operations

The changes ensure users can authenticate via Mobile Money without encountering database errors, while maintaining security through proper RLS policies.
