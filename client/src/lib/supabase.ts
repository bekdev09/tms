import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type DataSubmission = {
  id: string;
  user_id: string;
  row_count: number;
  submission_type: 'text' | 'textarea' | 'file';
  data: Record<string, any>;
  created_at: string;
};
