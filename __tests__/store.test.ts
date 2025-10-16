import { useStore } from '@/lib/store';
import type { Keyword, Model, Card, ReportHistory } from '@/lib/store';

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

  describe('Search Instructions', () => {
    test('sets search instructions', () => {
      const { setSearchInstructions } = useStore.getState();
      const instructions = 'Search for news about AI';

      setSearchInstructions(instructions);

      expect(useStore.getState().settings.searchInstructions).toBe(
        instructions
      );
    });

    test('updates search instructions', () => {
      const { setSearchInstructions } = useStore.getState();

      setSearchInstructions('New search');

      expect(useStore.getState().settings.searchInstructions).toBe(
        'New search'
      );
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

describe('useStore - Card Management', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useStore.setState({
      activeCards: [],
      archivedCards: [],
      reportHistory: [],
      activeNewsTab: 'generate',
    });
  });

  describe('Active Cards Management', () => {
    test('adds cards to active cards', () => {
      const { addCardsToActive } = useStore.getState();
      const testCards: Card[] = [
        {
          id: '1',
          reportId: 'report-1',
          keyword: 'AI',
          category: 'Technology',
          title: 'AI News Story',
          rating: 8,
          summary: 'Summary of AI news',
          source: 'TechNews',
          url: 'https://example.com/ai-news',
          date: '2025-01-15',
          generatedAt: new Date().toISOString(),
          status: 'active',
        },
      ];

      addCardsToActive(testCards);

      expect(useStore.getState().activeCards.length).toBe(1);
      expect(useStore.getState().activeCards[0]).toEqual(testCards[0]);
    });

    test('adds multiple cards from different reports', () => {
      const { addCardsToActive } = useStore.getState();
      const batch1: Card[] = [
        {
          id: '1',
          reportId: 'report-1',
          keyword: 'AI',
          category: 'Technology',
          title: 'AI Story 1',
          rating: 8,
          summary: 'Summary 1',
          source: null,
          url: null,
          date: null,
          generatedAt: new Date().toISOString(),
          status: 'active',
        },
      ];
      const batch2: Card[] = [
        {
          id: '2',
          reportId: 'report-2',
          keyword: 'Crypto',
          category: 'Finance',
          title: 'Crypto Story',
          rating: 7,
          summary: 'Summary 2',
          source: null,
          url: null,
          date: null,
          generatedAt: new Date().toISOString(),
          status: 'active',
        },
      ];

      addCardsToActive(batch1);
      addCardsToActive(batch2);

      const activeCards = useStore.getState().activeCards;
      expect(activeCards.length).toBe(2);
      expect(activeCards[0].reportId).toBe('report-1');
      expect(activeCards[1].reportId).toBe('report-2');
    });
  });

  describe('Mark Card As Read', () => {
    test('moves card from active to archived', () => {
      const { addCardsToActive, markCardAsRead } = useStore.getState();
      const testCard: Card = {
        id: '1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Technology',
        title: 'AI News',
        rating: 8,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: new Date().toISOString(),
        status: 'active',
      };

      addCardsToActive([testCard]);
      expect(useStore.getState().activeCards.length).toBe(1);
      expect(useStore.getState().archivedCards.length).toBe(0);

      markCardAsRead('1');

      expect(useStore.getState().activeCards.length).toBe(0);
      expect(useStore.getState().archivedCards.length).toBe(1);
      expect(useStore.getState().archivedCards[0].status).toBe('archived');
      expect(useStore.getState().archivedCards[0].archivedAt).toBeTruthy();
    });

    test('handles marking non-existent card', () => {
      const { markCardAsRead } = useStore.getState();

      // Should not throw error
      markCardAsRead('non-existent-id');

      expect(useStore.getState().activeCards.length).toBe(0);
      expect(useStore.getState().archivedCards.length).toBe(0);
    });

    test('marks multiple cards as read', () => {
      const { addCardsToActive, markCardAsRead } = useStore.getState();
      const testCards: Card[] = [
        {
          id: '1',
          reportId: 'report-1',
          keyword: 'AI',
          category: 'Technology',
          title: 'Story 1',
          rating: 8,
          summary: 'Summary 1',
          source: null,
          url: null,
          date: null,
          generatedAt: new Date().toISOString(),
          status: 'active',
        },
        {
          id: '2',
          reportId: 'report-1',
          keyword: 'AI',
          category: 'Technology',
          title: 'Story 2',
          rating: 7,
          summary: 'Summary 2',
          source: null,
          url: null,
          date: null,
          generatedAt: new Date().toISOString(),
          status: 'active',
        },
      ];

      addCardsToActive(testCards);
      markCardAsRead('1');
      markCardAsRead('2');

      expect(useStore.getState().activeCards.length).toBe(0);
      expect(useStore.getState().archivedCards.length).toBe(2);
    });
  });

  describe('Report History Management', () => {
    test('adds report to history', () => {
      const { addReportHistory } = useStore.getState();
      const testReport: ReportHistory = {
        id: 'report-1',
        generatedAt: new Date().toISOString(),
        keywords: ['AI', 'Tech'],
        totalCards: 5,
        modelUsed: 'gpt-3.5-turbo',
        costSpent: 0.0012,
        categories: ['Technology'],
        avgRating: 7.5,
        ratingDistribution: { 7: 2, 8: 3 },
      };

      addReportHistory(testReport);

      expect(useStore.getState().reportHistory.length).toBe(1);
      expect(useStore.getState().reportHistory[0]).toEqual(testReport);
    });

    test('adds multiple reports to history', () => {
      const { addReportHistory } = useStore.getState();
      const report1: ReportHistory = {
        id: 'report-1',
        generatedAt: new Date().toISOString(),
        keywords: ['AI'],
        totalCards: 3,
        modelUsed: 'gpt-3.5-turbo',
        costSpent: 0.001,
        categories: ['Technology'],
        avgRating: 7.0,
        ratingDistribution: { 7: 3 },
      };
      const report2: ReportHistory = {
        id: 'report-2',
        generatedAt: new Date().toISOString(),
        keywords: ['Crypto'],
        totalCards: 5,
        modelUsed: 'gpt-4',
        costSpent: 0.002,
        categories: ['Finance'],
        avgRating: 8.0,
        ratingDistribution: { 8: 5 },
      };

      addReportHistory(report1);
      addReportHistory(report2);

      const history = useStore.getState().reportHistory;
      expect(history.length).toBe(2);
      // Newest should be first
      expect(history[0].id).toBe('report-2');
      expect(history[1].id).toBe('report-1');
    });
  });

  describe('Active News Tab Management', () => {
    test('sets active news tab', () => {
      const { setActiveNewsTab } = useStore.getState();

      setActiveNewsTab('active');
      expect(useStore.getState().activeNewsTab).toBe('active');

      setActiveNewsTab('archived');
      expect(useStore.getState().activeNewsTab).toBe('archived');

      setActiveNewsTab('history');
      expect(useStore.getState().activeNewsTab).toBe('history');

      setActiveNewsTab('generate');
      expect(useStore.getState().activeNewsTab).toBe('generate');
    });
  });

  describe('Complete Card Management Workflow', () => {
    test('full report generation and archival flow', () => {
      const {
        addCardsToActive,
        markCardAsRead,
        addReportHistory,
        setActiveNewsTab,
      } = useStore.getState();

      // Generate report with cards
      const reportId = 'report-' + Date.now();
      const cards: Card[] = [
        {
          id: '1',
          reportId,
          keyword: 'AI',
          category: 'Technology',
          title: 'Story 1',
          rating: 9,
          summary: 'High priority story',
          source: 'TechNews',
          url: 'https://example.com/1',
          date: '2025-01-15',
          generatedAt: new Date().toISOString(),
          status: 'active',
        },
        {
          id: '2',
          reportId,
          keyword: 'AI',
          category: 'Technology',
          title: 'Story 2',
          rating: 7,
          summary: 'Medium priority story',
          source: 'NewsSource',
          url: 'https://example.com/2',
          date: '2025-01-14',
          generatedAt: new Date().toISOString(),
          status: 'active',
        },
      ];

      addCardsToActive(cards);

      const report: ReportHistory = {
        id: reportId,
        generatedAt: new Date().toISOString(),
        keywords: ['AI'],
        totalCards: 2,
        modelUsed: 'gpt-3.5-turbo',
        costSpent: 0.0015,
        categories: ['Technology'],
        avgRating: 8.0,
        ratingDistribution: { 7: 1, 9: 1 },
      };

      addReportHistory(report);

      // Navigate to active cards tab
      setActiveNewsTab('active');

      expect(useStore.getState().activeCards.length).toBe(2);
      expect(useStore.getState().reportHistory.length).toBe(1);
      expect(useStore.getState().activeNewsTab).toBe('active');

      // Read first card
      markCardAsRead('1');

      expect(useStore.getState().activeCards.length).toBe(1);
      expect(useStore.getState().archivedCards.length).toBe(1);

      // Navigate to archived tab
      setActiveNewsTab('archived');

      expect(useStore.getState().activeNewsTab).toBe('archived');
      expect(useStore.getState().archivedCards[0].id).toBe('1');
      expect(useStore.getState().archivedCards[0].status).toBe('archived');
    });
  });
});
