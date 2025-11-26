# Deploy Supabase Edge Function - Quick Guide

## Easiest Method: Use Supabase Dashboard

Since CLI linking is having issues, use the dashboard instead:

### Step 1: Go to Edge Functions
Visit: https://supabase.com/dashboard/project/ezsnodpgxdtbcxftidva/functions

### Step 2: Create New Function
1. Click **"Deploy a new function"** or **"New Function"**
2. Name it: `analyze-code`
3. Click **"Create function"**

### Step 3: Copy the Code
Copy ALL the code from: `supabase/functions/analyze-code/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // ... rest of the code
```

### Step 4: Paste and Deploy
1. Paste the code into the function editor
2. Click **"Deploy"** or **"Save"**

### Step 5: Set Environment Variable
1. Go to: https://supabase.com/dashboard/project/ezsnodpgxdtbcxftidva/settings/functions
2. Under **"Secrets"**, click **"Add new secret"**
3. Name: `GEMINI_API_KEY`
4. Value: `AIzaSyAiz7uPuH7DZwgAvAgQlP-85eZHqbHydwg`
5. Click **"Save"**

### Step 6: Test
Go back to your app and try analyzing code again!

---

## Alternative: CLI Deployment (If you want to retry)

```powershell
# Set environment variable first
$env:SUPABASE_DB_PASSWORD="sxclkJHBvmc1VNXa"

# Link project
npx supabase link --project-ref ezsnodpgxdtbcxftidva

# Deploy function
npx supabase functions deploy analyze-code --project-ref ezsnodpgxdtbcxftidva

# Set secret
npx supabase secrets set GEMINI_API_KEY=AIzaSyAiz7uPuH7DZwgAvAgQlP-85eZHqbHydwg --project-ref ezsnodpgxdtbcxftidva
```

## What This Does

- Deploys your `analyze-code` Edge Function to Supabase cloud
- Makes it available at: `https://ezsnodpgxdtbcxftidva.supabase.co/functions/v1/analyze-code`
- Your app will be able to call it and analyze code!
