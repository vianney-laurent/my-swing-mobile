import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { mobileAnalysisService } from '../lib/analysis/analysis-service';
import { MobileProfileService, UserProfile } from '../lib/profile/mobile-profile-service';
import { MobileWeatherService } from '../lib/weather/mobile-weather-service';
import WeatherCard from '../components/WeatherCard';
import { useSafeBottomPadding } from '../hooks/useSafeBottomPadding';
import { ShimmerEffect, ShimmerStatCard } from '../components/ui/ShimmerEffect';
import DailyTipCard from '../components/tips/DailyTipCard';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalAnalyses: 0, averageScore: 0, bestScore: 0 });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [greeting, setGreeting] = useState({ text: 'Bonjour !', emoji: '👋' });
  const { containerPaddingBottom } = useSafeBottomPadding();

  console.log('🏠 HomeScreen rendered, user:', user?.email);

  useEffect(() => {
    if (user) {
      loadHomeData();
    }
  }, [user]);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Charger le profil utilisateur
      const userProfile = await MobileProfileService.getCurrentUserProfile();
      setProfile(userProfile);
      
      // Générer le greeting personnalisé avec météo
      const userName = MobileProfileService.getDisplayName(userProfile);
      const personalizedGreeting = await MobileWeatherService.generatePersonalizedGreeting(
        userName, 
        userProfile?.city || undefined
      );
      setGreeting(personalizedGreeting);
      
      // Charger les statistiques
      await loadStats();
      
    } catch (error) {
      console.error('❌ Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading analysis stats...');
      
      const analyses = await mobileAnalysisService.getUserAnalyses(50);
      console.log(`📊 Loaded ${analyses.length} analyses`);
      
      const totalAnalyses = analyses.length;
      const scores = analyses.filter(a => a.overall_score && a.overall_score > 0).map(a => a.overall_score);
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

      setStats({ totalAnalyses, averageScore, bestScore });
      console.log('📊 Stats calculated:', { totalAnalyses, averageScore, bestScore });
    } catch (error) {
      console.error('❌ Error loading stats:', error);
      // Garder les stats à 0 en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const userName = MobileProfileService.getDisplayName(profile);

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
        {/* Header simple pour test */}
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
          {loading ? (
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
        {loading ? (
          <View style={styles.weatherSection}>
            <View style={styles.weatherShimmer}>
              <ShimmerEffect height={16} width="40%" style={{ marginBottom: 8 }} />
              <ShimmerEffect height={20} width="60%" style={{ marginBottom: 12 }} />
              <ShimmerEffect height={14} width="80%" />
            </View>
          </View>
        ) : profile?.city ? (
          <View style={styles.weatherSection}>
            <WeatherCard city={profile.city} />
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
            // Optionnel: naviguer vers une page de détail du conseil
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

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