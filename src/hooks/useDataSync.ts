import { useCallback } from 'react';
import { DataManager } from '../lib/cache/data-manager';
import { useAuth } from './useAuth';

/**
 * Hook pour synchroniser les données et invalider le cache
 * Garantit que les données restent à jour après les actions utilisateur
 */
export function useDataSync() {
  const { user } = useAuth();

  /**
   * Invalide le cache après une nouvelle analyse
   */
  const invalidateAfterNewAnalysis = useCallback(async () => {
    if (!user) return;
    
    console.log('🔄 [DataSync] Invalidating cache after new analysis...');
    await DataManager.invalidateAfterNewAnalysis(user.id);
  }, [user]);

  /**
   * Invalide le cache après suppression d'analyse
   */
  const invalidateAfterAnalysisDeletion = useCallback(async () => {
    if (!user) return;
    
    console.log('🗑️ [DataSync] Invalidating cache after analysis deletion...');
    await DataManager.invalidateAfterAnalysisDeletion(user.id);
  }, [user]);

  /**
   * Invalide le cache après mise à jour du profil
   */
  const invalidateAfterProfileUpdate = useCallback(async () => {
    if (!user) return;
    
    console.log('👤 [DataSync] Invalidating cache after profile update...');
    await DataManager.invalidateAfterProfileUpdate(user.id);
  }, [user]);

  /**
   * Force le rechargement des données (pour pull-to-refresh)
   */
  const forceRefresh = useCallback(async () => {
    if (!user) return;
    
    console.log('🔄 [DataSync] Forcing data refresh...');
    // Les composants utiliseront forceRefresh=true dans leurs appels DataManager
  }, [user]);

  return {
    invalidateAfterNewAnalysis,
    invalidateAfterAnalysisDeletion,
    invalidateAfterProfileUpdate,
    forceRefresh,
  };
}