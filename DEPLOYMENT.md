# 🚀 Deployment Guide

## Overview

NewsForge AI is a fully client-side application with **no backend required**. All data is stored locally in the user's browser using localStorage via Zustand persist middleware.

## Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- An OpenRouter API key (get one at [openrouter.ai/keys](https://openrouter.ai/keys))

---

## 🖥️ Local Development

### Setup and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then open: http://localhost:3000

### First Time Setup

1. Go to Settings tab
2. Enter your OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys)
3. Click "Validate & Save"
4. Click "Fetch Models"
5. Select a model (recommended: models with `:online` capability)
6. Add keywords (e.g., "AI news", "cryptocurrency", "technology")
7. Go to News tab
8. Click "Generate Report"

### Testing Your Setup

```bash
# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check

# Build for production
npm run build
```

---

## ☁️ Deployment Options

### Vercel (Recommended)

**Option 1: GitHub Integration (Easiest)**

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. No environment variables needed (app is fully client-side)
5. Click **Deploy**

**Option 2: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

**Build Configuration:**

- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next` (automatically detected)

### Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Deploy

### GitHub Pages

Since this is a Next.js app with dynamic routing, GitHub Pages requires additional configuration. We recommend using Vercel or Netlify instead.

### Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to Pages → Create a project
3. Connect your Git repository
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `.next`
5. Deploy

### Static Export (Advanced)

To generate a fully static site:

1. Update `next.config.js` to include `output: 'export'`
2. Run `npm run build`
3. Deploy the `out/` directory to any static host

**Note:** Some dynamic features may be limited in static export mode.

---

## 🔐 Security Considerations

### Data Storage

- **All data is stored locally** in the user's browser via localStorage
- No backend server or database is used
- Each user's data is private to their browser
- Data includes: API keys, keywords, generated reports, and settings

### API Key Security

**Important:** Your OpenRouter API key is stored in browser localStorage:

- ✅ Data stays on user's device
- ✅ Not transmitted to any backend
- ⚠️ Accessible by browser extensions
- ⚠️ Vulnerable to XSS attacks (mitigated by Content Security Policy)

**Best Practices:**

1. Only use the app on trusted devices
2. Use OpenRouter's origin restrictions to limit key usage
3. Regularly rotate your API keys
4. Don't share your deployed URL with untrusted users
5. Monitor your OpenRouter usage dashboard

### Content Security Policy

The application should be served over HTTPS in production. Consider adding CSP headers via your hosting provider:

```
Content-Security-Policy: default-src 'self'; connect-src 'self' https://openrouter.ai; script-src 'self' 'unsafe-inline' 'unsafe-eval';
```

### Rate Limiting

- Rate limiting is handled by OpenRouter API
- Check your OpenRouter plan limits
- The app shows estimated costs before generation

---

## ✅ Deployment Checklist

**Pre-Deployment:**

- [ ] All tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run type-check`
- [ ] Production build succeeds: `npm run build`
- [ ] App tested locally with real API key

**Deployment:**

- [ ] Code pushed to Git repository
- [ ] Hosting platform configured (Vercel/Netlify/Cloudflare)
- [ ] Build succeeds on hosting platform
- [ ] Deployed URL is accessible

**Post-Deployment:**

- [ ] Navigate to deployed URL
- [ ] Add OpenRouter API key in Settings
- [ ] Fetch models successfully
- [ ] Generate a test report
- [ ] Verify all tabs work (Settings, News, Agent Policy)
- [ ] Test on mobile device
- [ ] Check browser console for errors

---

## 🆘 Troubleshooting

### Build Issues

**Build fails with "Module not found":**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**TypeScript errors during build:**

```bash
npm run type-check
# Fix reported errors before deploying
```

### Runtime Issues

**"Invalid API key" error:**

- Get a valid API key from [openrouter.ai/keys](https://openrouter.ai/keys)
- Ensure the key starts with `sk-or-v1-` followed by 64 hex characters
- Click "Validate & Save" in Settings tab

**No models showing up:**

- Validate your API key first
- Click "Fetch Models" button
- Check browser console for errors
- Verify internet connection

**Reports not generating:**

- Ensure you have enabled keywords
- Check that a model is selected
- Verify the model supports `:online` mode (for web search)
- Check OpenRouter API status

**Data not persisting:**

- Ensure cookies/localStorage are enabled in browser
- Check if browser is in private/incognito mode
- Try clearing site data and re-entering settings

### Deployment Platform Issues

**Vercel: Build timeout:**

- Check build logs in Vercel dashboard
- Ensure dependencies install correctly
- Verify Node.js version compatibility (20.x)

**Netlify: Build fails:**

- Check build logs in Netlify dashboard
- Ensure build command is `npm run build`
- Verify publish directory is `.next`

---

## 📞 Support

- **Documentation:** Check [README.md](README.md) for features
- **Development:** See [DEVELOPMENT.md](DEVELOPMENT.md) for setup
- **API Issues:** Visit [OpenRouter status page](https://status.openrouter.ai/)
- **Bugs:** Create an issue in the GitHub repository
