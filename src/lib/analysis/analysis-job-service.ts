import { supabase } from '../supabase/client';
import 'react-native-get-random-values';
import type { CaptureMetadata } from '../video/video-upload-service';

// Simple UUID v4 generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface SwingContext {
  club: string;
  shotType: 'driver' | 'iron' | 'wedge' | 'putter';
  targetDistance?: number;
  conditions?: string;
  focusArea?: string;
  angle: 'face-on' | 'down-the-line';
}

export interface AnalysisJobRequest {
  videoPath: string;
  context: SwingContext;
  captureMetadata: CaptureMetadata;
}

export interface AnalysisJobResponse {
  success: boolean;
  jobId?: string;
  isSync?: boolean; // true if completed synchronously
  analysisId?: string; // if sync completion
  error?: string;
}

export interface JobStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorDetails?: string;
  analysisId?: string;
}

export class AnalysisJobService {
  private static readonly EDGE_FUNCTION_URL = '/api/analyze';

  /**
   * Submit video for analysis
   */
  static async submitAnalysis(request: AnalysisJobRequest): Promise<AnalysisJobResponse> {
    try {
      const clientRequestId = generateUUID();

      const payload = {
        videoPath: request.videoPath,
        context: request.context,
        captureMetadata: request.captureMetadata,
        clientRequestId
      };

      console.log('Submitting analysis request:', { 
        videoPath: request.videoPath, 
        clientRequestId 
      });

      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: payload
      });

      if (error) {
        console.error('Edge function error:', error);
        return { 
          success: false, 
          error: error.message || 'Analysis submission failed' 
        };
      }

      // Handle different response types
      if (data.isSync && data.analysisId) {
        // Synchronous completion
        return {
          success: true,
          jobId: data.jobId,
          isSync: true,
          analysisId: data.analysisId
        };
      } else if (data.jobId) {
        // Asynchronous processing
        return {
          success: true,
          jobId: data.jobId,
          isSync: false
        };
      } else {
        return {
          success: false,
          error: 'Invalid response from analysis service'
        };
      }

    } catch (error) {
      console.error('Analysis submission error:', error);
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
    try {
      const { data, error } = await supabase
        .from('analysis_jobs')
        .select(`
          id,
          status,
          created_at,
          started_at,
          completed_at,
          error_details,
          analyses!job_id(id)
        `)
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Failed to get job status:', error);
        return null;
      }

      return {
        id: data.id,
        status: data.status,
        createdAt: data.created_at,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        errorDetails: data.error_details,
        analysisId: data.analyses?.[0]?.id
      };

    } catch (error) {
      console.error('Error getting job status:', error);
      return null;
    }
  }

  /**
   * Subscribe to job status updates via Realtime
   */
  static subscribeToJobUpdates(
    jobId: string,
    onUpdate: (status: JobStatus) => void,
    onError?: (error: Error) => void
  ) {
    const channel = supabase
      .channel(`job:${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analysis_jobs',
          filter: `id=eq.${jobId}`
        },
        async (payload) => {
          console.log('Job update received:', payload);
          
          // Get full job status with analysis reference
          const status = await this.getJobStatus(jobId);
          if (status) {
            onUpdate(status);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to job updates:', jobId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error for job:', jobId);
          onError?.(new Error('Realtime subscription failed'));
        }
      });

    return () => {
      console.log('Unsubscribing from job updates:', jobId);
      supabase.removeChannel(channel);
    };
  }

  /**
   * Get user's recent jobs
   */
  static async getUserJobs(limit: number = 10): Promise<JobStatus[]> {
    try {
      const { data, error } = await supabase
        .from('analysis_jobs')
        .select(`
          id,
          status,
          created_at,
          started_at,
          completed_at,
          error_details,
          analyses!job_id(id)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get user jobs:', error);
        return [];
      }

      return data.map(job => ({
        id: job.id,
        status: job.status,
        createdAt: job.created_at,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        errorDetails: job.error_details,
        analysisId: job.analyses?.[0]?.id
      }));

    } catch (error) {
      console.error('Error getting user jobs:', error);
      return [];
    }
  }
}