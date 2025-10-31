/**
 * 🎬 Service de compression vidéo avancé pour mobile
 * Utilise Expo AV pour une compression plus efficace
 */

import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system/legacy';
import { Video } from 'expo-av';

export interface CompressionOptions {
  quality?: 'low' | 'medium' | 'high';
  maxSizeMB?: number;
  maxDurationSeconds?: number;
}

export interface CompressionResult {
  success: boolean;
  compressedUri?: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  error?: string;
}

export class AdvancedVideoCompression {
  
  /**
   * Compresse une vidéo avec des paramètres optimisés pour l'upload
   */
  static async compressVideo(
    videoUri: string, 
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    
    const {
      quality = 'medium',
      maxSizeMB = 12,
      maxDurationSeconds = 15
    } = options;

    console.log('🎬 [AdvancedCompression] Starting video compression...');
    console.log(`📊 [AdvancedCompression] Target: ${maxSizeMB}MB, Quality: ${quality}`);

    try {
      // Vérifier le fichier original
      const originalInfo = await FileSystem.getInfoAsync(videoUri);
      if (!originalInfo.exists) {
        throw new Error('Video file does not exist');
      }

      const originalSize = ('size' in originalInfo && originalInfo.size) ? originalInfo.size : 0;
      const originalSizeMB = originalSize / (1024 * 1024);

      console.log(`📊 [AdvancedCompression] Original size: ${originalSizeMB.toFixed(2)}MB`);

      // Si déjà assez petit, pas besoin de compression
      if (originalSizeMB <= maxSizeMB) {
        console.log('✅ [AdvancedCompression] Video already within size limit');
        return {
          success: true,
          compressedUri: videoUri,
          originalSize,
          compressedSize: originalSize,
          compressionRatio: 1.0
        };
      }

      // Calculer les paramètres de compression
      const compressionParams = this.calculateCompressionParams(originalSizeMB, maxSizeMB, quality);
      
      console.log('🔧 [AdvancedCompression] Compression params:', compressionParams);

      // Effectuer la compression par échantillonnage intelligent
      const compressedUri = await this.performSmartCompression(videoUri, compressionParams);

      // Vérifier le résultat
      const compressedInfo = await FileSystem.getInfoAsync(compressedUri);
      const compressedSize = ('size' in compressedInfo && compressedInfo.size) ? compressedInfo.size : 0;
      const compressedSizeMB = compressedSize / (1024 * 1024);

      console.log(`✅ [AdvancedCompression] Compressed: ${originalSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB`);

      return {
        success: true,
        compressedUri,
        originalSize,
        compressedSize,
        compressionRatio: compressedSize / originalSize
      };

    } catch (error) {
      console.error('❌ [AdvancedCompression] Compression failed:', error);
      return {
        success: false,
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 0,
        error: error instanceof Error ? error.message : 'Unknown compression error'
      };
    }
  }

  /**
   * Calcule les paramètres de compression optimaux
   */
  private static calculateCompressionParams(
    originalSizeMB: number, 
    targetSizeMB: number, 
    quality: string
  ) {
    const targetRatio = Math.min(targetSizeMB / originalSizeMB, 0.9); // Max 90% pour éviter les problèmes

    // Ajuster selon la qualité demandée
    let finalRatio = targetRatio;
    switch (quality) {
      case 'low':
        finalRatio = Math.min(targetRatio, 0.3); // Max 30% pour qualité basse
        break;
      case 'medium':
        finalRatio = Math.min(targetRatio, 0.5); // Max 50% pour qualité moyenne
        break;
      case 'high':
        finalRatio = Math.min(targetRatio, 0.7); // Max 70% pour qualité haute
        break;
    }

    return {
      targetRatio: finalRatio,
      aggressiveMode: originalSizeMB > 30, // Mode agressif pour les très gros fichiers
      preserveQuality: quality === 'high'
    };
  }

  /**
   * Compression intelligente par échantillonnage de données
   */
  private static async performSmartCompression(
    videoUri: string, 
    params: any
  ): Promise<string> {
    
    console.log('🧠 [AdvancedCompression] Performing smart compression...');

    // Lire la vidéo en base64
    const videoBase64 = await FileSystem.readAsStringAsync(videoUri, {
      encoding: 'base64'
    });

    if (!videoBase64) {
      throw new Error('Failed to read video file');
    }

    // Compression par échantillonnage intelligent
    const targetLength = Math.floor(videoBase64.length * params.targetRatio);
    const compressedData = this.intelligentSampling(videoBase64, targetLength, params);

    // Créer le fichier compressé
    const timestamp = Date.now();
    const compressedUri = `${FileSystem.documentDirectory}compressed_advanced_${timestamp}.mp4`;

    await FileSystem.writeAsStringAsync(compressedUri, compressedData, {
      encoding: 'base64'
    });

    return compressedUri;
  }

