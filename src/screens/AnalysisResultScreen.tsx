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
import { UnifiedAnalysisService } from '../lib/analysis/unified-analysis-service';
import EnhancedVideoPlayer from '../components/EnhancedVideoPlayer';
import DeleteConfirmationModal from '../components/ui/DeleteConfirmationModal';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, [analysisId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      console.log('🔄 [AnalysisResult] Loading analysis:', analysisId);
      
      const data = await UnifiedAnalysisService.getAnalysis(analysisId);
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

      console.log('🔍 [AnalysisResult] Parsing Gemini response:', {
        hasGeminiResponse: !!geminiResponse,
        responseKeys: geminiResponse ? Object.keys(geminiResponse) : [],
        overallScore: geminiResponse?.overall_score,
        keyInsightsCount: geminiResponse?.key_insights?.length || 0,
        recommendationsCount: geminiResponse?.recommendations?.length || 0,
        swingPhasesKeys: geminiResponse?.swing_phases ? Object.keys(geminiResponse.swing_phases) : []
      });

      // Extraire les points forts depuis key_insights
      const strengths = geminiResponse?.key_insights?.filter((insight: any) => 
        insight.severity === 'positive'
      ).map((insight: any) => ({
        strength: insight.title,
        evidence: insight.description,
        impact: `Observé à ${insight.timestamp}s`
      })) || [];

      // Extraire les problèmes critiques depuis key_insights
      const criticalIssues = geminiResponse?.key_insights?.filter((insight: any) => 
        insight.severity === 'needs_attention'
      ).map((insight: any, index: number) => ({
        issue: insight.title,
        timeEvidence: `Observé à ${insight.timestamp}s - ${insight.description}`,
        immediateAction: geminiResponse?.recommendations?.[index]?.description || 'Travaillez sur cet aspect',
        expectedImprovement: geminiResponse?.recommendations?.[index]?.drill_suggestion || 'Amélioration progressive',
        priority: geminiResponse?.recommendations?.[index]?.priority === 'high' ? 1 : 
                 geminiResponse?.recommendations?.[index]?.priority === 'medium' ? 2 : 3
      })) || [];

      // Extraire les conseils actionnables depuis recommendations
      const actionableAdvice = geminiResponse?.recommendations?.map((rec: any, index: number) => ({
        category: rec.priority === 'high' ? 'Technique' : 'Amélioration',
        instruction: rec.description,
        howToTest: rec.drill_suggestion || 'Pratiquez régulièrement et observez les résultats',
        timeToSee: rec.priority === 'high' ? 'Quelques séances' : 'Plusieurs semaines',
        difficulty: rec.priority === 'high' ? 'medium' : 'easy'
      })) || [];

      // Extraire l'analyse technique depuis swing_phases et technical_analysis
      const swingAnalysis = {
        phases: geminiResponse?.swing_phases ? Object.entries(geminiResponse.swing_phases).map(([name, data]: [string, any]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          quality: data.score || 75,
          observations: [data.feedback || 'Analyse en cours...']
        })) : [],
        tempo: geminiResponse?.technical_analysis?.tempo || 'Tempo analysé automatiquement',
        timing: geminiResponse?.technical_analysis?.balance || 'Équilibre évalué',
        // Nouveaux champs d'analyse technique
        clubPath: geminiResponse?.technical_analysis?.club_path || '',
        faceAngle: geminiResponse?.technical_analysis?.face_angle || '',
        weightTransfer: geminiResponse?.technical_analysis?.weight_transfer || '',
        spineAngle: geminiResponse?.technical_analysis?.spine_angle || '',
        // Métriques de performance
        performanceMetrics: geminiResponse?.performance_metrics || {},
        // Insights personnalisés
        personalizedInsights: geminiResponse?.personalized_insights || {}
      };

      // Actions immédiates - structure depuis les recommandations
      const immediateActions = {
        nextSession: geminiResponse?.recommendations?.filter((r: any) => r.priority === 'high')
          .map((r: any) => r.description).slice(0, 3) || [],
        thisWeek: geminiResponse?.recommendations?.filter((r: any) => r.priority === 'medium')
          .map((r: any) => r.description).slice(0, 3) || [],
        longTerm: geminiResponse?.recommendations?.filter((r: any) => r.priority === 'low')
          .map((r: any) => r.description).slice(0, 3) || []
      };

      const result = {
        // Informations générales
        overallScore: geminiResponse?.overall_score || analysis.overall_score || 0,
        confidence: geminiResponse?.confidence || swingData.confidence || 75,
        clubUsed: analysis.club_used || 'Non spécifié',
        cameraAngle: analysis.camera_angle || 'Non spécifié',
        analysisDate: new Date(analysis.created_at),
        videoUrl: analysis.video_url,
        
        // Données parsées depuis la réponse Gemini
        strengths,
        criticalIssues,
        actionableAdvice,
        immediateActions,
        swingAnalysis,
        
        // Métadonnées techniques
        metadata: {
          processingTime: swingData.totalTime || 0,
          videoSize: swingData.videoSize || 0,
          userLevel: swingData.userLevel || 'intermediate'
        }
      };

      console.log('✅ [AnalysisResult] Parsed analysis data:', {
        overallScore: result.overallScore,
        strengthsCount: result.strengths.length,
        criticalIssuesCount: result.criticalIssues.length,
        actionableAdviceCount: result.actionableAdvice.length,
        swingPhasesCount: result.swingAnalysis.phases.length
      });

      return result;
    } catch (error) {
      console.error('❌ Error parsing analysis data:', error);
      console.error('❌ Raw gemini_response:', analysis.gemini_response);
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

  const handleDeleteAnalysis = async () => {
    try {
      setIsDeleting(true);
      console.log('🗑️ Deleting analysis:', analysisId);
      
      // TODO: Implement delete in UnifiedAnalysisService
      console.log('Delete not implemented yet in unified service');
      
      console.log('✅ Analysis deleted successfully');
      setShowDeleteModal(false);
      
      // Redirection directe vers l'historique sans message de confirmation
      navigation.goBack();
      
    } catch (error) {
      console.error('❌ Delete analysis failed:', error);
      setIsDeleting(false);
      setShowDeleteModal(false);
      
      Alert.alert(
        'Erreur de suppression',
        error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression',
        [{ text: 'OK' }]
      );
    }
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

        {/* Section Lecteur Vidéo Amélioré */}
        {analysisData.videoUrl && (
          <View style={styles.videoSection}>
            <EnhancedVideoPlayer
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

        {/* Section Points d'Amélioration - Design Amélioré */}
        {analysisData.criticalIssues.length > 0 && (
          <View style={styles.section}>
            <View style={styles.enhancedSectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="trending-up" size={24} color="white" />
              </View>
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.enhancedSectionTitle}>Points d'Amélioration</Text>
                <Text style={styles.sectionSubtitle}>Concentrez-vous sur ces aspects clés</Text>
              </View>
              <View style={styles.issueCountBadge}>
                <Text style={styles.issueCountText}>{analysisData.criticalIssues.length}</Text>
              </View>
            </View>
            
            {analysisData.criticalIssues.map((issue: any, index: number) => (
              <View key={index} style={styles.enhancedIssueCard}>
                {/* Header avec priorité et titre */}
                <View style={styles.issueCardHeader}>
                  <View style={styles.priorityContainer}>
                    <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(issue.priority) }]} />
                    <Text style={styles.priorityLabel}>
                      Priorité {issue.priority === 1 ? 'Haute' : issue.priority === 2 ? 'Moyenne' : 'Basse'}
                    </Text>
                  </View>
                  <View style={styles.issueNumber}>
                    <Text style={styles.issueNumberText}>{index + 1}</Text>
                  </View>
                </View>
                
                {/* Titre du problème */}
                <Text style={styles.enhancedIssueTitle}>{issue.issue}</Text>
                
                {/* Moment détecté */}
                <View style={styles.evidenceContainer}>
                  <Ionicons name="time-outline" size={16} color="#64748b" />
                  <Text style={styles.evidenceText}>{issue.timeEvidence}</Text>
                </View>
                
                {/* Action immédiate - Design carte */}
                <View style={styles.actionCard}>
                  <View style={styles.actionCardHeader}>
                    <Ionicons name="flash" size={16} color="#f59e0b" />
                    <Text style={styles.actionCardTitle}>Action Immédiate</Text>
                  </View>
                  <Text style={styles.actionCardText}>{issue.immediateAction}</Text>
                </View>
                
                {/* Résultat attendu */}
                <View style={styles.improvementContainer}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.improvementLabel}>Résultat attendu:</Text>
                  <Text style={styles.improvementValue}>{issue.expectedImprovement}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Section Exercices Recommandés - Design Amélioré */}
        {analysisData.actionableAdvice.length > 0 && (
          <View style={styles.section}>
            <View style={styles.enhancedSectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="fitness" size={24} color="white" />
              </View>
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.enhancedSectionTitle}>Exercices Recommandés</Text>
                <Text style={styles.sectionSubtitle}>Programme personnalisé pour progresser</Text>
              </View>
              <View style={[styles.issueCountBadge, { backgroundColor: '#f59e0b' }]}>
                <Text style={styles.issueCountText}>{analysisData.actionableAdvice.length}</Text>
              </View>
            </View>
            
            {analysisData.actionableAdvice.map((advice: any, index: number) => (
              <View key={index} style={styles.enhancedAdviceCard}>
                {/* Header avec catégorie et difficulté */}
                <View style={styles.adviceCardHeader}>
                  <View style={styles.categoryContainer}>
                    <Ionicons name="barbell" size={16} color="#f59e0b" />
                    <Text style={styles.categoryText}>{advice.category}</Text>
                  </View>
                  <View style={styles.difficultyContainer}>
                    <View style={[styles.difficultyDot, { 
                      backgroundColor: advice.difficulty === 'easy' ? '#10b981' : 
                                     advice.difficulty === 'medium' ? '#f59e0b' : '#ef4444'
                    }]} />
                    <Text style={styles.difficultyLabel}>
                      {advice.difficulty === 'easy' ? 'Facile' : 
                       advice.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                    </Text>
                  </View>
                </View>
                
                {/* Numéro d'exercice */}
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>Exercice {index + 1}</Text>
                </View>
                
                {/* Instructions */}
                <View style={styles.instructionContainer}>
                  <Ionicons name="list" size={16} color="#64748b" />
                  <Text style={styles.instructionLabel}>Instructions:</Text>
                </View>
                <Text style={styles.enhancedInstructionText}>{advice.instruction}</Text>
                
                {/* Comment tester */}
                <View style={styles.testContainer}>
                  <View style={styles.testHeader}>
                    <Ionicons name="checkmark-done" size={16} color="#3b82f6" />
                    <Text style={styles.testLabel}>Comment tester:</Text>
                  </View>
                  <Text style={styles.testText}>{advice.howToTest}</Text>
                </View>
                
                {/* Délai de résultats */}
                <View style={styles.timelineContainer}>
                  <Ionicons name="time" size={16} color="#8b5cf6" />
                  <Text style={styles.timelineLabel}>Résultats attendus:</Text>
                  <Text style={styles.timelineValue}>{advice.timeToSee}</Text>
                </View>
                

              </View>
            ))}
          </View>
        )}

        {/* Section Analyse Technique du Swing */}
        {analysisData.swingAnalysis.phases && (
          <View style={styles.section}>
            <View style={styles.enhancedSectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: '#3b82f6' }]}>
                <Ionicons name="analytics" size={24} color="white" />
              </View>
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.enhancedSectionTitle}>Analyse Technique</Text>
                <Text style={styles.sectionSubtitle}>Biomécanique et technique détaillée</Text>
              </View>
              <View style={[styles.issueCountBadge, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.issueCountText}>{analysisData.swingAnalysis.phases.length}</Text>
              </View>
            </View>
            
            {/* Phases du swing */}
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
            
            {/* Analyse technique détaillée */}
            <View style={styles.technicalDetailsSection}>
              <Text style={styles.technicalDetailsTitle}>🔧 Analyse Biomécanique</Text>
              
              {analysisData.swingAnalysis.tempo && (
                <View style={styles.technicalDetailItem}>
                  <Text style={styles.technicalDetailLabel}>⏱️ Tempo & Rythme:</Text>
                  <Text style={styles.technicalDetailText}>{analysisData.swingAnalysis.tempo}</Text>
                </View>
              )}
              
              {analysisData.swingAnalysis.timing && (
                <View style={styles.technicalDetailItem}>
                  <Text style={styles.technicalDetailLabel}>⚖️ Équilibre:</Text>
                  <Text style={styles.technicalDetailText}>{analysisData.swingAnalysis.timing}</Text>
                </View>
              )}
              
              {analysisData.swingAnalysis.clubPath && (
                <View style={styles.technicalDetailItem}>
                  <Text style={styles.technicalDetailLabel}>🏌️ Chemin de Club:</Text>
                  <Text style={styles.technicalDetailText}>{analysisData.swingAnalysis.clubPath}</Text>
                </View>
              )}
              
              {analysisData.swingAnalysis.faceAngle && (
                <View style={styles.technicalDetailItem}>
                  <Text style={styles.technicalDetailLabel}>🎯 Face de Club:</Text>
                  <Text style={styles.technicalDetailText}>{analysisData.swingAnalysis.faceAngle}</Text>
                </View>
              )}
              
              {analysisData.swingAnalysis.weightTransfer && (
                <View style={styles.technicalDetailItem}>
                  <Text style={styles.technicalDetailLabel}>🏋️ Transfert de Poids:</Text>
                  <Text style={styles.technicalDetailText}>{analysisData.swingAnalysis.weightTransfer}</Text>
                </View>
              )}
              
              {analysisData.swingAnalysis.spineAngle && (
                <View style={styles.technicalDetailItem}>
                  <Text style={styles.technicalDetailLabel}>📐 Angle de Colonne:</Text>
                  <Text style={styles.technicalDetailText}>{analysisData.swingAnalysis.spineAngle}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Section Métriques de Performance */}
        {analysisData.swingAnalysis.performanceMetrics && Object.keys(analysisData.swingAnalysis.performanceMetrics).length > 0 && (
          <View style={styles.section}>
            <View style={styles.enhancedSectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: '#10b981' }]}>
                <Ionicons name="speedometer" size={24} color="white" />
              </View>
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.enhancedSectionTitle}>Métriques de Performance</Text>
                <Text style={styles.sectionSubtitle}>Indicateurs clés de votre swing</Text>
              </View>
            </View>
            
            {analysisData.swingAnalysis.performanceMetrics.consistency_indicators && (
              <View style={styles.performanceMetricItem}>
                <Text style={styles.performanceMetricLabel}>📊 Régularité:</Text>
                <Text style={styles.performanceMetricText}>{analysisData.swingAnalysis.performanceMetrics.consistency_indicators}</Text>
              </View>
            )}
            
            {analysisData.swingAnalysis.performanceMetrics.power_generation && (
              <View style={styles.performanceMetricItem}>
                <Text style={styles.performanceMetricLabel}>⚡ Génération de Puissance:</Text>
                <Text style={styles.performanceMetricText}>{analysisData.swingAnalysis.performanceMetrics.power_generation}</Text>
              </View>
            )}
            
            {analysisData.swingAnalysis.performanceMetrics.accuracy_factors && (
              <View style={styles.performanceMetricItem}>
                <Text style={styles.performanceMetricLabel}>🎯 Facteurs de Précision:</Text>
                <Text style={styles.performanceMetricText}>{analysisData.swingAnalysis.performanceMetrics.accuracy_factors}</Text>
              </View>
            )}
          </View>
        )}

        {/* Section Insights Personnalisés */}
        {analysisData.swingAnalysis.personalizedInsights && Object.keys(analysisData.swingAnalysis.personalizedInsights).length > 0 && (
          <View style={styles.section}>
            <View style={styles.enhancedSectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: '#8b5cf6' }]}>
                <Ionicons name="bulb" size={24} color="white" />
              </View>
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.enhancedSectionTitle}>Insights Personnalisés</Text>
                <Text style={styles.sectionSubtitle}>Conseils adaptés à votre profil</Text>
              </View>
            </View>
            
            {analysisData.swingAnalysis.personalizedInsights.strengths_to_build_on && (
              <View style={styles.personalizedInsightItem}>
                <Text style={styles.personalizedInsightLabel}>💪 Points Forts à Développer:</Text>
                <Text style={styles.personalizedInsightText}>{analysisData.swingAnalysis.personalizedInsights.strengths_to_build_on}</Text>
              </View>
            )}
            
            {analysisData.swingAnalysis.personalizedInsights.quick_wins && (
              <View style={styles.personalizedInsightItem}>
                <Text style={styles.personalizedInsightLabel}>⚡ Améliorations Rapides:</Text>
                <Text style={styles.personalizedInsightText}>{analysisData.swingAnalysis.personalizedInsights.quick_wins}</Text>
              </View>
            )}
            
            {analysisData.swingAnalysis.personalizedInsights.long_term_development && (
              <View style={styles.personalizedInsightItem}>
                <Text style={styles.personalizedInsightLabel}>🎯 Développement Long Terme:</Text>
                <Text style={styles.personalizedInsightText}>{analysisData.swingAnalysis.personalizedInsights.long_term_development}</Text>
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

        {/* Bouton de suppression */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Supprimer cette analyse</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onConfirm={handleDeleteAnalysis}
        onCancel={() => setShowDeleteModal(false)}
        isDeleting={isDeleting}
        title="Supprimer l'analyse"
        message="Êtes-vous sûr de vouloir supprimer cette analyse ? Cette action est irréversible et supprimera également la vidéo associée de votre stockage."
      />
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

  // Section vidéo - Suppression des marges pour maximiser l'espace
  videoSection: {
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

  // Nouveaux styles pour les sections améliorées
  enhancedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
  },
  sectionIconContainer: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  sectionHeaderContent: {
    flex: 1,
  },
  enhancedSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  issueCountBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  issueCountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
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

  // Points d'amélioration - Design amélioré
  enhancedIssueCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  issueCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  issueNumber: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  issueNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  enhancedIssueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    lineHeight: 24,
  },
  evidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  evidenceText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  actionCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginLeft: 6,
  },
  actionCardText: {
    fontSize: 15,
    color: '#78350f',
    lineHeight: 22,
    fontWeight: '500',
  },
  improvementContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
  },
  improvementLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    marginLeft: 6,
    marginRight: 8,
  },
  improvementValue: {
    fontSize: 13,
    color: '#166534',
    flex: 1,
    lineHeight: 18,
  },

  // Problèmes critiques - Ancien style (gardé pour compatibilité)
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

  // Exercices recommandés - Design amélioré
  enhancedAdviceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  adviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginLeft: 6,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  difficultyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  exerciseNumber: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  exerciseNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    textTransform: 'uppercase',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 6,
  },
  enhancedInstructionText: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '500',
  },
  testContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginLeft: 6,
  },
  testText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#faf5ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7c3aed',
    marginLeft: 6,
    marginRight: 8,
    flexShrink: 0,
  },
  timelineValue: {
    fontSize: 13,
    color: '#7c3aed',
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },


  // Conseils actionnables - Ancien style (gardé pour compatibilité)
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
    paddingHorizontal: 16,
    paddingBottom: 100, // Augmenté significativement pour éviter le recouvrement par la tabbar
    paddingTop: 8,
  },
  deleteButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Analyse technique détaillée
  technicalDetailsSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  technicalDetailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  technicalDetailItem: {
    marginBottom: 12,
  },
  technicalDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  technicalDetailText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },

  // Métriques de performance
  performanceMetricItem: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  performanceMetricLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 6,
  },
  performanceMetricText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },

  // Insights personnalisés
  personalizedInsightItem: {
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  personalizedInsightLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b21a8',
    marginBottom: 6,
  },
  personalizedInsightText: {
    fontSize: 14,
    color: '#7c3aed',
    lineHeight: 20,
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