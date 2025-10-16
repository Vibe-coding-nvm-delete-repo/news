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

    // Ensure model has :online suffix for web search capability
    const onlineModel = settings.selectedModel.includes(':online')
      ? settings.selectedModel
      : `${settings.selectedModel}:online`;

    // Stage 1: Search for each keyword IN PARALLEL
    const searchPromises = enabledKeywords.map(async (keyword, index) => {
      try {
        const response = await fetch(
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
                  content: `${settings.searchInstructions}\n\n"${keyword.text}"`,
                },
              ],
            }),
            signal: abortControllerRef.current?.signal,
          }
        );

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message || 'API Error');
        }

        const result = data.choices[0].message.content;

        // Parse JSON from this keyword's search
        const parsedResult = parseJSON(result);

        if (!parsedResult.stories || !Array.isArray(parsedResult.stories)) {
          throw new Error("Invalid JSON format: missing 'stories' array");
        }

        // Add keyword and reportId to each story, convert to Card
        const cardsFromStories: Card[] = parsedResult.stories.map((story: any) => ({
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

        return { success: true, cards: cardsFromStories, cost };
      } catch (error: any) {
        // Check if the error is due to abort
        if (error.name === 'AbortError') {
          return; // Stop processing
        }
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
      }
    });

    // Wait for all searches to complete (TRUE PARALLEL PROCESSING)
    const results = await Promise.all(searchPromises);

    // Aggregate all cards from successful searches
    results.forEach(result => {
      if (result && result.success && result.cards) {
        allCards.push(...result.cards);
      }
      if (result && result.cost) {
        totalCost += result.cost;
      }
    });

    // Update total cost
    setActualCost(totalCost);

    // Show completion animation
    setShowCompletionAnimation(true);
    setTimeout(() => setShowCompletionAnimation(false), 2000);

    // Save cards to active cards
    if (allCards.length > 0) {
      addCardsToActive(allCards);
      
      // Create history entry
      addReportHistory({
        id: reportId,
        generatedAt: new Date().toISOString(),
        keywords: enabledKeywords.map(k => k.text),
        totalCards: allCards.length,
        modelUsed: settings.selectedModel || 'unknown',
        costSpent: totalCost,
      });

      // Show success banner
      setLastReportCost(totalCost);
      setLastReportCardCount(allCards.length);
      setShowSuccessBanner(true);
    }

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
            Active Cards
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
          {/* Cumulative Cost Counter */}
          {actualCost > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 text-white rounded-full p-2">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Total Cost Spent
                    </p>
                    <p className="text-xs text-green-600">
                      Cumulative across all API calls
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-900 font-mono">
                    ${actualCost.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {showSuccessBanner && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border-2 border-green-400 shadow-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500 text-white rounded-full p-3">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-900">
                      Report Generated Successfully!
                    </p>
                    <p className="text-sm text-green-700">
                      {lastReportCardCount} cards created • Cost: ${lastReportCost.toFixed(4)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveNewsTab('active')}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  View Active Cards
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

      {/* Generate Report Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Generate News Report
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {settings.keywords.filter(k => k.enabled).length} keywords enabled
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
              <Button onClick={stopAndReset} variant="destructive" size="lg">
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
                <span className="font-semibold">All keywords complete!</span>
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
          {!isGenerating && !showSuccessBanner && stage1Results.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg">Ready to generate a report.</p>
              <p className="text-sm mt-2">
                Configure your settings and click &quot;Generate Report&quot; to get
                started.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
