import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Keyword {
  id: string;
  text: string;
  enabled: boolean;
}

export interface Model {
  id: string;
  name: string;
  pricing: {
    prompt: number;
    completion: number;
  };
  totalCostPer1M: number;
}

export interface Card {
  id: string;
  reportId: string;
  keyword: string;
  category: string;
  title: string;
  rating: number;
  summary: string;
  source: string | null;
  url: string | null;
  date: string | null;
  generatedAt: string;
  archivedAt?: string;
  status: 'active' | 'archived';
}

export interface ReportHistory {
  id: string;
  generatedAt: string;
  keywords: string[];
  totalCards: number;
  modelUsed: string;
  costSpent: number;
}

export interface Settings {
  apiKey: string | null;
  selectedModel: string | null;
  keywords: Keyword[];
  searchInstructions: string;
  formatPrompt: string;
  onlineEnabled: boolean;
}

interface StoreState {
  settings: Settings;
  models: Model[];
  isLoadingModels: boolean;
  activeCards: Card[];
  archivedCards: Card[];
  reportHistory: ReportHistory[];
  activeNewsTab: 'generate' | 'active' | 'archived' | 'history';
  setApiKey: (key: string | null) => void;
  setSelectedModel: (model: string | null) => void;
  setModels: (models: Model[]) => void;
  setIsLoadingModels: (loading: boolean) => void;
  addKeyword: (keyword: Keyword) => void;
  removeKeyword: (id: string) => void;
  toggleKeyword: (id: string) => void;
  setSearchInstructions: (instructions: string) => void;
  setFormatPrompt: (prompt: string) => void;
  setOnlineEnabled: (enabled: boolean) => void;
  addCardsToActive: (cards: Card[]) => void;
  markCardAsRead: (cardId: string) => void;
  addReportHistory: (report: ReportHistory) => void;
  setActiveNewsTab: (tab: 'generate' | 'active' | 'archived' | 'history') => void;
}

export const useStore = create<StoreState>()(
  persist(
    set => ({
      settings: {
        apiKey: null,
        selectedModel: null,
        keywords: [],
        searchInstructions: `You are a news research assistant. Search the web for the latest news and developments about the given keyword/topic. Focus on events from the past 7 days.

RETURN YOUR RESPONSE AS A JSON OBJECT with this exact schema:
{
  "stories": [
    {
      "title": "Clear, concise headline",
      "category": "Auto-categorize this story (e.g., Technology, Politics, Business, Health, etc.)",
      "rating": 1-10 (numeric value only - rate based on significance, novelty, and relevance),
      "summary": "2-3 sentence summary of the story",
      "source": "Source name or null if not available",
      "url": "Full article URL or null if not available",
      "date": "YYYY-MM-DD format or null if not available"
    }
  ]
}

REQUIREMENTS:
1. Return ONLY the JSON object starting with { and ending with }
2. Include ALL news stories you find for this keyword
3. Each story must have all fields (use null for missing data)
4. Category should be auto-determined based on the content
5. Rating should reflect significance, novelty, and relevance (1-10)
6. Ensure all JSON is properly formatted and valid
7. Do NOT include explanatory text, code blocks, or apologies - ONLY the JSON object

Keyword to search:`,
        formatPrompt: `DEPRECATED - Not used anymore. JSON is returned directly from keyword searches.`,
        onlineEnabled: true,
      },
      models: [],
      isLoadingModels: false,
      activeCards: [],
      archivedCards: [],
      reportHistory: [],
      activeNewsTab: 'generate',
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
      setFormatPrompt: prompt =>
        set(state => ({
          settings: { ...state.settings, formatPrompt: prompt },
        })),
      setOnlineEnabled: enabled =>
        set(state => ({
          settings: { ...state.settings, onlineEnabled: enabled },
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
        })),
      setActiveNewsTab: tab =>
        set({ activeNewsTab: tab }),
    }),
    {
      name: 'news-report-generator-storage',
    }
  )
);
