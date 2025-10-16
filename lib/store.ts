/**
 * Global state management store for the News Report Generator.
 * Uses Zustand with persistence middleware to store all application state in browser localStorage.
 *
 * @module store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Represents a search keyword with toggle capability.
 */
export interface Keyword {
  /** Unique identifier for the keyword */
  id: string;
  /** The keyword text to search for */
  text: string;
  /** Whether this keyword is currently enabled for searches */
  enabled: boolean;
}

/**
 * Represents an AI model available via OpenRouter.
 */
export interface Model {
  /** OpenRouter model identifier (e.g., "anthropic/claude-3-sonnet") */
  id: string;
  /** Human-readable model name */
  name: string;
  /** Pricing information per token */
  pricing: {
    /** Cost per prompt token (in USD per 1M tokens) */
    prompt: number;
    /** Cost per completion token (in USD per 1M tokens) */
    completion: number;
  };
  /** Total combined cost per 1M tokens (prompt + completion) */
  totalCostPer1M: number;
}

/**
 * OpenRouter API parameters for controlling model behavior and output quality.
 * These parameters improve accuracy, consistency, and cost control.
 */
export interface ModelParameters {
  /** Controls randomness (0.0 = deterministic, 2.0 = very creative). Recommended: 0.5 for factual news */
  temperature?: number;
  /** Maximum tokens in response. Controls cost and length. Recommended: 2000 */
  max_tokens?: number;
  /** Enforces response format. 'json_object' guarantees valid JSON. Highly recommended */
  response_format?: 'auto' | 'json_object' | 'text';
  /** Nucleus sampling (0.0-1.0). Alternative to temperature. Recommended: 0.9 */
  top_p?: number;
  /** Reduces word repetition (0.0-2.0). Recommended: 0.5 */
  frequency_penalty?: number;
  /** Encourages topic diversity (0.0-2.0). Recommended: 0.3 */
  presence_penalty?: number;
  /** Reasoning depth for O1/O3/reasoning models only */
  reasoning?: 'low' | 'medium' | 'high';
  /** Show model's reasoning process (for reasoning models) */
  include_reasoning?: boolean;
  /** Stop generation at these sequences */
  stop?: string[];
  /** Seed for reproducible results */
  seed?: number;
  /** Limits sampling to top K tokens */
  top_k?: number;
  /** Minimum probability threshold */
  min_p?: number;
  /** Repetition penalty (1.0-2.0) */
  repetition_penalty?: number;
}

/**
 * Represents a news story card generated from AI search results.
 */
export interface Card {
  /** Unique identifier for this card */
  id: string;
  /** ID of the report generation that created this card */
  reportId: string;
  /** The keyword that generated this story */
  keyword: string;
  /** Auto-categorized story category (e.g., "Technology", "Politics") */
  category: string;
  /** Story headline */
  title: string;
  /** Significance rating from 1-10 */
  rating: number;
  /** 2-3 sentence summary of the story */
  summary: string;
  /** Source publication name (null if unavailable) */
  source: string | null;
  /** Full article URL (null if unavailable) */
  url: string | null;
  /** Publication date in YYYY-MM-DD format (null if unavailable) */
  date: string | null;
  /** ISO timestamp when this card was generated */
  generatedAt: string;
  /** ISO timestamp when this card was archived (if archived) */
  archivedAt?: string;
  /** Current status of the card */
  status: 'active' | 'archived';
}

/**
 * Represents a historical report generation entry.
 */
export interface ReportHistory {
  /** Unique identifier for this report */
  id: string;
  /** ISO timestamp when this report was generated */
  generatedAt: string;
  /** List of keywords used in this report */
  keywords: string[];
  /** Total number of cards generated */
  totalCards: number;
  /** Model ID used for generation */
  modelUsed: string;
  /** Total cost spent on this report (in USD) */
  costSpent: number;
  categories: string[];
  avgRating: number;
  ratingDistribution: { [key: number]: number };
  summary?: string;
}

/**
 * User settings and configuration.
 */
