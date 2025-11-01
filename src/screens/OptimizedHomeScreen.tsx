import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../contexts/AppDataContext';
import { DataManager, WeatherPhrase } from '../lib/cache/data-manager';
import WeatherCard from '../components/WeatherCard';
import { useSafeBottomPadding } from '../hooks/useSafeBottomPadding';
import { ShimmerEffect, ShimmerStatCard } from '../components/ui/ShimmerEffect';
import DailyTipCard from '../components/tips/DailyTipCard';

interface HomeScreenProps {
  navigation: any;
}

export default function OptimizedHomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const { 
    userProfile, 
    userStats, 
    refreshUserData,
    isLoadingProfile,
    isLoadingStats 
  } = useAppData();
  
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState<WeatherPhrase>({ text: 'Bonjour !', emoji: '👋' });
  const [loadingGreeting, setLoadingGreeting] = useState(true);
  const { containerPaddingBottom } = useSafeBottomPadding();

  console.log('🏠 OptimizedHomeScreen rendered, user:', user?.email);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      // Charger les données utilisateur via le contexte (avec cache)
      await refreshUserData();
      
      // Charger le greeting en parallèle
      await loadGreeting();
      
    } catch (error) {
      console.error('❌ [OptimizedHomeScreen] Error loading initial data:', error);
    }
  };

  const loadGreeting = async (forceRefresh = false) => {
    try {
      setLoadingGreeting(true);
      
      if (!user) return;

      // Utiliser la ville du profil si disponible
      const city = userProfile?.city;
      const userName = userProfile?.first_name || userProfile?.email?.split('@')[0] || 'Golfeur';
      
      if (city) {
        const weatherGreeting = await DataManager.getWeatherData(city, forceRefresh);
        if (weatherGreeting) {
          // Personnaliser avec le nom d'utilisateur
          setGreeting({
            ...weatherGreeting,
            text: weatherGreeting.text.replace('Bonjour !', `Bonjour, ${userName} !`)
          });
          return;
        }
      }
      
      // Fallback sans météo
      setGreeting({
        text: `Bonjour, ${userName} !`,
        emoji: '👋'
      });
      
    } catch (error) {
      console.error('❌ [OptimizedHomeScreen] Error loading greeting:', error);
    } finally {
      setLoadingGreeting(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    
    try {
      // Forcer le rechargement de toutes les données
      await Promise.all([
        refreshUserData(true),
        loadGreeting(true)
      ]);
    } catch (error) {
      console.error('❌ [OptimizedHomeScreen] Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const userName = userProfile?.first_name || userProfile?.email?.split('@')[0] || 'Golfeur';
  const isLoading = isLoadingProfile || isLoadingStats || loadingGreeting;
  const stats = userStats || { totalAnalyses: 0, averageScore: 0, bestScore: 0 };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: containerPaddingBottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeBadge}>
            <Ionicons name="golf" size={16} color="white" />
            <Text style={styles.welcomeBadgeText}>Bienvenue sur My Swing</Text>
          </View>
          
          <Text style={styles.title}>Bonjour, {userName} ! {greeting.emoji}</Text>
          <Text style={styles.subtitle}>{greeting.text}</Text>
        </View>

        {/* Action principale - Nouvelle Analyse */}
        <View style={styles.mainAction}>
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={() => navigation.navigate('camera')}
            activeOpacity={0.8}
          >
            <View style={styles.analyzeButtonContent}>
              <View style={styles.analyzeIcon}>
                <Ionicons name="camera" size={28} color="white" />
              </View>
              <View style={styles.analyzeText}>
                <Text style={styles.analyzeTitle}>Nouvelle Analyse</Text>
                <Text style={styles.analyzeSubtitle}>Analysez votre swing maintenant</Text>
              </View>
              <View style={styles.analyzeArrow}>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section Mes Progrès */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Ionicons name="trending-up" size={20} color="#8b5cf6" />
            <Text style={styles.progressTitle}>Mes Progrès</Text>
          </View>
          <Text style={styles.progressSubtitle}>Suivez votre évolution</Text>
          
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('history')}
          >
            <Ionicons name="eye" size={16} color="white" />
            <Text style={styles.historyButtonText}>Voir l'historique</Text>
          </TouchableOpacity>
        </View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          {isLoading ? (
            <>
              <ShimmerStatCard />
              <ShimmerStatCard />
              <ShimmerStatCard />
            </>
          ) : (
            <>
              <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
                <Ionicons name="bar-chart" size={24} color="white" />
                <Text style={styles.statNumber}>{stats.totalAnalyses}</Text>
                <Text style={styles.statLabel}>Analyses</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
                <Ionicons name="analytics" size={24} color="white" />
                <Text style={styles.statNumber}>{stats.averageScore}</Text>
                <Text style={styles.statLabel}>Moyenne</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="trophy" size={24} color="white" />
                <Text style={styles.statNumber}>{stats.bestScore}</Text>
                <Text style={styles.statLabel}>Meilleur</Text>
              </View>
            </>
          )}
        </View>

        {/* Météo */}
        {loadingGreeting ? (
          <View style={styles.weatherSection}>
            <View style={styles.weatherShimmer}>
              <ShimmerEffect height={16} width="40%" style={{ marginBottom: 8 }} />
              <ShimmerEffect height={20} width="60%" style={{ marginBottom: 12 }} />
              <ShimmerEffect height={14} width="80%" />
            </View>
          </View>
        ) : userProfile?.city ? (
          <View style={styles.weatherSection}>
            <WeatherCard city={userProfile.city} />
          </View>
        ) : null}

        {/* Catégories d'actions */}
        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Actions Rapides</Text>
          
          <View style={styles.categoriesGrid}>
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => navigation.navigate('camera')}
            >
              <View style={[styles.categoryIcon, { backgroundColor: '#10b981' }]}>
                <Ionicons name="videocam" size={24} color="white" />
              </View>
              <Text style={styles.categoryTitle}>Enregistrer</Text>
              <Text style={styles.categorySubtitle}>Nouveau swing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => navigation.navigate('history')}
            >
              <View style={[styles.categoryIcon, { backgroundColor: '#8b5cf6' }]}>
                <Ionicons name="time" size={24} color="white" />
              </View>
              <Text style={styles.categoryTitle}>Historique</Text>
              <Text style={styles.categorySubtitle}>Mes analyses</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => navigation.navigate('profile')}
            >
              <View style={[styles.categoryIcon, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="person" size={24} color="white" />
              </View>
              <Text style={styles.categoryTitle}>Profil</Text>
              <Text style={styles.categorySubtitle}>Mes infos</Text>
            </TouchableOpacity>

            <View style={[styles.categoryCard, styles.categoryCardDisabled]}>
              <View style={[styles.categoryIcon, { backgroundColor: '#94a3b8' }]}>
                <Ionicons name="bulb" size={24} color="white" />
              </View>
              <Text style={[styles.categoryTitle, styles.categoryTitleDisabled]}>Conseils</Text>
              <Text style={[styles.categorySubtitle, styles.categorySubtitleDisabled]}>Bientôt disponible</Text>
            </View>
          </View>
        </View>

        {/* Conseil du jour dynamique */}
        <DailyTipCard 
          onTipPress={(tip) => {
            console.log('💡 Tip pressed:', tip.title);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// Réutiliser les mêmes styles que HomeScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollView: {
    flex: 1,
  },
  
  // Header
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  welcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 6,
  },
  welcomeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
  },

  // Action principale
  mainAction: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  analyzeButton: {
    backgroundColor: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    borderRadius: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  analyzeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#10b981',
    borderRadius: 16,
  },
  analyzeIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
  },
  analyzeText: {
    flex: 1,
  },
  analyzeTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  analyzeSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  analyzeArrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },

  // Section Progrès
  progressSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  historyButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  historyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Statistiques
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Météo
  weatherSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  weatherShimmer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Catégories
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  categoryCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#f8fafc',
  },
  categoryTitleDisabled: {
    color: '#94a3b8',
  },
  categorySubtitleDisabled: {
    color: '#94a3b8',
  },
});