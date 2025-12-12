# Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Supabase database configured and migration.sql run

## Part 1: GitHub Deployment

### Step 1: Initialize Git and Commit
```bash
cd C:\Users\mleen\michael_sandbox\econ4310\project
git init
git add .
git commit -m "Initial commit: Ultimatum Game app"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `ultimatum-game-app` (or your choice)
3. Make it **Public** or **Private**
4. **Do NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### Step 3: Push to GitHub
Replace `YOUR-USERNAME` and `YOUR-REPO-NAME`:
```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

## Part 2: Vercel Deployment

### Step 1: Sign Up / Log In to Vercel
1. Go to https://vercel.com
2. Sign up or log in (recommend: "Continue with GitHub")
3. This will connect your GitHub account to Vercel

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Select "Import Git Repository"
3. Find your `ultimatum-game-app` repository
4. Click "Import"

### Step 3: Configure Build Settings
On the import screen, configure:

**Framework Preset:** Leave as "Other" or select "Create React App"

**Build Command:**
```
npm run build:web
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install --legacy-peer-deps
```

### Step 4: Add Environment Variables
⚠️ **IMPORTANT:** Your Supabase credentials must be configured

Click "Environment Variables" and add:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | `your-anon-key-here` |

To get these values:
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy "Project URL" and "anon public" key

### Step 5: Deploy
1. Click "Deploy"
2. Wait 2-5 minutes for the build to complete
3. Your app will be live at: `https://your-project-name.vercel.app`

## Important Notes

### Supabase Configuration
You need to update `src/config/supabase.js` to use environment variables for production:

```javascript
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://prygnpfinhfvuajjdxnb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-key-here';
```

### Web vs Mobile
- Vercel hosts the **web version** of your Expo app
- For mobile (iOS/Android), you need to:
  - Build with `expo build` or EAS Build
  - Submit to App Store / Google Play

### Custom Domain (Optional)
After deployment, you can add a custom domain:
1. Go to project settings in Vercel
2. Click "Domains"
3. Add your domain and follow DNS instructions

### Database Setup
Make sure you've run `migration.sql` in your Supabase database:
1. Supabase Dashboard → SQL Editor
2. Paste contents of `database/migration.sql`
3. Click "Run"

### Enable CORS in Supabase
If you get CORS errors:
1. Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Site URL"
3. Add to "Redirect URLs": `https://your-app.vercel.app/*`

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify `--legacy-peer-deps` is in install command
- Check build logs in Vercel dashboard

### Blank Screen After Deploy
- Check browser console for errors
- Verify Supabase credentials are correct
- Ensure `migration.sql` was run in Supabase

### Environment Variables Not Working
- Restart the deployment after adding env vars
- Variables must be set before build
- Check they're spelled correctly (case-sensitive)

## Continuous Deployment

Once connected, Vercel automatically deploys on every push to `main`:

```bash
git add .
git commit -m "Update game logic"
git push
```

Vercel will automatically rebuild and deploy!

## Testing Before Production

Test locally first:
```bash
npm run build:web
npx serve dist
```

Then visit `http://localhost:3000` to test the built version.

