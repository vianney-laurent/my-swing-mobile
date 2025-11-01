/**
 * ✅ Service de validation vidéo - Version Unifiée
 * Validation basique pour le nouveau workflow (pas de limites de taille)
 */

import * as FileSystem from 'expo-file-system/legacy';
import { VideoMetadata, VideoSourceDetector, VideoSource } from './video-source-detector';

export interface ValidationResult {
  success: boolean;
  sizeMB: number;
  source: VideoSource;
  issues: ValidationIssue[];
  recommendations: string[];
  canProceed: boolean;
  needsCompression: boolean;
}

export interface ValidationIssue {
  type: 'size' | 'format' | 'duration' | 'quality' | 'access';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export class VideoValidator {
  // No size limits with new unified workflow
  static readonly MAX_DURATION_SECONDS = 30;
  static readonly MIN_DURATION_SECONDS = 3;
  
  /**
   * Valide une vidéo enregistrée avec la caméra
   */
  static async validateRecordedVideo(videoUri: string): Promise<ValidationResult> {
    console.log('📹 Validating recorded video with unified workflow...');
    
    try {
      const metadata = await VideoSourceDetector.getVideoMetadata(videoUri);
      const issues: ValidationIssue[] = [];
      const recommendations: string[] = [];
      
      // Log size for information only - no limits
      console.log(`📊 Video size: ${metadata.sizeMB.toFixed(1)}MB - processing with unified workflow`);
      recommendations.push(`✅ Vidéo de ${metadata.sizeMB.toFixed(1)}MB - traitement optimisé`);
      
      // Duration validation (informational only)
      if (metadata.duration) {
        if (metadata.duration > this.MAX_DURATION_SECONDS) {
          issues.push({
            type: 'duration',
            severity: 'info',
            message: `Vidéo longue: ${metadata.duration.toFixed(1)}s`,
            suggestion: 'Les vidéos courtes donnent parfois de meilleurs résultats'
          });
        } else if (metadata.duration < this.MIN_DURATION_SECONDS) {
          issues.push({
            type: 'duration',
            severity: 'info',
            message: `Vidéo courte: ${metadata.duration.toFixed(1)}s`,
            suggestion: 'Assurez-vous de capturer le swing complet'
          });
        }
      }
      
      // Positive recommendations
      recommendations.push('✅ Compatible avec le nouveau workflow d\'analyse');
      if (metadata.source === VideoSource.CAMERA_RECORDED) {
        recommendations.push('✅ Vidéo enregistrée avec qualité optimisée');
      }
      
      return {
        success: true, // Always success with new workflow
        sizeMB: metadata.sizeMB,
        source: metadata.source,
        issues,
        recommendations,
        canProceed: true, // Always can proceed
        needsCompression: false // Never needs compression
      };
      
    } catch (error) {
      console.error('❌ Video validation failed:', error);
      return {
        success: false,
        sizeMB: 0,
        source: VideoSource.CAMERA_RECORDED,
        issues: [{
          type: 'access',
          severity: 'error',
          message: 'Impossible de lire la vidéo',
          suggestion: 'Vérifiez que le fichier existe et est accessible'
        }],
        recommendations: [],
        canProceed: false,
        needsCompression: false
      };
    }
  }
  
  /**
   * Valide une vidéo sélectionnée depuis la galerie
   */
  static async validateGalleryVideo(videoUri: string): Promise<ValidationResult> {
    console.log('📱 Validating gallery video with unified workflow...');
    
    try {
      const metadata = await VideoSourceDetector.getVideoMetadata(videoUri);
      const issues: ValidationIssue[] = [];
      const recommendations: string[] = [];
      
      // Log size for information only - no limits
      console.log(`📊 Gallery video size: ${metadata.sizeMB.toFixed(1)}MB - processing with unified workflow`);
      recommendations.push(`✅ Vidéo de ${metadata.sizeMB.toFixed(1)}MB - traitement optimisé`);
      
      // Format validation (basic)
      if (!videoUri.toLowerCase().match(/\.(mp4|mov|avi|mkv)$/)) {
        issues.push({
          type: 'format',
          severity: 'info',
          message: 'Format vidéo non reconnu',
          suggestion: 'Les formats MP4 et MOV sont recommandés'
        });
      }
      
      // Positive recommendations
      recommendations.push('✅ Compatible avec le nouveau workflow d\'analyse');
      if (metadata.source === VideoSource.GALLERY_SELECTED) {
        recommendations.push('✅ Vidéo sélectionnée depuis la galerie');
      }
      
      return {
        success: true, // Always success with new workflow
        sizeMB: metadata.sizeMB,
        source: metadata.source,
        issues,
        recommendations,
        canProceed: true, // Always can proceed
        needsCompression: false // Never needs compression
      };
      
    } catch (error) {
      console.error('❌ Gallery video validation failed:', error);
      return {
        success: false,
        sizeMB: 0,
        source: VideoSource.GALLERY_SELECTED,
        issues: [{
          type: 'access',
          severity: 'error',
          message: 'Impossible de lire la vidéo sélectionnée',
          suggestion: 'Choisissez une autre vidéo ou vérifiez les permissions'
        }],
        recommendations: [],
        canProceed: false,
        needsCompression: false
      };
    }
  }
  
  /**
   * Validation générique (détecte automatiquement la source)
   */
  static async validateVideo(videoUri: string): Promise<ValidationResult> {
    const source = VideoSourceDetector.detectSource(videoUri);
    
    switch (source) {
      case VideoSource.CAMERA_RECORDED:
        return await this.validateRecordedVideo(videoUri);
      case VideoSource.GALLERY_SELECTED:
        return await this.validateGalleryVideo(videoUri);
      default:
        throw new Error(`Unknown video source: ${source}`);
    }
  }
  
  /**
   * Vérifie si une vidéo peut être traitée immédiatement (toujours true maintenant)
   */
  static async canProcessImmediately(videoUri: string): Promise<boolean> {
    return true; // Always true with new workflow
  }
  
  /**
   * Génère un résumé de validation pour l'utilisateur
   */
  static generateValidationSummary(validation: ValidationResult): string {
    return `✅ Vidéo prête pour l'analyse (${validation.sizeMB.toFixed(1)}MB)`;
  }

  /**
   * Get basic video info (compatibility method)
   */
  static async getVideoInfo(videoUri: string): Promise<{
    fps: number;
    width: number;
    height: number;
    duration: number;
    size: number;
  }> {
    try {
      const metadata = await VideoSourceDetector.getVideoMetadata(videoUri);
      return {
        fps: 30, // Default FPS
        width: 1920, // Default width
        height: 1080, // Default height
        duration: metadata.duration || 10, // Default duration
        size: Math.round(metadata.sizeMB * 1024 * 1024) // Convert MB to bytes
      };
    } catch (error) {
      console.error('❌ Failed to get video info:', error);
      return {
        fps: 30,
        width: 1920,
        height: 1080,
        duration: 10,
        size: 10 * 1024 * 1024 // 10MB default
      };
    }
  }
}