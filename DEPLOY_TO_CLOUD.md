# Deploy Edge Functions to Supabase Cloud

## Prerequisites
- Supabase CLI installed
- Your Supabase project: `ezsnodpgxdtbcxftidva`

---

## Step-by-Step Deployment Process

### Step 1: Install Supabase CLI

Choose one method:

**Option A: Using npm (Recommended)**
```powershell
npm install -g supabase
```

**Option B: Using Scoop (Windows Package Manager)**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Verify Installation:**
```powershell
supabase --version
```

---

### Step 2: Login to Supabase

```powershell
supabase login
```

This will:
1. Open your browser
2. Ask you to authorize the CLI
3. Generate an access token

---

### Step 3: Link Your Local Project to Cloud

```powershell
cd e:\scriptsmith\scriptsmith-ai-craft
supabase link --project-ref ezsnodpgxdtbcxftidva
```

You'll be prompted for your database password. This is the password you set when creating your Supabase project.

---

### Step 4: Set Environment Secrets

Before deploying, set your API keys as secrets in Supabase Cloud:

```powershell
# Set GEMINI_API_KEY
supabase secrets set GEMINI_API_KEY=your_actual_gemini_api_key_here

# Verify secrets are set
supabase secrets list
```

**Alternative: Set via Dashboard**
1. Go to: https://supabase.com/dashboard/project/ezsnodpgxdtbcxftidva/settings/functions
2. Click on **"Edge Function Secrets"**
3. Add secret:
   - Name: `GEMINI_API_KEY`
   - Value: Your actual Gemini API key

---

### Step 5: Deploy All Edge Functions

Deploy all your functions at once:

```powershell
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy chat-with-code
```

You should see output like:
```
Deploying Function chat-with-code (project ref: ezsnodpgxdtbcxftidva)
Function URL: https://ezsnodpgxdtbcxftidva.supabase.co/functions/v1/chat-with-code
Deployed successfully!
```

---

### Step 6: Verify Deployment

**Check in Dashboard:**
1. Go to: https://supabase.com/dashboard/project/ezsnodpgxdtbcxftidva/functions
2. You should see `chat-with-code` listed
3. Check the deployment status

**Test the Function:**
```powershell
# Simple test
supabase functions invoke chat-with-code --body '{
  "question": "What is TypeScript?",
  "userId": "test-user-123",
  "code": "const x = 5;",
  "analysis": {}
}'
```

---

## Deploy All Your Functions

You have multiple functions to deploy:

```powershell
# Deploy all at once
supabase functions deploy

# Or deploy individually
supabase functions deploy analyze-code
supabase functions deploy chat-with-code
supabase functions deploy fix-code
supabase functions deploy generate-docstring
supabase functions deploy rate-code
```

---

## Common Issues & Solutions

### Issue: "supabase: command not found"
**Solution:** Install Supabase CLI (Step 1)

### Issue: "Project not linked"
**Solution:** Run `supabase link --project-ref ezsnodpgxdtbcxftidva`

### Issue: "GEMINI_API_KEY not configured"
**Solution:** Set the secret using `supabase secrets set` (Step 4)

### Issue: "Permission denied"
**Solution:** Make sure you're logged in: `supabase login`

### Issue: CORS errors persist
**Solution:** 
1. Clear browser cache
2. Hard refresh (Ctrl + Shift + R)
3. Check function URL in browser console matches deployed URL

---

## After Deployment

### 1. Update Frontend Environment Variables (if needed)

Your frontend should already be configured to use the cloud URLs. Verify in browser console:
- Check Network tab
- Look for requests to: `https://ezsnodpgxdtbcxftidva.supabase.co/functions/v1/chat-with-code`

### 2. Test the Chat Feature

1. Open your app: http://localhost:5173
2. Go to Dashboard
3. Analyze some code
4. Try the chat feature
5. Check browser console for any errors

---

## Quick Reference Commands

```powershell
# Login
supabase login

# Link project
supabase link --project-ref ezsnodpgxdtbcxftidva

# Set secrets
supabase secrets set GEMINI_API_KEY=your_key_here

# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy chat-with-code

# List deployed functions
supabase functions list

# View function logs
supabase functions logs chat-with-code

# Test function
supabase functions invoke chat-with-code --body '{"question":"test","userId":"test"}'
```

---

## Expected Result

After successful deployment:
- ✅ Edge functions are live on Supabase Cloud
- ✅ CORS errors are resolved
- ✅ Chat feature works in your app
- ✅ All AI features are functional

---

## Need Help?

If you encounter issues:
1. Check function logs: `supabase functions logs chat-with-code`
2. Verify secrets are set: `supabase secrets list`
3. Check deployment status in dashboard
4. Look at browser console for detailed error messages
