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
import { mobileAnalysisService, AnalysisProgress } from '../lib/analysis/mobile-analysis-service';
import AnalysisProgressModal from '../components/analysis/AnalysisProgressModal';
import SwingContextForm from '../components/analysis/SwingContextForm';
import { useSafeBottomPadding } from '../hooks/useSafeBottomPadding';

interface AnalysisScreenProps {
  navigation?: any;
}

type ScreenMode = 'selection' | 'camera' | 'context' | 'analyzing';

export default function AnalysisScreen({ navigation }: AnalysisScreenProps) {
  const [mode, setMode] = useState<ScreenMode>('selection');
  const [selectedVideoUri, setSelectedVideoUri] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    step: 'uploading',
    progress: 0,
    message: 'Initialisation...'
  });
  const { containerPaddingBottom } = useSafeBottomPadding();

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

      // Ouvrir la galerie
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos', // Utiliser string au lieu de enum
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60, // 60 secondes max
      });

      if (!result.canceled && result.assets[0]) {
        const videoUri = result.assets[0].uri;
        console.log('Video selected:', videoUri);
        setSelectedVideoUri(videoUri);
        
        // Passer directement au contexte du swing
        setMode('context');
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner la vidéo');
    }
  };

  const handleContextSelected = async (context: { club: string; angle: 'face' | 'profile' }) => {
    await startAnalysis(context);
  };

  const handleSkipContext = async () => {
    await startAnalysis();
  };

  const startAnalysis = async (context?: { club: string; angle: 'face' | 'profile' }) => {
    setMode('analyzing');
    
    try {
      console.log('🎯 Starting video analysis for selected video...');
      console.log('📋 Analysis context:', context);
      
      const result = await mobileAnalysisService.analyzeGolfSwing(
        {
          videoUri: selectedVideoUri,
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
          { text: 'Réessayer', onPress: () => setMode('context') },
          { text: 'Retour', onPress: () => setMode('selection') }
        ]
      );
    }
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
      <>
        <SafeAreaView style={styles.container}>
          <View style={styles.analyzingContainer}>
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
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
});