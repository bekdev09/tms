
export type Profile = {
  id: string;
  email: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type DataSubmission = {
  id: string;
  user_id: string;
  row_count: number;
  submission_type: 'text' | 'textarea' | 'file';
  data: Record<string, any>;
  created_at: string;
};
