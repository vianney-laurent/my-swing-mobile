import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { mobileAnalysisService } from '../lib/analysis/analysis-service';
import VideoPlayer from '../components/VideoPlayer';

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
  const { analysisId } = route.params;
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, [analysisId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      console.log('🔄 [AnalysisResult] Loading analysis:', analysisId);
      
      const data = await mobileAnalysisService.getAnalysis(analysisId);
      setAnalysis(data);
      
      console.log('✅ [AnalysisResult] Analysis loaded successfully');
    } catch (error) {
      console.error('❌ [AnalysisResult] Error loading analysis:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les résultats de l\'analyse',
        [
          { text: 'Retour', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Extraire et parser les données d'analyse Gemini
  const getAnalysisData = () => {
    if (!analysis) return null;

    try {
      // Parser la réponse Gemini depuis Supabase
      const geminiResponse = typeof analysis.gemini_response === 'string' 
        ? JSON.parse(analysis.gemini_response) 
        : analysis.gemini_response;

      const swingData = typeof analysis.swing_data === 'string'
        ? JSON.parse(analysis.swing_data)
        : analysis.swing_data || {};

      return {
        // Informations générales
        overallScore: geminiResponse.overallScore || analysis.overall_score || 0,
        confidence: geminiResponse.confidence || swingData.confidence || 0,
        clubUsed: analysis.club_used || 'Non spécifié',
        cameraAngle: analysis.camera_angle || 'Non spécifié',
        analysisDate: new Date(analysis.created_at),
        videoUrl: analysis.video_url,
        
        // Points forts
        strengths: geminiResponse.strengths || [],
        
        // Problèmes critiques avec priorités
        criticalIssues: geminiResponse.criticalIssues || [],
        
        // Conseils actionnables
        actionableAdvice: geminiResponse.actionableAdvice || [],
        
        // Actions immédiates
        immediateActions: geminiResponse.immediateActions || {},
        
        // Analyse technique du swing par phases
        swingAnalysis: geminiResponse.swingAnalysis || {},
        
        // Métadonnées techniques
        metadata: {
          processingTime: swingData.totalTime || 0,
          videoSize: swingData.videoSize || 0,
          userLevel: swingData.userLevel || 'intermediate'
        }
      };
    } catch (error) {
      console.error('❌ Error parsing analysis data:', error);
      return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Vert
    if (score >= 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Rouge
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return '#ef4444'; // Rouge pour priorité haute
    if (priority === 2) return '#f59e0b'; // Orange pour priorité moyenne
    return '#64748b'; // Gris pour priorité basse
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Chargement des résultats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const analysisData = getAnalysisData();
  
  if (!analysisData) {
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
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Impossible de charger l'analyse</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Analyse de Swing</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section Score Principal */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreHeader}>
            <View style={styles.scoreMain}>
              <Text style={[styles.scoreValue, { color: getScoreColor(analysisData.overallScore) }]}>
                {analysisData.overallScore}
              </Text>
              <Text style={styles.scoreLabel}>/ 100</Text>
            </View>
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confiance IA</Text>
              <Text style={[styles.confidenceValue, { color: getConfidenceColor(analysisData.confidence) }]}>
                {analysisData.confidence}%
              </Text>
            </View>
          </View>
          
          <View style={styles.scoreBar}>
            <View 
              style={[
                styles.scoreProgress, 
                { 
                  width: `${analysisData.overallScore}%`,
                  backgroundColor: getScoreColor(analysisData.overallScore)
                }
              ]} 
            />
          </View>

          <View style={styles.analysisInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="golf" size={16} color="#64748b" />
              <Text style={styles.infoText}>{analysisData.clubUsed}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="videocam" size={16} color="#64748b" />
              <Text style={styles.infoText}>Vue {analysisData.cameraAngle}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time" size={16} color="#64748b" />
              <Text style={styles.infoText}>{formatDate(analysisData.analysisDate)}</Text>
            </View>
          </View>
        </View>

        {/* Section Lecteur Vidéo */}
        {analysisData.videoUrl && (
          <View style={styles.videoSection}>
            <VideoPlayer
              videoUrl={analysisData.videoUrl}
              title="Votre Swing Analysé"
              showAnalysisControls={true}
              onTimeUpdate={(currentTime, duration) => {
                // Callback pour synchroniser avec d'autres éléments si nécessaire
                console.log(`Video time: ${currentTime}/${duration}`);
              }}
            />
          </View>
        )}

        {/* Section Points Forts */}
        {analysisData.strengths.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.sectionTitle}>Points Forts</Text>
            </View>
            {analysisData.strengths.map((strength: any, index: number) => (
              <View key={index} style={styles.strengthItem}>
                <View style={styles.strengthHeader}>
                  <Ionicons name="trophy" size={16} color="#10b981" />
                  <Text style={styles.strengthText}>{strength.strength}</Text>
                </View>
                <Text style={styles.strengthEvidence}>📍 {strength.evidence}</Text>
                <View style={styles.impactBadge}>
                  <Text style={styles.impactText}>Impact: {strength.impact}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Section Problèmes Critiques */}
        {analysisData.criticalIssues.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning" size={20} color="#ef4444" />
              <Text style={styles.sectionTitle}>Points d'Amélioration</Text>
            </View>
            {analysisData.criticalIssues.map((issue: any, index: number) => (
              <View key={index} style={styles.issueItem}>
                <View style={styles.issueHeader}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) }]}>
                    <Text style={styles.priorityText}>#{issue.priority}</Text>
                  </View>
                  <Text style={styles.issueTitle}>{issue.issue}</Text>
                </View>
                <Text style={styles.issueEvidence}>⏱️ {issue.timeEvidence}</Text>
                <View style={styles.actionContainer}>
                  <Text style={styles.actionLabel}>Action immédiate:</Text>
                  <Text style={styles.actionText}>{issue.immediateAction}</Text>
                </View>
                <Text style={styles.improvementText}>💡 {issue.expectedImprovement}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Section Conseils Actionnables */}
        {analysisData.actionableAdvice.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={20} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Exercices Recommandés</Text>
            </View>
            {analysisData.actionableAdvice.map((advice: any, index: number) => (
              <View key={index} style={styles.adviceItem}>
                <View style={styles.adviceHeader}>
                  <Text style={styles.adviceCategory}>{advice.category}</Text>
                  <View style={[styles.difficultyBadge, { 
                    backgroundColor: advice.difficulty === 'easy' ? '#10b981' : 
                                   advice.difficulty === 'medium' ? '#f59e0b' : '#ef4444'
                  }]}>
                    <Text style={styles.difficultyText}>{advice.difficulty}</Text>
                  </View>
                </View>
                <Text style={styles.adviceInstruction}>{advice.instruction}</Text>
                <Text style={styles.adviceTest}>🎯 Test: {advice.howToTest}</Text>
                <Text style={styles.adviceTime}>⏰ Résultats attendus: {advice.timeToSee}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Section Analyse Technique du Swing */}
        {analysisData.swingAnalysis.phases && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics" size={20} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Analyse Technique</Text>
            </View>
            {analysisData.swingAnalysis.phases.map((phase: any, index: number) => (
              <View key={index} style={styles.phaseItem}>
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseName}>{phase.name}</Text>
                  <View style={styles.phaseQuality}>
                    <Text style={[styles.qualityScore, { color: getScoreColor(phase.quality) }]}>
                      {phase.quality}%
                    </Text>
                  </View>
                </View>
                <View style={styles.phaseObservations}>
                  {phase.observations.map((obs: string, obsIndex: number) => (
                    <Text key={obsIndex} style={styles.observationText}>• {obs}</Text>
                  ))}
                </View>
              </View>
            ))}
            
            {/* Tempo et Timing */}
            {analysisData.swingAnalysis.tempo && (
              <View style={styles.tempoSection}>
                <Text style={styles.tempoTitle}>Tempo & Timing</Text>
                <Text style={styles.tempoText}>{analysisData.swingAnalysis.tempo}</Text>
                {analysisData.swingAnalysis.timing && (
                  <Text style={styles.timingText}>{analysisData.swingAnalysis.timing}</Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Section Plan d'Action */}
        {analysisData.immediateActions && Object.keys(analysisData.immediateActions).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>Plan d'Action</Text>
            </View>
            
            {analysisData.immediateActions.nextSession && (
              <View style={styles.actionPlan}>
                <Text style={styles.actionPlanTitle}>🎯 Prochaine séance</Text>
                {analysisData.immediateActions.nextSession.map((action: string, index: number) => (
                  <Text key={index} style={styles.actionPlanItem}>• {action}</Text>
                ))}
              </View>
            )}
            
            {analysisData.immediateActions.thisWeek && (
              <View style={styles.actionPlan}>
                <Text style={styles.actionPlanTitle}>📅 Cette semaine</Text>
                {analysisData.immediateActions.thisWeek.map((action: string, index: number) => (
                  <Text key={index} style={styles.actionPlanItem}>• {action}</Text>
                ))}
              </View>
            )}
            
            {analysisData.immediateActions.longTerm && (
              <View style={styles.actionPlan}>
                <Text style={styles.actionPlanTitle}>🎯 Long terme</Text>
                {analysisData.immediateActions.longTerm.map((action: string, index: number) => (
                  <Text key={index} style={styles.actionPlanItem}>• {action}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('camera')}
          >
            <Ionicons name="camera" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Nouvelle Analyse</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('history')}
          >
            <Ionicons name="time" size={20} color="#3b82f6" />
            <Text style={styles.secondaryButtonText}>Voir l'Historique</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  
  // Section Score Principal
  scoreSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 56,
  },
  scoreLabel: {
    fontSize: 20,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '500',
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 6,
  },
  analysisInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
    fontWeight: '500',
  },

  // Section vidéo
  videoSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },

  // Sections générales
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 8,
  },

  // Points forts
  strengthItem: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  strengthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginLeft: 8,
    flex: 1,
  },
  strengthEvidence: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  impactBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  impactText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },

  // Problèmes critiques
  issueItem: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991b1b',
    flex: 1,
  },
  issueEvidence: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  actionContainer: {
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ea580c',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#c2410c',
    lineHeight: 20,
  },
  improvementText: {
    fontSize: 14,
    color: '#059669',
    fontStyle: 'italic',
  },

  // Conseils actionnables
  adviceItem: {
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  adviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adviceCategory: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  adviceInstruction: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
    marginBottom: 8,
  },
  adviceTest: {
    fontSize: 13,
    color: '#a16207',
    marginBottom: 4,
  },
  adviceTime: {
    fontSize: 13,
    color: '#a16207',
  },

  // Analyse technique
  phaseItem: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
  },
  phaseQuality: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qualityScore: {
    fontSize: 14,
    color: 'white',
    fontWeight: '700',
  },
  phaseObservations: {
    marginTop: 8,
  },
  observationText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    marginBottom: 4,
  },
  tempoSection: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  tempoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  tempoText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 8,
  },
  timingText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Plan d'action
  actionPlan: {
    backgroundColor: '#faf5ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionPlanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c3aed',
    marginBottom: 8,
  },
  actionPlanItem: {
    fontSize: 14,
    color: '#6d28d9',
    lineHeight: 20,
    marginBottom: 4,
  },

  // Boutons d'action
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  // États de chargement et d'erreur
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
});