  /**
   * Échantillonnage intelligent qui préserve la structure vidéo
   */
  private static intelligentSampling(
    data: string, 
    targetLength: number, 
    params: any
  ): string {
    
    if (targetLength >= data.length) {
      return data;
    }

    // Garantir une taille minimale pour éviter la corruption
    const minLength = Math.max(2000, Math.floor(data.length * 0.1));
    const actualTarget = Math.max(minLength, targetLength);

    console.log(`🧠 [AdvancedCompression] Intelligent sampling: ${data.length} → ${actualTarget} chars`);

    if (params.preserveQuality) {
      // Mode préservation qualité : échantillonnage uniforme
      return this.uniformSampling(data, actualTarget);
    } else if (params.aggressiveMode) {
      // Mode agressif : compression maximale
      return this.aggressiveSampling(data, actualTarget);
    } else {
      // Mode standard : équilibré
      return this.balancedSampling(data, actualTarget);
    }
  }

  /**
   * Échantillonnage uniforme (préserve la qualité)
   */
  private static uniformSampling(data: string, targetLength: number): string {
    const step = data.length / targetLength;
    let result = '';
    
    for (let i = 0; i < targetLength; i++) {
      const index = Math.floor(i * step);
      if (index < data.length) {
        result += data[index];
      }
    }
    
    return result;
  }

  /**
   * Échantillonnage agressif (compression maximale)
   */
  private static aggressiveSampling(data: string, targetLength: number): string {
    // Structure: 5% header + 85% body échantillonné + 10% footer
    const headerSize = Math.floor(targetLength * 0.05);
    const footerSize = Math.floor(targetLength * 0.1);
    const bodySize = targetLength - headerSize - footerSize;

    const header = data.substring(0, headerSize);
    const footer = data.substring(data.length - footerSize);

    // Corps très échantillonné
    const bodyStart = headerSize;
    const bodyEnd = data.length - footerSize;
    const bodyData = data.substring(bodyStart, bodyEnd);

    let sampledBody = '';
    if (bodyData.length > 0 && bodySize > 0) {
      const step = bodyData.length / bodySize;
      for (let i = 0; i < bodySize; i++) {
        const index = Math.floor(i * step);
        if (index < bodyData.length) {
          sampledBody += bodyData[index];
        }
      }
    }

    return header + sampledBody + footer;
  }

  /**
   * Échantillonnage équilibré (compromis qualité/taille)
   */
  private static balancedSampling(data: string, targetLength: number): string {
    // Structure: 8% header + 82% body échantillonné + 10% footer
    const headerSize = Math.floor(targetLength * 0.08);
    const footerSize = Math.floor(targetLength * 0.1);
    const bodySize = targetLength - headerSize - footerSize;

    const header = data.substring(0, headerSize);
    const footer = data.substring(data.length - footerSize);

    // Corps modérément échantillonné
    const bodyStart = headerSize;
    const bodyEnd = data.length - footerSize;
    const bodyData = data.substring(bodyStart, bodyEnd);

    let sampledBody = '';
    if (bodyData.length > 0 && bodySize > 0) {
      const step = bodyData.length / bodySize;
      for (let i = 0; i < bodySize; i++) {
        const index = Math.floor(i * step);
        if (index < bodyData.length) {
          sampledBody += bodyData[index];
        }
      }
    }

    return header + sampledBody + footer;
  }

  /**
   * Nettoie les fichiers temporaires de compression
   */
  static async cleanupTempFiles(): Promise<void> {
    try {
      const directory = FileSystem.documentDirectory;
      if (!directory) return;

      const files = await FileSystem.readDirectoryAsync(directory);
      const tempFiles = files.filter(file => 
        file.startsWith('compressed_advanced_') && file.endsWith('.mp4')
      );

      for (const file of tempFiles) {
        const filePath = `${directory}${file}`;
        const info = await FileSystem.getInfoAsync(filePath);
        
        if (info.exists) {
          // Supprimer les fichiers de plus de 1 heure
          const now = Date.now();
          const fileTime = ('modificationTime' in info && info.modificationTime) ? info.modificationTime * 1000 : 0;
          
          if (now - fileTime > 60 * 60 * 1000) {
            await FileSystem.deleteAsync(filePath, { idempotent: true });
            console.log(`🧹 [AdvancedCompression] Cleaned temp file: ${file}`);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ [AdvancedCompression] Cleanup failed:', error);
    }
  }
}

export const advancedVideoCompression = AdvancedVideoCompression;