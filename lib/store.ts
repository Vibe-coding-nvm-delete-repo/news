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
}

export const useStore = create<StoreState>()(
  persist(
    set => ({
      settings: {
        apiKey: null,
        selectedModel: null,
        keywords: [],
        searchInstructions: `You are a news research assistant. Search the web for the latest news and developments about the given keyword/topic. Focus on events from the past 7 days.

Provide a comprehensive summary that includes:
- Recent news articles and updates
- Important developments and trends  
- Key discussions and notable events
- Sources and dates when available

Do NOT provide code, commands, or apologies. Provide actual news content and information.`,
        formatPrompt: `Analyze all the news results and create a JSON response with this schema:
{
  "stories": [
    {
      "title": "Clear, concise headline",
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
2. Include ALL stories found across all keyword searches
3. Sort stories by rating (highest to lowest)
4. Use null for any missing fields (source, url, date)
5. Ensure all JSON is properly formatted and valid

Now analyze all the search results below and return the JSON response:`,
        onlineEnabled: true,
      },
      models: [],
      isLoadingModels: false,
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
    }),
    {
      name: 'news-report-generator-storage',
    }
  )
);
