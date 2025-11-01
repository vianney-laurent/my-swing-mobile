// Service vidéo pour React Native - Compatible avec Supabase
import { supabase } from '../supabase/client';

export interface VideoUrlResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

export class MobileVideoService {
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second
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
   * Teste si une URL vidéo est accessible avec retry
   */
  async testVideoUrl(url: string, attempt: number = 1): Promise<boolean> {
    try {
      console.log(`🧪 [VideoService] Testing video URL accessibility (attempt ${attempt}/${this.retryAttempts})...`);
      console.log('🔗 [VideoService] Testing URL:', url.substring(0, 100) + '...');
      
      // Pour React Native, on peut faire un simple fetch HEAD pour tester
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'Accept': 'video/*',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📊 [VideoService] Response status:', response.status);
      console.log('📊 [VideoService] Response headers:', Object.fromEntries(response.headers.entries()));
      
      const isAccessible = response.ok;
      
      console.log(`${isAccessible ? '✅' : '❌'} [VideoService] Video URL test result:`, isAccessible);
      return isAccessible;
      
    } catch (error) {
      console.error(`❌ [VideoService] Video URL test failed (attempt ${attempt}):`, error);
      
      // Retry logic
      if (attempt < this.retryAttempts) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`⏳ [VideoService] Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.testVideoUrl(url, attempt + 1);
      }
      
      console.error('❌ [VideoService] All retry attempts failed');
      return false;
    }
  }

  /**
   * Diagnostique une URL vidéo pour identifier les problèmes
   */
  async diagnoseVideoUrl(videoUrl: string): Promise<{
    url: string;
    isSupabaseUrl: boolean;
    needsSigning: boolean;
    isAccessible: boolean;
    error?: string;
  }> {
    try {
      console.log('🔍 [VideoService] Diagnosing video URL...');
      
      const isSupabaseUrl = videoUrl.includes('supabase.co/storage/');
      const needsSigning = this.needsSignedUrl(videoUrl);
      
      console.log('📋 [VideoService] URL Analysis:');
      console.log('  - Is Supabase URL:', isSupabaseUrl);
      console.log('  - Needs signing:', needsSigning);
      console.log('  - URL length:', videoUrl.length);
      console.log('  - URL preview:', videoUrl.substring(0, 100) + '...');
      
      const isAccessible = await this.testVideoUrl(videoUrl);
      
      return {
        url: videoUrl,
        isSupabaseUrl,
        needsSigning,
        isAccessible,
      };
      
    } catch (error) {
      console.error('❌ [VideoService] Diagnosis failed:', error);
      return {
        url: videoUrl,
        isSupabaseUrl: false,
        needsSigning: false,
        isAccessible: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Obtient la meilleure URL vidéo disponible avec fallbacks
   */
  async getBestVideoUrl(videoUrl: string): Promise<string> {
    try {
      console.log('🎯 [VideoService] Getting best video URL...');

      // Diagnostiquer l'URL d'abord
      const diagnosis = await this.diagnoseVideoUrl(videoUrl);
      console.log('🔍 [VideoService] Diagnosis result:', diagnosis);

      // 1. Essayer l'URL originale d'abord
      if (diagnosis.isAccessible) {
        console.log('✅ [VideoService] Original URL is accessible');
        return videoUrl;
      }

      // 2. Si l'URL est expirée (status 400) ou inaccessible, essayer de régénérer
      if (diagnosis.isSupabaseUrl) {
        console.log('🔄 [VideoService] Supabase URL not accessible, trying to regenerate...');
        
        // Essayer de régénérer une URL signée depuis le chemin
        const regeneratedUrl = await this.regenerateVideoUrl(videoUrl);
        if (regeneratedUrl && regeneratedUrl !== videoUrl) {
          const isRegeneratedAccessible = await this.testVideoUrl(regeneratedUrl);
          if (isRegeneratedAccessible) {
            console.log('✅ [VideoService] Regenerated URL is accessible');
            return regeneratedUrl;
          }
        }
      }

      // 3. Si c'est une URL signée expirée, essayer de créer une nouvelle
      if (diagnosis.needsSigning) {
        console.log('🔑 [VideoService] Trying signed URL...');
        try {
          const signedUrl = await this.getSignedVideoUrl(videoUrl);
          
          const isSignedAccessible = await this.testVideoUrl(signedUrl);
          if (isSignedAccessible) {
            console.log('✅ [VideoService] Signed URL is accessible');
            return signedUrl;
          } else {
            console.log('❌ [VideoService] Signed URL is not accessible');
          }
        } catch (signedUrlError) {
          console.error('❌ [VideoService] Failed to create signed URL:', signedUrlError);
        }
      }

      // 4. Fallback: retourner l'URL originale même si elle n'est pas testée comme accessible
      console.log('⚠️ [VideoService] Using original URL as fallback');
      return videoUrl;

    } catch (error) {
      console.error('❌ [VideoService] Error getting best video URL:', error);
      return videoUrl;
    }
  }

  /**
   * Tente de régénérer une URL vidéo depuis un chemin ou une URL expirée
   */
  async regenerateVideoUrl(videoUrl: string): Promise<string> {
    try {
      // Extraire le chemin depuis l'URL
      let videoPath = videoUrl;
      
      // Si c'est une URL signée, extraire le chemin original
      if (videoUrl.includes('/storage/v1/object/sign/videos/')) {
        const pathMatch = videoUrl.match(/\/storage\/v1\/object\/sign\/videos\/(.+?)\?/);
        if (pathMatch) {
          videoPath = pathMatch[1];
          console.log('🔍 [VideoService] Extracted path from signed URL:', videoPath);
        }
      } else if (videoUrl.includes('/storage/v1/object/public/videos/')) {
        const pathMatch = videoUrl.match(/\/storage\/v1\/object\/public\/videos\/(.+)$/);
        if (pathMatch) {
          videoPath = pathMatch[1];
          console.log('🔍 [VideoService] Extracted path from public URL:', videoPath);
        }
      }

      // Générer une nouvelle URL signée
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(videoPath, 3600); // 1 heure

      if (error || !data?.signedUrl) {
        console.error('❌ [VideoService] Failed to regenerate URL:', error);
        return videoUrl; // Retourner l'URL originale
      }

      console.log('✅ [VideoService] Successfully regenerated video URL');
      return data.signedUrl;

    } catch (error) {
      console.error('❌ [VideoService] Error regenerating video URL:', error);
      return videoUrl;
    }
  }
}

export const mobileVideoService = new MobileVideoService();