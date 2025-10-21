# Anonymous Authentication Setup Guide

## Problem Fixed

The Mobile Money authentication system was failing with error `"email_provider_disabled"` because:
- Email authentication is disabled in your Supabase project
- The old implementation tried to create fake email accounts using `signInWithPassword`
- This approach doesn't work when email provider is disabled

## Solution Implemented

We've refactored the authentication system to use **Anonymous Authentication**, which:
- Works immediately without SMS provider configuration
- Doesn't require email authentication to be enabled
- Allows users to authenticate with just their phone number
- Can be upgraded to permanent accounts later

## What Changed

### 1. Database Migration (020_make_email_optional.sql)
- Made `email` column nullable in the `users` table
- Added constraint ensuring either email OR phone is present
- Added unique index on phone numbers
- Updated RLS policies to support phone-only users

### 2. Social Auth Service Refactoring
- Replaced email-based workaround with anonymous authentication
- Uses `supabase.auth.signInAnonymously()` instead of `signInWithPassword`
- Stores phone verification in user metadata
- Creates user profiles with phone as primary identifier

### 3. Error Handling Updates
- Added specific error messages for disabled authentication providers
- Handles `email_provider_disabled`, `phone_provider_disabled`, and `anonymous_provider_disabled` errors
- Provides helpful guidance to users when providers are misconfigured

### 4. Database User Creation
- Updated to support users without email addresses
- Generates default names based on phone numbers
- Handles both email and phone-only authentication flows

## Setup Instructions

### Step 1: Enable Anonymous Authentication in Supabase

1. Go to your Supabase Dashboard: https://qmzubrrxuhgvphhliery.supabase.co
2. Navigate to **Authentication** → **Providers**
3. Find **Anonymous** in the list of providers
4. Toggle it to **Enabled**
5. Click **Save**

That's it! No configuration needed for anonymous authentication.

### Step 2: Apply Database Migration

**Option A: Using Supabase CLI** (recommended)
```bash
cd /tmp/cc-agent/58776887/project
supabase db push
```

**Option B: Using Supabase Dashboard**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/migrations/020_make_email_optional.sql`
3. Paste and execute the SQL

**Verify Migration:**
```sql
-- Check that email is now nullable
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'email';

-- Should return: is_nullable = 'YES'
```

### Step 3: Test the Authentication Flow

1. Start your development server:
```bash
npm run dev
```

2. Navigate to: http://localhost:8080/login/mobile-money

3. Test with these steps:
   - Select an operator (Orange, MTN, Moov, or WhatsApp)
   - Enter any phone number: `0712345678`
   - Open browser console (F12) to see the OTP code
   - Copy the 6-digit code from console
   - Enter it in the verification form
   - ✅ You should be logged in successfully!

## How It Works

### Authentication Flow

```
User enters phone number
       ↓
System generates 6-digit OTP
       ↓
OTP stored in localStorage (dev mode)
       ↓
User enters OTP code
       ↓
System verifies OTP
       ↓
Creates anonymous Supabase session
       ↓
Creates user profile with phone number
       ↓
User is authenticated! 🎉
```

### Anonymous Authentication Benefits

1. **No External Dependencies**: Works without SMS provider setup
2. **Immediate Functionality**: Perfect for development and testing
3. **Secure**: Uses Supabase's built-in anonymous auth system
4. **Upgradeable**: Can be converted to permanent accounts later
5. **RLS Compatible**: Works with Row Level Security policies

### User Profile Structure

For phone-authenticated users:
```javascript
{
  id: "uuid",
  user_id: "uuid",
  phone: "+225XXXXXXXX",
  email: "XXXXXXXXXX@mobilemoney.local", // Fake email for compatibility
  mobile_money_operator: "orange",
  mobile_money_verified: true,
  primary_auth_method: "mobile_money",
  auth_methods_used: ["mobile_money"],
  role: "merchant"
}
```

## Production Considerations

### Current Setup (Development)
- OTP displayed in browser console
- OTP stored in localStorage
- No real SMS sending

### For Production
You'll need to:

1. **Set up SMS Provider** (choose one):
   - Twilio (recommended)
   - MessageBird
   - Vonage
   - African Messaging Service

2. **Create Edge Function** for sending real SMS:
   ```typescript
   // supabase/functions/send-otp-sms/index.ts
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

   serve(async (req) => {
     const { phoneNumber, otp, operator } = await req.json();

     // Call SMS API based on operator
     // Orange Money, MTN, Moov, or WhatsApp

     return new Response(JSON.stringify({ success: true }));
   });
   ```

3. **Update socialAuthService.ts**:
   - Replace `localStorage` with database storage
   - Call Edge Function to send real SMS
   - Add rate limiting and abuse prevention

4. **Consider Phone OTP Authentication**:
   - Enable Phone provider in Supabase
   - Use `supabase.auth.signInWithOtp({ phone })`
   - Requires SMS provider configuration
   - More secure than anonymous + phone metadata

## Troubleshooting

### Error: "Anonymous provider disabled"
**Solution**: Go to Supabase Dashboard → Authentication → Providers → Enable "Anonymous"

### Error: "Cannot insert into users table"
**Solution**: Run the migration `020_make_email_optional.sql` to make email nullable

### OTP not showing in console
**Solution**:
1. Open browser console with F12
2. Look for message: "OTP envoyé au [phone]: [code]"
3. Ensure localStorage is enabled in your browser

### User profile not created
**Solution**: Check that `user_profiles` table exists and has correct columns. Run migration 019 and 020.

### Session expires immediately
**Solution**: Check Supabase project settings for session timeout configuration

## Migration Path to Phone OTP

When ready for production SMS:

1. Enable Phone provider in Supabase
2. Configure SMS provider (Twilio/MessageBird)
3. Update `socialAuthService.ts`:
```typescript
// Replace anonymous auth with phone OTP
const { data, error } = await supabase.auth.signInWithOtp({
  phone: phoneNumber,
  options: {
    channel: 'sms' // or 'whatsapp'
  }
});
```

4. Update verification:
```typescript
const { data, error } = await supabase.auth.verifyOtp({
  phone: phoneNumber,
  token: otp,
  type: 'sms'
});
```

## Security Notes

- Anonymous sessions are tied to the device
- User can clear session by logging out
- Phone numbers are unique identifiers
- OTP expires after 5 minutes
- Maximum 3 OTP verification attempts
- Rate limiting should be implemented in production

## Support

If you encounter issues:
1. Check Supabase dashboard for authentication provider status
2. Verify migrations are applied correctly
3. Check browser console for detailed error messages
4. Review Supabase logs for authentication attempts

## Next Steps

After testing locally:
1. Deploy to staging environment
2. Test with real phone numbers
3. Set up SMS provider for production
4. Implement proper monitoring and logging
5. Train support team on new authentication flow

---

**Status**: ✅ Development-ready with anonymous authentication
**Production**: ⏳ Requires SMS provider configuration
