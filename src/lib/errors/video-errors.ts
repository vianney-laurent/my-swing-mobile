/**
 * 🚨 Gestion d'erreurs vidéo
 * Messages d'erreur standardisés pour le workflow vidéo unifié
 */

export enum VideoError {
  // Erreurs de taille
  TOO_LARGE = 'VIDEO_TOO_LARGE',
  TOO_SMALL = 'VIDEO_TOO_SMALL',
  
  // Erreurs de compression
  COMPRESSION_FAILED = 'COMPRESSION_FAILED',
  COMPRESSION_INSUFFICIENT = 'COMPRESSION_INSUFFICIENT',
  
  // Erreurs de format
  INVALID_FORMAT = 'INVALID_FORMAT',
  UNSUPPORTED_CODEC = 'UNSUPPORTED_CODEC',
  
  // Erreurs de traitement
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  READ_FAILED = 'READ_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  
  // Erreurs d'upload
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Erreurs d'analyse
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
  GEMINI_ERROR = 'GEMINI_ERROR',
  
  // Erreurs d'accès
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // Erreurs génériques
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export const VIDEO_ERROR_MESSAGES: Record<VideoError, string> = {
  [VideoError.TOO_LARGE]: 'Vidéo trop volumineuse (max 10MB)',
  [VideoError.TOO_SMALL]: 'Vidéo trop courte pour une analyse fiable',
  
  [VideoError.COMPRESSION_FAILED]: 'Impossible de compresser la vidéo',
  [VideoError.COMPRESSION_INSUFFICIENT]: 'Compression insuffisante, vidéo encore trop volumineuse',
  
  [VideoError.INVALID_FORMAT]: 'Format vidéo non supporté',
  [VideoError.UNSUPPORTED_CODEC]: 'Codec vidéo non compatible',
  
  [VideoError.PROCESSING_FAILED]: 'Erreur lors du traitement de la vidéo',
  [VideoError.READ_FAILED]: 'Impossible de lire le fichier vidéo',
  [VideoError.VALIDATION_FAILED]: 'Validation de la vidéo échouée',
  
  [VideoError.UPLOAD_FAILED]: 'Échec de l\'upload vers le serveur',
  [VideoError.NETWORK_ERROR]: 'Erreur de connexion réseau',
  
  [VideoError.ANALYSIS_FAILED]: 'Analyse de la vidéo échouée',
  [VideoError.GEMINI_ERROR]: 'Erreur du service d\'analyse IA',
  
  [VideoError.FILE_NOT_FOUND]: 'Fichier vidéo introuvable',
  [VideoError.PERMISSION_DENIED]: 'Accès au fichier refusé',
  
  [VideoError.UNKNOWN_ERROR]: 'Erreur inconnue'
};

export const VIDEO_ERROR_SUGGESTIONS: Record<VideoError, string> = {
  [VideoError.TOO_LARGE]: 'Enregistrez une vidéo plus courte ou de moindre qualité',
  [VideoError.TOO_SMALL]: 'Enregistrez un swing complet (5-10 secondes minimum)',
  
  [VideoError.COMPRESSION_FAILED]: 'Essayez avec une vidéo plus petite ou contactez le support',
  [VideoError.COMPRESSION_INSUFFICIENT]: 'Choisissez une vidéo plus courte',
  
  [VideoError.INVALID_FORMAT]: 'Utilisez un format MP4 ou MOV',
  [VideoError.UNSUPPORTED_CODEC]: 'Réenregistrez la vidéo avec l\'app',
  
  [VideoError.PROCESSING_FAILED]: 'Réessayez ou redémarrez l\'application',
  [VideoError.READ_FAILED]: 'Vérifiez que le fichier n\'est pas corrompu',
  [VideoError.VALIDATION_FAILED]: 'Choisissez une autre vidéo',
  
  [VideoError.UPLOAD_FAILED]: 'Vérifiez votre connexion internet',
  [VideoError.NETWORK_ERROR]: 'Réessayez quand la connexion sera stable',
  
  [VideoError.ANALYSIS_FAILED]: 'Réessayez avec une vidéo de meilleure qualité',
  [VideoError.GEMINI_ERROR]: 'Service temporairement indisponible, réessayez plus tard',
  
  [VideoError.FILE_NOT_FOUND]: 'Sélectionnez une autre vidéo',
  [VideoError.PERMISSION_DENIED]: 'Autorisez l\'accès aux fichiers dans les paramètres',
  
  [VideoError.UNKNOWN_ERROR]: 'Redémarrez l\'application et réessayez'
};

export class VideoErrorHandler {
  /**
   * Convertit une erreur générique en erreur vidéo typée
   */
  static categorizeError(error: Error | string): VideoError {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();
    
    // Erreurs de taille
    if (lowerMessage.includes('too large') || lowerMessage.includes('trop volumineu')) {
      return VideoError.TOO_LARGE;
    }
    if (lowerMessage.includes('too small') || lowerMessage.includes('trop court')) {
      return VideoError.TOO_SMALL;
    }
    
    // Erreurs de compression
    if (lowerMessage.includes('compression')) {
      return VideoError.COMPRESSION_FAILED;
    }
    
    // Erreurs de format
    if (lowerMessage.includes('format') || lowerMessage.includes('codec')) {
      return VideoError.INVALID_FORMAT;
    }
    
    // Erreurs d'accès
    if (lowerMessage.includes('not found') || lowerMessage.includes('does not exist')) {
      return VideoError.FILE_NOT_FOUND;
    }
    if (lowerMessage.includes('permission') || lowerMessage.includes('access denied')) {
      return VideoError.PERMISSION_DENIED;
    }
    
    // Erreurs réseau
    if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
      return VideoError.NETWORK_ERROR;
    }
    
