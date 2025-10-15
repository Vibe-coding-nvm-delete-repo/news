# News Report Generator

AI-powered news aggregation and analysis using OpenRouter and Supabase.

## Features

### Settings Tab
- **API Key Management**: Connect and validate your OpenRouter.ai API key
- **Model Selection**: Fetch and browse all available text models from OpenRouter
  - Searchable dropdown with virtualized scrolling
  - Sorted by price (highest to lowest)
  - Displays cost per 1M tokens
  - Auto-saves on selection
- **Keywords**: Create and manage search keywords
  - Add comma-separated keywords
  - Toggle keywords on/off
  - Auto-enabled on creation
- **Search Instructions**: Custom prompt for individual keyword searches
- **Format Prompt**: JSON formatting instructions for final report aggregation

### News Tab
- **Generate Report Button**: 
  - Shows estimated cost before generation
  - Displays actual cost after completion
  - Disabled until API key and model are configured
  
- **Two-Stage Report Generation**:
  - **Stage 1**: Individual searches for each enabled keyword
    - Visual loading indicators (⏳ pending, 🔄 loading, ✓ complete, ✗ error)
    - Collapsible results - click to expand/collapse
    - Real-time status updates
  
  - **Stage 2**: Aggregation and formatting
    - Combines all Stage 1 results
    - Uses Format Prompt for JSON structuring
    - Parses and validates JSON response
    - Sorts stories by rating (10 → 1)

- **Story Cards**:
  - Rating display (1-10 scale with star icon)
  - Title, summary, source, date, and URL
  - Archive button for each story
  - Sorted by rating (highest to lowest)

- **Archive System**:
  - Active/Archived subtabs
  - Archive/unarchive stories with one click
  - Persistent storage in database

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your credentials
3. Copy `.env.example` to `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Update `.env.local` with your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
\`\`\`

5. Run the database schema:
   - Go to Supabase SQL Editor
   - Copy and paste contents from `supabase-schema.sql`
   - Execute the SQL

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Configure OpenRouter

1. Get an API key from [openrouter.ai](https://openrouter.ai)
2. In the Settings tab, paste your API key and click "Validate"
3. Click "Fetch Models" to load available models
4. Select a model (recommended: Perplexity models for online search)

Notes:
- Key format must be `sk-or-v1-<64 hex>`, for example: `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`.
- Add your app's URL to "Allowed Origins" in your OpenRouter dashboard (e.g., `http://localhost:3000` during development, plus your production domain). If not configured, you may see 403 errors like "Origin not allowed".

### 5. Setup Keywords and Prompts

1. Add keywords (comma-separated) in the Keywords section
2. Customize Search Instructions if needed (or use defaults)
3. Customize Format Prompt if needed (or use defaults)

### 6. Generate Your First Report

1. Go to the News tab
2. Review the estimated cost
3. Click "Generate Report"
4. Watch Stage 1 individual searches complete
5. Stage 2 will automatically aggregate and format results
6. View your sorted news stories!

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Cost Management

- **Estimated Cost**: Displayed before generating each report
- **Actual Cost**: Tracked and displayed after report completion
- **Cost Format**: Always shown as `$X.XXXX / 1M tokens`
- **Model Pricing**: Fetched directly from OpenRouter API

## Database Schema

- **settings**: Global application settings (API key, model, prompts)
- **keywords**: User-created keywords with enable/disable toggles
- **reports**: Generated report metadata and costs
- **stories**: Individual news stories with ratings and archive status

## Technology Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom shadcn/ui-inspired components
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **AI API**: OpenRouter.ai
- **Deployment**: Vercel

## Features Highlights

✅ Auto-save everything (no save buttons needed)  
✅ Real-time cost tracking  
✅ Searchable model dropdown with 200+ models  
✅ Two-stage report generation with visual progress  
✅ JSON parsing with fallback strategies  
✅ Archive system for organizing stories  
✅ Responsive design  
✅ Error handling throughout  

## Notes

- All data is stored in Supabase and shared across all users
- API key is stored in the database (use RLS policies for production security)
- Online search works best with Perplexity models (e.g., `perplexity/llama-3.1-sonar-large-128k-online`)
- JSON parsing uses simplified strategy (direct parse → strip markdown)
