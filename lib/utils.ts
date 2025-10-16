import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)} / 1M tokens`;
}

export function parseJSON(text: string): any {
  try {
    // Strategy 1: Direct parse (handles clean JSON responses)
    return JSON.parse(text);
  } catch {
    try {
      // Strategy 2: Strip markdown code blocks (handles ```json ... ``` wrapped responses)
      const stripped = text
        .replace(/```(?:json)?\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      return JSON.parse(stripped);
    } catch {
      try {
        // Strategy 3: Extract JSON object from surrounding text (handles explanatory text before/after)
        // This finds the first { and last }, capturing the entire JSON object
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No JSON object found in response');
      } catch (extractError) {
        // Provide more helpful error message with response preview
        const preview = text.substring(0, 200);
        throw new Error(
          `Failed to parse JSON response. Response preview: "${preview}..."`
        );
      }
    }
  }
}

export function isValidOpenRouterApiKey(key: string): boolean {
  if (!key) return false;
  const normalized = key.trim();
  // OpenRouter keys follow: sk-or-v1- + 64 hex chars
  return /^sk-or-v1-[a-f0-9]{64}$/i.test(normalized);
}
