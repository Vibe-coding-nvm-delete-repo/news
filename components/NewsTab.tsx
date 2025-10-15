"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  X, 
  Clock,
  Archive,
  Star
} from "lucide-react";
import { parseJSON } from "@/lib/utils";

interface Stage1Result {
  keyword: string;
  status: "pending" | "loading" | "complete" | "error";
  result?: string;
  error?: string;
}

interface Story {
  id?: string;
  title: string;
  rating: number;
  summary: string;
  source?: string | null;
  url?: string | null;
  date?: string | null;
  archived?: boolean;
}

export default function NewsTab() {
  const { settings, models } = useStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState<1 | 2 | null>(null);
  const [stage1Results, setStage1Results] = useState<Stage1Result[]>([]);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [stories, setStories] = useState<Story[]>([]);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [actualCost, setActualCost] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState<"active" | "archived">("active");
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);

  // Load latest report on mount
  useEffect(() => {
    loadLatestReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate estimated cost whenever keywords or model changes
  useEffect(() => {
    calculateEstimatedCost();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.keywords, settings.selectedModel, models]);

  const loadLatestReport = async () => {
    try {
      const { data: latestReport } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (latestReport) {
        setCurrentReportId(latestReport.id);
        setActualCost(parseFloat(latestReport.total_cost));
        
        // Load stories for this report
        const { data: storiesData } = await supabase
          .from("stories")
          .select("*")
          .eq("report_id", latestReport.id)
          .order("rating", { ascending: false });

        if (storiesData) {
          setStories(storiesData);
        }
      }
    } catch (error) {
      console.error("Error loading latest report:", error);
    }
  };

  const calculateEstimatedCost = () => {
    const enabledKeywords = settings.keywords.filter((k) => k.enabled);
    if (enabledKeywords.length === 0 || !settings.selectedModel) {
      setEstimatedCost(0);
      return;
    }

    const selectedModel = models.find((m) => m.id === settings.selectedModel);
    if (!selectedModel) {
      setEstimatedCost(0);
      return;
    }

    // Rough token estimation:
    // Stage 1: ~500 tokens per keyword (input + output)
    // Stage 2: ~2000 tokens (aggregating all results)
    const tokensPerKeyword = 500;
    const stage2Tokens = 2000;
    
    const totalTokens = (enabledKeywords.length * tokensPerKeyword) + stage2Tokens;
    const costPer1MTokens = selectedModel.totalCostPer1M;
    const estimatedCostValue = (totalTokens / 1000000) * costPer1MTokens;
    
    setEstimatedCost(estimatedCostValue);
  };

  const generateReport = async () => {
    const enabledKeywords = settings.keywords.filter((k) => k.enabled);
    
    if (enabledKeywords.length === 0) {
      alert("Please enable at least one keyword");
      return;
    }

    if (!settings.apiKey || !settings.selectedModel) {
      alert("Please configure your API key and select a model");
      return;
    }

    setIsGenerating(true);
    setCurrentStage(1);
    setStories([]);
    setActualCost(0);
    
    // Initialize stage 1 results
    const initialResults: Stage1Result[] = enabledKeywords.map((k) => ({
      keyword: k.text,
      status: "pending",
    }));
    setStage1Results(initialResults);

    let totalCost = 0;
    const completedResults: any[] = [];

    // Stage 1: Search for each keyword
    for (let i = 0; i < enabledKeywords.length; i++) {
      const keyword = enabledKeywords[i];
      
      // Update status to loading
      setStage1Results((prev) =>
        prev.map((r, idx) =>
          idx === i ? { ...r, status: "loading" } : r
        )
      );

      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${settings.apiKey}`,
            "Content-Type": "application/json",
            "X-Title": "News Report Generator",
          },
          body: JSON.stringify({
            model: settings.selectedModel,
            messages: [
              {
                role: "user",
                content: `${settings.searchInstructions}\n\nKeyword: ${keyword.text}`,
              },
            ],
          }),
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message || "API Error");
        }

        const result = data.choices[0].message.content;
        
        // Track cost
        if (data.usage) {
          const selectedModel = models.find((m) => m.id === settings.selectedModel);
          if (selectedModel) {
            const promptCost = (data.usage.prompt_tokens / 1000000) * selectedModel.pricing.prompt;
            const completionCost = (data.usage.completion_tokens / 1000000) * selectedModel.pricing.completion;
            totalCost += promptCost + completionCost;
          }
        }

        completedResults.push({
          keyword: keyword.text,
          result,
        });

        // Update status to complete
        setStage1Results((prev) =>
          prev.map((r, idx) =>
            idx === i ? { ...r, status: "complete", result } : r
          )
        );
      } catch (error: any) {
        // Update status to error
        setStage1Results((prev) =>
          prev.map((r, idx) =>
            idx === i ? { ...r, status: "error", error: error.message } : r
          )
        );
      }
    }

    // Stage 2: Aggregate and format
    setCurrentStage(2);

    try {
      const aggregatedResults = completedResults
        .map((r) => `Keyword: ${r.keyword}\n\n${r.result}`)
        .join("\n\n---\n\n");

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "News Report Generator",
        },
        body: JSON.stringify({
          model: settings.selectedModel,
          messages: [
            {
              role: "user",
              content: `${settings.formatPrompt}\n\nAll search results:\n\n${aggregatedResults}`,
            },
          ],
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "API Error");
      }

      // Track cost for stage 2
      if (data.usage) {
        const selectedModel = models.find((m) => m.id === settings.selectedModel);
        if (selectedModel) {
          const promptCost = (data.usage.prompt_tokens / 1000000) * selectedModel.pricing.prompt;
          const completionCost = (data.usage.completion_tokens / 1000000) * selectedModel.pricing.completion;
          totalCost += promptCost + completionCost;
        }
      }

      setActualCost(totalCost);

      // Parse JSON response
      const result = data.choices[0].message.content;
      const parsedResult = parseJSON(result);
      
      if (!parsedResult.stories || !Array.isArray(parsedResult.stories)) {
        throw new Error("Invalid JSON format: missing 'stories' array");
      }

      // Sort by rating (highest to lowest)
      const sortedStories = parsedResult.stories.sort(
        (a: Story, b: Story) => b.rating - a.rating
      );

      // Save report to database
      const { data: reportData } = await supabase
        .from("reports")
        .insert([
          {
            total_cost: totalCost,
            stage1_results: completedResults,
            stage2_result: parsedResult,
          },
        ])
        .select()
        .single();

      if (reportData) {
        setCurrentReportId(reportData.id);

        // Save stories to database
        const storiesToInsert = sortedStories.map((story: Story) => ({
          report_id: reportData.id,
          title: story.title,
          rating: story.rating,
          summary: story.summary || "",
          source: story.source,
          url: story.url,
          date: story.date,
          archived: false,
        }));

        const { data: insertedStories } = await supabase
          .from("stories")
          .insert(storiesToInsert)
          .select();

        if (insertedStories) {
          setStories(insertedStories);
        }
      }
    } catch (error: any) {
      console.error("Stage 2 error:", error);
      alert(`Failed to generate final report: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setCurrentStage(null);
    }
  };

  const toggleExpanded = (keyword: string) => {
    setExpandedResults((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyword)) {
        newSet.delete(keyword);
      } else {
        newSet.add(keyword);
      }
      return newSet;
    });
  };

  const archiveStory = async (storyId: string) => {
    await supabase
      .from("stories")
      .update({ archived: true })
      .eq("id", storyId);

    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, archived: true } : s))
    );
  };

  const unarchiveStory = async (storyId: string) => {
    await supabase
      .from("stories")
      .update({ archived: false })
      .eq("id", storyId);

    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, archived: false } : s))
    );
  };

  const activeStories = stories.filter((s) => !s.archived);
  const archivedStories = stories.filter((s) => s.archived);
  const displayStories = activeSubTab === "active" ? activeStories : archivedStories;

  return (
    <div className="space-y-6">
      {/* Generate Report Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Generate News Report</h2>
            <p className="text-sm text-slate-600 mt-1">
              {settings.keywords.filter((k) => k.enabled).length} keywords enabled
            </p>
          </div>
          <Button
            onClick={generateReport}
            disabled={
              isGenerating ||
              settings.keywords.filter((k) => k.enabled).length === 0 ||
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
              "Generate Report"
            )}
          </Button>
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
          <h3 className="text-xl font-semibold text-slate-900">
            Stage 1: Individual Keyword Searches
          </h3>
          
          <div className="space-y-2">
            {stage1Results.map((result) => (
              <div
                key={result.keyword}
                className="border rounded-lg overflow-hidden bg-white"
              >
                <button
                  onClick={() => toggleExpanded(result.keyword)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {result.status === "pending" && (
                      <Clock className="h-5 w-5 text-slate-400" />
                    )}
                    {result.status === "loading" && (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    )}
                    {result.status === "complete" && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                    {result.status === "error" && (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                    
                    <span className="font-medium text-slate-900">
                      {result.keyword}
                    </span>
                    
                    <span className="text-sm text-slate-500 capitalize">
                      {result.status}
                    </span>
                  </div>

                  {result.status === "complete" && (
                    expandedResults.has(result.keyword) ? (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )
                  )}
                </button>

                {expandedResults.has(result.keyword) && result.result && (
                  <div className="px-4 py-3 border-t bg-slate-50">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {result.result}
                    </p>
                  </div>
                )}

                {result.error && (
                  <div className="px-4 py-3 border-t bg-red-50">
                    <p className="text-sm text-red-600">Error: {result.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage 2: Loading Indicator */}
      {currentStage === 2 && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Stage 2: Aggregating and Formatting Results
              </h3>
              <p className="text-sm text-slate-600">
                Combining all keyword searches into a final report...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Final Stories */}
      {stories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">News Stories</h3>
            
            <div className="flex gap-2">
              <Button
                variant={activeSubTab === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSubTab("active")}
              >
                Active ({activeStories.length})
              </Button>
              <Button
                variant={activeSubTab === "archived" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSubTab("archived")}
              >
                Archived ({archivedStories.length})
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {displayStories.map((story) => (
              <div
                key={story.id}
                className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
                        <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                        <span className="font-bold text-yellow-900">
                          {story.rating.toFixed(1)}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900">
                        {story.title}
                      </h4>
                    </div>
                    
                    <p className="text-slate-700 mb-3">{story.summary}</p>
                    
                    <div className="flex gap-4 text-sm text-slate-500">
                      {story.source && <span>Source: {story.source}</span>}
                      {story.date && <span>Date: {story.date}</span>}
                    </div>
                    
                    {story.url && (
                      <a
                        href={story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                      >
                        Read more →
                      </a>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      story.archived
                        ? unarchiveStory(story.id!)
                        : archiveStory(story.id!)
                    }
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stories.length === 0 && !isGenerating && (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">No reports generated yet.</p>
          <p className="text-sm mt-2">
            Configure your settings and click &quot;Generate Report&quot; to get started.
          </p>
        </div>
      )}
    </div>
  );
}
