/**
 * Hook pour gérer le padding de bas de page de manière globale
 * Prend en compte la barre de navigation et les safe areas
 */

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export function useSafeBottomPadding() {
  const insets = useSafeAreaInsets();
  
  // Hauteur estimée de la barre de navigation native
  const TAB_BAR_HEIGHT = 60;
  
  // Padding supplémentaire pour éviter que les éléments soient collés
  const EXTRA_PADDING = 20;
  
  // Calcul du padding total
  const bottomPadding = Math.max(
    insets.bottom + TAB_BAR_HEIGHT + EXTRA_PADDING,
    TAB_BAR_HEIGHT + EXTRA_PADDING // Minimum même sans safe area
  );
  
  return {
    // Padding pour les conteneurs principaux (ScrollView, View)
    containerPaddingBottom: bottomPadding,
    
    // Padding pour les éléments flottants (boutons fixes)
    floatingElementBottom: insets.bottom + EXTRA_PADDING,
    
    // Padding pour les actions en bas de formulaire
    actionsPaddingBottom: bottomPadding,
    
    // Safe area insets bruts si besoin
    insets,
    
    // Hauteur de la tab bar
    tabBarHeight: TAB_BAR_HEIGHT,
  };
}