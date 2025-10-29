import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dailyTipsService, DailyTip } from '../../lib/tips/daily-tips-service';
import { ShimmerEffect } from '../ui/ShimmerEffect';

interface DailyTipCardProps {
  onTipPress?: (tip: DailyTip) => void;
}

export default function DailyTipCard({ onTipPress }: DailyTipCardProps) {
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadTodaysTip();
  }, []);

  const loadTodaysTip = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎯 Loading today\'s tip...');
      
      // Essayer de récupérer le conseil du jour
      let todaysTip = await dailyTipsService.getTodaysTip();
      
      // Si pas de conseil pour aujourd'hui, en générer un
      if (!todaysTip) {
        console.log('📝 No tip for today, generating one...');
        todaysTip = await dailyTipsService.ensureTodaysTip();
      }
      
      setTip(todaysTip);
      
      // Animation d'apparition
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      console.log('✅ Today\'s tip loaded:', todaysTip.title);
      
    } catch (error) {
      console.error('❌ Error loading today\'s tip:', error);
      setError('Impossible de charger le conseil du jour');
      
      // Essayer de récupérer un conseil récent en fallback
      try {
        const recentTips = await dailyTipsService.getRecentTips(1);
        if (recentTips.length > 0) {
          setTip(recentTips[0]);
          setError(null);
          console.log('⚠️ Using recent tip as fallback');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };



  const getCategoryLabel = (category: string): string => {
    const labels = {
      technique: 'Technique',
      mental: 'Mental',
      equipement: 'Équipement',
      entrainement: 'Entraînement'
    };
    return labels[category as keyof typeof labels] || 'Conseil';
  };

  const getDifficultyLabel = (level: string): string => {
    const labels = {
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé'
    };
    return labels[level as keyof typeof labels] || 'Tous niveaux';
  };

  const getDifficultyColor = (level: string): string => {
    const colors = {
      beginner: '#10b981',
      intermediate: '#f59e0b',
      advanced: '#ef4444'
    };
    return colors[level as keyof typeof colors] || '#64748b';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ShimmerEffect height={20} width="60%" style={{ marginBottom: 8 }} />
          <ShimmerEffect height={16} width="40%" />
        </View>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <ShimmerEffect height={40} width={40} borderRadius={20} />
          </View>
          <View style={styles.textContainer}>
            <ShimmerEffect height={18} width="80%" style={{ marginBottom: 8 }} />
            <ShimmerEffect height={14} width="100%" style={{ marginBottom: 4 }} />
            <ShimmerEffect height={14} width="90%" />
          </View>
        </View>
      </View>
    );
  }

  if (error && !tip) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTodaysTip}>
            <Ionicons name="refresh" size={16} color="#3b82f6" />
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!tip) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header avec date et catégorie */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.dateText}>Conseil du jour</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{getCategoryLabel(tip.category)}</Text>
          </View>
        </View>
      </View>

      {/* Contenu principal */}
      <TouchableOpacity
        style={styles.content}
        onPress={() => onTipPress?.(tip)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: tip.color }]}>
          <Ionicons 
            name={tip.icon as any} 
            size={24} 
            color="white" 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{tip.title}</Text>
          <Text style={styles.contentText}>{tip.content}</Text>
          
          {/* Badge de difficulté */}
          <View style={styles.footer}>
            <View style={[
              styles.difficultyBadge, 
              { backgroundColor: getDifficultyColor(tip.difficulty_level) }
            ]}>
              <Text style={styles.difficultyText}>
                {getDifficultyLabel(tip.difficulty_level)}
              </Text>
            </View>
            
            {tip.generated_by === 'gemini' && (
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={12} color="#8b5cf6" />
                <Text style={styles.aiText}>IA</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>


    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  categoryBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },

  content: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  iconContainer: {
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 24,
  },
  contentText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  aiText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8b5cf6',
  },

  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});