export interface Settings {
  /** OpenRouter API key (null if not set) */
  apiKey: string | null;
  /** Currently selected model ID (null if not selected) */
  selectedModel: string | null;
  /** List of configured keywords */
  keywords: Keyword[];
  /** Custom prompt for keyword searches */
  searchInstructions: string;
  onlineEnabled: boolean;
  /** Model parameters for controlling API behavior and output quality */
  modelParameters: ModelParameters;
}

/**
 * Complete application state interface with actions.
 * All state is persisted to localStorage via Zustand middleware.
 */
interface StoreState {
  // State
  /** User settings and configuration */
  settings: Settings;
  /** Available AI models from OpenRouter */
  models: Model[];
  /** Whether models are currently being fetched */
  isLoadingModels: boolean;
  /** Active news cards (not yet archived) */
  activeCards: Card[];
  /** Archived news cards (marked as read) */
  archivedCards: Card[];
  /** Historical report generation records */
  reportHistory: ReportHistory[];
  /** Currently active tab in the News section */
  activeNewsTab: 'generate' | 'active' | 'archived' | 'history';
  totalCostSpent: number;
  totalReportsGenerated: number;
  setApiKey: (key: string | null) => void;
  /** Sets the currently selected model */
  setSelectedModel: (model: string | null) => void;
  /** Updates the list of available models */
  setModels: (models: Model[]) => void;
  /** Sets the loading state for model fetching */
  setIsLoadingModels: (loading: boolean) => void;

  // Actions - Keywords
  /** Adds a new keyword to the list */
  addKeyword: (keyword: Keyword) => void;
  /** Removes a keyword by ID */
  removeKeyword: (id: string) => void;
  /** Toggles the enabled state of a keyword */
  toggleKeyword: (id: string) => void;

  // Actions - Prompts
  /** Updates the search instructions prompt */
  setSearchInstructions: (instructions: string) => void;
  setOnlineEnabled: (enabled: boolean) => void;
  /** Updates model parameters */
  setModelParameters: (parameters: Partial<ModelParameters>) => void;

  // Actions - Cards
  /** Adds new cards to the active cards list */
  addCardsToActive: (cards: Card[]) => void;
  /** Moves a card from active to archived */
  markCardAsRead: (cardId: string) => void;

  // Actions - History
  /** Adds a new report to history */
  addReportHistory: (report: ReportHistory) => void;

  // Actions - UI
  /** Sets the active tab in the News section */
  setActiveNewsTab: (
    tab: 'generate' | 'active' | 'archived' | 'history'
  ) => void;
}

/**
 * Default model parameters for backward compatibility and new users
 */
const DEFAULT_MODEL_PARAMETERS: ModelParameters = {
  temperature: 0.5,
  max_tokens: 8000, // Increased from 2000 to prevent JSON truncation when generating multiple stories
  response_format: 'json_object',
  top_p: 0.9,
  frequency_penalty: 0.5,
  presence_penalty: 0.3,
};

