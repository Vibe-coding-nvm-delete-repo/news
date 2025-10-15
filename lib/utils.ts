import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)} / 1M tokens`;
}

export function parseJSON(text: string): any {
  try {
    // Strategy 1: Direct parse
    return JSON.parse(text);
  } catch {
    try {
      // Strategy 2: Strip markdown code blocks
      const stripped = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(stripped);
    } catch {
      throw new Error("Failed to parse JSON response");
    }
  }
}
