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
 * formatCost(undefined) // Returns: "$0.0000 / 1M tokens"
 * ```
 */
export function formatCost(cost?: number): string {
  const safeCost = cost ?? 0;
  return `$${safeCost.toFixed(4)} / 1M tokens`;
}

/**
 * Robustly parses JSON from AI model responses with multiple fallback strategies.
 * Handles various response formats including clean JSON, markdown-wrapped, and text-embedded JSON.
 *
 * Strategy sequence:
 * 1. Check for empty/invalid input
 * 2. Direct JSON.parse (for clean responses)
 * 3. Strip markdown code blocks (```json ... ```)
 * 4. Extract JSON object from surrounding text (finds {...})
 * 5. Try to fix common JSON issues (trailing commas, single quotes, etc.)
 *
 * @param text - The text response potentially containing JSON
 * @returns Parsed JSON object
 * @throws {Error} If JSON cannot be extracted or parsed (includes full response for debugging)
 */
export function parseJSON(text: string): any {
  // Log the raw response for debugging
  console.log('🔍 RAW RESPONSE:', text.substring(0, 500));
  console.log('📏 RESPONSE LENGTH:', text.length);

  // Check for empty or invalid input
  if (!text || typeof text !== 'string') {
    console.error('❌ INVALID INPUT:', text);
    throw new Error(`Invalid input to parseJSON: ${typeof text} - "${text}"`);
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    console.error('❌ EMPTY RESPONSE');
    throw new Error('Empty response from AI model');
  }

  // Strategy 1: Direct parse (handles clean JSON responses)
  try {
    const parsed = JSON.parse(trimmed);
    console.log('✅ PARSED SUCCESSFULLY (Strategy 1: Direct)');
    return parsed;
  } catch (e1) {
    console.log('❌ Strategy 1 failed:', (e1 as Error).message);
  }

  // Strategy 2: Strip markdown code blocks
  try {
    const stripped = trimmed
      .replace(/```(?:json)?\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    const parsed = JSON.parse(stripped);
    console.log('✅ PARSED SUCCESSFULLY (Strategy 2: Strip markdown)');
    return parsed;
  } catch (e2) {
    console.log('❌ Strategy 2 failed:', (e2 as Error).message);
  }

  // Strategy 3: Extract JSON object from surrounding text
  try {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ PARSED SUCCESSFULLY (Strategy 3: Extract object)');
      return parsed;
    }
  } catch (e3) {
    console.log('❌ Strategy 3 failed:', (e3 as Error).message);
  }

  // Strategy 4: Try to find and extract array instead of object
  try {
    const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      const parsed = JSON.parse(arrayMatch[0]);
      console.log('✅ PARSED SUCCESSFULLY (Strategy 4: Extract array)');
      // Wrap in stories if it's a bare array
      if (Array.isArray(parsed)) {
        return { stories: parsed };
      }
      return parsed;
    }
  } catch (e4) {
    console.log('❌ Strategy 4 failed:', (e4 as Error).message);
  }

  // Strategy 5: Try to fix common JSON issues
  try {
    let fixed = trimmed;
    // Remove trailing commas
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    // Try to convert single quotes to double quotes (risky but might work)
    fixed = fixed.replace(/'/g, '"');
    const parsed = JSON.parse(fixed);
    console.log('✅ PARSED SUCCESSFULLY (Strategy 5: Fixed common issues)');
    return parsed;
  } catch (e5) {
    console.log('❌ Strategy 5 failed:', (e5 as Error).message);
  }

  // Strategy 6: Extract JSON from text with stronger pattern matching
  try {
    // Look for JSON with "stories" key specifically
    const storiesMatch = trimmed.match(/\{[\s\S]*"stories"[\s\S]*\}/);
    if (storiesMatch) {
      const parsed = JSON.parse(storiesMatch[0]);
      console.log(
        '✅ PARSED SUCCESSFULLY (Strategy 6: Extract stories object)'
      );
      return parsed;
    }
  } catch (e6) {
    console.log('❌ Strategy 6 failed:', (e6 as Error).message);
  }

  // Strategy 7: Last resort - try to find any valid JSON structure
  try {
    // Split by newlines and look for lines that start with { or [
    const lines = trimmed.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (
        (trimmedLine.startsWith('{') || trimmedLine.startsWith('[')) &&
        trimmedLine.length > 2
      ) {
        try {
          const parsed = JSON.parse(trimmedLine);
          console.log(
            '✅ PARSED SUCCESSFULLY (Strategy 7: Line-by-line search)'
          );
          if (Array.isArray(parsed)) {
            return { stories: parsed };
          }
          return parsed;
        } catch {
          // Continue to next line
        }
      }
    }
  } catch (e7) {
    console.log('❌ Strategy 7 failed:', (e7 as Error).message);
  }

  // All strategies failed - provide detailed error
  console.error('❌ ALL PARSING STRATEGIES FAILED');
  console.error('Full response:', text);
  throw new Error(
    `Failed to parse JSON response after trying all strategies.\n\n` +
      `Response length: ${text.length} characters\n` +
      `First 500 chars: "${text.substring(0, 500)}"\n\n` +
      `FULL RESPONSE:\n${text}`
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
