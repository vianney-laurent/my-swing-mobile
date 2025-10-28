// Analysis service for mobile - integrates with existing backend
import { supabase } from '../supabase/client';
import { Analysis } from '../../types/profile';

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
      const response = await fetch(`https://your-app-domain.vercel.app/api/analysis`, {
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

      return data.map((item: any) => ({
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

// Simplified methods for mobile compatibility - compatible avec l'interface Analysis
export class MobileAnalysisService {
  async getUserAnalyses(limit = 10): Promise<Analysis[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🔄 [Mobile] Loading analyses from database...');

      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ [Mobile] Failed to get analyses:', error);
        throw new Error(`Failed to get analyses: ${error.message}`);
      }

      console.log(`✅ [Mobile] Successfully loaded ${data?.length || 0} analyses`);
      return data || [];
    } catch (error) {
      console.error('❌ [Mobile] Error fetching analyses:', error);
      throw error;
    }
  }

  async getAnalysis(analysisId: string) {
    try {
      console.log('🔄 [Mobile] Loading analysis from database:', analysisId);

      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', analysisId)
        .single();

      if (error) {
        console.error('❌ [Mobile] Failed to get analysis:', error);
        throw new Error(`Failed to get analysis: ${error.message}`);
      }

      // Parse the stored analysis data with new structure (same as web app)
      let parsedAnalysis = data;
      if (data.gemini_response) {
        try {
          const geminiData = JSON.parse(data.gemini_response);
          const swingData = data.swing_data || {};
          
          parsedAnalysis = {
            ...data,
            // New structure from GolfAnalysisResult
            analysis: geminiData,
            frameUrls: data.frames_urls || [],
            metadata: {
              userLevel: swingData.userLevel || 'intermediate',
              confidence: geminiData.confidence || 0,
              videoProcessingTime: swingData.videoProcessingTime || 0,
              totalTime: swingData.totalTime || 0,
              videoMethod: swingData.videoMethod || 'unknown',
              videoSize: swingData.videoSize || 0,
              videoHash: swingData.videoHash || ''
            },
            // Legacy compatibility
            strengths: geminiData.strengths || [],
            areasForImprovement: geminiData.criticalIssues || [],
            specificTips: geminiData.actionableAdvice || [],
            technicalAnalysis: geminiData.frameAnalysis || [],
            nextSteps: geminiData.immediateActions || {}
          };
        } catch (parseError) {
          console.error('❌ [Mobile] Failed to parse gemini_response:', parseError);
        }
      }

      console.log('✅ [Mobile] Analysis loaded successfully');
      return parsedAnalysis;
    } catch (error) {
      console.error('❌ [Mobile] Error fetching analysis:', error);
      throw error;
    }
  }
}

export const mobileAnalysisService = new MobileAnalysisService();

export const analysisService = new AnalysisService();