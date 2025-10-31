import { useState } from 'react';

export type HelpScreen = 
  | 'home' 
  | 'camera' 
  | 'analysis' 
  | 'history' 
  | 'profile' 
  | 'auth' 
  | 'analysisResult' 
  | 'helpIndex';

export interface UseHelpNavigationReturn {
  currentScreen: HelpScreen;
  navigateToScreen: (screen: HelpScreen) => void;
  navigateToIndex: () => void;
  goBack: () => void;
  canGoBack: boolean;
}

export function useHelpNavigation(initialScreen: HelpScreen = 'helpIndex'): UseHelpNavigationReturn {
  const [currentScreen, setCurrentScreen] = useState<HelpScreen>(initialScreen);
  const [navigationStack, setNavigationStack] = useState<HelpScreen[]>([initialScreen]);

  const navigateToScreen = (screen: HelpScreen) => {
    setCurrentScreen(screen);
    setNavigationStack(prev => [...prev, screen]);
  };

  const navigateToIndex = () => {
    setCurrentScreen('helpIndex');
    setNavigationStack(['helpIndex']);
  };

  const goBack = () => {
    if (navigationStack.length > 1) {
      const newStack = navigationStack.slice(0, -1);
      const previousScreen = newStack[newStack.length - 1];
      setNavigationStack(newStack);
      setCurrentScreen(previousScreen);
    }
  };

  const canGoBack = navigationStack.length > 1;

  return {
    currentScreen,
    navigateToScreen,
    navigateToIndex,
    goBack,
    canGoBack
  };
}