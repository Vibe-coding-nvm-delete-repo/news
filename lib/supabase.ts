import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;
let configuredUrl: string | null = null;
let configuredAnonKey: string | null = null;

function readLocalStorageConfig(): { url: string | null; anonKey: string | null } {
  if (typeof window === "undefined" || !(window as any).localStorage) {
    return { url: null, anonKey: null };
  }
  try {
    const url = window.localStorage.getItem("supabaseUrl");
    const anonKey = window.localStorage.getItem("supabaseAnonKey");
    return { url: url || null, anonKey: anonKey || null };
  } catch {
    return { url: null, anonKey: null };
  }
}

export function getSupabaseConfig(): { url: string | null; anonKey: string | null } {
  if (configuredUrl && configuredAnonKey) {
    return { url: configuredUrl, anonKey: configuredAnonKey };
  }
  const stored = readLocalStorageConfig();
  if (stored.url && stored.anonKey) {
    return stored;
  }
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const envAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
  return { url: envUrl, anonKey: envAnon };
}

export function configureSupabase(url: string, anonKey: string): void {
  configuredUrl = url;
  configuredAnonKey = anonKey;
  if (typeof window !== "undefined" && (window as any).localStorage) {
    try {
      window.localStorage.setItem("supabaseUrl", url);
      window.localStorage.setItem("supabaseAnonKey", anonKey);
    } catch {}
  }
  // Reset instance so next access uses fresh config
  supabaseInstance = null;
}

export function clearSupabaseConfig(): void {
  configuredUrl = null;
  configuredAnonKey = null;
  if (typeof window !== "undefined" && (window as any).localStorage) {
    try {
      window.localStorage.removeItem("supabaseUrl");
      window.localStorage.removeItem("supabaseAnonKey");
    } catch {}
  }
  supabaseInstance = null;
}

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Open Settings → Supabase Configuration, enter your Supabase URL and anon key, then validate."
    );
  }

  supabaseInstance = createClient(url, anonKey);
  return supabaseInstance;
}

// Export using a Proxy to lazy-load the client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, _receiver) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export type Database = {
  settings: {
    id: number;
    api_key: string | null;
    selected_model: string | null;
    search_instructions: string;
    format_prompt: string;
    created_at: string;
    updated_at: string;
  };
  keywords: {
    id: string;
    text: string;
    enabled: boolean;
    created_at: string;
  };
  reports: {
    id: string;
    created_at: string;
    total_cost: number;
    stage1_results: any;
    stage2_result: any;
  };
  stories: {
    id: string;
    report_id: string;
    title: string;
    rating: number;
    summary: string;
    source: string | null;
    url: string | null;
    date: string | null;
    archived: boolean;
    created_at: string;
  };
};
