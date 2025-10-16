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
        searchInstructions: `Search for the latest news and developments about this topic. Focus on events from the past 7 days. Include important updates, trends, and notable discussions.`,
        formatPrompt: `CRITICAL INSTRUCTIONS: You MUST return ONLY a valid JSON object. Do NOT include:
- Markdown code blocks (no \`\`\`json or \`\`\`)
- Explanatory text before or after the JSON
- Any commentary or additional information

Required JSON Schema:
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
