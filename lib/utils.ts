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

export function isValidOpenRouterApiKey(key: string): boolean {
  if (!key) return false;
  const normalized = key.trim();
  // OpenRouter keys follow: sk-or-v1- + 64 hex chars
  return /^sk-or-v1-[a-f0-9]{64}$/i.test(normalized);
}

export function isValidSupabaseUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "https:") return false;
    if (!u.hostname || u.hostname.length < 3) return false;
    return true;
  } catch {
    return false;
  }
}

export function isValidSupabaseAnonKey(key: string): boolean {
  if (!key) return false;
  const normalized = key.trim();
  // Supabase anon keys are JWTs: header.payload.signature (base64url)
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(normalized);
}
