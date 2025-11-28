# Fix CORS Error for Chat Feature

## The Problem
You're getting a CORS error when trying to use the AI chat feature. This happens because the Supabase Edge Function needs to be deployed (or redeployed) to Supabase Cloud.

## Solution Steps

### 1. Install Supabase CLI (if not already installed)
```powershell
# Using npm
npm install -g supabase

# Or using scoop (Windows package manager)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Login to Supabase
```powershell
supabase login
```

### 3. Link Your Project
```powershell
cd e:\scriptsmith\scriptsmith-ai-craft
supabase link --project-ref ezsnodpgxdtbcxftidva
```

### 4. Set Environment Variables
Before deploying, make sure your GEMINI_API_KEY is set in Supabase:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ezsnodpgxdtbcxftidva
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Add the secret:
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key

### 5. Deploy the Edge Function
```powershell
supabase functions deploy chat-with-code
```

### 6. Verify Deployment
After deployment, test the function:
```powershell
# Test the function
supabase functions invoke chat-with-code --body '{"question":"test","userId":"test"}'
```

---

## Alternative: Quick Fix (Update CORS in existing function)

If the function is already deployed but CORS is still failing, you may need to update the CORS headers:

### Update the Edge Function

The function at `supabase/functions/chat-with-code/index.ts` already has correct CORS headers:

```typescript
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

Just redeploy it:
```powershell
supabase functions deploy chat-with-code
```

---

## Troubleshooting

### Error: "supabase: command not found"
- Install the Supabase CLI using the steps above

### Error: "Project not linked"
- Run: `supabase link --project-ref ezsnodpgxdtbcxftidva`

### Error: "GEMINI_API_KEY not configured"
- Make sure you've added the secret in Supabase Dashboard (Step 4)

### Still getting CORS errors?
1. Check browser console for the exact error
2. Verify the function URL in the error matches your project
3. Clear browser cache and try again
4. Check if the function is actually deployed: https://supabase.com/dashboard/project/ezsnodpgxdtbcxftidva/functions

---

## What This Does

- **Deploys** your Edge Function to Supabase Cloud
- **Enables CORS** so your frontend can call the function
- **Sets up** environment variables needed for the AI to work

After following these steps, your chat feature should work! 🎉
