import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

// Fallback pour BlurView si pas disponible
let BlurView: any;
try {
  BlurView = require('expo-blur').BlurView;
} catch (error) {
  console.log('BlurView not available, using fallback');
  BlurView = View;
}

const { width: screenWidth } = Dimensions.get('window');

interface TabItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface NativeTabBarProps {
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

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function NativeTabBar({ currentScreen, onTabPress }: NativeTabBarProps) {
  const activeIndex = tabs.findIndex(tab => tab.key === currentScreen);
  const indicatorPosition = useSharedValue(activeIndex);

  React.useEffect(() => {
    indicatorPosition.value = withSpring(activeIndex, {
      damping: 20,
      stiffness: 200,
    });
  }, [activeIndex]);

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = screenWidth / tabs.length;
    const translateX = interpolate(
      indicatorPosition.value,
      [0, tabs.length - 1],
      [0, tabWidth * (tabs.length - 1)]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const renderIOSTabBar = () => {
    const hasBlur = BlurView && BlurView.name !== 'View';
    
    return (
      <View style={styles.iosContainer}>
        {hasBlur ? (
          <BlurView intensity={100} tint="light" style={styles.iosBlurContainer}>
            <View style={styles.iosContent}>
              {/* Indicateur animé */}
              <Animated.View style={[styles.iosIndicator, indicatorStyle]} />
              
              {/* Tabs */}
              {tabs.map((tab) => {
                const isActive = tab.key === currentScreen;
                
                return (
                  <AnimatedTouchableOpacity
                    key={tab.key}
                    style={styles.iosTab}
                    onPress={() => onTabPress(tab.key)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iosTabContent, isActive && styles.iosTabContentActive]}>
                      <Ionicons
                        name={isActive ? (tab.activeIcon || tab.icon) : tab.icon}
                        size={24}
                        color={isActive ? '#007AFF' : '#8E8E93'}
                      />
                    </View>
                  </AnimatedTouchableOpacity>
                );
              })}
            </View>
          </BlurView>
        ) : (
          <View style={styles.iosFallbackContainer}>
            <View style={styles.iosContent}>
              {/* Indicateur animé */}
              <Animated.View style={[styles.iosIndicator, indicatorStyle]} />
              
              {/* Tabs */}
              {tabs.map((tab) => {
                const isActive = tab.key === currentScreen;
                
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={styles.iosTab}
                    onPress={() => onTabPress(tab.key)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iosTabContent, isActive && styles.iosTabContentActive]}>
                      <Ionicons
                        name={isActive ? (tab.activeIcon || tab.icon) : tab.icon}
                        size={24}
                        color={isActive ? '#007AFF' : '#8E8E93'}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderAndroidTabBar = () => (
    <View style={styles.androidContainer}>
      <View style={styles.androidContent}>
        {tabs.map((tab, index) => {
          const isActive = tab.key === currentScreen;
          
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.androidTab}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.androidTabContent, isActive && styles.androidTabContentActive]}>
                <View style={[styles.androidIconContainer, isActive && styles.androidIconContainerActive]}>
                  <Ionicons
                    name={isActive ? (tab.activeIcon || tab.icon) : tab.icon}
                    size={24}
                    color={isActive ? '#1976D2' : '#757575'}
                  />
                </View>
                {isActive && (
                  <View style={styles.androidIndicator} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return Platform.OS === 'ios' ? renderIOSTabBar() : renderAndroidTabBar();
}

const styles = StyleSheet.create({
  // iOS Styles (Liquid Glass Effect)
  iosContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 34, // Safe area for iPhone
  },
  iosBlurContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  iosContent: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
    position: 'relative',
  },
  iosIndicator: {
    position: 'absolute',
    top: 8,
    width: screenWidth / 4 - 16,
    height: 40,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  iosTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  iosTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iosTabContentActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  iosFallbackContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  // Android Styles (Material Design)
  androidContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  androidContent: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  androidTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  androidTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  androidTabContentActive: {
    // Active state handled by indicator
  },
  androidIconContainer: {
    padding: 8,
    borderRadius: 16,
  },
  androidIconContainerActive: {
    backgroundColor: 'rgba(25, 118, 210, 0.12)',
  },
  androidIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 32,
    height: 3,
    backgroundColor: '#1976D2',
    borderRadius: 2,
  },
});