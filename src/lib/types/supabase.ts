// Supabase database types - simplified for mobile
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          golf_level: 'beginner' | 'intermediate' | 'advanced';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          golf_level?: 'beginner' | 'intermediate' | 'advanced';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          golf_level?: 'beginner' | 'intermediate' | 'advanced';
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          video_url: string;
          analysis_result: any;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_url: string;
          analysis_result?: any;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          analysis_result?: any;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          updated_at?: string;
        };
      };
    };
  };
}