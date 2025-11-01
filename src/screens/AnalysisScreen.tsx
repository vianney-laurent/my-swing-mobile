import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CameraScreen from './CameraScreen';
import { UnifiedAnalysisService } from '../lib/analysis/unified-analysis-service';
import { VideoValidator } from '../lib/video/video-validator-unified';
import { AnalysisJobTracker } from '../components/analysis/AnalysisJobTracker';
import SwingContextForm from '../components/analysis/SwingContextForm';
import { useSafeBottomPadding } from '../hooks/useSafeBottomPadding';
import { useAnalysisNavigation } from '../hooks/useAnalysisNavigation';

interface AnalysisScreenProps {
  navigation?: any;
}

type ScreenMode = 'selection' | 'camera' | 'context' | 'analyzing';

export default function AnalysisScreen({ navigation }: AnalysisScreenProps) {
  const [mode, setMode] = useState<ScreenMode>('selection');
  const [selectedVideoUri, setSelectedVideoUri] = useState<string>('');
  const [currentJobId, setCurrentJobId] = useState<string>('');
  const [swingContext, setSwingContext] = useState<any>(null);
  const { containerPaddingBottom } = useSafeBottomPadding();
  const { navigateToAnalysisResult } = useAnalysisNavigation();

  const handlePickVideo = async () => {
    try {
      // Demander les permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin d\'accéder à votre galerie pour sélectionner une vidéo.'
        );
        return;
      }

      // Ouvrir la galerie avec paramètres optimisés
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: true, // Permettre découpage
        quality: 0.8, // Qualité raisonnable
        videoMaxDuration: 30, // Limite initiale raisonnable
      });

      if (!result.canceled && result.assets[0]) {
        const videoUri = result.assets[0].uri;
        console.log('Video selected:', videoUri);
        
        // Validation basique de la vidéo de galerie
        try {
          const validation = await VideoValidator.validateGalleryVideo(videoUri);
          
          // Avec le nouveau workflow, on peut gérer toutes les tailles
          // On vérifie juste les erreurs critiques
          const criticalErrors = validation.issues.filter(issue => issue.severity === 'error');
          
          if (criticalErrors.length > 0) {
            Alert.alert(
              'Vidéo invalide',
              criticalErrors[0].message,
              [
                { text: 'Choisir une autre', onPress: () => handlePickVideo() }
              ]
            );
            return;
          }
          
          // Continuer directement sans alerte de compression
          proceedWithVideo(videoUri);
          
        } catch (validationError) {
          console.error('❌ Gallery video validation failed:', validationError);
          Alert.alert('Erreur', 'Impossible de valider la vidéo sélectionnée');
        }
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner la vidéo');
    }
  };

  const proceedWithVideo = (videoUri: string) => {
    setSelectedVideoUri(videoUri);
    setMode('context');
  };

  const handleContextSelected = async (context: { club: string; angle: 'face-on' | 'down-the-line' }) => {
    setSwingContext(context);
    await startAnalysis(context);
  };

  const handleSkipContext = async () => {
    const defaultContext = {
      club: 'Driver',
      angle: 'face-on' as const
    };
    setSwingContext(defaultContext);
    await startAnalysis(defaultContext);
  };

  const startAnalysis = async (context: { club: string; angle: 'face-on' | 'down-the-line' }) => {
    setMode('analyzing');
    
    try {
      console.log('🎯 Starting new unified analysis workflow...');
      console.log('📋 Analysis context:', context);
      
      // Get video metadata
      const videoInfo = await VideoValidator.getVideoInfo(selectedVideoUri);
      
      const result = await UnifiedAnalysisService.analyzeVideo({
        videoUri: selectedVideoUri,
        context: {
          club: context.club,
          shotType: context.club.toLowerCase().includes('driver') ? 'driver' : 'iron',
          angle: context.angle,
          focusArea: 'General analysis'
        },
        captureMetadata: {
          fps: videoInfo.fps,
          resolution: `${videoInfo.width}x${videoInfo.height}`,
          duration: videoInfo.duration,
          fileSize: videoInfo.size,
          club: context.club,
          angle: context.angle
        }
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }
      
      console.log('✅ Analysis job submitted:', result.jobId);
      
      if (result.isSync && result.analysisId) {
        // Synchronous completion - invalidate cache and go to results
        await navigateToAnalysisResult(navigation, result.analysisId, 'camera');
      } else if (result.jobId) {
        // Asynchronous processing - track job
        setCurrentJobId(result.jobId);
      }
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      Alert.alert(
        'Erreur d\'analyse',
        error instanceof Error ? error.message : 'Une erreur est survenue',
        [
          { text: 'Réessayer', onPress: () => setMode('context') },
          { text: 'Retour', onPress: () => setMode('selection') }
        ]
      );
    }
  };

  const handleJobCompleted = async (analysisId: string) => {
    console.log('✅ Analysis job completed:', analysisId);
    await navigateToAnalysisResult(navigation, analysisId, 'camera');
  };

  const handleJobError = (error: string) => {
    console.error('❌ Analysis job failed:', error);
    Alert.alert(
      'Erreur d\'analyse',
      error,
      [
        { text: 'Réessayer', onPress: () => setMode('context') },
        { text: 'Retour', onPress: () => setMode('selection') }
      ]
    );
  };

  if (mode === 'camera') {
    return <CameraScreen onBack={() => setMode('selection')} navigation={navigation} />;
  }

  if (mode === 'context') {
    return (
      <SafeAreaView style={styles.container}>
        <SwingContextForm
          onContextSelected={handleContextSelected}
          onSkip={handleSkipContext}
        />
      </SafeAreaView>
    );
  }

  if (mode === 'analyzing') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.analyzingContainer}>
          <Text style={styles.analyzingTitle}>Analyse en cours</Text>
          <Text style={styles.analyzingSubtitle}>
            Votre swing est en cours d'analyse par notre IA
          </Text>
          
          {currentJobId && (
            <AnalysisJobTracker
              jobId={currentJobId}
              onCompleted={handleJobCompleted}
              onError={handleJobError}
            />
          )}
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setMode('selection')}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: containerPaddingBottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Analyser mon swing</Text>
          <Text style={styles.subtitle}>
            Choisissez comment vous souhaitez analyser votre swing
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => setMode('camera')}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="videocam" size={48} color="#10b981" />
            </View>
            <Text style={styles.optionTitle}>Se filmer</Text>
            <Text style={styles.optionDescription}>
              Utilisez la caméra pour enregistrer votre swing en direct
            </Text>
            <View style={styles.optionBadge}>
              <Text style={styles.optionBadgeText}>Recommandé</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handlePickVideo}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="folder-open" size={48} color="#3b82f6" />
            </View>
            <Text style={styles.optionTitle}>Choisir une vidéo</Text>
            <Text style={styles.optionDescription}>
              Sélectionnez une vidéo existante depuis votre galerie
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>💡 Conseils pour une bonne analyse</Text>
          <Text style={styles.tipsText}>
            • Filmez de profil pour voir tout le mouvement{'\n'}
            • Assurez-vous d'avoir un bon éclairage{'\n'}
            • Gardez le téléphone stable{'\n'}
            • Filmez pendant 5-10 secondes
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
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
  optionsContainer: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  optionIcon: {
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  optionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optionBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tips: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  analyzingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  analyzingSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  cancelButton: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
});