    // Erreurs d'upload
    if (lowerMessage.includes('upload') || lowerMessage.includes('supabase')) {
      return VideoError.UPLOAD_FAILED;
    }
    
    // Erreurs d'analyse
    if (lowerMessage.includes('gemini') || lowerMessage.includes('analysis')) {
      return VideoError.ANALYSIS_FAILED;
    }
    
    // Par défaut
    return VideoError.UNKNOWN_ERROR;
  }
  
  /**
   * Génère un message d'erreur utilisateur complet
   */
  static getErrorMessage(error: Error | string | VideoError): {
    title: string;
    message: string;
    suggestion: string;
    canRetry: boolean;
  } {
    let videoError: VideoError;
    
    if (typeof error === 'string' && Object.values(VideoError).includes(error as VideoError)) {
      videoError = error as VideoError;
    } else {
      videoError = this.categorizeError(error as Error | string);
    }
    
    const canRetry = ![
      VideoError.INVALID_FORMAT,
      VideoError.UNSUPPORTED_CODEC,
      VideoError.PERMISSION_DENIED
    ].includes(videoError);
    
    return {
      title: this.getErrorTitle(videoError),
      message: VIDEO_ERROR_MESSAGES[videoError],
      suggestion: VIDEO_ERROR_SUGGESTIONS[videoError],
      canRetry
    };
  }
  
  /**
   * Génère un titre d'erreur approprié
   */
  private static getErrorTitle(error: VideoError): string {
    switch (error) {
      case VideoError.TOO_LARGE:
      case VideoError.TOO_SMALL:
        return 'Problème de taille';
      
      case VideoError.COMPRESSION_FAILED:
      case VideoError.COMPRESSION_INSUFFICIENT:
        return 'Erreur de compression';
      
      case VideoError.INVALID_FORMAT:
      case VideoError.UNSUPPORTED_CODEC:
        return 'Format non supporté';
      
      case VideoError.UPLOAD_FAILED:
      case VideoError.NETWORK_ERROR:
        return 'Erreur de connexion';
      
      case VideoError.ANALYSIS_FAILED:
      case VideoError.GEMINI_ERROR:
        return 'Erreur d\'analyse';
      
      case VideoError.FILE_NOT_FOUND:
      case VideoError.PERMISSION_DENIED:
        return 'Accès au fichier';
      
      default:
        return 'Erreur';
    }
  }
  
  /**
   * Log une erreur avec contexte
   */
  static logError(error: Error | string, context: {
    step?: string;
    videoUri?: string;
    videoSize?: number;
    source?: string;
  }) {
    const videoError = this.categorizeError(error);
    
    console.error('🚨 Video Error:', {
      type: videoError,
      message: typeof error === 'string' ? error : error.message,
      context,
      timestamp: new Date().toISOString()
    });
  }
}