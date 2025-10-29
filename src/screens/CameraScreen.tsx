import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
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
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [screenState, setScreenState] = useState<ScreenState>('camera');
  const [recordedVideoUri, setRecordedVideoUri] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    step: 'uploading',
    progress: 0,
    message: 'Initialisation...'
  });
  const cameraRef = useRef<CameraView>(null);
  const retryCountRef = useRef(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback pour s'assurer que la caméra est prête après un délai
  useEffect(() => {
    if (permission?.granted && !isCameraReady) {
      const timer = setTimeout(() => {
        console.log('📷 Camera ready fallback timer triggered');
        setIsCameraReady(true);
      }, 3000); // 3 secondes de délai de sécurité

      return () => clearTimeout(timer);
    }
  }, [permission?.granted, isCameraReady]);

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      
      // Démarrer le timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      try {
        console.log('🎥 Starting video recording...');
        
        // Attendre un délai plus long pour s'assurer que la caméra est vraiment prête
        // Augmenter progressivement le délai selon le nombre de tentatives
        const delay = 500 + (retryCountRef.current * 1000); // 500ms, puis 1.5s, 2.5s, 3.5s
        await new Promise(resolve => setTimeout(resolve, delay));
        
        const video = await cameraRef.current.recordAsync({
          maxDuration: 15, // 15 seconds max pour limiter la taille
          mirror: false,
        });
        
        if (video) {
          console.log('✅ Video recorded with CameraView:', video.uri);
          console.log('📊 Video info:', video);
          setRecordedVideoUri(video.uri);
          retryCountRef.current = 0; // Reset counter on success
          
          // Passer à l'écran de contexte
          setScreenState('context');
        }
        
        // Arrêter le timer et reset
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setIsRecording(false);
        setRecordingTime(0);
      } catch (error) {
        console.error('❌ Recording error:', error);
        
        // Si l'erreur est liée à la caméra non prête dans Expo Go, utiliser ImagePicker comme fallback
        if (error instanceof Error && error.message.includes('Camera is not ready')) {
          console.log('🔄 Using ImagePicker fallback for Expo Go...');
          await useImagePickerFallback();
        } else {
          Alert.alert('Erreur', 'Impossible d\'enregistrer la vidéo. Veuillez réessayer.');
          
          // Arrêter le timer et reset
          if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
          }
          setIsRecording(false);
          setRecordingTime(0);
          retryCountRef.current = 0; // Reset counter
        }
      }
    }
  };

  const useImagePickerFallback = async () => {
    try {
      console.log('📱 Using ImagePicker for video recording (Expo Go fallback)');
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 0.5, // Réduire la qualité pour limiter la taille
        videoMaxDuration: 15, // Limiter à 15 secondes pour réduire la taille
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('✅ Video recorded with ImagePicker:', result.assets[0].uri);
        setRecordedVideoUri(result.assets[0].uri);
        // Passer à l'écran de contexte comme pour l'enregistrement normal
        setScreenState('context');
      }
    } catch (error) {
      console.error('❌ ImagePicker error:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer la vidéo avec la caméra système.');
    } finally {
      setIsRecording(false);
      retryCountRef.current = 0;
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
            <View style={styles.backButtonBackground}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Analyser mon swing</Text>
          <Text style={styles.subtitle}>
            Filmez votre swing de profil pour une analyse optimale
          </Text>
        </View>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          mode="video"
          videoQuality="720p"
          onCameraReady={() => {
            console.log('📷 Camera is ready callback triggered');
            // Attendre encore un peu après le callback pour être sûr
            setTimeout(() => {
              console.log('📷 Camera is really ready now');
              setIsCameraReady(true);
            }, 1000);
          }}
        />
        <View style={styles.overlay}>
          <View style={styles.guideLine} />
          <Text style={styles.guideText}>
            Placez-vous de profil dans le cadre
          </Text>

          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>REC</Text>
              <Text style={styles.recordingTime}>
                {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:
                {(recordingTime % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => {
            setIsCameraReady(false); // Reset camera ready state when flipping
            retryCountRef.current = 0; // Reset retry counter
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
          💡 Conseil : Filmez pendant 8-15 secondes pour une analyse complète
        </Text>
        <Text style={styles.tipsText}>
          📱 Tenez le téléphone à la verticale et filmez de profil
        </Text>
        
        {/* Bouton alternatif pour Expo Go */}
        <TouchableOpacity 
          style={styles.alternativeButton}
          onPress={useImagePickerFallback}
        >
          <Ionicons name="videocam-outline" size={16} color="#3b82f6" />
          <Text style={styles.alternativeButtonText}>
            Utiliser la caméra système (Expo Go)
          </Text>
        </TouchableOpacity>
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
    zIndex: 10,
    padding: 4,
  },
  backButtonBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  titleContainer: {
    alignItems: 'center',
    paddingTop: 60, // Espace pour les boutons
    paddingHorizontal: 60, // Espace pour les boutons latéraux
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: '#e2e8f0',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  recordingTime: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  alternativeButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },

});