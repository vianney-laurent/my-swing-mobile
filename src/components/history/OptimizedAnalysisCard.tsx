import React, { useState, useCallback } from 'react';
import { Analysis } from '../../types/profile';
import { UnifiedAnalysisService } from '../../lib/analysis/unified-analysis-service';
import EnhancedAnalysisCard from './EnhancedAnalysisCard';

interface OptimizedAnalysisCardProps {
  analysis: Analysis;
  onPress: (analysis: Analysis) => void;
  index: number;
}

/**
 * Wrapper optimisé pour EnhancedAnalysisCard
 * Génère les URLs vidéo seulement au clic pour améliorer les performances
 */
export default function OptimizedAnalysisCard({ 
  analysis, 
  onPress, 
  index 
}: OptimizedAnalysisCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePress = useCallback(async (analysisItem: Analysis) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      // Si l'analyse est complète mais n'a pas d'URL vidéo valide, essayer de la régénérer
      if (analysisItem.status === 'completed' && analysisItem.video_url) {
        // Vérifier si l'URL est expirée (contient 'sign' et pourrait être expirée)
        if (analysisItem.video_url.includes('sign/')) {
          console.log('🔄 [OptimizedCard] Regenerating video URL for analysis:', analysisItem.id);
          
          // Extraire le chemin et régénérer l'URL
          const pathMatch = analysisItem.video_url.match(/\/storage\/v1\/object\/sign\/videos\/(.+?)\?/);
          if (pathMatch) {
            const videoPath = pathMatch[1];
            const freshUrl = await UnifiedAnalysisService.getVideoUrl(videoPath);
            
            if (freshUrl) {
              // Mettre à jour l'analyse avec la nouvelle URL
              analysisItem.video_url = freshUrl;
              console.log('✅ [OptimizedCard] Video URL regenerated');
            }
          }
        }
      }

      // Appeler le handler parent
      onPress(analysisItem);
      
    } catch (error) {
      console.error('❌ [OptimizedCard] Error processing analysis press:', error);
      // Continuer avec l'analyse originale même en cas d'erreur
      onPress(analysisItem);
    } finally {
      setIsProcessing(false);
    }
  }, [onPress, isProcessing]);

  return (
    <EnhancedAnalysisCard
      analysis={analysis}
      onPress={handlePress}
      index={index}
    />
  );
}