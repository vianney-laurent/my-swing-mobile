import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DataManager, UserStats } from '../lib/cache/data-manager';
import { UserProfile } from '../lib/profile/mobile-profile-service';
import { Analysis } from '../types/profile';
import { useAuth } from '../hooks/useAuth';

interface AppDataContextType {
  // État global
  userProfile: UserProfile | null;
  userStats: UserStats | null;
  recentAnalyses: Analysis[];
  
  // Actions
  refreshUserData: (forceRefresh?: boolean) => Promise<void>;
  refreshAnalyses: (forceRefresh?: boolean) => Promise<void>;
  invalidateAfterNewAnalysis: () => Promise<void>;
  invalidateAfterAnalysisDeletion: () => Promise<void>;
  invalidateAfterProfileUpdate: () => Promise<void>;
  
  // État de chargement
  isLoadingProfile: boolean;
  isLoadingStats: boolean;
  isLoadingAnalyses: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

interface AppDataProviderProps {
  children: ReactNode;
}

export function AppDataProvider({ children }: AppDataProviderProps) {
  const { user } = useAuth();
  
  // État global
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  
  // États de chargement
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);

  /**
   * Rafraîchit les données utilisateur (profil + stats)
   */
  const refreshUserData = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    try {
      setIsLoadingProfile(true);
      setIsLoadingStats(true);

      // Charger profil et stats en parallèle
      const [profile, stats] = await Promise.all([
        DataManager.getUserProfile(user.id, forceRefresh),
        DataManager.getUserStats(user.id, forceRefresh)
      ]);

      setUserProfile(profile);
      setUserStats(stats);
      
      console.log('✅ [AppDataContext] User data refreshed');
      
    } catch (error) {
      console.error('❌ [AppDataContext] Error refreshing user data:', error);
    } finally {
      setIsLoadingProfile(false);
      setIsLoadingStats(false);
    }
  }, [user]);

  /**
   * Rafraîchit les analyses récentes
   */
  const refreshAnalyses = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    try {
      setIsLoadingAnalyses(true);
      
      const analyses = await DataManager.getUserAnalyses(user.id, 10, forceRefresh);
      setRecentAnalyses(analyses);
      
      console.log('✅ [AppDataContext] Analyses refreshed');
      
    } catch (error) {
      console.error('❌ [AppDataContext] Error refreshing analyses:', error);
    } finally {
      setIsLoadingAnalyses(false);
    }
  }, [user]);

  /**
   * Invalide le cache après une nouvelle analyse
   */
  const invalidateAfterNewAnalysis = useCallback(async () => {
    if (!user) return;
    
    console.log('🔄 [AppDataContext] Invalidating after new analysis...');
    await DataManager.invalidateAfterNewAnalysis(user.id);
    
    // Rafraîchir les données immédiatement pour que les compteurs se mettent à jour
    console.log('🔄 [AppDataContext] Refreshing data after invalidation...');
    await Promise.all([
      refreshUserData(true),
      refreshAnalyses(true)
    ]);
    
    console.log('✅ [AppDataContext] Data refreshed after new analysis');
  }, [user, refreshUserData, refreshAnalyses]);

  /**
   * Invalide le cache après suppression d'analyse
   */
  const invalidateAfterAnalysisDeletion = useCallback(async () => {
    if (!user) return;
    
    console.log('🗑️ [AppDataContext] Invalidating after analysis deletion...');
    await DataManager.invalidateAfterAnalysisDeletion(user.id);
    
    // Rafraîchir les données
    await Promise.all([
      refreshUserData(true),
      refreshAnalyses(true)
    ]);
  }, [user, refreshUserData, refreshAnalyses]);

  /**
   * Invalide le cache après mise à jour du profil
   */
  const invalidateAfterProfileUpdate = useCallback(async () => {
    if (!user) return;
    
    console.log('👤 [AppDataContext] Invalidating after profile update...');
    await DataManager.invalidateAfterProfileUpdate(user.id);
    
    // Rafraîchir seulement le profil
    await refreshUserData(true);
  }, [user, refreshUserData]);

  const contextValue: AppDataContextType = {
    // État global
    userProfile,
    userStats,
    recentAnalyses,
    
    // Actions
    refreshUserData,
    refreshAnalyses,
    invalidateAfterNewAnalysis,
    invalidateAfterAnalysisDeletion,
    invalidateAfterProfileUpdate,
    
    // État de chargement
    isLoadingProfile,
    isLoadingStats,
    isLoadingAnalyses,
  };

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte des données de l'app
 */
export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}