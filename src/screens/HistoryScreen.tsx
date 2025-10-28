import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  // Mock data - à remplacer par les vraies données Supabase
  const analyses = [
    {
      id: '1',
      date: '2024-01-15',
      score: 85,
      status: 'completed',
    },
    {
      id: '2',
      date: '2024-01-10',
      score: 78,
      status: 'completed',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.subtitle}>
          Vos analyses précédentes
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {analyses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="golf" size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Aucune analyse</Text>
            <Text style={styles.emptySubtitle}>
              Commencez par analyser votre premier swing !
            </Text>
          </View>
        ) : (
          <View style={styles.analysesList}>
            {analyses.map((analysis) => (
              <TouchableOpacity
                key={analysis.id}
                style={styles.analysisCard}
              >
                <View style={styles.analysisHeader}>
                  <Text style={styles.analysisDate}>
                    {new Date(analysis.date).toLocaleDateString('fr-FR')}
                  </Text>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>{analysis.score}</Text>
                    <Text style={styles.scoreLabel}>/100</Text>
                  </View>
                </View>
                
                <View style={styles.analysisFooter}>
                  <View style={styles.statusContainer}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={16} 
                      color="#10b981" 
                    />
                    <Text style={styles.statusText}>Terminé</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  analysesList: {
    padding: 20,
  },
  analysisCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 2,
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
  statusText: {
    fontSize: 14,
    color: '#10b981',
    marginLeft: 4,
  },
});