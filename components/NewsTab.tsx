'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore, Card } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Archive,
  History,
  ArrowRight,
} from 'lucide-react';
import { parseJSON } from '@/lib/utils';
import ActiveCardsTab from './ActiveCardsTab';
import ArchivedCardsTab from './ArchivedCardsTab';
import HistoryTab from './HistoryTab';

interface Stage1Result {
  keyword: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  result?: string;
  error?: string;
  cost?: number;
}

export default function NewsTab() {
  const {
    settings,
    models,
    activeNewsTab,
    setActiveNewsTab,
    addCardsToActive,
    addReportHistory,
    totalCostSpent,
    totalReportsGenerated,
    activeCards,
  } = useStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState<1 | 2 | null>(null);
  const [stage1Results, setStage1Results] = useState<Stage1Result[]>([]);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(
    new Set()
  );
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [actualCost, setActualCost] = useState(0);
  const [stage1Progress, setStage1Progress] = useState(0);
  const [stage1StartTime, setStage1StartTime] = useState<number | null>(null);
  const [stage1ElapsedTime, setStage1ElapsedTime] = useState(0);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [lastReportCost, setLastReportCost] = useState(0);
  const [lastReportCardCount, setLastReportCardCount] = useState(0);
  const [lastReportMetadata, setLastReportMetadata] = useState<{
    categories: string[];
    avgRating: number;
    ratingDistribution: { [key: number]: number };
  } | null>(null);
  const [dateFilterStats, setDateFilterStats] = useState<{
    totalStories: number;
    filteredStories: number;
    rejectedCount: number;
  } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Calculate estimated cost whenever keywords or model changes
  useEffect(() => {
    calculateEstimatedCost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.keywords, settings.selectedModel, models]);

  // Track elapsed time for search process
  useEffect(() => {
    if (!stage1StartTime) return;

    const interval = setInterval(() => {
      setStage1ElapsedTime(Date.now() - stage1StartTime);
    }, 100);

    return () => clearInterval(interval);
  }, [stage1StartTime]);

  const calculateEstimatedCost = () => {
    const enabledKeywords = settings.keywords.filter(k => k.enabled);
    if (enabledKeywords.length === 0 || !settings.selectedModel) {
      setEstimatedCost(0);
      return;
    }

    const selectedModel = models.find(m => m.id === settings.selectedModel);
    if (!selectedModel) {
      setEstimatedCost(0);
      return;
    }

    // Rough token estimation:
    // ~800 tokens per keyword (input + output including JSON formatting)
    // No Stage 2 - client-side aggregation only!
    const tokensPerKeyword = 800;

    const totalTokens = enabledKeywords.length * tokensPerKeyword;
    const costPer1MTokens = selectedModel.totalCostPer1M;
    const estimatedCostValue = (totalTokens / 1000000) * costPer1MTokens;

    setEstimatedCost(estimatedCostValue);
  };

  const stopAndReset = () => {
    // Abort any ongoing API requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Reset all state
    setIsGenerating(false);
    setCurrentStage(null);
    setStage1Results([]);
    setExpandedResults(new Set());
    setActualCost(0);
    setShowSuccessBanner(false);
    setStage1Progress(0);
    setStage1StartTime(null);
    setStage1ElapsedTime(0);
    setShowCompletionAnimation(false);
  };

  const generateReport = async () => {
    const enabledKeywords = settings.keywords.filter(k => k.enabled);

    if (enabledKeywords.length === 0) {
      alert('Please enable at least one keyword');
      return;
    }

    if (!settings.apiKey || !settings.selectedModel) {
      alert('Please configure your API key and select a model');
      return;
    }

    // Create new abort controller for this generation
    abortControllerRef.current = new AbortController();

    setIsGenerating(true);
    setCurrentStage(1);
    setActualCost(0);
    setStage1Progress(0);
    setStage1StartTime(Date.now());
    setStage1ElapsedTime(0);
    setShowCompletionAnimation(false);
    setShowSuccessBanner(false);

    // Generate unique reportId for this generation
    const reportId = Date.now().toString();

    // Initialize stage 1 results - all start as loading since they run in parallel
    const initialResults: Stage1Result[] = enabledKeywords.map(k => ({
      keyword: k.text,
      status: 'loading',
    }));
    setStage1Results(initialResults);

    let totalCost = 0;
    const allCards: Card[] = [];
    let totalStoriesReceived = 0;
    let totalStoriesRejected = 0;

    // Ensure model has :online suffix for web search capability
    const onlineModel = settings.selectedModel?.includes(':online')
      ? settings.selectedModel
      : `${settings.selectedModel}:online`;

    // Stage 1: Search for each keyword WITH CONTROLLED CONCURRENCY
    // Run searches with a concurrency limit to avoid overwhelming the API
    // Increased limit for faster processing - most APIs can handle 10+ concurrent requests
    const CONCURRENT_LIMIT = 10; // Process up to 10 searches at a time for optimal performance

    const searchKeyword = async (keyword: any, index: number) => {
      try {
        console.log(`[${keyword.text}] Starting search...`);
        const startTime = Date.now();

        // Create a timeout promise (30 seconds for faster failure detection)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error('Search timeout after 30 seconds')),
            30000
          );
        });

        // Calculate 24-hour cutoff date dynamically
        const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const cutoffDateString = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        const todayDateString = new Date().toISOString().split('T')[0];

        // Race between fetch and timeout
        const fetchPromise = fetch(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${settings.apiKey}`,
              'Content-Type': 'application/json',
              'X-Title': 'News Report Generator',
              'HTTP-Referer':
                typeof window !== 'undefined'
                  ? window.location.origin
                  : 'http://localhost:3000',
            },
            body: JSON.stringify({
              model: onlineModel,
              messages: [
                {
                  role: 'user',
                  content: `${settings.searchInstructions}\n\n"${keyword.text}"\n\nIMPORTANT: Today is ${todayDateString}. Only include articles published on or after ${cutoffDateString}.`,
                },
              ],
              // Add model parameters for improved quality and consistency
              ...(settings.modelParameters?.temperature !== undefined && {
                temperature: settings.modelParameters.temperature,
              }),
              ...(settings.modelParameters?.max_tokens !== undefined && {
                max_tokens: settings.modelParameters.max_tokens,
              }),
              ...(settings.modelParameters?.response_format &&
                settings.modelParameters.response_format !== 'auto' && {
                  response_format: {
                    type: settings.modelParameters.response_format,
                  },
                }),
              ...(settings.modelParameters?.top_p !== undefined && {
                top_p: settings.modelParameters.top_p,
              }),
              ...(settings.modelParameters?.frequency_penalty !== undefined && {
                frequency_penalty: settings.modelParameters.frequency_penalty,
              }),
              ...(settings.modelParameters?.presence_penalty !== undefined && {
                presence_penalty: settings.modelParameters.presence_penalty,
              }),
              ...(settings.modelParameters?.reasoning && {
                reasoning: settings.modelParameters.reasoning,
              }),
              ...(settings.modelParameters?.include_reasoning !== undefined && {
                include_reasoning: settings.modelParameters.include_reasoning,
              }),
              ...(settings.modelParameters?.stop &&
                settings.modelParameters.stop.length > 0 && {
                  stop: settings.modelParameters.stop,
                }),
              ...(settings.modelParameters?.seed !== undefined && {
                seed: settings.modelParameters.seed,
              }),
              ...(settings.modelParameters?.top_k !== undefined && {
                top_k: settings.modelParameters.top_k,
              }),
              ...(settings.modelParameters?.min_p !== undefined && {
                min_p: settings.modelParameters.min_p,
              }),
              ...(settings.modelParameters?.repetition_penalty !==
                undefined && {
                repetition_penalty: settings.modelParameters.repetition_penalty,
              }),
            }),
            signal: abortControllerRef.current?.signal,
          }
        );

        const response = (await Promise.race([
          fetchPromise,
          timeoutPromise,
        ])) as Response;

        console.log(
          `[${keyword.text}] Response received in ${((Date.now() - startTime) / 1000).toFixed(1)}s`
        );

        const data = await response.json();

        if (data.error) {
          console.error(`[${keyword.text}] API Error:`, data.error);
          throw new Error(data.error.message || 'API Error');
        }

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error(`[${keyword.text}] Invalid API response:`, data);
          throw new Error('Invalid API response format');
        }

        const result = data.choices[0].message.content;
        console.log(
          `[${keyword.text}] Response length: ${result.length} chars`
        );

        // Parse JSON from this keyword's search
        const parsedResult = parseJSON(result);

        if (!parsedResult.stories || !Array.isArray(parsedResult.stories)) {
          console.error(
            `[${keyword.text}] Invalid JSON format. Response:`,
            result.substring(0, 500)
          );
          throw new Error("Invalid JSON format: missing 'stories' array");
        }

        console.log(
          `[${keyword.text}] Successfully parsed ${parsedResult.stories.length} stories`
        );

        // Filter stories to ONLY include those from the last 24 hours
        const now = new Date();
        const twentyFourHoursAgo = new Date(
          now.getTime() - 24 * 60 * 60 * 1000
        );

        const validStories = parsedResult.stories.filter((story: any) => {
          // Reject stories without dates
          if (!story.date) {
            console.warn(
              `[${keyword.text}] ❌ Rejected (no date): "${story.title?.substring(0, 50)}..."`
            );
            return false;
          }

          // Parse and validate date
          const storyDate = new Date(story.date);
          if (isNaN(storyDate.getTime())) {
            console.warn(
              `[${keyword.text}] ❌ Rejected (invalid date "${story.date}"): "${story.title?.substring(0, 50)}..."`
            );
            return false;
          }

          // Reject stories older than 24 hours
          if (storyDate < twentyFourHoursAgo) {
            console.warn(
              `[${keyword.text}] ❌ Rejected (too old - ${story.date}): "${story.title?.substring(0, 50)}..."`
            );
            return false;
          }

          // Reject stories with future dates (likely errors)
          if (storyDate > now) {
            console.warn(
              `[${keyword.text}] ❌ Rejected (future date - ${story.date}): "${story.title?.substring(0, 50)}..."`
            );
            return false;
          }

          console.log(
            `[${keyword.text}] ✅ Accepted (${story.date}): "${story.title?.substring(0, 50)}..."`
          );
          return true;
        });

        const rejectedCount = parsedResult.stories.length - validStories.length;
        console.log(
          `[${keyword.text}] Filtered: ${validStories.length}/${parsedResult.stories.length} stories passed 24-hour validation${rejectedCount > 0 ? ` (${rejectedCount} rejected)` : ''}`
        );

        // Add keyword and reportId to each story, convert to Card
        const cardsFromStories: Card[] = validStories.map((story: any) => ({
          id: `${reportId}-${keyword.text}-${Date.now()}-${Math.random().toString(36).substring(2)}`,
          reportId: reportId,
          keyword: keyword.text,
          category: story.category || 'Uncategorized',
          title: story.title,
          rating: story.rating,
          summary: story.summary,
          source: story.source,
          url: story.url,
          date: story.date,
          generatedAt: new Date().toISOString(),
          status: 'active' as const,
        }));

        // Track cost
        let cost = 0;
        if (data.usage) {
          const selectedModel = models.find(
            m => m.id === settings.selectedModel
          );
          if (selectedModel) {
            const promptCost =
              (data.usage.prompt_tokens / 1000000) *
              selectedModel.pricing.prompt;
            const completionCost =
              (data.usage.completion_tokens / 1000000) *
              selectedModel.pricing.completion;
            cost = promptCost + completionCost;
          }
        }

        // Update status to complete
        setStage1Results(prev => {
          const updated = prev.map((r, idx) =>
            idx === index
              ? { ...r, status: 'complete' as const, result, cost }
              : r
          );
          // Update progress
          const completedCount = updated.filter(
            r => r.status === 'complete' || r.status === 'error'
          ).length;
          setStage1Progress((completedCount / enabledKeywords.length) * 100);
          return updated;
        });

        // Immediately add completed cards to the active list (don't wait for all to finish)
        if (cardsFromStories.length > 0) {
          addCardsToActive(cardsFromStories);
        }

        return {
          success: true,
          cards: cardsFromStories,
          cost,
          totalStories: parsedResult.stories.length,
          rejectedStories: parsedResult.stories.length - validStories.length,
        };
      } catch (error: any) {
        // Check if the error is due to abort
        if (error.name === 'AbortError') {
          console.log(`[${keyword.text}] Search aborted by user`);
          return { success: false, cards: [], cost: 0 };
        }

        console.error(`[${keyword.text}] Error:`, error.message);

        // Update status to error
        setStage1Results(prev => {
          const updated = prev.map((r, idx) =>
            idx === index
              ? { ...r, status: 'error' as const, error: error.message }
              : r
          );
          // Update progress
          const completedCount = updated.filter(
            r => r.status === 'complete' || r.status === 'error'
          ).length;
          setStage1Progress((completedCount / enabledKeywords.length) * 100);
          return updated;
        });

        return { success: false, cards: [], cost: 0 };
      }
    };

    // Process searches with controlled concurrency
    console.log(
      `Starting searches with concurrency limit of ${CONCURRENT_LIMIT}...`
    );
    const results: Awaited<ReturnType<typeof searchKeyword>>[] = [];

    for (let i = 0; i < enabledKeywords.length; i += CONCURRENT_LIMIT) {
      const batch = enabledKeywords.slice(i, i + CONCURRENT_LIMIT);
      const batchPromises = batch.map((keyword, batchIndex) =>
        searchKeyword(keyword, i + batchIndex)
      );
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      console.log(`Batch ${Math.floor(i / CONCURRENT_LIMIT) + 1} completed`);
    }

    console.log('All searches completed!');

    // Aggregate results (cards were already added incrementally)
    results.forEach(result => {
      if (result && result.success && result.cards) {
        allCards.push(...result.cards);
      }
      if (result && result.cost) {
        totalCost += result.cost;
      }
      if (result) {
        totalStoriesReceived += result.totalStories || 0;
        totalStoriesRejected += result.rejectedStories || 0;
      }
    });

    console.log(
      `Generated ${allCards.length} cards with total cost $${totalCost.toFixed(4)}`
    );
    console.log(
      `📊 Date filtering stats: ${totalStoriesReceived} stories received, ${totalStoriesRejected} rejected (${((totalStoriesRejected / Math.max(totalStoriesReceived, 1)) * 100).toFixed(1)}% filtered out)`
    );

    // Update total cost and filter stats
    setActualCost(totalCost);
    setDateFilterStats({
      totalStories: totalStoriesReceived,
      filteredStories: allCards.length,
      rejectedCount: totalStoriesRejected,
    });

    // Show completion animation
    setShowCompletionAnimation(true);
    setTimeout(() => setShowCompletionAnimation(false), 2000);

    // Always show summary banner and create history entry, regardless of card count
    // Calculate report metadata
    let metadata = null;
    if (allCards.length > 0) {
      const categories = Array.from(
        new Set(allCards.map(card => card.category))
      );
      const avgRating =
        allCards.reduce((sum, card) => sum + card.rating, 0) / allCards.length;
      const ratingDistribution: { [key: number]: number } = {};
      for (let i = 1; i <= 10; i++) {
        ratingDistribution[i] = allCards.filter(
          card => Math.round(card.rating) === i
        ).length;
      }
      metadata = { categories, avgRating, ratingDistribution };
    }

    // Create history entry
    addReportHistory({
      id: reportId,
      generatedAt: new Date().toISOString(),
      keywords: enabledKeywords.map(k => k.text),
      totalCards: allCards.length,
      modelUsed: settings.selectedModel || 'unknown',
      costSpent: totalCost,
      categories: metadata?.categories || [],
      avgRating: metadata?.avgRating || 0,
      ratingDistribution: metadata?.ratingDistribution || {},
    });

    // Always show success banner (will display appropriate message based on card count)
    setLastReportCost(totalCost);
    setLastReportCardCount(allCards.length);
    setLastReportMetadata(metadata);
    setShowSuccessBanner(true);

    setIsGenerating(false);
    setCurrentStage(null);
    abortControllerRef.current = null;
  };

  const toggleExpanded = (keyword: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyword)) {
        newSet.delete(keyword);
      } else {
        newSet.add(keyword);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 -mb-px">
          <button
            onClick={() => setActiveNewsTab('generate')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeNewsTab === 'generate'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Generate Report
          </button>
          <button
            onClick={() => setActiveNewsTab('active')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeNewsTab === 'active'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            Active Cards {activeCards.length > 0 && `(${activeCards.length})`}
          </button>
          <button
            onClick={() => setActiveNewsTab('archived')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeNewsTab === 'archived'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Archive className="h-4 w-4" />
            Archived Cards
          </button>
          <button
            onClick={() => setActiveNewsTab('history')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeNewsTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <History className="h-4 w-4" />
            History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeNewsTab === 'active' && <ActiveCardsTab />}
      {activeNewsTab === 'archived' && <ArchivedCardsTab />}
      {activeNewsTab === 'history' && <HistoryTab />}

      {/* Generate Report Tab */}
      {activeNewsTab === 'generate' && (
        <div className="space-y-6">
          {/* Total Cost Spent - Always Visible */}
          <div
            className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border-2 border-slate-300 shadow-sm hover:shadow-md transition-shadow cursor-help"
            title={`Total Reports: ${totalReportsGenerated} | Total Cards: ${activeCards.length}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-slate-600 text-white rounded-full p-2">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Total Cost Spent
                  </p>
                  <p className="text-xs text-slate-600">
                    Cumulative across all API calls
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900 font-mono">
                  ${totalCostSpent.toFixed(6)}
                </p>
                <p className="text-xs text-slate-500">
                  {totalReportsGenerated}{' '}
                  {totalReportsGenerated === 1 ? 'report' : 'reports'}
                </p>
              </div>
            </div>
          </div>

          {/* Date Filter Warning Banner */}
          {dateFilterStats && dateFilterStats.rejectedCount > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-400">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-500 text-white rounded-full p-2 mt-0.5">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-yellow-900 mb-1">
                    📅 Date Filter Active
                  </p>
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">
                      {dateFilterStats.rejectedCount}
                    </span>{' '}
                    out of{' '}
                    <span className="font-semibold">
                      {dateFilterStats.totalStories}
                    </span>{' '}
                    stories were filtered out because they were older than 24
                    hours.
                    <br />
                    <span className="text-xs text-yellow-700 mt-1 inline-block">
                      ✅ Only showing news from the last 24 hours (
                      {dateFilterStats.filteredStories} recent stories)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {showSuccessBanner && (
            <div className={`bg-gradient-to-r p-6 rounded-xl border-2 shadow-2xl ${
              lastReportCardCount > 0
                ? 'from-green-50 to-emerald-50 border-green-400'
                : 'from-yellow-50 to-orange-50 border-yellow-400'
            }`}>
              <div className="space-y-4">
                {/* Header with prominent CTA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`text-white rounded-full p-3 ${
                      lastReportCardCount > 0 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {lastReportCardCount > 0 ? (
                        <CheckCircle2 className="h-8 w-8" />
                      ) : (
                        <XCircle className="h-8 w-8" />
                      )}
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${
                        lastReportCardCount > 0 ? 'text-green-900' : 'text-yellow-900'
                      }`}>
                        {lastReportCardCount > 0
                          ? 'Report Generated Successfully!'
                          : 'Report Generation Complete'}
                      </p>
                      <p className={`text-sm mt-1 ${
                        lastReportCardCount > 0 ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {lastReportCardCount > 0
                          ? `${lastReportCardCount} cards created • Cost: $${lastReportCost.toFixed(4)}`
                          : `No cards generated • Cost: $${lastReportCost.toFixed(4)}`}
                      </p>
                    </div>
                  </div>
                  {lastReportCardCount > 0 && (
                    <Button
                      onClick={() => setActiveNewsTab('active')}
                      className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      <span className="font-bold">View Active Cards</span>
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  )}
                </div>

                {/* Report Metadata - Only show if cards were generated */}
                {lastReportCardCount > 0 && lastReportMetadata && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-green-200">
                      {/* Categories */}
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-xs font-semibold text-slate-600 mb-2">
                          CATEGORIES
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {lastReportMetadata.categories.length}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {lastReportMetadata.categories.join(', ')}
                        </p>
                      </div>

                      {/* Average Rating */}
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-xs font-semibold text-slate-600 mb-2">
                          AVERAGE RATING
                        </p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {lastReportMetadata.avgRating.toFixed(1)}/10
                        </p>
                        <div className="flex gap-1 mt-2">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded ${
                                i < Math.round(lastReportMetadata.avgRating)
                                  ? 'bg-yellow-500'
                                  : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Rating Distribution */}
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-xs font-semibold text-slate-600 mb-2">
                          RATING DISTRIBUTION
                        </p>
                        <div className="grid grid-cols-5 gap-1 text-xs">
                          {Object.entries(
                            lastReportMetadata.ratingDistribution
                          ).map(
                            ([rating, count]) =>
                              count > 0 && (
                                <div key={rating} className="text-center">
                                  <div className="font-bold text-slate-900">
                                    {count}
                                  </div>
                                  <div className="text-slate-500">★{rating}</div>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Next Steps Call-to-Action */}
                    <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 text-center">
                      <p className="text-green-900 font-bold text-lg mb-2">
                        📊 Ready to review your cards?
                      </p>
                      <p className="text-green-700 text-sm mb-3">
                        Click &quot;View Active Cards&quot; above to see all{' '}
                        {lastReportCardCount} news stories organized by rating and
                        category!
                      </p>
                    </div>
                  </>
                )}

                {/* No Cards Generated Warning */}
                {lastReportCardCount === 0 && (
                  <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4">
                    <p className="text-yellow-900 font-bold text-lg mb-2">
                      ⚠️ No Cards Generated
                    </p>
                    <p className="text-yellow-800 text-sm mb-3">
                      All keyword searches completed, but no valid news stories were found. This could be because:
                    </p>
                    <ul className="text-yellow-800 text-sm space-y-1 ml-6 list-disc">
                      <li>All keywords failed or encountered errors</li>
                      <li>No recent stories (last 24 hours) matched your keywords</li>
                      <li>The AI model couldn&apos;t find relevant news articles</li>
                    </ul>
                    <p className="text-yellow-800 text-sm mt-3 font-medium">
                      Try adjusting your keywords or checking the individual keyword results above for more details.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generate Report Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            {/* Timing Warning */}
            <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Optimized searches: Up to 10 concurrent searches at a time
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Results appear as they complete (5-30 seconds each). Check
                    browser console (F12) for progress logs.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Generate News Report
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {settings.keywords.filter(k => k.enabled).length} keywords
                  enabled
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={generateReport}
                  disabled={
                    isGenerating ||
                    settings.keywords.filter(k => k.enabled).length === 0 ||
                    !settings.apiKey ||
                    !settings.selectedModel
                  }
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
                {isGenerating && (
                  <Button
                    onClick={stopAndReset}
                    variant="destructive"
                    size="lg"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Stop & Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Cost Estimation */}
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Estimated Cost:</span>
                <span className="font-mono font-semibold text-slate-900">
                  ${estimatedCost.toFixed(4)}
                </span>
              </div>
              {actualCost > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Actual Cost:</span>
                  <span className="font-mono font-semibold text-green-600">
                    ${actualCost.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stage 1: Individual Keyword Results */}
          {stage1Results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">
                  Parallel Keyword Searches (Online Mode)
                </h3>

                {currentStage === 1 && (
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-600">
                      {
                        stage1Results.filter(
                          r => r.status === 'complete' || r.status === 'error'
                        ).length
                      }{' '}
                      / {stage1Results.length} complete
                    </div>
                    <div className="text-sm font-mono text-slate-600">
                      {(stage1ElapsedTime / 1000).toFixed(1)}s
                    </div>
                  </div>
                )}

                {showCompletionAnimation && (
                  <div className="flex items-center gap-2 text-green-600 animate-pulse">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="font-semibold">
                      All keywords complete!
                    </span>
                    <Sparkles className="h-5 w-5" />
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {currentStage === 1 && (
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out flex items-center justify-end px-2"
                    style={{ width: `${stage1Progress}%` }}
                  >
                    {stage1Progress > 10 && (
                      <span className="text-xs font-bold text-white">
                        {Math.round(stage1Progress)}%
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {stage1Results.map(result => {
                  const isComplete = result.status === 'complete';
                  const isError = result.status === 'error';
                  const isLoading = result.status === 'loading';

                  return (
                    <div
                      key={result.keyword}
                      className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                        isComplete
                          ? 'bg-green-50 border-green-200'
                          : isError
                            ? 'bg-red-50 border-red-200'
                            : isLoading
                              ? 'bg-blue-50 border-blue-200 shadow-sm'
                              : 'bg-white'
                      }`}
                    >
                      <button
                        onClick={() => toggleExpanded(result.keyword)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {result.status === 'pending' && (
                            <Clock className="h-5 w-5 text-slate-400" />
                          )}
                          {result.status === 'loading' && (
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          )}
                          {result.status === 'complete' && (
                            <div className="relative">
                              <Check className="h-5 w-5 text-green-600" />
                              <div className="absolute inset-0 animate-ping opacity-75">
                                <Check className="h-5 w-5 text-green-400" />
                              </div>
                            </div>
                          )}
                          {result.status === 'error' && (
                            <X className="h-5 w-5 text-red-600" />
                          )}

                          <span className="font-medium text-slate-900">
                            {result.keyword}
                          </span>

                          <span
                            className={`text-sm capitalize px-2 py-1 rounded-full ${
                              isComplete
                                ? 'bg-green-100 text-green-700 font-medium'
                                : isError
                                  ? 'bg-red-100 text-red-700 font-medium'
                                  : isLoading
                                    ? 'bg-blue-100 text-blue-700 font-medium animate-pulse'
                                    : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {result.status}
                          </span>
                        </div>

                        {result.status === 'complete' &&
                          (expandedResults.has(result.keyword) ? (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                          ))}
                      </button>

                      {expandedResults.has(result.keyword) && result.result && (
                        <div className="px-4 py-3 border-t bg-white">
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {result.result}
                          </p>
                        </div>
                      )}

                      {result.error && (
                        <div className="px-4 py-3 border-t bg-red-100">
                          <p className="text-sm text-red-600">
                            Error: {result.error}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isGenerating &&
            !showSuccessBanner &&
            stage1Results.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p className="text-lg">Ready to generate a report.</p>
                <p className="text-sm mt-2">
                  Configure your settings and click &quot;Generate Report&quot;
                  to get started.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
