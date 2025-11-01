import { useState, useCallback } from 'react';

export type Screen = 'home' | 'camera' | 'history' | 'profile' | 'analysisResult' | 'auth' | 'help';
export type HelpScreen = 'home' | 'camera' | 'analysis' | 'history' | 'profile' | 'auth' | 'analysisResult' | 'helpIndex';
export type TabScreen = 'home' | 'camera' | 'history' | 'profile';

interface NavigationState {
  currentScreen: Screen;
  analysisId?: string;
  previousScreen?: Screen;
  helpScreen?: HelpScreen;
  activeTab?: TabScreen; // Nouvel état pour tracker l'onglet parent actif
}

export function useNavigation() {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentScreen: 'auth', // Commencer par auth, sera changé vers home après connexion
  });

  const navigate = useCallback((screen: Screen, params?: { analysisId?: string; fromTab?: TabScreen }) => {
    setNavigationState(prev => {
      // Déterminer l'onglet actif basé sur l'écran de destination
      let activeTab: TabScreen | undefined;
      
      if (screen === 'analysisResult') {
        // Si on navigue vers une analyse, garder l'onglet parent actif
        activeTab = params?.fromTab || prev.activeTab || 'history';
      } else if (['home', 'camera', 'history', 'profile'].includes(screen)) {
        // Si c'est un onglet principal, l'activer
        activeTab = screen as TabScreen;
      } else {
        // Pour les autres écrans (auth, help), garder l'onglet précédent
        activeTab = prev.activeTab;
      }

      return {
        currentScreen: screen,
        analysisId: params?.analysisId,
        previousScreen: prev.currentScreen,
        helpScreen: undefined, // Reset help screen when navigating normally
        activeTab,
      };
    });
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
    activeTab: navigationState.activeTab,
    navigate,
    navigateToHelp,
    navigateToHelpSection,
    goBack,
    goBackFromHelp,
    setCurrentScreen,
  };
}