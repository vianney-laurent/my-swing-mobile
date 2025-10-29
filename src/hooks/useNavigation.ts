import { useState, useCallback } from 'react';

export type Screen = 'home' | 'camera' | 'history' | 'profile' | 'analysisResult' | 'auth' | 'help';
export type HelpScreen = 'home' | 'camera' | 'analysis' | 'history' | 'profile' | 'auth' | 'analysisResult' | 'helpIndex';

interface NavigationState {
  currentScreen: Screen;
  analysisId?: string;
  previousScreen?: Screen;
  helpScreen?: HelpScreen;
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
      helpScreen: undefined, // Reset help screen when navigating normally
    }));
  }, []);

  const getHelpScreenFromRoute = (routeName: string): HelpScreen => {
    const mapping: Record<string, HelpScreen> = {
      'home': 'home',
      'camera': 'camera',
      'analysis': 'analysis',
      'history': 'history',
      'profile': 'profile',
      'auth': 'auth',
      'analysisResult': 'analysisResult',
    };

    return mapping[routeName] || 'helpIndex';
  };

  const navigateToHelp = useCallback((fromScreen: string) => {
    const helpScreen = getHelpScreenFromRoute(fromScreen);
    setNavigationState(prev => ({
      ...prev,
      currentScreen: 'help',
      helpScreen,
      previousScreen: prev.currentScreen
    }));
  }, []);

  const navigateToHelpSection = useCallback((section: HelpScreen) => {
    setNavigationState(prev => ({
      ...prev,
      helpScreen: section
    }));
  }, []);

  const goBack = useCallback(() => {
    setNavigationState(prev => ({
      currentScreen: prev.previousScreen || 'home',
      analysisId: undefined,
      previousScreen: undefined,
      helpScreen: undefined,
    }));
  }, []);

  const goBackFromHelp = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      currentScreen: prev.previousScreen || 'home',
      helpScreen: undefined,
      previousScreen: undefined
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
    helpScreen: navigationState.helpScreen,
    navigate,
    navigateToHelp,
    navigateToHelpSection,
    goBack,
    goBackFromHelp,
    setCurrentScreen,
  };
}