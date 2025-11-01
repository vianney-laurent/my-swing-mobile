import { VideoUploadService } from './video-upload-service';
import { VideoValidator } from './video-validator-unified';
import * as FileSystem from 'expo-file-system';

export interface SmartProcessResult {
  success: boolean;
  videoPath?: string;
  wasCompressed?: boolean;
  originalSize?: number;
  finalSize?: number;
  error?: string;
}

export class SmartVideoProcessor {
  /**
   * Simplified video processing: direct upload with expanded bucket capabilities
   */
  static async processAndUpload(
    videoUri: string,
    metadata: any
  ): SmartProcessResult {
    try {
      const originalSize = metadata.fileSize;
      console.log(`🎬 Processing video: ${(originalSize / 1024 / 1024).toFixed(1)}MB`);

      // With expanded bucket capabilities, upload directly
      console.log('📤 Uploading video directly (no size limits)...');
      const result = await VideoUploadService.uploadVideo(videoUri, metadata);
      
      console.log('Upload result:', {
        success: result.success,
        error: result.error,
        videoPath: result.videoPath
      });

      return {
        success: result.success,
        videoPath: result.videoPath,
        wasCompressed: false,
        originalSize,
        finalSize: originalSize,
        error: result.error
      };

    } catch (error) {
      console.error('Smart processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    }
  }

  /**
   * Get file size from URI
   */
  private static async getFileSize(videoUri: string): Promise<number> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      return fileInfo.exists ? (fileInfo.size || 0) : 0;
    } catch (error) {
      console.error('Error getting file size:', error);
      return 0;
    }
  }
}