export const useStore = create<StoreState>()(
  persist(
    set => ({
      settings: {
        apiKey: null,
        selectedModel: null,
        keywords: [],
        searchInstructions: `YOU ARE A PROFESSIONAL NEWS RESEARCHER. Your job is to SEARCH THE WEB THOROUGHLY for recent breaking news.

SEARCH INSTRUCTIONS:
1. SEARCH multiple reputable news sources for the keyword provided below
2. Find AT LEAST 5-10 recent news stories (more is better)
3. Prioritize stories from the LAST 48 HOURS when possible
4. Include the EXACT publication date in YYYY-MM-DD format
5. Include the actual article URL (not the homepage)

CRITICAL REQUIREMENTS FOR EACH STORY:
- "title": Full headline exactly as it appears in the article
- "category": Must be one of: Technology, Politics, Business, Science, World, Sports, Entertainment, Health
- "rating": Rate the news significance from 1-10 (1=trivial mention, 5=notable news, 8=major story, 10=breaking global event)
- "summary": Write 2-3 sentences explaining the key facts and why it matters
- "source": The publication name (e.g., "Reuters", "TechCrunch", "BBC News")
- "url": The complete article URL starting with https://
- "date": Publication date in YYYY-MM-DD format (REQUIRED - do not guess, find the actual date)

Return ONLY valid JSON in this EXACT format (no markdown, no extra text):
{
  "stories": [
    {
      "title": "Full article headline",
      "category": "Technology",
      "rating": 7,
      "summary": "Detailed 2-3 sentence summary of the key facts and implications.",
      "source": "Publication Name",
      "url": "https://actual-article-url.com/article",
      "date": "2025-10-16"
    }
  ]
}

⚠️ IMPORTANT: You MUST return at least 5-10 stories. Do NOT return {"stories": []} unless:
1. The keyword is complete gibberish/nonsensical
2. You have exhausted ALL search attempts and found ZERO results across multiple sources
3. You have tried broader related terms and still found nothing

If initial searches fail:
- Try synonyms and related terms
- Search for broader topics related to the keyword
- Look for recent developments in that field/area
- Check multiple news sources and aggregators

YOU HAVE ONLINE SEARCH CAPABILITY - USE IT FULLY. Empty results are NOT acceptable unless truly impossible.

NOW SEARCH FOR THIS KEYWORD:`,
        onlineEnabled: true,
        modelParameters: DEFAULT_MODEL_PARAMETERS,
      },
      models: [],
      isLoadingModels: false,
      activeCards: [],
      archivedCards: [],
      reportHistory: [],
      activeNewsTab: 'generate',
      totalCostSpent: 0,
      totalReportsGenerated: 0,
      setApiKey: key =>
        set(state => ({
          settings: { ...state.settings, apiKey: key },
        })),
      setSelectedModel: model =>
        set(state => ({
          settings: { ...state.settings, selectedModel: model },
        })),
      setModels: models => set({ models }),
      setIsLoadingModels: loading => set({ isLoadingModels: loading }),
      addKeyword: keyword =>
        set(state => ({
          settings: {
            ...state.settings,
            keywords: [...state.settings.keywords, keyword],
          },
        })),
      removeKeyword: id =>
        set(state => ({
          settings: {
            ...state.settings,
            keywords: state.settings.keywords.filter(k => k.id !== id),
          },
        })),
      toggleKeyword: id =>
        set(state => ({
          settings: {
            ...state.settings,
            keywords: state.settings.keywords.map(k =>
              k.id === id ? { ...k, enabled: !k.enabled } : k
            ),
          },
        })),
      setSearchInstructions: instructions =>
        set(state => ({
          settings: { ...state.settings, searchInstructions: instructions },
        })),
      setOnlineEnabled: enabled =>
        set(state => ({
          settings: { ...state.settings, onlineEnabled: enabled },
        })),
      setModelParameters: parameters =>
        set(state => ({
          settings: {
            ...state.settings,
            modelParameters: {
              ...(state.settings.modelParameters || DEFAULT_MODEL_PARAMETERS),
              ...parameters,
            },
          },
        })),
      addCardsToActive: cards =>
        set(state => ({
          activeCards: [...state.activeCards, ...cards],
        })),
      markCardAsRead: cardId =>
        set(state => {
          const card = state.activeCards.find(c => c.id === cardId);
          if (!card) return state;

          const archivedCard: Card = {
            ...card,
            status: 'archived',
            archivedAt: new Date().toISOString(),
          };

          return {
            activeCards: state.activeCards.filter(c => c.id !== cardId),
            archivedCards: [...state.archivedCards, archivedCard],
          };
        }),
      addReportHistory: report =>
        set(state => ({
          reportHistory: [report, ...state.reportHistory],
          totalCostSpent: state.totalCostSpent + report.costSpent,
          totalReportsGenerated: state.totalReportsGenerated + 1,
        })),
      setActiveNewsTab: tab => set({ activeNewsTab: tab }),
    }),
    {
      name: 'news-report-generator-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Ensure modelParameters exists for backward compatibility
        if (persistedState && persistedState.settings) {
          if (!persistedState.settings.modelParameters) {
            persistedState.settings.modelParameters = DEFAULT_MODEL_PARAMETERS;
          }
        }
        return persistedState as StoreState;
      },
    }
  )
);
