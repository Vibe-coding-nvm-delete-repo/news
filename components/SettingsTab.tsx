'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Loader2,
  Search,
  Plus,
  Trash2,
  Key,
  Cpu,
  Hash,
  FileText,
  FolderOpen,
  Sliders,
} from 'lucide-react';
import { formatCost, isValidOpenRouterApiKey } from '@/lib/utils';

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
    setOnlineEnabled,
    setModelParameters,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<
    | 'api-key'
    | 'model-selection'
    | 'model-parameters'
    | 'keywords'
    | 'search-instructions'
    | 'categories'
  >('api-key');

  // OpenRouter API Key
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [validationMessage, setValidationMessage] = useState('');

  const [keywordInput, setKeywordInput] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  const validateAndSaveApiKey = async () => {
    const trimmedKey = apiKeyInput.trim();
    if (!trimmedKey) return;

    setIsValidating(true);
    setValidationStatus('idle');

    try {
      // Test API key by fetching models
      if (!isValidOpenRouterApiKey(trimmedKey)) {
        setValidationStatus('error');
        setValidationMessage(
          '✗ Invalid API key format. It should look like sk-or-v1-<64 hex>'
        );
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${trimmedKey}`,
          'X-Title': 'News Report Generator',
        },
      });

      if (!response.ok) {
        let apiErrorMessage = 'Validation failed';
        try {
          const err = await response.json();
          if (err?.error?.message) apiErrorMessage = err.error.message;
        } catch {
          try {
            const text = await response.text();
            if (text) apiErrorMessage = text;
          } catch {}
        }

        if (
          response.status === 401 ||
          /invalid api key/i.test(apiErrorMessage)
        ) {
          throw new Error('✗ Invalid API key. Please check and try again.');
        }

        if (
          response.status === 403 ||
          /referer|origin/i.test(apiErrorMessage)
        ) {
          throw new Error(
            '✗ Origin not allowed. Add your site (e.g., http://localhost:3000) to Allowed Origins in your OpenRouter dashboard.'
          );
        }

        throw new Error(`✗ ${apiErrorMessage}`);
      }

      setApiKey(trimmedKey);
      setValidationStatus('success');
      setValidationMessage(
        '✓ API key validated successfully! You can now fetch models.'
      );
    } catch (error) {
      setValidationStatus('error');
      const message =
        error instanceof Error
          ? error.message
          : '✗ Unexpected error validating key.';
      setValidationMessage(message);
    } finally {
      setIsValidating(false);
    }
  };

  const fetchModels = async () => {
    if (!settings.apiKey) {
      alert('Please enter and validate your API key first');
      return;
    }

    setIsLoadingModels(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
          'X-Title': 'News Report Generator',
        },
      });

      if (!response.ok) {
        let apiErrorMessage = 'Failed to fetch models';
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
      console.error('Error fetching models:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to fetch models.';
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
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywordsToCreate.length === 0) return;

    for (const keywordText of keywordsToCreate) {
      const newKeyword = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        text: keywordText,
        enabled: true,
      };
      addKeyword(newKeyword);
    }

    setKeywordInput('');
  };

  const filteredModels = models.filter(
    model =>
      model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      model.id.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('api-key')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'api-key'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Key className="h-4 w-4" />
            API Key
          </button>
          <button
            onClick={() => setActiveSubTab('model-selection')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'model-selection'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Cpu className="h-4 w-4" />
            Model Selection
          </button>
          <button
            onClick={() => setActiveSubTab('model-parameters')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'model-parameters'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Sliders className="h-4 w-4" />
            Model Parameters
          </button>
          <button
            onClick={() => setActiveSubTab('keywords')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'keywords'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Hash className="h-4 w-4" />
            Keywords
          </button>
          <button
            onClick={() => setActiveSubTab('search-instructions')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'search-instructions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            Search Instructions
          </button>
          <button
            onClick={() => setActiveSubTab('categories')}
            disabled={true}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap opacity-50 cursor-not-allowed ${
              activeSubTab === 'categories'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400'
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            Categories
          </button>
        </div>
      </div>

      {/* API Key Tab */}
      {activeSubTab === 'api-key' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            Add Your OpenRouter API Key
          </h2>
          <p className="text-sm text-slate-600">
            Get your API key from{' '}
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
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && validateAndSaveApiKey()}
                  className="pr-10"
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  </div>
                )}
              </div>
              <Button
                onClick={validateAndSaveApiKey}
                disabled={isValidating || !apiKeyInput.trim()}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Validating...
                  </>
                ) : (
                  'Validate & Save'
                )}
              </Button>
            </div>

            {validationStatus !== 'idle' && (
              <p
                className={`text-sm ${
                  validationStatus === 'success'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {validationMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Model Selection Tab */}
      {activeSubTab === 'model-selection' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">
              Fetch & Select a Model
            </h2>
            <Button
              onClick={fetchModels}
              disabled={isLoadingModels || !settings.apiKey}
            >
              {isLoadingModels ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Fetch Models
            </Button>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md w-fit">
            <Switch checked={true} onCheckedChange={() => {}} disabled={true} />
            <span className="text-sm font-medium text-green-700">
              Online Mode (Always Enabled)
            </span>
          </div>

          <p className="text-sm text-slate-600">
            <strong>Note:</strong> All searches automatically use the{' '}
            <code>:online</code> variant of your selected model for real-time
            web search capabilities. Models are sorted by cost (cheapest first).
          </p>

          {models.length > 0 && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search models..."
                  value={modelSearch}
                  onChange={e => setModelSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="border rounded-md max-h-[600px] overflow-y-auto">
                {filteredModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className={`w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b last:border-b-0 ${
                      settings.selectedModel === model.id
                        ? 'bg-blue-50 border-l-4 border-l-blue-600'
                        : ''
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium text-slate-900 text-sm">
                        {model.name}
                      </div>
                      <div className="text-xs text-slate-500">{model.id}</div>
                    </div>
                    <div className="text-xs font-mono text-slate-600">
                      {formatCost(model.totalCostPer1M)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Model Parameters Tab */}
      {activeSubTab === 'model-parameters' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Model Parameters
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Control model behavior for improved accuracy and consistency.{' '}
              <span className="text-green-600 font-medium">
                ✓ Already active
              </span>{' '}
              — These defaults are optimized for news search.
            </p>
          </div>

          {/* Core Parameters */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Core Parameters
            </h3>

            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Temperature
                </label>
                <span className="text-sm text-slate-600">
                  {settings.modelParameters.temperature ?? 0.5}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.modelParameters.temperature ?? 0.5}
                onChange={e =>
                  setModelParameters({
                    temperature: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Controls randomness. Lower (0.3-0.5) = more factual and
                consistent. Higher (0.8-1.5) = more creative.
              </p>
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Max Tokens
                </label>
                <Input
                  type="number"
                  min="100"
                  max="10000"
                  value={settings.modelParameters.max_tokens ?? 2000}
                  onChange={e =>
                    setModelParameters({
                      max_tokens: parseInt(e.target.value) || 2000,
                    })
                  }
                  className="w-24 text-right"
                />
              </div>
              <p className="text-xs text-slate-500">
                Maximum response length. Controls cost and prevents overly long
                responses. Recommended: 1500-2500.
              </p>
            </div>

            {/* Response Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Response Format
              </label>
              <select
                value={
                  settings.modelParameters.response_format ?? 'json_object'
                }
                onChange={e =>
                  setModelParameters({
                    response_format: e.target.value as
                      | 'auto'
                      | 'json_object'
                      | 'text',
                  })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="json_object">JSON Object (Recommended)</option>
                <option value="auto">Auto</option>
                <option value="text">Text</option>
              </select>
              <p className="text-xs text-slate-500">
                <strong>json_object</strong> enforces valid JSON output. Highly
                recommended for this app.
              </p>
            </div>

            {/* Top P */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Top P (Nucleus Sampling)
                </label>
                <span className="text-sm text-slate-600">
                  {settings.modelParameters.top_p ?? 0.9}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.modelParameters.top_p ?? 0.9}
                onChange={e =>
                  setModelParameters({ top_p: parseFloat(e.target.value) })
                }
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Alternative to temperature. 0.9-0.95 = balanced results. Lower =
                more focused.
              </p>
            </div>
          </div>

          {/* Quality Controls */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Quality Controls
            </h3>

            {/* Frequency Penalty */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Frequency Penalty
                </label>
                <span className="text-sm text-slate-600">
                  {settings.modelParameters.frequency_penalty ?? 0.5}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.modelParameters.frequency_penalty ?? 0.5}
                onChange={e =>
                  setModelParameters({
                    frequency_penalty: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Reduces word repetition. 0.5 = good balance for varied output.
              </p>
            </div>

            {/* Presence Penalty */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Presence Penalty
                </label>
                <span className="text-sm text-slate-600">
                  {settings.modelParameters.presence_penalty ?? 0.3}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.modelParameters.presence_penalty ?? 0.3}
                onChange={e =>
                  setModelParameters({
                    presence_penalty: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Encourages diverse topics. 0.3 = good for varied news coverage.
              </p>
            </div>
          </div>

          {/* Reset to Defaults */}
          <div className="border-t pt-4">
            <Button
              onClick={() =>
                setModelParameters({
                  temperature: 0.5,
                  max_tokens: 2000,
                  response_format: 'json_object',
                  top_p: 0.9,
                  frequency_penalty: 0.5,
                  presence_penalty: 0.3,
                })
              }
              variant="outline"
            >
              Reset to Recommended Defaults
            </Button>
          </div>
        </div>
      )}

      {/* Keywords Tab */}
      {activeSubTab === 'keywords' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            Add Keywords
          </h2>
          <p className="text-sm text-slate-600">
            Add keywords to search for (comma-separated for multiple)
          </p>

          <div className="flex gap-2">
            <Input
              placeholder="e.g., AI, Crypto, Tech News"
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createKeywords()}
              className="flex-1"
            />
            <Button onClick={createKeywords} disabled={!keywordInput.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {settings.keywords.length > 0 && (
            <div className="space-y-2">
              {settings.keywords.map(keyword => (
                <div
                  key={keyword.id}
                  className="flex items-center justify-between p-3 border rounded-md bg-white"
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={keyword.enabled}
                      onCheckedChange={() => toggleKeyword(keyword.id)}
                    />
                    <span
                      className={
                        keyword.enabled ? 'text-slate-900' : 'text-slate-400'
                      }
                    >
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
      )}

      {/* Search Instructions Tab */}
      {activeSubTab === 'search-instructions' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            Search Instructions
          </h2>
          <p className="text-sm text-slate-600">
            Customize how the AI searches for each keyword
          </p>
          <Textarea
            value={settings.searchInstructions}
            onChange={e => setSearchInstructions(e.target.value)}
            rows={12}
            placeholder="Enter search instructions..."
            className="font-mono text-sm"
          />
        </div>
      )}

      {/* Categories Tab */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 text-slate-400">
            Categories
          </h2>
          <p className="text-sm text-slate-500">
            This feature is coming soon. Categories will display all
            auto-generated categories from your reports with additional data and
            insights.
          </p>
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
            <FolderOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">
              Categories Feature Coming Soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
