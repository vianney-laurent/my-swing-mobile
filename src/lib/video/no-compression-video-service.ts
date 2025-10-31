/**
 * Service vidéo SANS COMPRESSION pour test
 * Utilise directement les vidéos originales
 */

import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../supabase/client';

export interface VideoUploadResult {
  success: boolean;
  videoUrl?: string;
  error?: string;
  fileSize?: number;
  compressionApplied?: boolean;
}

export class NoCompressionVideoService {
  /**
   * Upload d'une vidéo SANS COMPRESSION (pour test)
   */
  static async uploadVideo(videoUri: string, analysisId?: string): Promise<VideoUploadResult> {
    try {
      console.log('🎬 [NoCompression] Starting video upload WITHOUT compression...');

      // Vérifier l'authentification
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Vérifier le fichier
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      if (!fileInfo.exists) {
        throw new Error('Video file does not exist');
      }

      const originalSize = fileInfo.size || 0;
      const originalSizeMB = originalSize / (1024 * 1024);

      console.log(`📊 [NoCompression] Original size: ${originalSizeMB.toFixed(2)}MB`);

      // VÉRIFICATION DE TAILLE CRITIQUE
      if (originalSizeMB > 50) {
        throw new Error(`Video too large: ${originalSizeMB.toFixed(2)}MB. Please use a video smaller than 50MB for testing.`);
      }

      // Lire la vidéo directement en base64 SANS compression
      console.log('📱 [NoCompression] Reading video as base64 WITHOUT compression...');
      const base64Data = await FileSystem.readAsStringAsync(videoUri, {
        encoding: 'base64',
      });

      if (!base64Data || base64Data.length === 0) {
        throw new Error('Failed to read video file');
      }

      console.log(`📊 [NoCompression] Base64 size: ${(base64Data.length / 1024).toFixed(0)}KB`);

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const fileName = analysisId 
        ? `analysis_${analysisId}_${timestamp}.mp4`
        : `video_${user.id}_${timestamp}.mp4`;

      console.log(`📁 [NoCompression] Uploading as: ${fileName}`);

      // Upload direct vers Supabase Storage SANS compression
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, decode(base64Data), {
          contentType: 'video/mp4',
          upsert: false
        });

      if (error) {
        console.error('❌ [NoCompression] Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Générer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(data.path);

      console.log('✅ [NoCompression] Video uploaded successfully');
      console.log(`📁 [NoCompression] Public URL: ${publicUrl}`);

      return {
        success: true,
        videoUrl: publicUrl,
        fileSize: originalSize,
        compressionApplied: false
      };

    } catch (error) {
      console.error('❌ [NoCompression] Upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error',
        compressionApplied: false
      };
    }
  }
}

/**
 * Décode une chaîne base64 en Uint8Array
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const noCompressionVideoService = new NoCompressionVideoService();