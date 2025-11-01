import { useCallback } from 'react';
import { useAppData } from '../contexts/AppDataContext';

/**
 * Hook pour gérer la navigation après analyse avec invalidation du cache
 */
export function useAnalysisNavigation() {
  const { invalidateAfterNewAnalysis } = useAppData();

  /**
   * Navigue vers les résultats d'analyse en invalidant le cache
   */
  const navigateToAnalysisResult = useCallback(async (
    navigation: any, 
    analysisId: string,
    fromTab: 'camera' | 'history' = 'camera'
  ) => {
    try {
      console.log('🔄 [AnalysisNavigation] Invalidating cache before navigation...');
      await invalidateAfterNewAnalysis();
      console.log('✅ [AnalysisNavigation] Cache invalidated successfully');
      
      if (navigation) {
        navigation.navigate('AnalysisResult', { analysisId, fromTab });
      }
    } catch (error) {
      console.error('❌ [AnalysisNavigation] Error invalidating cache:', error);
      
      // Naviguer quand même même si l'invalidation échoue
      if (navigation) {
        navigation.navigate('AnalysisResult', { analysisId, fromTab });
      }
    }
  }, [invalidateAfterNewAnalysis]);

  /**
   * Navigue vers l'accueil en invalidant le cache
   */
  const navigateToHomeWithRefresh = useCallback(async (navigation: any) => {
    try {
      console.log('🔄 [AnalysisNavigation] Invalidating cache before home navigation...');
      await invalidateAfterNewAnalysis();
      console.log('✅ [AnalysisNavigation] Cache invalidated successfully');
      
      if (navigation) {
        navigation.navigate('home');
      }
    } catch (error) {
      console.error('❌ [AnalysisNavigation] Error invalidating cache:', error);
      
      // Naviguer quand même
      if (navigation) {
        navigation.navigate('home');
      }
    }
  }, [invalidateAfterNewAnalysis]);

  return {
    navigateToAnalysisResult,
    navigateToHomeWithRefresh,
  };
}