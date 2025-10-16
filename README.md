# News Report Generator

A simplified AI-powered news aggregation tool using OpenRouter.

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
- **For online search with real-time news:** Select models with built-in web search capabilities:
  - Recommended: `Perplexity Sonar` models (Small, Large, or Huge)
  - These models automatically search the web for current information
- Other models (GPT-4, Claude, etc.) will respond based on training data only
- Models are sorted by price (cheapest first)

### Step 3: Add Keywords

- Add keywords you want to search for (comma-separated for multiple)
- Toggle keywords on/off as needed
- Delete keywords you no longer need

### Step 4: Generate Report

- Switch to the "News" tab
- Click "Generate Report"
- Watch as the AI searches each keyword and generates a summary

## Features

- ✅ **Simple Setup**: Just add your OpenRouter API key
- ✅ **Model Selection**: Browse and select from all available models
- ✅ **Keyword Management**: Add, enable/disable, and remove keywords
- ✅ **Cost Tracking**: See estimated and actual costs
- ✅ **Local Storage**: All settings persist in your browser
- ✅ **No Database Required**: Everything works locally

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

## License

MIT
