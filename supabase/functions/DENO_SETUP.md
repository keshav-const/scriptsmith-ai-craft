# VS Code Deno Setup for Supabase Edge Functions

## The Issue

TypeScript errors appear in Supabase Edge Functions because VS Code is using Node.js TypeScript instead of Deno types. The errors you're seeing are expected when VS Code doesn't recognize this as a Deno project.

## Solution Options

### Option 1: Install Deno VS Code Extension (Recommended)

1. Install the **Deno extension** for VS Code:
   - Press `Ctrl+Shift+X` to open Extensions
   - Search for "Deno" (by Denoland)
   - Click Install

2. Enable Deno for the `supabase/functions` directory:
   - Press `Ctrl+Shift+P` to open Command Palette
   - Type "Deno: Initialize Workspace Configuration"
   - Select it and choose to enable Deno for the workspace
   - OR manually create `.vscode/settings.json` with:
   ```json
   {
     "deno.enable": true,
     "deno.enablePaths": ["supabase/functions"],
     "deno.lint": true,
     "deno.unstable": true
   }
   ```

3. Reload VS Code window:
   - Press `Ctrl+Shift+P`
   - Type "Developer: Reload Window"
   - Press Enter

### Option 2: Ignore TypeScript Errors (Quick Fix)

If you don't want to install the Deno extension, you can suppress these errors:

1. Add `// @ts-nocheck` at the top of the file
2. The errors won't affect the actual Supabase Edge Function deployment

### Option 3: Use Deno CLI for Type Checking

Instead of relying on VS Code, use Deno CLI to check types:

```bash
# Install Deno if not already installed
# Then run:
deno check supabase/functions/analyze-code/index.ts
```

## Why These Errors Appear

- Supabase Edge Functions run on **Deno runtime**, not Node.js
- VS Code's TypeScript server defaults to Node.js types
- The `Deno` global and ESM imports from URLs are Deno-specific features
- Without the Deno extension, VS Code doesn't understand these

## Current Status

✅ The code is **correct** and will work when deployed to Supabase  
✅ `deno.json` is properly configured  
❌ VS Code needs Deno extension to recognize Deno types

The TypeScript errors are **IDE-only** and won't affect your deployed Edge Function!
