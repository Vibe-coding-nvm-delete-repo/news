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
- Paste it in the Settings tab and click "Validate"

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

- Switch to the "News" tab
- Click "Generate Report"
- Watch as the AI searches each keyword and generates a summary
- **NEW**: See real-time progress with per-keyword timing and optimized parallel processing

## Features

- ✅ **Simple Setup**: Just add your OpenRouter API key
- ✅ **Model Selection**: Browse and select from all available models
- ✅ **Model Parameters**: Fine-tune AI behavior with 13+ parameters for better accuracy
- ✅ **Keyword Management**: Add, enable/disable, and remove keywords
- ✅ **Cost Tracking**: See estimated and actual costs
- ✅ **Local Storage**: All settings persist in your browser
- ✅ **No Database Required**: Everything works locally
- ✅ **Interactive Policy Viewer**: Browse autonomous agent policies with responsive design
- ✅ **Optimized Parallel Processing**: Worker pool pattern with retry logic for 60-80% faster generation

## Data Storage

All your settings (API key, selected model, keywords, prompts) are stored in your browser's local storage using Zustand persist. No external database required!

## Technology Stack

- **Framework**: Next.js 14
- **UI**: React + Tailwind CSS
- **State Management**: Zustand (with persist)
- **AI API**: OpenRouter
- **Icons**: Lucide React

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

All code includes JSDoc comments for inline documentation. TypeScript types provide additional context and IDE support.

## Project Structure

```
.
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utility libraries (store, utils)
├── __tests__/        # Test files
├── docs/             # Comprehensive documentation
└── public/           # Static assets
```

## License

MIT
