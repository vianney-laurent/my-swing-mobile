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
    console.log('📹 Validating recorded video...');
    
    try {
      const metadata = await VideoSourceDetector.getVideoMetadata(videoUri);
      const issues: ValidationIssue[] = [];
      const recommendations: string[] = [];
      
      // Size validation removed - new workflow handles any size
      // Just log the size for information
      console.log(`📊 Video size: ${metadata.sizeMB.toFixed(1)}MB - processing with new workflow`);
      recommendations.push(`Vidéo de ${metadata.sizeMB.toFixed(1)}MB - traitement optimisé`);
      
      // Validation de la durée (si disponible)
      if (metadata.duration) {
        if (metadata.duration > this.MAX_DURATION_SECONDS) {
          issues.push({
            type: 'duration',
            severity: 'warning',
            message: `Vidéo longue: ${metadata.duration.toFixed(1)}s (recommandé < ${this.MAX_DURATION_SECONDS}s)`,
            suggestion: 'Les vidéos courtes donnent de meilleurs résultats d\'analyse'
          });
        } else if (metadata.duration < this.MIN_DURATION_SECONDS) {
          issues.push({
            type: 'duration',
            severity: 'warning',
            message: `Vidéo courte: ${metadata.duration.toFixed(1)}s (recommandé > ${this.MIN_DURATION_SECONDS}s)`,
            suggestion: 'Enregistrez un swing complet pour une meilleure analyse'
          });
        }
      }
      
      // Recommandations spécifiques aux vidéos de caméra
      if (metadata.source === VideoSource.CAMERA_RECORDED) {
        recommendations.push('Vidéo enregistrée avec qualité optimisée');
        
        if (metadata.sizeMB < 2) {
          recommendations.push('Qualité excellente pour l\'analyse');
        }
      }
      
      const hasErrors = issues.some(issue => issue.severity === 'error');
      const needsCompression = metadata.sizeMB > this.MAX_SIZE_MB && metadata.sizeMB <= this.ABSOLUTE_MAX_SIZE_MB;
      
      return {
        success: !hasErrors,
        sizeMB: metadata.sizeMB,
        source: metadata.source,
        issues,
        recommendations,
        canProceed: !hasErrors,
        needsCompression
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
    console.log('📱 Validating gallery video...');
    
    try {
      const metadata = await VideoSourceDetector.getVideoMetadata(videoUri);
      const issues: ValidationIssue[] = [];
      const recommendations: string[] = [];
      
      // Size validation removed - new workflow handles any size
      console.log(`📊 Gallery video size: ${metadata.sizeMB.toFixed(1)}MB - processing with new workflow`);
      recommendations.push(`Vidéo de ${metadata.sizeMB.toFixed(1)}MB - traitement optimisé`);
      
      // Validation du format (basique)
      if (!videoUri.toLowerCase().match(/\.(mp4|mov|avi|mkv)$/)) {
        issues.push({
          type: 'format',
          severity: 'warning',
          message: 'Format vidéo non reconnu',
          suggestion: 'Les formats MP4 et MOV sont recommandés'
        });
      }
      
      // Recommandations spécifiques aux vidéos de galerie
      if (metadata.source === VideoSource.GALLERY_SELECTED) {
        if (metadata.sizeMB > 50) {
          recommendations.push('Vidéo de haute qualité détectée - compression forte appliquée');
        } else if (metadata.sizeMB > 20) {
          recommendations.push('Vidéo de bonne qualité - compression modérée appliquée');
        } else {
          recommendations.push('Vidéo de taille raisonnable');
        }
      }
      
      // Estimation de la durée si pas disponible
      if (!metadata.duration) {
        const estimatedDuration = VideoSourceDetector.estimateVideoDuration(metadata.sizeMB, metadata.source);
        if (estimatedDuration > this.MAX_DURATION_SECONDS) {
          issues.push({
            type: 'duration',
            severity: 'info',
            message: `Durée estimée: ${estimatedDuration.toFixed(1)}s (peut être longue pour l'analyse)`,
            suggestion: 'Considérez découper la vidéo pour ne garder que le swing'
          });
        }
      }
      
      const hasErrors = issues.some(issue => issue.severity === 'error');
      const needsCompression = metadata.sizeMB > this.MAX_SIZE_MB && metadata.sizeMB <= this.ABSOLUTE_MAX_SIZE_MB;
      
      return {
        success: !hasErrors,
        sizeMB: metadata.sizeMB,
        source: metadata.source,
        issues,
        recommendations,
        canProceed: !hasErrors,
        needsCompression
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
   * Vérifie si une vidéo peut être traitée immédiatement
   */
  static async canProcessImmediately(videoUri: string): Promise<boolean> {
    try {
      const validation = await this.validateVideo(videoUri);
      return validation.success && !validation.needsCompression;
    } catch (error) {
      console.error('❌ Cannot check if video can be processed immediately:', error);
      return false;
    }
  }
  
  /**
   * Génère un résumé de validation pour l'utilisateur
   */
  static generateValidationSummary(validation: ValidationResult): string {
    if (validation.success && validation.issues.length === 0) {
      return `✅ Vidéo prête pour l'analyse (${validation.sizeMB.toFixed(1)}MB)`;
    }
    
    const errors = validation.issues.filter(issue => issue.severity === 'error');
    const warnings = validation.issues.filter(issue => issue.severity === 'warning');
    
    if (errors.length > 0) {
      return `❌ ${errors[0].message}`;
    }
    
    if (warnings.length > 0) {
      return `⚠️ ${warnings[0].message}`;
    }
    
    return `ℹ️ Vidéo analysée (${validation.sizeMB.toFixed(1)}MB)`;
  }

  /**
   * Get basic video info (compatibility method)
   * @deprecated Use validateVideo() instead for comprehensive validation
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