/**
 * Utility functions for the News Report Generator application.
 * Provides helpers for styling, cost formatting, JSON parsing, and API key validation.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with proper precedence handling.
 * Combines clsx for conditional classes and tailwind-merge for conflict resolution.
 *
 * @param inputs - Class values to merge (strings, objects, arrays, etc.)
 * @returns Merged class string with proper Tailwind precedence
 *
 * @example
 * ```ts
 * cn('px-2 py-1', someCondition && 'bg-blue-500', { 'text-white': isActive })
 * // Returns: "px-2 py-1 bg-blue-500 text-white" (if conditions are true)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a cost value for display with 4 decimal precision.
 * Displays cost per 1 million tokens in USD.
 *
 * @param cost - The cost value to format (in USD per 1M tokens)
 * @returns Formatted cost string like "$0.0150 / 1M tokens"
 *
 * @example
 * ```ts
 * formatCost(0.015) // Returns: "$0.0150 / 1M tokens"
 * formatCost(1.5)   // Returns: "$1.5000 / 1M tokens"
 * ```
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)} / 1M tokens`;
}

/**
 * Robustly parses JSON from AI model responses with multiple fallback strategies.
 * Handles various response formats including clean JSON, markdown-wrapped, and text-embedded JSON.
 *
 * Strategy sequence:
 * 1. Direct JSON.parse (for clean responses)
 * 2. Strip markdown code blocks (```json ... ```)
 * 3. Extract JSON object from surrounding text (finds {...})
 *
 * @param text - The text response potentially containing JSON
 * @returns Parsed JSON object
 * @throws {Error} If JSON cannot be extracted or parsed (includes response preview)
 *
 * @example
 * ```ts
 * // Handles clean JSON
 * parseJSON('{"stories": []}')
 *
 * // Handles markdown-wrapped
 * parseJSON('```json\n{"stories": []}\n```')
 *
 * // Handles text-embedded
 * parseJSON('Here is the data: {"stories": []} as requested')
 * ```
 */
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

/**
 * Validates OpenRouter API key format.
 * Checks if the key matches the expected OpenRouter pattern.
 *
 * OpenRouter keys follow the pattern: `sk-or-v1-` followed by 64 hexadecimal characters
 *
 * @param key - The API key string to validate
 * @returns `true` if the key matches the valid format, `false` otherwise
 *
 * @example
 * ```ts
 * isValidOpenRouterApiKey('sk-or-v1-' + 'a'.repeat(64)) // Returns: true
 * isValidOpenRouterApiKey('invalid-key')                // Returns: false
 * isValidOpenRouterApiKey('')                          // Returns: false
 * ```
 */
export function isValidOpenRouterApiKey(key: string): boolean {
  if (!key) return false;
  const normalized = key.trim();
  // OpenRouter keys follow: sk-or-v1- + 64 hex chars
  return /^sk-or-v1-[a-f0-9]{64}$/i.test(normalized);
}
