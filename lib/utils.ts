/**
 * Utility functions for the News Report Generator application.
 * Provides helpers for styling, cost formatting, JSON parsing, and API key validation.
 * Updated for deployment.
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
 * Simple JSON parsing for AI model responses.
 * Extracts stories array from model output with minimal processing.
 *
 * @param text - The text response from the AI model
 * @returns Parsed JSON object with stories array
 * @throws {Error} If JSON cannot be parsed
 */
export function parseJSON(text: string): any {
  if (!text || typeof text !== 'string') {
    throw new Error(`Invalid input to parseJSON: ${typeof text} - "${text}"`);
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new Error('Empty response from AI model');
  }

  // Try direct JSON parse first
  try {
    const parsed = JSON.parse(trimmed);
    return parsed;
  } catch (e1) {
    // Continue to extraction
  }

  // Extract JSON object from text (look for {...})
  try {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
  } catch (e2) {
    // Continue to array extraction
  }

  // Try to extract array and wrap in stories
  try {
    const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) {
        return { stories: parsed };
      }
      return parsed;
    }
  } catch (e3) {
    // Continue to error
  }

  // If all else fails, throw error with response
  throw new Error(
    `Failed to parse JSON response.\n\n` +
      `Response: "${text.substring(0, 500)}${text.length > 500 ? '...' : ''}"`
  );
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
