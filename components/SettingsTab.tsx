"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Check, X, Search, Plus, Trash2 } from "lucide-react";
import { formatCost, isValidOpenRouterApiKey } from "@/lib/utils";

export default function SettingsTab() {
  const {
    settings,
    models,
    isLoadingModels,
    setApiKey,
    setSelectedModel,
    setModels,
    setIsLoadingModels,
    addKeyword,
    toggleKeyword,
    setSearchInstructions,
    setFormatPrompt,
    loadSettings,
  } = useStore();

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [validationMessage, setValidationMessage] = useState("");
  
  const [keywordInput, setKeywordInput] = useState("");
  const [modelSearch, setModelSearch] = useState("");

  // Load settings from Supabase on mount
  useEffect(() => {
    loadSettingsFromDB();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettingsFromDB = async () => {
    try {
      // Load settings
      const { data: settingsData } = await supabase
        .from("settings")
        .select("*")
        .eq("id", 1)
        .single();

      // Load keywords
      const { data: keywordsData } = await supabase
        .from("keywords")
        .select("*")
        .order("created_at", { ascending: true });

      if (settingsData) {
        loadSettings({
          apiKey: settingsData.api_key,
          selectedModel: settingsData.selected_model,
          keywords: keywordsData || [],
          searchInstructions: settingsData.search_instructions,
          formatPrompt: settingsData.format_prompt,
        });
        setApiKeyInput(settingsData.api_key || "");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const validateAndSaveApiKey = async () => {
    const trimmedKey = apiKeyInput.trim();
    if (!trimmedKey) return;

    setIsValidating(true);
    setValidationStatus("idle");

    try {
      // Test API key by fetching models
      if (!isValidOpenRouterApiKey(trimmedKey)) {
        setValidationStatus("error");
        setValidationMessage(
          "✗ Invalid API key format. It should look like sk-or-v1-<64 hex>"
        );
        return;
      }

      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          Authorization: `Bearer ${trimmedKey}`,
          "X-Title": "News Report Generator",
        },
      });

      if (!response.ok) {
        let apiErrorMessage = "Validation failed";
        try {
          const err = await response.json();
          if (err?.error?.message) apiErrorMessage = err.error.message;
        } catch {
          try {
            const text = await response.text();
            if (text) apiErrorMessage = text;
          } catch {}
        }

        if (response.status === 401 || /invalid api key/i.test(apiErrorMessage)) {
          throw new Error("✗ Invalid API key. Please check and try again.");
        }

        if (response.status === 403 || /referer|origin/i.test(apiErrorMessage)) {
          throw new Error(
            "✗ Origin not allowed. Add your site (e.g., http://localhost:3000) to Allowed Origins in your OpenRouter dashboard."
          );
        }

        throw new Error(`✗ ${apiErrorMessage}`);
      }

      // Save to Supabase
      await supabase
        .from("settings")
        .update({ api_key: trimmedKey, updated_at: new Date().toISOString() })
        .eq("id", 1);

      setApiKey(trimmedKey);
      setValidationStatus("success");
      setValidationMessage("✓ API key validated and saved successfully!");
    } catch (error) {
      setValidationStatus("error");
      const message = error instanceof Error ? error.message : "✗ Unexpected error validating key.";
      setValidationMessage(message);
    } finally {
      setIsValidating(false);
    }
  };

  const fetchModels = async () => {
    if (!settings.apiKey) {
      alert("Please enter and validate your API key first");
      return;
    }

    setIsLoadingModels(true);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
          "X-Title": "News Report Generator",
        },
      });

      if (!response.ok) {
        let apiErrorMessage = "Failed to fetch models";
        try {
          const err = await response.json();
          if (err?.error?.message) apiErrorMessage = err.error.message;
        } catch {}
        throw new Error(apiErrorMessage);
      }

      const data = await response.json();
      
      // Parse and sort models by price (highest to lowest)
      const parsedModels = data.data
        .filter((model: any) => model.pricing) // Only models with pricing
        .map((model: any) => ({
          id: model.id,
          name: model.name || model.id,
          pricing: {
            prompt: parseFloat(model.pricing.prompt) * 1000000 || 0,
            completion: parseFloat(model.pricing.completion) * 1000000 || 0,
          },
          totalCostPer1M: 
            (parseFloat(model.pricing.prompt) * 1000000 || 0) +
            (parseFloat(model.pricing.completion) * 1000000 || 0),
        }))
        .sort((a: any, b: any) => b.totalCostPer1M - a.totalCostPer1M);

      setModels(parsedModels);
    } catch (error) {
      console.error("Error fetching models:", error);
      const message = error instanceof Error ? error.message : "Failed to fetch models.";
      alert(message);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleModelSelect = async (modelId: string) => {
    setSelectedModel(modelId);
    await supabase
      .from("settings")
      .update({ selected_model: modelId, updated_at: new Date().toISOString() })
      .eq("id", 1);
  };

  const createKeywords = async () => {
    const keywordsToCreate = keywordInput
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keywordsToCreate.length === 0) return;

    for (const keywordText of keywordsToCreate) {
      const newKeyword = {
        text: keywordText,
        enabled: true,
      };

      const { data } = await supabase
        .from("keywords")
        .insert([newKeyword])
        .select()
        .single();

      if (data) {
        addKeyword(data);
      }
    }

    setKeywordInput("");
  };

  const handleToggleKeyword = async (id: string) => {
    const keyword = settings.keywords.find((k) => k.id === id);
    if (!keyword) return;

    await supabase
      .from("keywords")
      .update({ enabled: !keyword.enabled })
      .eq("id", id);

    toggleKeyword(id);
  };

  const handleDeleteKeyword = async (id: string) => {
    await supabase.from("keywords").delete().eq("id", id);
    loadSettingsFromDB();
  };

  const handleSearchInstructionsBlur = async () => {
    await supabase
      .from("settings")
      .update({
        search_instructions: settings.searchInstructions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
  };

  const handleFormatPromptBlur = async () => {
    await supabase
      .from("settings")
      .update({
        format_prompt: settings.formatPrompt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
  };

  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      model.id.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* API Key Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">API Configuration</h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            OpenRouter API Key
          </label>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && validateAndSaveApiKey()}
              className="flex-1"
            />
            <Button
              onClick={validateAndSaveApiKey}
              disabled={isValidating || !apiKeyInput.trim()}
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Validate"
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Format: <code>sk-or-v1-</code> followed by 64 hex characters.
          </p>
          
          {validationStatus !== "idle" && (
            <p
              className={`text-sm ${
                validationStatus === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {validationMessage}
            </p>
          )}
        </div>
      </div>

      {/* Model Selection Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Model Selection</h2>
          <Button onClick={fetchModels} disabled={isLoadingModels || !settings.apiKey}>
            {isLoadingModels ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Fetch Models
          </Button>
        </div>

        {models.length > 0 && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search models..."
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="border rounded-md max-h-96 overflow-y-auto">
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors border-b last:border-b-0 ${
                    settings.selectedModel === model.id
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : ""
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-slate-900">{model.name}</div>
                    <div className="text-xs text-slate-500">{model.id}</div>
                  </div>
                  <div className="text-sm font-mono text-slate-600">
                    {formatCost(model.totalCostPer1M)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Keywords Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Keywords</h2>
        
        <div className="flex gap-2">
          <Input
            placeholder="Enter keywords (comma-separated)"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createKeywords()}
            className="flex-1"
          />
          <Button onClick={createKeywords} disabled={!keywordInput.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Keywords
          </Button>
        </div>

        <div className="space-y-2">
          {settings.keywords.map((keyword) => (
            <div
              key={keyword.id}
              className="flex items-center justify-between p-3 border rounded-md bg-white"
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={keyword.enabled}
                  onCheckedChange={() => handleToggleKeyword(keyword.id)}
                />
                <span className={keyword.enabled ? "text-slate-900" : "text-slate-400"}>
                  {keyword.text}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteKeyword(keyword.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Search Instructions Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Search Instructions</h2>
        <Textarea
          value={settings.searchInstructions}
          onChange={(e) => setSearchInstructions(e.target.value)}
          onBlur={handleSearchInstructionsBlur}
          rows={6}
          placeholder="Enter search instructions..."
          className="font-mono text-sm"
        />
      </div>

      {/* Format Prompt Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Format Prompt</h2>
        <Textarea
          value={settings.formatPrompt}
          onChange={(e) => setFormatPrompt(e.target.value)}
          onBlur={handleFormatPromptBlur}
          rows={12}
          placeholder="Enter format prompt..."
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
}
