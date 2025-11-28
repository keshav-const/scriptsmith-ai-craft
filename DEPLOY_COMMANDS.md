# PowerShell Commands to Deploy Edge Functions

Copy and paste these commands one by one into your PowerShell terminal.

---

## Step 1: Navigate to Project Directory

```powershell
cd e:\scriptsmith\scriptsmith-ai-craft
```

---

## Step 2: Login to Supabase

```powershell
npx supabase login
```

**What happens:**
- Opens your browser
- You'll authorize the CLI
- Come back to terminal after authorization

---

## Step 3: Link Your Project

```powershell
npx supabase link --project-ref ezsnodpgxdtbcxftidva
```

**You'll be asked for:**
- Database password (the one you set when creating your Supabase project)

---

## Step 4: Set Environment Secrets

**Replace `YOUR_ACTUAL_GEMINI_API_KEY` with your real API key:**

```powershell
npx supabase secrets set GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY
```

**Verify secrets are set:**

```powershell
npx supabase secrets list
```

---

## Step 5: Deploy All Edge Functions

**Deploy all functions at once:**

```powershell
npx supabase functions deploy
```

**OR deploy individually:**

```powershell
npx supabase functions deploy chat-with-code
npx supabase functions deploy analyze-code
npx supabase functions deploy fix-code
npx supabase functions deploy generate-docstring
npx supabase functions deploy rate-code
```

---

## Step 6: Verify Deployment

**List deployed functions:**

```powershell
npx supabase functions list
```

**Test the chat function:**

```powershell
npx supabase functions invoke chat-with-code --body '{\"question\":\"test\",\"userId\":\"test-123\",\"code\":\"const x = 5;\",\"analysis\":{}}'
```

---

## Quick Copy-Paste Sequence

Here's the entire sequence you can copy and run (make sure to replace YOUR_ACTUAL_GEMINI_API_KEY):

```powershell
# 1. Navigate to project
cd e:\scriptsmith\scriptsmith-ai-craft

# 2. Login (will open browser)
npx supabase login

# 3. Link project (you'll need your database password)
npx supabase link --project-ref ezsnodpgxdtbcxftidva

# 4. Set API key (REPLACE WITH YOUR ACTUAL KEY!)
npx supabase secrets set GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY

# 5. Verify secrets
npx supabase secrets list

# 6. Deploy all functions
npx supabase functions deploy

# 7. Verify deployment
npx supabase functions list
```

---

## After Deployment

Once deployed successfully:

1. **Refresh your app** in the browser (Ctrl + Shift + R)
2. **Test the chat feature** - the CORS error should be gone!
3. **Check function logs** if needed:
   ```powershell
   npx supabase functions logs chat-with-code
   ```

---

## Troubleshooting

### If you get "Database password required"
- This is the password you set when creating your Supabase project
- You can reset it in: https://supabase.com/dashboard/project/ezsnodpgxdtbcxftidva/settings/database

### If deployment fails
- Check you're logged in: `npx supabase login`
- Check project is linked: `npx supabase link --project-ref ezsnodpgxdtbcxftidva`
- Check secrets are set: `npx supabase secrets list`

### If CORS error persists
- Clear browser cache
- Hard refresh (Ctrl + Shift + R)
- Check browser console for the exact error
- Verify function URL matches: `https://ezsnodpgxdtbcxftidva.supabase.co/functions/v1/chat-with-code`

---

## Important Notes

- **npx** downloads and runs Supabase CLI temporarily (no global install needed)
- First time using `npx supabase` will take a moment to download
- You only need to login and link once
- You can redeploy anytime by running `npx supabase functions deploy`

---

## Expected Success Output

After `npx supabase functions deploy`, you should see:

```
Deploying chat-with-code (project ref: ezsnodpgxdtbcxftidva)
Bundled chat-with-code in 234ms
Deployed chat-with-code in 1.2s
Function URL: https://ezsnodpgxdtbcxftidva.supabase.co/functions/v1/chat-with-code
```

✅ **Done!** Your chat feature should now work without CORS errors!
