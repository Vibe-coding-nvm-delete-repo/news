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

export const useStore = create<StoreState>()(
  persist(
    set => ({
      settings: {
        apiKey: null,
        selectedModel: null,
        keywords: [],
        searchInstructions: `Search for TODAY'S NEWS about the keyword below. ONLY return stories published in the last 24 hours.

Output valid JSON ONLY (no explanatory text):
{
  "stories": [
    {
      "title": "Headline text",
      "category": "Technology|Politics|Business|Health|Sports|Entertainment|Science|Other",
      "rating": 7,
      "summary": "2-3 sentences",
      "source": "Source name or null",
      "url": "Full URL or null",
      "date": "YYYY-MM-DD"
    }
  ]
}

RULES:
1. ONLY recent news (last 24 hours)
2. Every story MUST have a date field
3. If no recent news exists, return {"stories": []}
4. Return ONLY JSON (no markdown, no explanations)
5. Skip old articles completely

Keyword:`,
        onlineEnabled: true,
        modelParameters: {
          temperature: 0.5,
          max_tokens: 2000,
          response_format: 'json_object',
          top_p: 0.9,
          frequency_penalty: 0.5,
          presence_penalty: 0.3,
        },
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
              ...state.settings.modelParameters,
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
    }
  )
);
