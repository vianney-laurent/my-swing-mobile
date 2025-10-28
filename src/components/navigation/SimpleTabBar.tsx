import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface SimpleTabBarProps {
  currentScreen: string;
  onTabPress: (screen: string) => void;
}

const tabs: TabItem[] = [
  {
    key: 'home',
    icon: 'home-outline',
    activeIcon: 'home',
    label: 'Accueil',
  },
  {
    key: 'camera',
    icon: 'camera-outline',
    activeIcon: 'camera',
    label: 'Analyse',
  },
  {
    key: 'history',
    icon: 'bar-chart-outline',
    activeIcon: 'bar-chart',
    label: 'Historique',
  },
  {
    key: 'profile',
    icon: 'person-outline',
    activeIcon: 'person',
    label: 'Profil',
  },
];

export default function SimpleTabBar({ currentScreen, onTabPress }: SimpleTabBarProps) {
  // Fallback pour safe area si pas disponible
  let insets = { bottom: 0 };
  try {
    insets = useSafeAreaInsets();
  } catch (error) {
    console.warn('SafeAreaInsets not available, using fallback');
    // Fallback pour iPhone (34px) et Android (0px)
    insets = { bottom: Platform.OS === 'ios' ? 34 : 0 };
  }
  
  // Log de debug pour vérifier le rendu
  console.log('🔍 [SimpleTabBar] Rendering with screen:', currentScreen);
  console.log('🔍 [SimpleTabBar] Safe area bottom:', insets.bottom);
  console.log('🔍 [SimpleTabBar] Using minimal padding:', Math.min(insets.bottom, 8));
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {tabs.map((tab) => {
        const isActive = tab.key === currentScreen;
        
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.tabContent, isActive && styles.tabContentActive]}>
              <Ionicons
                name={isActive ? (tab.activeIcon || tab.icon) : tab.icon}
                size={24}
                color={isActive ? (Platform.OS === 'ios' ? '#007AFF' : '#1976D2') : '#8E8E93'}
              />
              <Text style={[
                styles.tabLabel,
                { color: isActive ? (Platform.OS === 'ios' ? '#007AFF' : '#1976D2') : '#8E8E93' }
              ]}>
                {tab.label}
              </Text>
            </View>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // Position absolue pour flotter
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderTopColor: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.1)' : '#E0E0E0',
    paddingTop: 8,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        // Effet blur pour iOS
        backdropFilter: 'blur(20px)',
      },
      android: {
        elevation: 16, // Plus d'élévation pour bien se détacher
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    minHeight: 48,
  },
  tabContentActive: {
    backgroundColor: Platform.OS === 'ios' 
      ? 'rgba(0, 122, 255, 0.1)' 
      : 'rgba(25, 118, 210, 0.12)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 32,
    height: 3,
    backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#1976D2',
    borderRadius: 2,
  },
});