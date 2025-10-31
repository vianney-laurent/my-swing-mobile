/**
 * 🔗 Helper pour les URLs vidéo mobile
 * Génère des URLs signées pour l'accès serveur GCP
 */

import { supabase } from '../supabase/client';

export class VideoUrlHelper {
  
  /**
   * Convertit une URL publique Supabase en URL signée pour l'accès serveur
   */
  static async getAccessibleVideoUrl(videoUrl: string): Promise<string> {
    console.log(`🔗 Processing video URL for server access...`);
    console.log(`📹 Original URL: ${videoUrl}`);
    
    try {
      // Si ce n'est pas une URL Supabase, la retourner telle quelle
      if (!this.isSupabaseUrl(videoUrl)) {
        console.log('✅ Non-Supabase URL, using as-is');
        return videoUrl;
      }
      
      // Si c'est déjà une URL signée, la retourner telle quelle
      if (this.isSignedUrl(videoUrl)) {
        console.log('✅ Already signed URL, using as-is');
        return videoUrl;
      }
      
      // Extraire le chemin du fichier depuis l'URL publique
      const filePath = this.extractFilePathFromUrl(videoUrl);
      if (!filePath) {
        throw new Error('Could not extract file path from URL');
      }
      
      console.log(`📁 Extracted file path: ${filePath}`);
      
      // Générer une URL signée (valide 2 heures)
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(filePath, 7200); // 2 heures
      
      if (error || !data) {
        throw new Error(`Failed to create signed URL: ${error?.message}`);
      }
      
      console.log('✅ Generated signed URL successfully');
      console.log(`🔐 Signed URL: ${data.signedUrl.substring(0, 100)}...`);
      
      return data.signedUrl;
      
    } catch (error) {
      console.error('❌ Failed to get accessible video URL:', error);
      console.log('⚠️ Falling back to original URL');
      return videoUrl;
    }
  }
  
  /**
   * Vérifie si l'URL est une URL Supabase
   */
  private static isSupabaseUrl(url: string): boolean {
    return url.includes('supabase.co/storage/v1/object/public/videos/');
  }
  
  /**
   * Vérifie si l'URL est déjà signée
   */
  private static isSignedUrl(url: string): boolean {
    return url.includes('/sign/') && url.includes('token=');
  }
  
  /**
   * Extrait le chemin du fichier depuis une URL publique Supabase
   */
  private static extractFilePathFromUrl(publicUrl: string): string | null {
    try {
      // Format: https://project.supabase.co/storage/v1/object/public/videos/user-id/file.mp4
      const match = publicUrl.match(/\/storage\/v1\/object\/public\/videos\/(.+)$/);
      return match ? match[1] : null;
    } catch (error) {
      console.error('❌ Error extracting file path:', error);
      return null;
    }
  }
  
  /**
   * Valide qu'une URL est accessible
   */
  static async validateUrlAccess(url: string): Promise<boolean> {
    try {
      console.log('🔍 Validating URL access...');
      const response = await fetch(url, { method: 'HEAD' });
      const isAccessible = response.ok;
      
      if (isAccessible) {
        console.log('✅ URL is accessible');
      } else {
        console.log(`❌ URL not accessible: ${response.status} ${response.statusText}`);
      }
      
      return isAccessible;
    } catch (error) {
      console.log('❌ URL validation failed:', error);
      return false;
    }
  }
}

export const videoUrlHelper = VideoUrlHelper;