# Setup Guide: Create Your Own Ultimatum Game App

This guide will walk you through setting up your own version of this Ultimatum Game application, from scratch.

## 📋 Prerequisites

Before you begin, make sure you have:
- A computer with internet access
- A GitHub account (free at https://github.com)
- Basic familiarity with using a terminal/command prompt
- A text editor (VS Code recommended)

**No prior programming experience required!** Just follow the steps carefully.

---

## Part 1: Set Up Your Development Environment (15 minutes)

### Step 1: Install Node.js
1. Go to https://nodejs.org
2. Download the **LTS version** (Long Term Support)
3. Run the installer and follow the prompts
4. Verify installation by opening a terminal and typing:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers appear.

### Step 2: Install Git
1. Go to https://git-scm.com/downloads
2. Download Git for your operating system
3. Run the installer with default settings
4. Verify installation:
   ```bash
   git --version
   ```

### Step 3: Install Expo CLI
Open your terminal and run:
```bash
npm install -g expo-cli
```

---

## Part 2: Set Up Supabase Database (10 minutes)

### Step 1: Create a Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Verify your email if needed

### Step 2: Create a New Project
1. Click "New Project"
2. Choose your organization (or create one)
3. Enter project details:
   - **Name:** `ultimatum-game-db` (or any name you like)
   - **Database Password:** Create a strong password (save it somewhere safe!)
   - **Region:** Choose the closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for the database to initialize

### Step 3: Run the Database Schema
1. In your Supabase dashboard, click **SQL Editor** (in left sidebar)
2. Click "New query"
3. Go to the `database/migration.sql` file in this repository
4. Copy all the SQL code
5. Paste it into the Supabase SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Step 4: Get Your API Credentials
1. In Supabase, click **Settings** (gear icon at bottom of sidebar)
2. Click **API** in the settings menu
3. You'll need two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)
4. Keep this tab open - you'll need these soon!

---

## Part 3: Clone and Configure the App (10 minutes)

### Step 1: Fork or Clone the Repository

**Option A: Fork (Recommended for customization)**
1. Go to https://github.com/MJLee02/ultimatum-game-app
2. Click the "Fork" button (top right)
3. This creates a copy under your GitHub account

**Option B: Clone directly**
1. Open terminal
2. Navigate to where you want the project:
   ```bash
   cd Documents  # or wherever you want the project
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/MJLee02/ultimatum-game-app.git
   cd ultimatum-game-app
   ```

### Step 2: Install Dependencies
In the project directory, run:
```bash
npm install --legacy-peer-deps
```

This will take 2-5 minutes to download all required packages.

### Step 3: Configure Supabase Connection
1. Open the project in your text editor (e.g., VS Code)
2. Navigate to `src/config/supabase.js`
3. Replace the placeholder values with your credentials:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
   ```
4. Save the file

---

## Part 4: Test Locally (5 minutes)

### Step 1: Start the Development Server
In your terminal, run:
```bash
npm start
```

### Step 2: Open in Browser
- A QR code will appear in the terminal
- Press `w` to open in web browser
- The app should open at `http://localhost:8081` (or similar)

### Step 3: Test with Multiple Users
- Open the app in **2+ browser tabs** or windows
- Each tab represents a different user
- Wait for all users to join the lobby
- Click "Start Game" when you have an even number of players
- Play through the game to test everything works!

---

## Part 5: Deploy Online (Optional - 15 minutes)

Want to share your app with others? Deploy it to Vercel (free hosting):

### Step 1: Push to GitHub (if you cloned directly)
If you forked in Part 3, skip this. Otherwise:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up / Log in (use "Continue with GitHub")
3. Click "Add New..." → "Project"
4. Import your repository
5. Configure settings:
   - **Build Command:** `npx expo export --platform web`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install --legacy-peer-deps`
6. **Add Environment Variables** (click "Environment Variables"):
   - Name: `SUPABASE_URL`, Value: (your Supabase URL)
   - Name: `SUPABASE_ANON_KEY`, Value: (your Supabase anon key)
7. Click "Deploy"
8. Wait 3-5 minutes

Your app will be live at: `https://your-project-name.vercel.app` 🎉

---

## 🎨 Customization Options

### Change the Amount to Split
Edit `src/screens/GameScreen.js`, line 14:
```javascript
const TOTAL_AMOUNT = 40;  // Change to any number
```

### Change Number of Rounds
Edit `src/screens/GameScreen.js`, line 13:
```javascript
const TOTAL_ROUNDS = 10;  // Change to any even number
```

Also update `LobbyScreen.js` role assignment logic if you change rounds.

### Add/Modify Demographic Questions
Edit `src/screens/DemographicScreen.js` to add or remove questions.

### Change Color Scheme
Edit the color values in style objects:
- Primary color: `#6200ee` (purple)
- Accept button: `#4caf50` (green)
- Reject button: `#f44336` (red)

### Customize Game Rules Text
Edit `src/screens/LobbyScreen.js` to change the rules displayed to players.

---

## 📊 Accessing Your Data

### View Data in Supabase
1. Go to your Supabase dashboard
2. Click **Table Editor**
3. Select a table to view:
   - `games` - All game sessions
   - `game_players` - Player participation
   - `player_roles` - Role assignments per round
   - `rounds` - Proposals, decisions, and payouts
   - `demographics` - Participant information

### Export Data for Analysis
1. In Supabase Table Editor, select your table
2. Click the **Export** button
3. Choose CSV or JSON format
4. Use in Excel, R, Python, etc. for analysis

### SQL Queries
You can run custom SQL queries in the SQL Editor:
```sql
-- Example: Get all proposals and acceptance rates
SELECT 
  round_number,
  AVG(proposal_amount) as avg_proposal,
  SUM(CASE WHEN responder_decision THEN 1 ELSE 0 END)::float / COUNT(*) as acceptance_rate
FROM rounds
GROUP BY round_number
ORDER BY round_number;
```

---

## 🔧 Troubleshooting

### "Error joining lobby. Retrying..."
- **Cause:** Database connection issue
- **Fix:** 
  1. Check your Supabase credentials in `src/config/supabase.js`
  2. Verify you ran `migration.sql` in Supabase
  3. Check that RLS policies are enabled (they should be in migration.sql)

### "Cannot find module" errors
- **Cause:** Dependencies not installed
- **Fix:** Run `npm install --legacy-peer-deps` again

### App shows blank screen
- **Cause:** Build or runtime error
- **Fix:** 
  1. Open browser console (F12)
  2. Look for red error messages
  3. Check that Supabase URL and key are correct

### Players stuck in waiting screen
- **Cause:** Tables not created properly
- **Fix:** Re-run `migration.sql` in Supabase SQL Editor

### Build fails on Vercel
- **Cause:** Missing dependencies or wrong Node version
- **Fix:**
  1. Check `vercel.json` has `--legacy-peer-deps` flag
  2. In Vercel, go to Settings → General → Node.js Version → Choose 18.x or 20.x

---

## 📚 Additional Resources

### Learning More
- **React Native:** https://reactnative.dev/docs/getting-started
- **Expo:** https://docs.expo.dev
- **Supabase:** https://supabase.com/docs
- **React Navigation:** https://reactnavigation.org/docs/getting-started

### Getting Help
- **GitHub Issues:** Report bugs or ask questions at https://github.com/MJLee02/ultimatum-game-app/issues
- **Supabase Discord:** https://discord.supabase.com
- **Expo Forums:** https://forums.expo.dev

### Research Papers
See the `Econ 4310 Final Paper.pdf` for the research context and methodology behind this implementation.

---

## 🤝 Contributing

Want to improve the app? Contributions are welcome!

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature-name`
6. Open a Pull Request on GitHub

---

## ✅ Checklist

Use this checklist to make sure you've completed everything:

- [ ] Installed Node.js, Git, and Expo CLI
- [ ] Created Supabase account and project
- [ ] Ran `migration.sql` in Supabase SQL Editor
- [ ] Copied Supabase URL and anon key
- [ ] Cloned/forked the repository
- [ ] Ran `npm install --legacy-peer-deps`
- [ ] Updated `supabase.js` with your credentials
- [ ] Tested locally with `npm start`
- [ ] (Optional) Deployed to Vercel
- [ ] Tested with multiple users

---

## 🎓 For Researchers

### Study Design Considerations
This app implements the experimental design from "Behavioral Assimilation in Social Preferences: Evidence from a Multi-Round Ultimatum Game with Immigrant Populations" by Lee et al. (2024).

Key features for research validity:
- **Role randomization:** Prevents order effects
- **Anonymous matching:** Reduces reputation effects  
- **Multiple rounds:** Captures behavioral patterns
- **Migration history:** Enables assimilation analysis
- **Data isolation:** Each session is independent

### Ethical Considerations
If using for research:
1. Obtain IRB approval from your institution
2. Add informed consent screen before participation
3. Ensure data privacy and anonymization
4. Provide debriefing information after completion
5. Consider adding compensation information

### Sample Size Recommendations
For adequate statistical power:
- Minimum: 20-30 participants (10-15 games)
- Recommended: 60-100 participants (30-50 games)
- For subgroup analysis: 150+ participants

---

## 📞 Support

If you get stuck or have questions:
1. Check the troubleshooting section above
2. Review the `DEPLOYMENT.md` file for deployment issues
3. Open an issue on GitHub: https://github.com/MJLee02/ultimatum-game-app/issues
4. Read the research paper for context on the methodology

Good luck with your research! 🚀

