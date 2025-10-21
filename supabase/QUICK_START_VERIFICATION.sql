-- ============================================
-- QUICK START VERIFICATION FOR SUPABASE
-- ============================================
--
-- Execute this in the Supabase SQL Editor to check your database state
-- Dashboard > SQL Editor > New Query > Paste this > Run
--
-- ============================================

-- 1. Check which tables currently exist
SELECT
    'Existing Tables' as section,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check extensions
SELECT
    'Extensions' as section,
    extname as extension_name,
    extversion as version
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm')
ORDER BY extname;

-- 3. Check custom types
SELECT
    'Custom Types' as section,
    t.typname as type_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as possible_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%role' OR t.typname LIKE '%status' OR t.typname LIKE '%type' OR t.typname LIKE '%method'
GROUP BY t.typname
ORDER BY t.typname;

-- 4. Check RLS status
SELECT
    'RLS Status' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. Check functions
SELECT
    'Functions' as section,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 6. Check triggers
SELECT
    'Triggers' as section,
    trigger_name,
    event_object_table as table_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- 7. Count records in key tables (if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        RAISE NOTICE 'Users table: % rows', (SELECT COUNT(*) FROM public.users);
    ELSE
        RAISE NOTICE 'Users table does not exist';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cooperatives') THEN
        RAISE NOTICE 'Cooperatives table: % rows', (SELECT COUNT(*) FROM public.cooperatives);
    ELSE
        RAISE NOTICE 'Cooperatives table does not exist';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        RAISE NOTICE 'Products table: % rows', (SELECT COUNT(*) FROM public.products);
    ELSE
        RAISE NOTICE 'Products table does not exist';
    END IF;
END $$;

-- 8. Summary report
SELECT
    'Summary' as section,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT COUNT(*) FROM pg_type WHERE typname LIKE '%role' OR typname LIKE '%status') as total_custom_types,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as total_functions,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as tables_with_rls;

-- ============================================
-- NEXT STEPS BASED ON RESULTS
-- ============================================
--
-- If total_tables = 0:
--   → Your database is empty. Follow SUPABASE_SETUP_GUIDE.md
--   → Start with migration 001_initial_schema.sql
--
-- If total_tables < 40:
--   → Some migrations are missing
--   → Check which tables you have and continue from there
--   → Refer to README_ORDER.md for the correct sequence
--
-- If total_tables >= 40 AND tables_with_rls >= 40:
--   → Your database is fully set up!
--   → You can start using the application
--   → Run `npm run dev` to test
--
-- If tables_with_rls = 0:
--   → Your tables exist but RLS is not configured
--   → Run migration 002_rls_policies.sql
--
-- ============================================
