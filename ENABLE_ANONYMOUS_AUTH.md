# Enable Anonymous Authentication - Quick Guide

## What You're Seeing

**Error in Console**:
```
email_provider_disabled
Email logins are disabled
```

## Why This Happens

Your Supabase project has email authentication turned off, but the Mobile Money login was trying to use email-based authentication behind the scenes.

## The Fix (2 Simple Steps)

### Step 1: Enable Anonymous Authentication

Anonymous authentication lets users log in without email or password. It's perfect for phone-based authentication.

**Go to Supabase Dashboard**:
1. Open: https://qmzubrrxuhgvphhliery.supabase.co
2. Click on **Authentication** in the left sidebar
3. Click on **Providers** tab
4. Scroll down to find **Anonymous** provider
5. Toggle the switch to **Enabled** (it should turn green)
6. Click **Save** button at the bottom

**Visual Guide**:
```
Supabase Dashboard
├── Authentication (left sidebar)
│   ├── Users
│   ├── Policies
│   └── Providers ← Click here
│       ├── Email (disabled - that's fine!)
│       ├── Phone (optional)
│       ├── Google (optional)
│       └── Anonymous ← Enable this one! ✅
```

### Step 2: Apply Database Migration

This updates your database to support phone-only users (no email required).

**Option A - Using Supabase Dashboard** (Easier):

1. In Supabase Dashboard, click **SQL Editor** in left sidebar
2. Click **New query**
3. Copy and paste the entire content of this file:
   - File location: `supabase/migrations/020_make_email_optional.sql`
4. Click **Run** button
5. You should see: "Success. No rows returned"

**Option B - Using Terminal** (If you have Supabase CLI):

```bash
cd /tmp/cc-agent/58776887/project
supabase db push
```

## Verify It Works

### Test the Login Flow

1. Open your app: http://localhost:8080/login

2. Click on **"Connexion avec Mobile Money"** button

3. Choose any operator (Orange, MTN, Moov, or WhatsApp)

4. Enter a test phone number: `0712345678`

5. Click **"Recevoir le code"**

6. Open browser console (Press F12)

7. Look for this message:
   ```
   OTP envoyé au 0712345678: 123456
   ```

8. Copy the 6-digit code and enter it in the form

9. Click **"Vérifier et se connecter"**

10. ✅ You should be logged in!

## What Changed?

### Before (Broken)
```
User → Phone Number
       ↓
System → Create fake email (phone@mobilemoney.local)
       ↓
System → Try signInWithPassword
       ↓
❌ ERROR: email_provider_disabled
```

### After (Fixed)
```
User → Phone Number
       ↓
System → Generate OTP code
       ↓
User → Enter OTP
       ↓
System → Create anonymous session
       ↓
System → Link phone to session
       ↓
✅ SUCCESS: User logged in!
```

## Troubleshooting

### Still Getting Error?

**Check 1**: Is Anonymous Auth Enabled?
- Go to Authentication → Providers
- Anonymous should show "Enabled"
- If not, toggle it on and save

**Check 2**: Did Migration Run?
```sql
-- Run this in SQL Editor to verify:
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'email';

-- Should return: is_nullable = 'YES'
-- If it says 'NO', run the migration again
```

**Check 3**: Clear Browser Cache
- Open DevTools (F12)
- Right-click refresh button
- Select "Empty Cache and Hard Reload"

**Check 4**: Check Console for Errors
- Press F12 to open console
- Look for detailed error messages
- They'll guide you to what's wrong

### Migration Fails?

If you see errors running the migration:

```sql
-- Try running this first:
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;
```

Then try the full migration again.

## Production Considerations

### Current Setup (Development)
- ✅ Works great for testing
- ✅ No SMS costs
- ✅ Fast development iteration
- ⚠️ OTP codes shown in console
- ⚠️ Not suitable for real users yet

### For Production
You'll need to:
1. Set up an SMS provider (Twilio, MessageBird, etc.)
2. Create a Supabase Edge Function to send real SMS
3. Update the code to call the Edge Function
4. Implement rate limiting
5. Add monitoring and logging

See `ANONYMOUS_AUTH_SETUP.md` for production setup details.

## Need Help?

1. **Quick Reference**: `AUTHENTICATION_FIX_SUMMARY.md`
2. **Detailed Guide**: `ANONYMOUS_AUTH_SETUP.md`
3. **Console Errors**: Check browser DevTools (F12)
4. **Supabase Docs**: https://supabase.com/docs/guides/auth/auth-anonymous

## Success Indicators

You'll know it's working when:
- ✅ No "email_provider_disabled" error
- ✅ OTP code appears in console
- ✅ Can enter OTP and log in
- ✅ Redirected to dashboard after login
- ✅ User session persists across page refreshes

---

**Next**: After confirming it works, read `ANONYMOUS_AUTH_SETUP.md` for production setup.
