import { supabase } from '../supabase/client';
import 'react-native-get-random-values';

// Simple UUID v4 generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface VideoUploadResult {
  success: boolean;
  videoPath?: string;
  error?: string;
}

export interface CaptureMetadata {
  fps: number;
  resolution: string;
  duration: number;
  club?: string;
  angle?: 'face-on' | 'down-the-line';
  shotType?: 'driver' | 'iron' | 'wedge' | 'putter';
  fileSize: number;
}

export class VideoUploadService {
  private static readonly BUCKET_NAME = 'videos';
  private static readonly ALLOWED_TYPES = ['video/mp4', 'video/quicktime'];

  /**
   * Upload video to Supabase Storage using signed URL
   */
  static async uploadVideo(
    videoUri: string,
    metadata: CaptureMetadata
  ): Promise<VideoUploadResult> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Generate unique filename
      const fileId = generateUUID();
      const fileName = `${user.id}/${fileId}.mp4`;

      // Log file size for information
      console.log(`📊 Uploading video: ${(metadata.fileSize / 1024 / 1024).toFixed(1)}MB`);

      // Create signed upload URL
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUploadUrl(fileName, {
          upsert: false
        });

      if (uploadError || !uploadData) {
        console.error('Failed to create signed URL:', uploadError);
        return { success: false, error: 'Failed to prepare upload' };
      }

      // Read video file
      const response = await fetch(videoUri);
      if (!response.ok) {
        return { success: false, error: 'Failed to read video file' };
      }

      const videoBlob = await response.blob();

      // Validate content type
      if (!this.ALLOWED_TYPES.includes(videoBlob.type)) {
        return { 
          success: false, 
          error: `Invalid file type. Allowed: ${this.ALLOWED_TYPES.join(', ')}` 
        };
      }

      // Upload to signed URL
      const uploadResponse = await fetch(uploadData.signedUrl, {
        method: 'PUT',
        body: videoBlob,
        headers: {
          'Content-Type': videoBlob.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text().catch(() => 'Unknown error');
        console.error('Upload failed:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorText,
          fileSize: videoBlob.size,
          fileName: fileName
        });
        
        if (uploadResponse.status === 413) {
          return { 
            success: false, 
            error: `File too large (${(videoBlob.size / 1024 / 1024).toFixed(1)}MB). Upload failed.` 
          };
        }
        
        return { 
          success: false, 
          error: `Upload failed (${uploadResponse.status}): ${errorText}` 
        };
      }

      console.log('Video uploaded successfully:', fileName);
      return { 
        success: true, 
        videoPath: fileName 
      };

    } catch (error) {
      console.error('Video upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown upload error' 
      };
    }
  }

  /**
   * Get signed URL for viewing uploaded video
   */
  static async getVideoUrl(videoPath: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(videoPath, 3600); // 1 hour expiry

      if (error) {
        console.error('Failed to get video URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting video URL:', error);
      return null;
    }
  }

  /**
   * Delete video from storage
   */
  static async deleteVideo(videoPath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([videoPath]);

      if (error) {
        console.error('Failed to delete video:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      return false;
    }
  }
}