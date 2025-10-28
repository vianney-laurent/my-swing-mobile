import { useState, useCallback } from 'react';

export type Screen = 'home' | 'camera' | 'history' | 'profile' | 'analysisResult' | 'auth';

interface NavigationState {
  currentScreen: Screen;
  analysisId?: string;
  previousScreen?: Screen;
}

export function useNavigation() {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentScreen: 'auth', // Commencer par auth, sera changé vers home après connexion
  });

  const navigate = useCallback((screen: Screen, params?: { analysisId?: string }) => {
    setNavigationState(prev => ({
      currentScreen: screen,
      analysisId: params?.analysisId,
      previousScreen: prev.currentScreen,
    }));
  }, []);

  const goBack = useCallback(() => {
    setNavigationState(prev => ({
      currentScreen: prev.previousScreen || 'home',
      analysisId: undefined,
      previousScreen: undefined,
    }));
  }, []);

  const setCurrentScreen = useCallback((screen: Screen) => {
    setNavigationState(prev => ({
      ...prev,
      currentScreen: screen,
    }));
  }, []);

  return {
    currentScreen: navigationState.currentScreen,
    analysisId: navigationState.analysisId,
    navigate,
    goBack,
    setCurrentScreen,
  };
}