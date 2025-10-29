import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { mobileAnalysisService } from '../lib/analysis/analysis-service';
import { Analysis } from '../types/profile';
// formatDistanceToNow et fr sont maintenant utilisés dans EnhancedAnalysisCard
import { ShimmerStatCard, ShimmerAnalysisCard } from '../components/ui/ShimmerEffect';
import { useSafeBottomPadding } from '../hooks/useSafeBottomPadding';
import EnhancedAnalysisCard from '../components/history/EnhancedAnalysisCard';

interface UserStats {
  totalAnalyses: number;
  averageScore: number;
  bestScore: number;
}

interface HistoryScreenProps {
  navigation: any;
}

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalAnalyses: 0,
    averageScore: 0,
    bestScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { containerPaddingBottom } = useSafeBottomPadding();

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      console.log('🔄 [HistoryScreen] Loading analyses...');
      
      // Récupérer les vraies analyses depuis Supabase
      const data = await mobileAnalysisService.getUserAnalyses(20);
      setAnalyses(data);
      
      console.log(`✅ [HistoryScreen] Loaded ${data.length} analyses`);
      
      // Calculate stats
      const totalAnalyses = data.length;
      const scores = data.filter((a: Analysis) => a.overall_score).map((a: Analysis) => a.overall_score);
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

      setStats({ totalAnalyses, averageScore, bestScore });
      console.log('📊 [HistoryScreen] Stats calculated:', { totalAnalyses, averageScore, bestScore });
    } catch (error) {
      console.error('❌ [HistoryScreen] Error loading analyses:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'historique des analyses');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyses();
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
    <EnhancedAnalysisCard 
      analysis={item}
      onPress={handleAnalysisPress}
      index={index}
    />
  );

  const renderStatsCards = () => (
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
  );

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
});