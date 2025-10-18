import { ModelParameters } from './store';

const REASONING_MODEL_HINTS = [
  'o1',
  'o3',
  'o4',
  'deepseek-r1',
  'reasoning',
  'qwq',
];

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const sanitizeStopSequences = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;

  const cleaned = value
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

  return cleaned.length > 0 ? cleaned : undefined;
};

const modelSupportsReasoning = (modelId?: string | null): boolean => {
  if (!modelId) return false;
  const normalized = modelId.toLowerCase();
  return REASONING_MODEL_HINTS.some(hint => normalized.includes(hint));
};

/**
 * Normalize model parameters before sending to the OpenRouter API.
 * - Removes undefined, null, empty, or invalid values so they are not serialized
 * - Converts response_format string into the OpenRouter object syntax
 * - Suppresses reasoning-only parameters for models that do not support them
 * - Excludes response_format for models with :online suffix (web search conflicts with JSON mode)
 */
export function normalizeModelParameters(
  parameters?: ModelParameters | null,
  modelId?: string | null
): Record<string, unknown> {
  if (!parameters) {
    return {};
  }

  const normalized: Record<string, unknown> = {};
  const isOnlineModel = modelId?.includes(':online') ?? false;

  if (isFiniteNumber(parameters.temperature)) {
    normalized.temperature = parameters.temperature;
  }

  if (isFiniteNumber(parameters.max_tokens) && parameters.max_tokens > 0) {
    normalized.max_tokens = Math.floor(parameters.max_tokens);
  }

  // Exclude response_format for :online models as web search conflicts with JSON mode
  if (parameters.response_format === 'json_object' && !isOnlineModel) {
    normalized.response_format = { type: 'json_object' };
  }

  if (isFiniteNumber(parameters.top_p) && parameters.top_p > 0) {
    normalized.top_p = parameters.top_p;
  }

  if (isFiniteNumber(parameters.frequency_penalty)) {
    normalized.frequency_penalty = parameters.frequency_penalty;
  }

  if (isFiniteNumber(parameters.presence_penalty)) {
    normalized.presence_penalty = parameters.presence_penalty;
  }

  const stopSequences = sanitizeStopSequences(parameters.stop);
  if (stopSequences) {
    normalized.stop = stopSequences;
  }

  if (
    isFiniteNumber(parameters.seed) &&
    Number.isInteger(parameters.seed) &&
    parameters.seed >= 0
  ) {
    normalized.seed = parameters.seed;
  }

  if (isFiniteNumber(parameters.top_k) && parameters.top_k > 0) {
    normalized.top_k = Math.floor(parameters.top_k);
  }

  if (isFiniteNumber(parameters.min_p) && parameters.min_p > 0) {
    normalized.min_p = parameters.min_p;
  }

  if (isFiniteNumber(parameters.repetition_penalty)) {
    normalized.repetition_penalty = parameters.repetition_penalty;
  }

  const supportsReasoning = modelSupportsReasoning(modelId);
  if (supportsReasoning && parameters.reasoning) {
    normalized.reasoning = { effort: parameters.reasoning };
  }

  if (supportsReasoning && parameters.include_reasoning) {
    normalized.include_reasoning = true;
  }

  return normalized;
}

export { modelSupportsReasoning };
