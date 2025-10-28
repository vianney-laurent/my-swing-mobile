import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { mobileAnalysisService, AnalysisProgress } from '../lib/analysis/mobile-analysis-service';
import AnalysisProgressModal from '../components/analysis/AnalysisProgressModal';
import SwingContextForm from '../components/analysis/SwingContextForm';

interface CameraScreenProps {
  onBack?: () => void;
  navigation?: any;
}

type ScreenState = 'camera' | 'context' | 'analyzing';

export default function CameraScreen({ onBack, navigation }: CameraScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [screenState, setScreenState] = useState<ScreenState>('camera');
  const [recordedVideoUri, setRecordedVideoUri] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    step: 'uploading',
    progress: 0,
    message: 'Initialisation...'
  });
  const cameraRef = useRef<CameraView>(null);

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync({
          maxDuration: 30, // 30 seconds max
        });
        
        if (video) {
          console.log('Video recorded:', video.uri);
          setRecordedVideoUri(video.uri);
          
          // Passer à l'écran de contexte
          setScreenState('context');
        }
      } catch (error) {
        console.error('Recording error:', error);
        Alert.alert('Erreur', 'Impossible d\'enregistrer la vidéo');
      } finally {
        setIsRecording(false);
      }
    }
  };

  const handleContextSelected = async (context: { club: string; angle: 'face' | 'profile' }) => {
    await startAnalysis(context);
  };

  const handleSkipContext = async () => {
    await startAnalysis();
  };

  const startAnalysis = async (context?: { club: string; angle: 'face' | 'profile' }) => {
    setScreenState('analyzing');
    
    try {
      console.log('🎯 Starting video analysis...');
      
      const result = await mobileAnalysisService.analyzeGolfSwing(
        {
          videoUri: recordedVideoUri,
          userLevel: 'intermediate', // TODO: Get from user profile
          focusAreas: [],
          context
        },
        (progress) => {
          setAnalysisProgress(progress);
        }
      );
      
      console.log('✅ Analysis completed:', result.analysisId);
      
      // Naviguer vers les résultats
      if (navigation) {
        navigation.navigate('AnalysisResult', { 
          analysisId: result.analysisId 
        });
      }
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      Alert.alert(
        'Erreur d\'analyse',
        error instanceof Error ? error.message : 'Une erreur est survenue',
        [
          { text: 'Réessayer', onPress: () => setScreenState('context') },
          { text: 'Retour', onPress: () => setScreenState('camera') }
        ]
      );
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text>Chargement des permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.noAccessText}>
            Accès à la caméra requis
          </Text>
          <Text style={styles.noAccessSubtext}>
            Cette app a besoin d'accéder à votre caméra pour analyser votre swing
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Autoriser la caméra</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Rendu conditionnel selon l'état
  if (screenState === 'context') {
    return (
      <SafeAreaView style={styles.container}>
        <SwingContextForm
          onContextSelected={handleContextSelected}
          onSkip={handleSkipContext}
        />
      </SafeAreaView>
    );
  }

  if (screenState === 'analyzing') {
    return (
      <>
        <SafeAreaView style={styles.container}>
          <View style={styles.centered}>
            <Text style={styles.analyzingText}>Analyse en cours...</Text>
          </View>
        </SafeAreaView>
        <AnalysisProgressModal
          visible={true}
          progress={analysisProgress}
        />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Analyser mon swing</Text>
        <Text style={styles.subtitle}>
          Filmez votre swing de profil pour une analyse optimale
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          <View style={styles.overlay}>
            <View style={styles.guideLine} />
            <Text style={styles.guideText}>
              Placez-vous de profil dans le cadre
            </Text>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>REC</Text>
              </View>
            )}
          </View>
        </CameraView>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => {
            setFacing(
              facing === 'back'
                ? 'front'
                : 'back'
            );
          }}
        >
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive
          ]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons 
            name={isRecording ? "stop" : "radio-button-on"} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>

        <View style={styles.placeholder} />
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsText}>
          💡 Conseil : Filmez pendant 5-10 secondes pour une analyse complète
        </Text>
        <Text style={styles.tipsText}>
          📱 Tenez le téléphone à la verticale et filmez de profil
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noAccessText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  noAccessSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    backgroundColor: '#000',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideLine: {
    width: 2,
    height: '60%',
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    position: 'absolute',
  },
  guideText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 4,
    position: 'absolute',
    bottom: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#dc2626',
  },
  placeholder: {
    width: 50,
  },
  tips: {
    padding: 20,
    backgroundColor: '#000',
  },
  tipsText: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 6,
  },
  recordingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
});