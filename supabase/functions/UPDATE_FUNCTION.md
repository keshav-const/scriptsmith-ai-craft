# Update Deployed Edge Function

Since the function is already deployed, you need to **update it** with the corrected code.

## Method 1: Update via Dashboard (Easiest)

### Step 1: Open the Function
1. Go to: https://supabase.com/dashboard/project/ezsnodpgxdtbcxftidva/functions
2. Click on **`analyze-code`** function

### Step 2: Update the Code
1. You'll see the function editor
2. **Delete all existing code**
3. Copy the entire corrected code from: `supabase/functions/analyze-code/index.ts`
4. Paste it into the editor
5. Click **"Deploy"** or **"Save"**

### Step 3: Verify Environment Variable
1. Go to: https://supabase.com/dashboard/project/ezsnodpgxdtbcxftidva/settings/functions
2. Under **"Secrets"**, check if `GEMINI_API_KEY` exists
3. If not, add it:
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSyAiz7uPuH7DZwgAvAgQlP-85eZHqbHydwg`
   - Click **"Save"**

## Method 2: Update via CLI

```powershell
# Deploy updated function (will overwrite existing)
npx supabase functions deploy analyze-code --project-ref ezsnodpgxdtbcxftidva

# Set/update the secret
npx supabase secrets set GEMINI_API_KEY=AIzaSyAiz7uPuH7DZwgAvAgQlP-85eZHqbHydwg --project-ref ezsnodpgxdtbcxftidva
```

## What to Update

The corrected code in `supabase/functions/analyze-code/index.ts`:
- ✅ Proper imports
- ✅ CORS headers
- ✅ Request type annotation
- ✅ Error handling
- ✅ Gemini API integration

## After Update

Test the function by trying to analyze code in your app again!
