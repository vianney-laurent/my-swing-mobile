import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Permission is handled by useCameraPermissions hook

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync({
          maxDuration: 30,
        });
        
        if (video) {
          console.log('Video recorded:', video.uri);
          Alert.alert(
            'Vidéo enregistrée !',
            'Voulez-vous analyser cette vidéo ?',
            [
              { text: 'Plus tard', style: 'cancel' },
              { 
                text: 'Analyser', 
                onPress: () => handleAnalyzeVideo(video.uri)
              }
            ]
          );
        }
      } catch (error) {
        console.error('Recording error:', error);
        Alert.alert('Erreur', 'Impossible d\'enregistrer la vidéo');
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const handleAnalyzeVideo = async (videoUri: string) => {
    try {
      Alert.alert('Analyse', 'Envoi de la vidéo pour analyse...', [
        { text: 'OK', onPress: () => console.log('Analysis started for:', videoUri) }
      ]);
      
      // TODO: Implémenter l'upload vers Supabase et l'analyse
      // 1. Upload vidéo vers Supabase Storage
      // 2. Créer un enregistrement d'analyse
      // 3. Déclencher l'analyse via ton API Vercel
      
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de démarrer l\'analyse');
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Chargement des permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Accès à la caméra requis</Text>
        <Text style={styles.submessage}>
          Cette app a besoin d'accéder à votre caméra pour analyser votre swing
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analyser mon swing</Text>
        <Text style={styles.subtitle}>Filmez votre swing de profil</Text>
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
          <Text style={styles.buttonText}>🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive
          ]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? '⏹️' : '🔴'}
          </Text>
        </TouchableOpacity>

        <View style={styles.placeholder} />
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsText}>
          💡 Conseil : Filmez pendant 5-10 secondes pour une analyse complète
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    padding: 20,
  },
  submessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    padding: 20,
    backgroundColor: '#000',
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
  buttonText: {
    fontSize: 24,
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
  recordButtonText: {
    fontSize: 32,
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
  },
  button: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
});