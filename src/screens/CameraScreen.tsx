import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<Camera>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync({
          maxDuration: 30, // 30 seconds max
          quality: Camera.Constants.VideoQuality['720p'],
        });
        
        console.log('Video recorded:', video.uri);
        
        // Show analysis options
        Alert.alert(
          'Vidéo enregistrée !',
          'Voulez-vous analyser cette vidéo maintenant ?',
          [
            { text: 'Plus tard', style: 'cancel' },
            { 
              text: 'Analyser', 
              onPress: () => handleAnalyzeVideo(video.uri)
            }
          ]
        );
      } catch (error) {
        console.error('Recording error:', error);
        Alert.alert('Erreur', 'Impossible d\'enregistrer la vidéo');
      } finally {
        setIsRecording(false);
      }
    }
  };

  const handleAnalyzeVideo = (videoUri: string) => {
    // TODO: Implement video analysis
    // This will be connected to the analysis service
    Alert.alert('Analyse', 'Fonctionnalité d\'analyse à implémenter dans la prochaine étape !');
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text>Demande d'autorisation caméra...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.noAccessText}>
            Accès à la caméra refusé
          </Text>
          <Text style={styles.noAccessSubtext}>
            Veuillez autoriser l'accès à la caméra dans les paramètres
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analyser mon swing</Text>
        <Text style={styles.subtitle}>
          Filmez votre swing de profil
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={type}
          ratio="16:9"
        >
          <View style={styles.overlay}>
            <View style={styles.guideLine} />
            <Text style={styles.guideText}>
              Placez-vous de profil dans le cadre
            </Text>
          </View>
        </Camera>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => {
            setType(
              type === CameraType.back
                ? CameraType.front
                : CameraType.back
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
  },
});