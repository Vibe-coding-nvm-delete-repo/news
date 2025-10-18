# NewsForge AI

A simplified AI-powered news aggregation and intelligent reporting tool using OpenRouter.

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Use

### Step 1: Add Your OpenRouter API Key

- Get your API key from [openrouter.ai/keys](https://openrouter.ai/keys)
- Paste it in the Settings tab and click "Validate & Save"
- The key is validated by fetching available models

### Step 2: Fetch & Select a Model

- Click "Fetch Models" to load all available models
- Browse and select your preferred model
- Models are sorted by price (cheapest first)

### Step 2.5: Configure Model Parameters (Optional)

- Go to Settings > Model Parameters
- Adjust parameters for better accuracy and consistency:
  - **Temperature**: Controls randomness (lower = more factual)
  - **Max Tokens**: Limits response length (controls cost)
  - **Response Format**: Set to JSON for reliable parsing
  - **Penalties**: Reduce repetition and encourage diversity
- Default values are optimized for news search

### Step 3: Add Keywords

- Add keywords you want to search for (comma-separated for multiple)
- Toggle keywords on/off as needed
- Delete keywords you no longer need

### Step 4: Generate Report

- Switch to the "News" tab → "Generate" sub-tab
- Click "Generate Report"
- Watch as the AI searches each keyword in parallel and generates summaries
- See real-time progress with per-keyword timing and system logic steps
- View generated news cards in "Active Cards" tab

## Features

- ✅ **Simple Setup**: Just add your OpenRouter API key (get one free at openrouter.ai)
- ✅ **Model Selection**: Browse and select from 100+ available AI models
- ✅ **Model Parameters**: Fine-tune AI behavior with 13+ parameters for better accuracy
- ✅ **Keyword Management**: Add, enable/disable, and remove search keywords
- ✅ **Cost Tracking**: See estimated costs before generation and actual costs after
- ✅ **Local Storage**: All settings and data persist in your browser via Zustand
- ✅ **No Backend Required**: Fully client-side application, no database or server needed
- ✅ **Interactive Policy Viewer**: Browse autonomous agent policies with responsive, mobile-friendly design
- ✅ **Parallel Processing**: True parallel API calls for faster report generation
- ✅ **News Card Management**: Archive, restore, and delete individual news stories
- ✅ **Date Filtering**: Filter news cards by date range
- ✅ **Report History**: View all past reports with metadata and regenerate options

## Data Storage

All your data is stored locally in your browser using Zustand persist middleware:

- **Settings**: API key, selected model, model parameters, prompts
- **Keywords**: Your search keywords and their enabled state
- **News Cards**: Active and archived news stories
- **Report History**: Metadata from all generated reports

**No external database required!** Your data stays private on your device.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS 3
- **State Management**: Zustand with persist middleware
- **AI API**: OpenRouter (access to 100+ AI models)
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, Prettier, TypeScript, Husky

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm test         # Run tests
```

## Documentation

Comprehensive documentation is available in the `docs/` folder:

### For Users

- **[README.md](README.md)** - This file - Quick start and user guide
- **[Report Generation Error Handling Guide](REPORT_GENERATION_ERROR_HANDLING.md)** - Comprehensive guide to understanding and resolving report generation errors
- **[Policy Viewer Guide](docs/POLICY_VIEWER_GUIDE.md)** - Interactive policy documentation guide

### For Developers

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development setup and workflow
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to the project
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Application architecture and design decisions
- **[docs/API.md](docs/API.md)** - OpenRouter API integration documentation
- **[docs/CODE_STYLE.md](docs/CODE_STYLE.md)** - Code style guide and best practices

### For Autonomous Agents

- **[Agent Policies Hub](docs/agent-policies/README.md)** - Complete documentation suite for agent governance
- **Interactive Policy Viewer** - Access via the 🤖 Agent Policy tab in the application

### For Deployment

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions and configuration

### Historical Documentation

The repository includes several implementation summaries and research documents (e.g., `PARALLELIZATION_IMPLEMENTATION_SUMMARY.md`, `MODEL_SETTINGS_OPTIONS.md`, `PQA_REPORT_2025-10-16.md`) that document the development history and design decisions. These are preserved for reference but are not required reading for end users.

All code includes JSDoc comments for inline documentation. TypeScript types provide additional context and IDE support.

## Project Structure

```
.
├── app/                   # Next.js App Router pages
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # Home page with tab navigation
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI primitives (button, input, etc.)
│   ├── SettingsTab.tsx   # Settings configuration
│   ├── NewsTab.tsx       # News generation and display
│   ├── PolicyViewer.tsx  # Agent policy documentation viewer
│   └── ...               # Other feature components
├── lib/                   # Utility libraries
│   ├── store.ts          # Zustand global state
│   ├── openrouter.ts     # OpenRouter API utilities
│   ├── utils.ts          # Helper functions
│   └── ...               # Other utilities
├── __tests__/             # Jest test files
├── docs/                  # Comprehensive documentation
│   ├── API.md            # OpenRouter integration docs
│   ├── ARCHITECTURE.md   # System architecture
│   ├── CODE_STYLE.md     # Coding standards
│   └── agent-policies/   # Agent governance docs
└── public/                # Static assets (if any)
```

## License

MIT
