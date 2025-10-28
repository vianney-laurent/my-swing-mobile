// Service vidéo pour React Native - Compatible avec Supabase
import { supabase } from '../supabase/client';

export interface VideoUrlResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

export class MobileVideoService {
  /**
   * Vérifie si une URL Supabase nécessite une signature
   */
  needsSignedUrl(url: string): boolean {
    return url.includes('supabase.co/storage/v1/object/public/videos/') && 
           !url.includes('/sign/');
  }

  /**
   * Obtient une URL accessible pour une vidéo
   * Pour le mobile, on utilise directement l'URL publique Supabase
   */
  async getAccessibleVideoUrl(videoUrl: string): Promise<string> {
    try {
      console.log('🎥 [VideoService] Processing video URL:', videoUrl.substring(0, 100) + '...');

      // Pour le mobile, on peut souvent utiliser directement l'URL publique
      // Si c'est une URL Supabase publique, elle devrait fonctionner
      if (videoUrl.includes('supabase.co/storage/v1/object/public/')) {
        console.log('✅ [VideoService] Using public Supabase URL');
        return videoUrl;
      }

      // Si c'est une autre URL, on la retourne telle quelle
      console.log('✅ [VideoService] Using original URL');
      return videoUrl;

    } catch (error) {
      console.error('❌ [VideoService] Error processing video URL:', error);
      // En cas d'erreur, retourner l'URL originale
      return videoUrl;
    }
  }

  /**
   * Génère une URL signée si nécessaire (pour les cas où l'URL publique ne fonctionne pas)
   */
  async getSignedVideoUrl(videoUrl: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('🔑 [VideoService] Requesting signed URL...');

      // Extraire le chemin du fichier depuis l'URL Supabase
      const urlParts = videoUrl.split('/storage/v1/object/public/videos/');
      if (urlParts.length !== 2) {
        throw new Error('Invalid Supabase video URL format');
      }

      const filePath = urlParts[1];
      console.log('📁 [VideoService] File path:', filePath);

      // Générer une URL signée via Supabase
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(filePath, 3600); // 1 heure d'expiration

      if (error) {
        console.error('❌ [VideoService] Supabase signed URL error:', error);
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error('No signed URL returned from Supabase');
      }

      console.log('✅ [VideoService] Signed URL generated successfully');
      return data.signedUrl;

    } catch (error) {
      console.error('❌ [VideoService] Failed to get signed URL:', error);
      // Fallback: retourner l'URL originale
      return videoUrl;
    }
  }

  /**
   * Teste si une URL vidéo est accessible
   */
  async testVideoUrl(url: string): Promise<boolean> {
    try {
      console.log('🧪 [VideoService] Testing video URL accessibility...');
      
      // Pour React Native, on peut faire un simple fetch HEAD pour tester
      const response = await fetch(url, { method: 'HEAD' });
      const isAccessible = response.ok;
      
      console.log(`${isAccessible ? '✅' : '❌'} [VideoService] Video URL test result:`, isAccessible);
      return isAccessible;
      
    } catch (error) {
      console.error('❌ [VideoService] Video URL test failed:', error);
      return false;
    }
  }

  /**
   * Obtient la meilleure URL vidéo disponible avec fallbacks
   */
  async getBestVideoUrl(videoUrl: string): Promise<string> {
    try {
      console.log('🎯 [VideoService] Getting best video URL...');

      // 1. Essayer l'URL originale d'abord
      const isOriginalAccessible = await this.testVideoUrl(videoUrl);
      if (isOriginalAccessible) {
        console.log('✅ [VideoService] Original URL is accessible');
        return videoUrl;
      }

      // 2. Si l'URL originale ne fonctionne pas et c'est une URL Supabase, essayer une URL signée
      if (this.needsSignedUrl(videoUrl)) {
        console.log('🔑 [VideoService] Trying signed URL...');
        const signedUrl = await this.getSignedVideoUrl(videoUrl);
        
        const isSignedAccessible = await this.testVideoUrl(signedUrl);
        if (isSignedAccessible) {
          console.log('✅ [VideoService] Signed URL is accessible');
          return signedUrl;
        }
      }

      // 3. Fallback: retourner l'URL originale même si elle n'est pas testée comme accessible
      console.log('⚠️ [VideoService] Using original URL as fallback');
      return videoUrl;

    } catch (error) {
      console.error('❌ [VideoService] Error getting best video URL:', error);
      return videoUrl;
    }
  }
}

export const mobileVideoService = new MobileVideoService();