# 🚀 Deployment Guide

## ✅ Supabase Setup Complete!

Your Supabase database is connected:
- **URL**: https://xpyledlyzhozqwngxfdx.supabase.co
- **Status**: ✅ Connected

---

## 📋 NEXT STEP: Run the Database Schema

**IMPORTANT:** You need to create the database tables before using the app.

### 1. Go to Supabase SQL Editor
👉 https://supabase.com/dashboard/project/xpyledlyzhozqwngxfdx/sql/new

### 2. Copy the SQL Schema
Open the file `supabase-schema.sql` in this project and copy ALL contents.

### 3. Run the SQL
- Paste the SQL into the Supabase SQL Editor
- Click **"Run"** button
- You should see: "Success. No rows returned"

This creates 4 tables:
- ✅ `settings` (stores API key, model, prompts)
- ✅ `keywords` (stores user keywords)
- ✅ `reports` (stores generated reports)
- ✅ `stories` (stores individual news stories)

---

## 🖥️ Local Development

Run the app locally:

\`\`\`bash
npm run dev
\`\`\`

Then open: http://localhost:3000

**First Steps:**
1. Go to Settings tab
2. Enter your OpenRouter API key
3. Click "Validate"
4. Click "Fetch Models"
5. Select a model (recommend: Perplexity Sonar Online)
6. Add keywords (e.g., "AI, crypto, tech news")
7. Go to News tab
8. Click "Generate Report"!

---

## ☁️ Deploy to Vercel

### Option 1: Quick Deploy (Recommended)

1. **Push to GitHub:**
   \`\`\`bash
   git add .
   git commit -m "Complete news report generator"
   git push origin main
   \`\`\`

2. **Deploy on Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://xpyledlyzhozqwngxfdx.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhweWxlZGx5emhvenF3bmd4ZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDM0MTQsImV4cCI6MjA3NjA3OTQxNH0.w_mcy6TQOLYNx2U8_hHYkZHj9XSeNrVVTTFgGEHgTrI`
   - Click **Deploy**!

### Option 2: Vercel CLI

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and add environment variables when asked
\`\`\`

---

## 🔐 Security Notes

**For Production:**
- The `service_role` secret should be kept private (don't commit to git)
- Consider implementing Row Level Security (RLS) policies in Supabase
- Add user authentication if needed
- The current setup allows anyone to read/write to your database

**Current Setup:**
- All users share the same data (keywords, settings, reports)
- API key is stored in database and visible to all users
- This is fine for personal use or trusted team environments

---

## ✅ Checklist

- [x] Supabase project created
- [x] Environment variables configured
- [x] Build passes successfully
- [ ] **SQL schema executed** ← DO THIS NEXT!
- [ ] App tested locally
- [ ] Deployed to Vercel

---

## 🆘 Troubleshooting

**"Table doesn't exist" error:**
→ Run the SQL schema in Supabase SQL Editor

**"Invalid API key" in Settings:**
→ Get an API key from https://openrouter.ai

**Build fails:**
→ Make sure `.env.local` exists with correct values

**No models showing up:**
→ Validate your OpenRouter API key first, then click "Fetch Models"

---

## 📞 Need Help?

Check the main README.md for detailed feature documentation.
