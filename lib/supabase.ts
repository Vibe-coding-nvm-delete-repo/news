import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
