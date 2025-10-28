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

interface AnalysisResultScreenProps {
  route: {
    params: {
      analysisId: string;
      result?: any;
    };
  };
  navigation: any;
}

export default function AnalysisResultScreen({ route, navigation }: AnalysisResultScreenProps) {
  const { analysisId, result } = route.params;

  // Mock analysis result for now
  const mockResult = {
    score: 85,
    feedback: [
      "Excellent équilibre pendant le backswing",
      "Améliorer la rotation des hanches à l'impact",
      "Bon tempo général du swing"
    ],
    metrics: {
      tempo: 82,
      balance: 90,
      power: 78,
      accuracy: 88
    }
  };

  const analysisData = result || mockResult;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Résultats d'analyse</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Score global</Text>
          <Text style={styles.scoreValue}>{analysisData.score}/100</Text>
          <View style={styles.scoreBar}>
            <View 
              style={[
                styles.scoreProgress, 
                { width: `${analysisData.score}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Métriques détaillées</Text>
          {Object.entries(analysisData.metrics).map(([key, value]) => (
            <View key={key} style={styles.metricItem}>
              <Text style={styles.metricLabel}>
                {key === 'tempo' ? 'Tempo' :
                 key === 'balance' ? 'Équilibre' :
                 key === 'power' ? 'Puissance' : 'Précision'}
              </Text>
              <View style={styles.metricBar}>
                <View 
                  style={[
                    styles.metricProgress, 
                    { width: `${value}%` }
                  ]} 
                />
              </View>
              <Text style={styles.metricValue}>{value}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Conseils d'amélioration</Text>
          {analysisData.feedback.map((tip: string, index: number) => (
            <View key={index} style={styles.feedbackItem}>
              <Ionicons name="bulb" size={16} color="#10b981" />
              <Text style={styles.feedbackText}>{tip}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Camera')}
        >
          <Ionicons name="camera" size={20} color="white" />
          <Text style={styles.actionButtonText}>Nouvelle analyse</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scoreSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 16,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  metricsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 80,
  },
  metricBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  metricProgress: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    width: 40,
    textAlign: 'right',
  },
  feedbackSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});