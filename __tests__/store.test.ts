import { useStore } from '@/lib/store';
import type { Keyword, Model } from '@/lib/store';

describe('useStore - Settings Management', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { settings } = useStore.getState();
    useStore.setState({
      settings: {
        apiKey: null,
        selectedModel: null,
        keywords: [],
        searchInstructions: settings.searchInstructions,
        formatPrompt: settings.formatPrompt,
        onlineEnabled: true,
      },
      models: [],
      isLoadingModels: false,
    });
  });

  describe('API Key Management', () => {
    test('sets API key', () => {
      const { setApiKey } = useStore.getState();
      const testKey = 'sk-or-v1-' + 'a'.repeat(64);

      setApiKey(testKey);

      expect(useStore.getState().settings.apiKey).toBe(testKey);
    });

    test('clears API key', () => {
      const { setApiKey } = useStore.getState();
      setApiKey('sk-or-v1-' + 'a'.repeat(64));

      setApiKey(null);

      expect(useStore.getState().settings.apiKey).toBeNull();
    });
  });

  describe('Model Management', () => {
    test('sets selected model', () => {
      const { setSelectedModel } = useStore.getState();
      const modelId = 'gpt-3.5-turbo';

      setSelectedModel(modelId);

      expect(useStore.getState().settings.selectedModel).toBe(modelId);
    });

    test('updates models list', () => {
      const { setModels } = useStore.getState();
      const testModels: Model[] = [
        {
          id: 'model-1',
          name: 'Test Model 1',
          pricing: { prompt: 0.001, completion: 0.002 },
          totalCostPer1M: 0.003,
        },
        {
          id: 'model-2',
          name: 'Test Model 2',
          pricing: { prompt: 0.005, completion: 0.01 },
          totalCostPer1M: 0.015,
        },
      ];

      setModels(testModels);

      expect(useStore.getState().models).toEqual(testModels);
      expect(useStore.getState().models.length).toBe(2);
    });

    test('sets loading state', () => {
      const { setIsLoadingModels } = useStore.getState();

      setIsLoadingModels(true);
      expect(useStore.getState().isLoadingModels).toBe(true);

      setIsLoadingModels(false);
      expect(useStore.getState().isLoadingModels).toBe(false);
    });
  });

  describe('Keyword Management', () => {
    test('adds a keyword', () => {
      const { addKeyword } = useStore.getState();
      const newKeyword: Keyword = {
        id: '1',
        text: 'AI News',
        enabled: true,
      };

      addKeyword(newKeyword);

      const keywords = useStore.getState().settings.keywords;
      expect(keywords.length).toBe(1);
      expect(keywords[0]).toEqual(newKeyword);
    });

    test('adds multiple keywords', () => {
      const { addKeyword } = useStore.getState();
      const keyword1: Keyword = { id: '1', text: 'AI', enabled: true };
      const keyword2: Keyword = { id: '2', text: 'Crypto', enabled: true };

      addKeyword(keyword1);
      addKeyword(keyword2);

      const keywords = useStore.getState().settings.keywords;
      expect(keywords.length).toBe(2);
      expect(keywords).toContainEqual(keyword1);
      expect(keywords).toContainEqual(keyword2);
    });

    test('removes a keyword', () => {
      const { addKeyword, removeKeyword } = useStore.getState();
      const keyword1: Keyword = { id: '1', text: 'AI', enabled: true };
      const keyword2: Keyword = { id: '2', text: 'Crypto', enabled: true };

      addKeyword(keyword1);
      addKeyword(keyword2);
      removeKeyword('1');

      const keywords = useStore.getState().settings.keywords;
      expect(keywords.length).toBe(1);
      expect(keywords[0].id).toBe('2');
    });

    test('toggles keyword enabled state', () => {
      const { addKeyword, toggleKeyword } = useStore.getState();
      const keyword: Keyword = { id: '1', text: 'AI', enabled: true };

      addKeyword(keyword);
      expect(useStore.getState().settings.keywords[0].enabled).toBe(true);

      toggleKeyword('1');
      expect(useStore.getState().settings.keywords[0].enabled).toBe(false);

      toggleKeyword('1');
      expect(useStore.getState().settings.keywords[0].enabled).toBe(true);
    });

    test('handles toggle for non-existent keyword', () => {
      const { addKeyword, toggleKeyword } = useStore.getState();
      const keyword: Keyword = { id: '1', text: 'AI', enabled: true };

      addKeyword(keyword);
      toggleKeyword('non-existent-id');

      // Original keyword should remain unchanged
      expect(useStore.getState().settings.keywords[0]).toEqual(keyword);
    });
  });

  describe('Search Instructions & Format Prompt', () => {
    test('sets search instructions', () => {
      const { setSearchInstructions } = useStore.getState();
      const instructions = 'Search for news about AI';

      setSearchInstructions(instructions);

      expect(useStore.getState().settings.searchInstructions).toBe(
        instructions
      );
    });

    test('sets format prompt', () => {
      const { setFormatPrompt } = useStore.getState();
      const prompt = 'Format as markdown';

      setFormatPrompt(prompt);

      expect(useStore.getState().settings.formatPrompt).toBe(prompt);
    });

    test('updates search instructions independently', () => {
      const { setSearchInstructions, setFormatPrompt } = useStore.getState();

      setSearchInstructions('New search');
      setFormatPrompt('New format');

      expect(useStore.getState().settings.searchInstructions).toBe(
        'New search'
      );
      expect(useStore.getState().settings.formatPrompt).toBe('New format');
    });
  });

  describe('Online Mode', () => {
    test('sets online enabled state', () => {
      const { setOnlineEnabled } = useStore.getState();

      setOnlineEnabled(false);
      expect(useStore.getState().settings.onlineEnabled).toBe(false);

      setOnlineEnabled(true);
      expect(useStore.getState().settings.onlineEnabled).toBe(true);
    });
  });

  describe('Initial State', () => {
    test('has correct initial settings', () => {
      const { settings } = useStore.getState();

      expect(settings.apiKey).toBeNull();
      expect(settings.selectedModel).toBeNull();
      expect(settings.keywords).toEqual([]);
      expect(settings.onlineEnabled).toBe(true);
      expect(settings.searchInstructions).toBeTruthy();
      expect(settings.formatPrompt).toBeTruthy();
    });

    test('has empty models array initially', () => {
      expect(useStore.getState().models).toEqual([]);
    });

    test('is not loading models initially', () => {
      expect(useStore.getState().isLoadingModels).toBe(false);
    });
  });

  describe('Complex Workflows', () => {
    test('complete setup workflow', () => {
      const { setApiKey, setSelectedModel, addKeyword, setSearchInstructions } =
        useStore.getState();

      // Setup API key
      setApiKey('sk-or-v1-' + 'a'.repeat(64));

      // Select model
      setSelectedModel('gpt-3.5-turbo');

      // Add keywords
      addKeyword({ id: '1', text: 'AI', enabled: true });
      addKeyword({ id: '2', text: 'Tech', enabled: true });

      // Set instructions
      setSearchInstructions('Custom search instructions');

      const state = useStore.getState();
      expect(state.settings.apiKey).toBeTruthy();
      expect(state.settings.selectedModel).toBe('gpt-3.5-turbo');
      expect(state.settings.keywords.length).toBe(2);
      expect(state.settings.searchInstructions).toBe(
        'Custom search instructions'
      );
    });

    test('keyword management workflow', () => {
      const { addKeyword, toggleKeyword, removeKeyword } = useStore.getState();

      // Add keywords
      addKeyword({ id: '1', text: 'AI', enabled: true });
      addKeyword({ id: '2', text: 'Crypto', enabled: true });
      addKeyword({ id: '3', text: 'Tech', enabled: true });

      // Disable one
      toggleKeyword('2');

      // Remove one
      removeKeyword('3');

      const keywords = useStore.getState().settings.keywords;
      expect(keywords.length).toBe(2);
      expect(keywords.find(k => k.id === '1')?.enabled).toBe(true);
      expect(keywords.find(k => k.id === '2')?.enabled).toBe(false);
      expect(keywords.find(k => k.id === '3')).toBeUndefined();
    });
  });
});
