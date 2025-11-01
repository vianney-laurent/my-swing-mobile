import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DataManager, UserStats } from '../lib/cache/data-manager';
import { Analysis } from '../types/profile';
import { ShimmerStatCard, ShimmerAnalysisCard } from '../components/ui/ShimmerEffect';
import { useSafeBottomPadding } from '../hooks/useSafeBottomPadding';
import { useAuth } from '../hooks/useAuth';
import { useAppData } from '../contexts/AppDataContext';
import OptimizedAnalysisCard from '../components/history/OptimizedAnalysisCard';

interface HistoryScreenProps {
  navigation: any;
}

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const { user } = useAuth();
  const { userStats, refreshAnalyses, isLoadingStats } = useAppData();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const { containerPaddingBottom } = useSafeBottomPadding();

  const INITIAL_LIMIT = 8; // Charger moins d'analyses initialement
  const LOAD_MORE_LIMIT = 5; // Charger par petits groupes

  useEffect(() => {
    if (user) {
      loadHistoryData();
    }
  }, [user]);

  const loadHistoryData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      if (!user) return;

      console.log('🔄 [HistoryScreen] Loading history data...');
      
      // Chargement optimisé avec cache et pagination
      const historyData = await DataManager.loadHistoryData(
        user.id, 
        INITIAL_LIMIT, 
        forceRefresh
      );
      
      setAnalyses(historyData.analyses);
      setHasMore(historyData.hasMore);
      
      // Rafraîchir les stats via le contexte si nécessaire
      if (!userStats) {
        await refreshAnalyses(forceRefresh);
      }
      
      console.log(`✅ [HistoryScreen] Loaded ${historyData.analyses.length} analyses, hasMore: ${historyData.hasMore}`);
      
    } catch (error) {
      console.error('❌ [HistoryScreen] Error loading history data:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'historique des analyses');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreAnalyses = async () => {
    if (loadingMore || !hasMore || !user) return;

    try {
      setLoadingMore(true);
      console.log('📋 [HistoryScreen] Loading more analyses...');
      
      // Charger plus d'analyses depuis le cache ou l'API
      const moreAnalyses = await DataManager.getUserAnalyses(
        user.id, 
        analyses.length + LOAD_MORE_LIMIT, 
        false // Utiliser le cache si disponible
      );
      
      // Vérifier s'il y en a encore plus
      const allAnalyses = await DataManager.getUserAnalyses(
        user.id, 
        analyses.length + LOAD_MORE_LIMIT + 1, 
        false
      );
      
      setAnalyses(moreAnalyses);
      setHasMore(allAnalyses.length > moreAnalyses.length);
      
      console.log(`✅ [HistoryScreen] Loaded ${moreAnalyses.length} total analyses`);
      
    } catch (error) {
      console.error('❌ [HistoryScreen] Error loading more analyses:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistoryData(true); // Force refresh
    setRefreshing(false);
  };

  // getScoreColor est maintenant dans EnhancedAnalysisCard  
  const handleAnalysisPress = (analysis: Analysis) => {
    if (analysis.status === 'completed') {
      console.log('🔄 [HistoryScreen] Navigating to analysis:', analysis.id);
      navigation.navigate('AnalysisResult', { analysisId: analysis.id });
    } else {
      Alert.alert(
        'Analyse en cours',
        'Cette analyse n\'est pas encore terminée. Veuillez patienter quelques instants.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderAnalysisItem = ({ item, index }: { item: Analysis; index: number }) => (
    <OptimizedAnalysisCard 
      analysis={item}
      onPress={handleAnalysisPress}
      index={index}
    />
  );

  const renderStatsCards = () => {
    const stats = userStats || { totalAnalyses: 0, averageScore: 0, bestScore: 0 };
    const isLoadingStats = loading || isLoadingStats;
    
    return (
      <View style={styles.statsContainer}>
        {isLoadingStats ? (
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
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.subtitle}>Vos analyses et statistiques</Text>
      </View>

      {loading ? (
        <View>
          {renderStatsCards()}
          <ShimmerAnalysisCard />
          <ShimmerAnalysisCard />
          <ShimmerAnalysisCard />
        </View>
      ) : (
        <FlatList
          data={analyses}
          renderItem={renderAnalysisItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderStatsCards}
          ListFooterComponent={() => (
            hasMore ? (
              <TouchableOpacity 
                style={styles.loadMoreButton}
                onPress={loadMoreAnalyses}
                disabled={loadingMore}
              >
                <Ionicons 
                  name={loadingMore ? "hourglass" : "chevron-down"} 
                  size={20} 
                  color="#8b5cf6" 
                />
                <Text style={styles.loadMoreText}>
                  {loadingMore ? 'Chargement...' : 'Voir plus d\'analyses'}
                </Text>
              </TouchableOpacity>
            ) : analyses.length > 0 ? (
              <View style={styles.endMessage}>
                <Text style={styles.endMessageText}>
                  Toutes vos analyses sont affichées
                </Text>
              </View>
            ) : null
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Aucune analyse</Text>
              <Text style={styles.emptySubtitle}>
                Commencez par analyser votre premier swing
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={[styles.listContainer, { paddingBottom: containerPaddingBottom }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  listContainer: {
    flexGrow: 1,
    // paddingBottom sera géré dynamiquement par useSafeBottomPadding
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
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
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  // Styles de l'ancienne card supprimés - maintenant dans EnhancedAnalysisCard
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  endMessage: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  endMessageText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});