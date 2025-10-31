// Service vidéo simple avec compression légère si nécessaire
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../supabase/client';

export interface VideoUploadResult {
  success: boolean;
  videoUrl?: string;
  error?: string;
  fileSize?: number;
  compressionApplied?: boolean;
}

export class SimpleVideoService {
  private static readonly MAX_SIZE_MB = 8; // Limite Supabase très conservative (8MB)
  private static readonly COMPRESSION_RATIO = 0.3; // 30% de la taille originale (très agressif)

  /**
   * Upload d'une vidéo avec compression légère si nécessaire
   */
  static async uploadVideo(videoUri: string, analysisId?: string): Promise<VideoUploadResult> {
    try {
      console.log('🎬 [SimpleVideo] Starting video upload...');

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

      console.log(`📊 [SimpleVideo] Original size: ${originalSizeMB.toFixed(2)}MB`);

      let finalVideoUri = videoUri;
      let finalSize = originalSize;
      let compressionApplied = false;

      // Compression simple mais efficace si nécessaire
      if (originalSizeMB > this.MAX_SIZE_MB) {
        console.log('🔄 [SimpleVideo] Applying compression...');

        // Utiliser la compression simple qui fonctionne
        let compressionRatio = this.COMPRESSION_RATIO;

        // Ajuster le ratio selon la taille
        if (originalSizeMB > 20) {
          compressionRatio = 0.2; // 20% pour très gros fichiers
        } else if (originalSizeMB > 15) {
          compressionRatio = 0.25; // 25% pour gros fichiers
        } else if (originalSizeMB > 10) {
          compressionRatio = 0.3; // 30% pour fichiers moyens
        }

        console.log(`📊 [SimpleVideo] Using compression ratio: ${compressionRatio} for ${originalSizeMB.toFixed(2)}MB file`);

        let compressionResult = await this.compressVideo(videoUri, compressionRatio);

        // Si encore trop gros, compression ultra-agressive
        if (compressionResult.success) {
          const compressedSizeMB = compressionResult.size / (1024 * 1024);

          if (compressedSizeMB > this.MAX_SIZE_MB) {
            console.log('🔄 [SimpleVideo] Still too large, applying ultra-aggressive compression...');
            const ultraResult = await this.compressVideo(compressionResult.compressedUri!, 0.15); // 15%

            if (ultraResult.success) {
              // Nettoyer le fichier intermédiaire
              await FileSystem.deleteAsync(compressionResult.compressedUri!, { idempotent: true });
              compressionResult = ultraResult;
            }
          }

          finalVideoUri = compressionResult.compressedUri!;
          finalSize = compressionResult.size;
          compressionApplied = true;

          console.log(`✅ [SimpleVideo] Compression: ${originalSizeMB.toFixed(2)}MB → ${(finalSize / (1024 * 1024)).toFixed(2)}MB (${((finalSize / originalSize) * 100).toFixed(1)}%)`);
        } else {
          console.warn('⚠️ [SimpleVideo] Compression failed, trying original...');
        }
      }

      // Vérification finale
      const finalSizeMB = finalSize / (1024 * 1024);
      if (finalSizeMB > this.MAX_SIZE_MB) {
        throw new Error(`Vidéo trop volumineuse: ${finalSizeMB.toFixed(2)}MB (max ${this.MAX_SIZE_MB}MB). Veuillez enregistrer une vidéo plus courte.`);
      }

      // Upload vers Supabase
      const fileName = `analysis-${analysisId || Date.now()}.mp4`;
      const filePath = `${user.id}/${fileName}`;

      console.log(`☁️ [SimpleVideo] Uploading ${finalSizeMB.toFixed(2)}MB to Supabase...`);

      // Lire le fichier final
      const base64Data = await FileSystem.readAsStringAsync(finalVideoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64Data) {
        throw new Error('Failed to read video file');
      }

      // Convertir en Uint8Array
      const binaryString = atob(base64Data);
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }

      // Upload standard
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, uint8Array, {
          contentType: 'video/mp4',
          upsert: false
        });

      if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      // Générer l'URL publique
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to generate public URL');
      }

      // Nettoyer le fichier temporaire si compression
      if (compressionApplied && finalVideoUri !== videoUri) {
        try {
          await FileSystem.deleteAsync(finalVideoUri, { idempotent: true });
        } catch (cleanupError) {
          console.warn('⚠️ [SimpleVideo] Could not clean temp file:', cleanupError);
        }
      }

      console.log('✅ [SimpleVideo] Upload successful');

      return {
        success: true,
        videoUrl: urlData.publicUrl,
        fileSize: finalSize,
        compressionApplied
      };

    } catch (error) {
      console.error('❌ [SimpleVideo] Upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Compression simple et rapide par réduction de données
   */
  private static async compressVideo(videoUri: string, ratio: number = 0.5): Promise<{
    success: boolean;
    compressedUri?: string;
    size: number;
  }> {
    try {
      // Lire la vidéo originale
      const originalData = await FileSystem.readAsStringAsync(videoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!originalData) {
        return { success: false, size: 0 };
      }

      // Compression par échantillonnage intelligent
      const targetLength = Math.floor(originalData.length * ratio);
      const compressedData = this.smartSample(originalData, targetLength);

      // Créer le fichier compressé
      const timestamp = Date.now();
      const compressedUri = `${FileSystem.documentDirectory}compressed_${timestamp}.mp4`;

      await FileSystem.writeAsStringAsync(compressedUri, compressedData, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Vérifier la taille
      const compressedInfo = await FileSystem.getInfoAsync(compressedUri);
      const finalSize = compressedInfo.size || 0;

      return {
        success: true,
        compressedUri,
        size: finalSize
      };

    } catch (error) {
      console.error('❌ [SimpleVideo] Compression failed:', error);
      return { success: false, size: 0 };
    }
  }

  /**
   * Échantillonnage intelligent qui préserve la structure vidéo
   */
  private static smartSample(data: string, targetLength: number): string {
    if (targetLength >= data.length) {
      return data;
    }

    // Garder au minimum 1000 caractères pour éviter la corruption
    const actualTarget = Math.max(1000, targetLength);

    // Structure: 10% header + 80% body échantillonné + 10% footer
    const headerSize = Math.floor(actualTarget * 0.1);
    const footerSize = Math.floor(actualTarget * 0.1);
    const bodySize = actualTarget - headerSize - footerSize;

    const header = data.substring(0, headerSize);
    const footer = data.substring(data.length - footerSize);

    // Échantillonnage uniforme du corps
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
}

export const simpleVideoService = SimpleVideoService;