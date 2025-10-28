import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { mobileAnalysisService } from '../lib/analysis/analysis-service';
import { Analysis } from '../types/profile';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };  
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

  const renderAnalysisItem = ({ item }: { item: Analysis }) => (
    <TouchableOpacity 
      style={styles.analysisCard}
      onPress={() => handleAnalysisPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.analysisHeader}>
        <View style={styles.analysisInfo}>
          <Text style={styles.analysisType}>
            {item.analysis_type === 'correction' ? 'Correction' : 'Analyse'}
          </Text>
          <Text style={styles.analysisDate}>
            {formatDistanceToNow(new Date(item.created_at), { 
              addSuffix: true, 
              locale: fr 
            })}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: getScoreColor(item.overall_score || 0) }]}>
            {item.overall_score || 0}
          </Text>
          <Text style={styles.scoreLabel}>/100</Text>
        </View>
      </View>
      
      <View style={styles.analysisFooter}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: item.status === 'completed' ? '#10b981' : '#f59e0b' }
          ]} />
          <Text style={styles.statusText}>
            {item.status === 'completed' ? 'Terminée' : 'En cours'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.subtitle}>Vos analyses et statistiques</Text>
      </View>

      <FlatList
        data={analyses}
        renderItem={renderAnalysisItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderStatsCards}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Aucune analyse</Text>
              <Text style={styles.emptySubtitle}>
                Commencez par analyser votre premier swing
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: 20,
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
  analysisCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  analysisType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  analysisDate: {
    fontSize: 14,
    color: '#64748b',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748b',
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
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#64748b',
  },
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