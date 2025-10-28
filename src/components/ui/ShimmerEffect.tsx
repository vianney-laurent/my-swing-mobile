import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

interface ShimmerEffectProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            opacity,
            borderRadius,
          },
        ]}
      />
    </View>
  );
};

// Composants shimmer spécialisés
export const ShimmerCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.card, style]}>
    <ShimmerEffect height={16} width="60%" style={{ marginBottom: 8 }} />
    <ShimmerEffect height={12} width="40%" style={{ marginBottom: 12 }} />
    <ShimmerEffect height={14} width="80%" />
  </View>
);

export const ShimmerStatCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.statCard, style]}>
    <ShimmerEffect height={24} width={24} borderRadius={12} style={{ marginBottom: 8 }} />
    <ShimmerEffect height={20} width="50%" style={{ marginBottom: 4 }} />
    <ShimmerEffect height={12} width="70%" />
  </View>
);

export const ShimmerProfileField: React.FC = () => (
  <View style={styles.profileField}>
    <ShimmerEffect height={20} width={20} borderRadius={10} />
    <View style={styles.fieldContent}>
      <ShimmerEffect height={14} width="40%" style={{ marginBottom: 4 }} />
      <ShimmerEffect height={16} width="70%" />
    </View>
  </View>
);

export const ShimmerAnalysisCard: React.FC = () => (
  <View style={styles.analysisCard}>
    <View style={styles.analysisHeader}>
      <View style={styles.analysisInfo}>
        <ShimmerEffect height={16} width="50%" style={{ marginBottom: 4 }} />
        <ShimmerEffect height={14} width="70%" />
      </View>
      <View style={styles.scoreContainer}>
        <ShimmerEffect height={24} width={40} style={{ marginBottom: 2 }} />
        <ShimmerEffect height={12} width={30} />
      </View>
    </View>
    <View style={styles.analysisFooter}>
      <View style={styles.statusContainer}>
        <ShimmerEffect height={8} width={8} borderRadius={4} style={{ marginRight: 8 }} />
        <ShimmerEffect height={14} width={60} />
      </View>
      <ShimmerEffect height={20} width={20} borderRadius={10} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  shimmer: {
    flex: 1,
    backgroundColor: '#e2e8f0',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileField: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fieldContent: {
    flex: 1,
    marginLeft: 12,
  },
  analysisCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  analysisInfo: {
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  analysisFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});