import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

// For backwards compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
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
