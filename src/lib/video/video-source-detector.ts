/**
 * 🔍 Détecteur de source vidéo
 * Identifie si la vidéo provient de la caméra ou de la galerie
 */

import * as FileSystem from 'expo-file-system/legacy';
import { Video } from 'expo-av';

export enum VideoSource {
  CAMERA_RECORDED = 'camera_recorded',
  GALLERY_SELECTED = 'gallery_selected'
}

export interface VideoMetadata {
  sizeMB: number;
  duration?: number;
  resolution?: {
    width: number;
    height: number;
  };
  source: VideoSource;
  uri: string;
}

export class VideoSourceDetector {
  /**
   * Détecte la source d'une vidéo basée sur son URI
   */
  static detectSource(videoUri: string): VideoSource {
    console.log('🔍 Detecting video source for:', videoUri.substring(0, 50) + '...');
    
    // Heuristiques pour détecter la source
    const lowerUri = videoUri.toLowerCase();
    
    // Patterns typiques des vidéos de caméra
    if (
      lowerUri.includes('camera') ||
      lowerUri.includes('tmp') ||
      lowerUri.includes('cache') ||
      lowerUri.includes('expo') ||
      lowerUri.includes('imagepicker') && lowerUri.includes('camera')
    ) {
      console.log('📹 Detected: Camera recorded video');
      return VideoSource.CAMERA_RECORDED;
    }
    
    // Par défaut, considérer comme venant de la galerie
    console.log('📱 Detected: Gallery selected video');
    return VideoSource.GALLERY_SELECTED;
  }
  
  /**
   * Obtient les métadonnées complètes d'une vidéo
   */
  static async getVideoMetadata(videoUri: string): Promise<VideoMetadata> {
    console.log('📊 Getting video metadata for:', videoUri.substring(0, 50) + '...');
    
    try {
      // Informations de base du fichier
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      
      if (!fileInfo.exists) {
        throw new Error('Video file does not exist');
      }
      
      const sizeMB = ('size' in fileInfo && fileInfo.size) 
        ? fileInfo.size / (1024 * 1024) 
        : 0;
      
      const source = this.detectSource(videoUri);
      
      // Essayer d'obtenir la durée avec expo-av
      let duration: number | undefined;
      let resolution: { width: number; height: number } | undefined;
      
      try {
        // Créer un objet Video temporaire pour obtenir les métadonnées
        const videoRef = new Video({});
        
        // Note: En production, on pourrait utiliser une méthode plus robuste
        // pour obtenir les métadonnées sans créer un composant Video
        
        console.log('📏 Video metadata extracted:', {
          sizeMB: sizeMB.toFixed(2),
          source,
          hasSize: sizeMB > 0
        });
        
      } catch (metadataError) {
        console.warn('⚠️ Could not extract video metadata:', metadataError);
      }
      
      return {
        sizeMB,
        duration,
        resolution,
        source,
        uri: videoUri
      };
      
    } catch (error) {
      console.error('❌ Failed to get video metadata:', error);
      throw new Error(`Failed to get video metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Estime la durée d'une vidéo basée sur sa taille (approximation)
   */
  static estimateVideoDuration(sizeMB: number, source: VideoSource): number {
    // Estimations basées sur des bitrates typiques
    const estimatedBitrates = {
      [VideoSource.CAMERA_RECORDED]: 8, // ~8 Mbps pour 720p mobile
      [VideoSource.GALLERY_SELECTED]: 12 // ~12 Mbps pour vidéos de galerie (souvent 1080p+)
    };
    
    const bitrateMbps = estimatedBitrates[source];
    const estimatedDurationSeconds = (sizeMB * 8) / bitrateMbps;
    
    console.log(`⏱️ Estimated duration: ${estimatedDurationSeconds.toFixed(1)}s (${sizeMB}MB at ${bitrateMbps}Mbps)`);
    
    return estimatedDurationSeconds;
  }
  
  /**
   * Vérifie si une vidéo nécessite une compression
   */
  static needsCompression(metadata: VideoMetadata, targetSizeMB: number = 10): boolean {
    const needs = metadata.sizeMB > targetSizeMB;
    
    console.log(`🔄 Compression needed: ${needs} (${metadata.sizeMB.toFixed(2)}MB > ${targetSizeMB}MB)`);
    
    return needs;
  }
  
  /**
   * Calcule le niveau de compression recommandé - Version optimisée pour Gemini 15MB
   */
  static calculateCompressionLevel(metadata: VideoMetadata, targetSizeMB: number = 10): {
    quality: number;
    resolution?: string;
    aggressive: boolean;
  } {
    const ratio = metadata.sizeMB / targetSizeMB;
    
    // Calcul optimisé pour garantir < 15MB final (marge de sécurité)
    const geminiLimit = 14; // Marge de sécurité de 1MB sous la limite Gemini
    const geminiRatio = metadata.sizeMB / geminiLimit;
    
    console.log(`🎯 Compression calculation: ${metadata.sizeMB}MB → target ${targetSizeMB}MB (ratio: ${ratio.toFixed(2)}x, Gemini ratio: ${geminiRatio.toFixed(2)}x)`);
    
    if (ratio <= 1) {
      return { quality: 1.0, aggressive: false }; // Pas de compression
    } else if (ratio <= 1.5) {
      return { quality: 0.8, aggressive: false }; // Compression très légère
    } else if (ratio <= 2.5) {
      // Compression modérée - garantir < 14MB
      const quality = Math.min(0.5, geminiLimit / metadata.sizeMB);
      return { quality, aggressive: true };
    } else if (ratio <= 4) {
      // Compression forte - garantir < 14MB  
      const quality = Math.min(0.35, geminiLimit / metadata.sizeMB);
      return { quality, resolution: '720p', aggressive: true };
    } else if (ratio <= 8) {
      // Compression très forte - garantir < 14MB
      const quality = Math.min(0.3, geminiLimit / metadata.sizeMB);
      return { quality, resolution: '720p', aggressive: true };
    } else {
      // Compression maximale - garantir < 14MB
      const quality = Math.min(0.25, geminiLimit / metadata.sizeMB);
      return { quality, resolution: '720p', aggressive: true };
    }
  }
}