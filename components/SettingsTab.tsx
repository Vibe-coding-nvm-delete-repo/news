"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Search, Plus, Trash2 } from "lucide-react";
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
    removeKeyword,
    toggleKeyword,
    setSearchInstructions,
    setFormatPrompt,
  } = useStore();

  // OpenRouter API Key
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey || "");
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [validationMessage, setValidationMessage] = useState("");
  
  const [keywordInput, setKeywordInput] = useState("");
  const [modelSearch, setModelSearch] = useState("");

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

      setApiKey(trimmedKey);
      setValidationStatus("success");
      setValidationMessage("✓ API key validated successfully! You can now fetch models.");
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
      
      // Parse and sort models by price (lowest to highest for cost efficiency)
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
        .sort((a: any, b: any) => a.totalCostPer1M - b.totalCostPer1M);

      setModels(parsedModels);
    } catch (error) {
      console.error("Error fetching models:", error);
      const message = error instanceof Error ? error.message : "Failed to fetch models.";
      alert(message);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const createKeywords = () => {
    const keywordsToCreate = keywordInput
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keywordsToCreate.length === 0) return;

    for (const keywordText of keywordsToCreate) {
      const newKeyword = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        text: keywordText,
        enabled: true,
      };
      addKeyword(newKeyword);
    }

    setKeywordInput("");
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
        <h2 className="text-2xl font-semibold text-slate-900">Step 1: Add Your OpenRouter API Key</h2>
        <p className="text-sm text-slate-600">
          Get your API key from{" "}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            openrouter.ai/keys
          </a>
        </p>
        
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="flex-1 pr-10"
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            )}
          </div>
          
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
          <h2 className="text-2xl font-semibold text-slate-900">Step 2: Fetch & Select a Model</h2>
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
        <h2 className="text-2xl font-semibold text-slate-900">Step 3: Add Keywords</h2>
        <p className="text-sm text-slate-600">
          Add keywords to search for (comma-separated for multiple)
        </p>
        
        <div className="flex gap-2">
          <Input
            placeholder="e.g., AI, Crypto, Tech News"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createKeywords()}
            className="flex-1"
          />
          <Button onClick={createKeywords} disabled={!keywordInput.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {settings.keywords.length > 0 && (
          <div className="space-y-2">
            {settings.keywords.map((keyword) => (
              <div
                key={keyword.id}
                className="flex items-center justify-between p-3 border rounded-md bg-white"
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={keyword.enabled}
                    onCheckedChange={() => toggleKeyword(keyword.id)}
                  />
                  <span className={keyword.enabled ? "text-slate-900" : "text-slate-400"}>
                    {keyword.text}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeKeyword(keyword.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Instructions Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Search Instructions (Optional)</h2>
        <p className="text-sm text-slate-600">
          Customize how the AI searches for each keyword
        </p>
        <Textarea
          value={settings.searchInstructions}
          onChange={(e) => setSearchInstructions(e.target.value)}
          rows={6}
          placeholder="Enter search instructions..."
          className="font-mono text-sm"
        />
      </div>

      {/* Format Prompt Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Format Prompt (Optional)</h2>
        <p className="text-sm text-slate-600">
          Customize how the AI formats the final report
        </p>
        <Textarea
          value={settings.formatPrompt}
          onChange={(e) => setFormatPrompt(e.target.value)}
          rows={12}
          placeholder="Enter format prompt..."
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
}
