export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  golf_index: number | null;
  dominant_hand: 'right' | 'left' | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  golf_index: string;
  dominant_hand: 'right' | 'left' | 'none';
  city: string;
}

export interface Analysis {
  id: string;
  analysis_type: 'coaching' | 'correction';
  overall_score: number;
  status: string;
  created_at: string;
  video_url: string;
}