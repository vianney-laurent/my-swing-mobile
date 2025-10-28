// Analysis service for mobile - integrates with existing backend
import { supabase } from '../supabase/client';
import { config } from '../config';

export interface VideoAnalysisRequest {
  videoUri: string;
  userId: string;
  golfLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface AnalysisResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export class AnalysisService {
  // Upload video to Supabase storage
  static async uploadVideo(videoUri: string, userId: string): Promise<string | null> {
    try {
      // Create unique filename
      const timestamp = Date.now();
      const filename = `${userId}/${timestamp}.mp4`;

      // Read video file (React Native specific)
      const response = await fetch(videoUri);
      const blob = await response.blob();

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filename, blob, {
          contentType: 'video/mp4',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('Video upload failed:', error);
      return null;
    }
  }

  // Create analysis record in database
  static async createAnalysis(videoUrl: string, userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .insert({
          user_id: userId,
          video_url: videoUrl,
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Create analysis error:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Create analysis failed:', error);
      return null;
    }
  }

  // Trigger analysis via your existing API
  static async triggerAnalysis(analysisId: string, videoUrl: string): Promise<boolean> {
    try {
      // Call your existing Vercel API endpoint
      const response = await fetch(`${config.frameExtraction.serverUrl}/api/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId,
          videoUrl,
          // Add other parameters as needed
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Trigger analysis failed:', error);
      return false;
    }
  }

  // Complete analysis workflow
  static async analyzeVideo({ videoUri, userId, golfLevel }: VideoAnalysisRequest): Promise<AnalysisResult | null> {
    try {
      // Step 1: Upload video
      const videoUrl = await this.uploadVideo(videoUri, userId);
      if (!videoUrl) {
        return {
          id: '',
          status: 'failed',
          error: 'Échec de l\'upload de la vidéo'
        };
      }

      // Step 2: Create analysis record
      const analysisId = await this.createAnalysis(videoUrl, userId);
      if (!analysisId) {
        return {
          id: '',
          status: 'failed',
          error: 'Échec de la création de l\'analyse'
        };
      }

      // Step 3: Trigger analysis
      const triggered = await this.triggerAnalysis(analysisId, videoUrl);
      if (!triggered) {
        return {
          id: analysisId,
          status: 'failed',
          error: 'Échec du déclenchement de l\'analyse'
        };
      }

      return {
        id: analysisId,
        status: 'processing'
      };
    } catch (error) {
      console.error('Analysis workflow failed:', error);
      return {
        id: '',
        status: 'failed',
        error: 'Erreur inattendue lors de l\'analyse'
      };
    }
  }

  // Get analysis status
  static async getAnalysisStatus(analysisId: string): Promise<AnalysisResult | null> {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('id, status, analysis_result')
        .eq('id', analysisId)
        .single();

      if (error) {
        console.error('Get analysis status error:', error);
        return null;
      }

      return {
        id: data.id,
        status: data.status,
        result: data.analysis_result
      };
    } catch (error) {
      console.error('Get analysis status failed:', error);
      return null;
    }
  }

  // Get user's analysis history
  static async getUserAnalyses(userId: string): Promise<AnalysisResult[]> {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('id, status, analysis_result, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get user analyses error:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        status: item.status,
        result: item.analysis_result
      }));
    } catch (error) {
      console.error('Get user analyses failed:', error);
      return [];
    }
  }
}