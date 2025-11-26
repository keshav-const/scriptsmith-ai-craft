# Deploy Supabase Edge Functions

## The Problem

Your Edge Function code exists locally but hasn't been deployed to your Supabase project. When your app tries to call `analyze-code`, it's looking for it on the remote Supabase server where it doesn't exist yet.

## Solution: Deploy the Edge Function

### Option 1: Using Supabase CLI (Recommended)

#### Step 1: Install Supabase CLI

```powershell
# Using npm
npm install -g supabase

# OR using Scoop (Windows package manager)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Step 2: Login to Supabase

```powershell
supabase login
```

This will open your browser to authenticate.

#### Step 3: Link Your Project

```powershell
cd e:\scriptsmith\scriptsmith-ai-craft
supabase link --project-ref ezsnodpgxdtbcxftidva
```

You'll need your database password (from your Supabase project settings).

#### Step 4: Deploy the Edge Function

```powershell
supabase functions deploy analyze-code
```

You'll need to set environment variables:

```powershell
# Set the GEMINI_API_KEY secret
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

### Option 2: Using Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/ezsnodpgxdtbcxftidva
2. Navigate to **Edge Functions** in the left sidebar
3. Click **"New Function"**
4. Name it `analyze-code`
5. Copy and paste the contents of `supabase/functions/analyze-code/index.ts`
6. Click **Deploy**
7. Go to **Project Settings** → **Edge Functions** → **Secrets**
8. Add `GEMINI_API_KEY` with your Gemini API key

### Option 3: Quick Test with Local Supabase

If you want to test locally first:

```powershell
# Start local Supabase
supabase start

# Deploy to local instance
supabase functions serve analyze-code
```

Then update your `.env` to point to local Supabase:
```
VITE_SUPABASE_URL=http://localhost:54321
```

## Required Environment Variables

Your Edge Function needs these secrets set in Supabase:

- `GEMINI_API_KEY` - Your Google Gemini API key
- `SUPABASE_URL` - Auto-provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase

## Verify Deployment

After deploying, test the function:

```powershell
# Using curl
curl -i --location --request POST 'https://ezsnodpgxdtbcxftidva.supabase.co/functions/v1/analyze-code' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"code":"console.log(\"test\")","language":"javascript","userId":"test-user-id"}'
```

## Next Steps

1. Install Supabase CLI
2. Deploy the function
3. Set the GEMINI_API_KEY secret
4. Test from your app

The TypeScript errors in VS Code won't affect deployment - the function will work once deployed!
