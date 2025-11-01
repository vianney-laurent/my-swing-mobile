import { VideoUploadService, CaptureMetadata } from '../video/video-upload-service';
import { SmartVideoProcessor } from '../video/smart-video-processor';
import { AnalysisJobService, SwingContext, AnalysisJobResponse, JobStatus } from './analysis-job-service';
import { supabase } from '../supabase/client';
import { Analysis } from '../../types/profile';

export interface UnifiedAnalysisRequest {
  videoUri: string;
  context: SwingContext;
  captureMetadata: CaptureMetadata;
}

export interface UnifiedAnalysisResult {
  success: boolean;
  jobId?: string;
  analysisId?: string;
  isSync?: boolean;
  error?: string;
}

/**
 * Unified Analysis Service - New workflow with Edge Functions
 * Replaces the old analysis service with the new backend architecture
 */
export class UnifiedAnalysisService {
  
  /**
   * Complete analysis workflow: Upload + Analysis
   */
  static async analyzeVideo(request: UnifiedAnalysisRequest): Promise<UnifiedAnalysisResult> {
    try {
      console.log('🎬 [Unified] Starting new analysis workflow...');

      // Step 1: Smart video processing and upload
      console.log('📤 [Unified] Processing and uploading video...');
      const uploadResult = await SmartVideoProcessor.processAndUpload(
        request.videoUri,
        request.captureMetadata
      );

      if (!uploadResult.success || !uploadResult.videoPath) {
        return {
          success: false,
          error: `Upload failed: ${uploadResult.error}`
        };
      }

      console.log('✅ [Unified] Video uploaded:', uploadResult.videoPath);

      // Step 2: Submit analysis job
      console.log('🧠 [Unified] Submitting analysis job...');
      const jobResult = await AnalysisJobService.submitAnalysis({
        videoPath: uploadResult.videoPath,
        context: request.context,
        captureMetadata: request.captureMetadata
      });

      if (!jobResult.success) {
        return {
          success: false,
          error: `Analysis submission failed: ${jobResult.error}`
        };
      }

      console.log('✅ [Unified] Analysis job submitted:', jobResult.jobId);

      return {
        success: true,
        jobId: jobResult.jobId,
        analysisId: jobResult.analysisId,
        isSync: jobResult.isSync
      };

    } catch (error) {
      console.error('❌ [Unified] Analysis workflow failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get job status
   */
  static async getJobStatus(jobId: string): Promise<JobStatus | null> {
    return AnalysisJobService.getJobStatus(jobId);
  }

  /**
   * Subscribe to job updates
   */
  static subscribeToJobUpdates(
    jobId: string,
    onUpdate: (status: JobStatus) => void,
    onError?: (error: Error) => void
  ) {
    return AnalysisJobService.subscribeToJobUpdates(jobId, onUpdate, onError);
  }

  /**
   * Get analysis by ID (compatible with existing interface)
   */
  static async getAnalysis(analysisId: string): Promise<Analysis | null> {
    try {
      console.log('🔄 [Unified] Loading analysis:', analysisId);

      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', analysisId)
        .single();

      if (error) {
        console.error('❌ [Unified] Failed to get analysis:', error);
        return null;
      }

      // Transform to expected format
      return await this.transformAnalysisData(data);

    } catch (error) {
      console.error('❌ [Unified] Error fetching analysis:', error);
      return null;
    }
  }

  /**
   * Get user's analysis history
   */
  static async getUserAnalyses(limit: number = 10): Promise<Analysis[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🔄 [Unified] Loading user analyses...');

      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ [Unified] Failed to get analyses:', error);
        throw new Error(`Failed to get analyses: ${error.message}`);
      }

      console.log(`✅ [Unified] Loaded ${data?.length || 0} analyses`);
      
      // Transform each analysis data (async)
      const transformedAnalyses = [];
      if (data) {
        for (const item of data) {
          const transformed = await this.transformAnalysisData(item);
          transformedAnalyses.push(transformed);
        }
      }
      
      return transformedAnalyses;

    } catch (error) {
      console.error('❌ [Unified] Error fetching analyses:', error);
      throw error;
    }
  }

  /**
   * Get user's recent jobs
   */
  static async getUserJobs(limit: number = 10): Promise<JobStatus[]> {
    return AnalysisJobService.getUserJobs(limit);
  }

  /**
   * Transform database analysis data to expected format
   */
  private static async transformAnalysisData(data: any): Promise<Analysis> {
    let parsedAnalysis = data;

    // Generate fresh signed URL for video
    if (data.video_url) {
      let videoPath = data.video_url;
      
      // If it's a signed URL (old format), extract the path
      if (data.video_url.includes('sign/')) {
        console.log('🔍 [Unified] Extracting path from signed URL...');
        
        // Extract path from signed URL: /storage/v1/object/sign/videos/path?token=...
        const pathMatch = data.video_url.match(/\/storage\/v1\/object\/sign\/videos\/(.+?)\?/);
        if (pathMatch) {
          videoPath = pathMatch[1];
          console.log('✅ [Unified] Extracted path:', videoPath);
        } else {
          // Try alternative pattern for different URL formats
          const altPathMatch = data.video_url.match(/videos\/(.+?)(?:\?|$)/);
          if (altPathMatch) {
            videoPath = altPathMatch[1];
            console.log('✅ [Unified] Extracted path (alternative pattern):', videoPath);
          } else {
            console.warn('⚠️ [Unified] Could not extract path from signed URL:', data.video_url.substring(0, 100));
            // Keep original URL as fallback
            return parsedAnalysis;
          }
        }
      }
      
      // Generate fresh signed URL from path
      try {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('videos')
          .createSignedUrl(videoPath, 3600); // 1 hour expiry

        if (signedUrlError) {
          if (signedUrlError.message?.includes('Object not found')) {
            console.warn('⚠️ [Unified] Video file no longer exists in storage');
            // Set video_url to null to indicate missing video
            parsedAnalysis.video_url = null;
          } else {
            console.error('❌ [Unified] Supabase error generating signed URL:', signedUrlError);
          }
        } else if (signedUrlData?.signedUrl) {
          parsedAnalysis.video_url = signedUrlData.signedUrl;
          console.log('✅ [Unified] Generated fresh signed URL for video');
        } else {
          console.warn('⚠️ [Unified] No signed URL returned from Supabase');
        }
      } catch (error) {
        console.error('❌ [Unified] Error generating signed URL:', error);
      }
    }

    // Parse gemini_response (new format) or analysis_data (legacy)
    const responseData = data.gemini_response || data.analysis_data;
    
    if (responseData && typeof responseData === 'string') {
      try {
        const analysisData = JSON.parse(responseData);
        parsedAnalysis = {
          ...parsedAnalysis,
          analysis: analysisData,
          frameUrls: data.frames_urls || [],
          
          // New format compatibility (from Edge Function)
          strengths: analysisData.strengths || [],
          areasForImprovement: analysisData.criticalIssues || [],
          specificTips: analysisData.actionableAdvice || [],
          technicalAnalysis: analysisData.swingAnalysis || {},
          nextSteps: analysisData.immediateActions || {},
          
          // Legacy compatibility
          ...(analysisData.key_insights && {
            strengths: analysisData.key_insights.filter((i: any) => i.severity === 'positive') || [],
            areasForImprovement: analysisData.key_insights.filter((i: any) => i.severity === 'needs_attention') || [],
          })
        };
      } catch (parseError) {
        console.error('❌ [Unified] Failed to parse response data:', parseError);
      }
    } else if (responseData) {
      // Already parsed
      parsedAnalysis = {
        ...parsedAnalysis,
        analysis: responseData,
        frameUrls: data.frames_urls || []
      };
    }

    console.log('✅ [Unified] Transformed analysis data:', {
      id: parsedAnalysis.id,
      hasGeminiResponse: !!data.gemini_response,
      hasAnalysisData: !!data.analysis_data,
      hasVideoUrl: !!parsedAnalysis.video_url,
      strengthsCount: parsedAnalysis.strengths?.length || 0,
      issuesCount: parsedAnalysis.areasForImprovement?.length || 0
    });

    return parsedAnalysis;
  }

  /**
   * Delete video from storage (cleanup)
   */
  static async deleteVideo(videoPath: string): Promise<boolean> {
    return VideoUploadService.deleteVideo(videoPath);
  }

  /**
   * Delete analysis and associated video
   */
  static async deleteAnalysis(analysisId: string): Promise<boolean> {
    try {
      console.log('🗑️ [Unified] Deleting analysis:', analysisId);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get analysis details first to get video path
      const { data: analysis, error: getError } = await supabase
        .from('analyses')
        .select('video_url')
        .eq('id', analysisId)
        .eq('user_id', user.id) // Security: only delete own analyses
        .single();

      if (getError) {
        console.error('❌ [Unified] Failed to get analysis for deletion:', getError);
        throw new Error('Analysis not found or access denied');
      }

      // Extract video path if exists
      let videoPath = null;
      if (analysis.video_url) {
        if (analysis.video_url.includes('sign/')) {
          // Extract path from signed URL
          const pathMatch = analysis.video_url.match(/\/storage\/v1\/object\/sign\/videos\/(.+?)\?/);
          if (pathMatch) {
            videoPath = pathMatch[1];
          }
        } else {
          // It's already a path
          videoPath = analysis.video_url;
        }
      }

      // Delete video file if exists
      if (videoPath) {
        console.log('🗑️ [Unified] Deleting video file:', videoPath);
        try {
          const { error: deleteVideoError } = await supabase.storage
            .from('videos')
            .remove([videoPath]);

          if (deleteVideoError) {
            console.warn('⚠️ [Unified] Failed to delete video file:', deleteVideoError);
            // Continue with analysis deletion even if video deletion fails
          } else {
            console.log('✅ [Unified] Video file deleted successfully');
          }
        } catch (videoError) {
          console.warn('⚠️ [Unified] Error deleting video file:', videoError);
          // Continue with analysis deletion
        }
      }

      // Delete analysis from database
      const { error: deleteError } = await supabase
        .from('analyses')
        .delete()
        .eq('id', analysisId)
        .eq('user_id', user.id); // Security: only delete own analyses

      if (deleteError) {
        console.error('❌ [Unified] Failed to delete analysis:', deleteError);
        throw new Error(`Failed to delete analysis: ${deleteError.message}`);
      }

      console.log('✅ [Unified] Analysis deleted successfully');
      return true;

    } catch (error) {
      console.error('❌ [Unified] Error deleting analysis:', error);
      throw error;
    }
  }

  /**
   * Get video URL for viewing
   */
  static async getVideoUrl(videoPath: string): Promise<string | null> {
    return VideoUploadService.getVideoUrl(videoPath);
  }
}

// Export singleton instance for compatibility
export const unifiedAnalysisService = new UnifiedAnalysisService();