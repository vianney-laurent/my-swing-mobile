import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { mobileVideoService } from '../lib/video/video-service';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  showAnalysisControls?: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export default function VideoPlayer({ 
  videoUrl, 
  title = 'Vidéo d\'Analyse',
  showAnalysisControls = true,
  onTimeUpdate 
}: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [seekFeedback, setSeekFeedback] = useState<string | null>(null);

  // Dimensions de l'écran pour le responsive
  const { width: screenWidth } = Dimensions.get('window');
  const videoHeight = (screenWidth * 9) / 16; // Ratio 16:9

  // Vitesses de lecture pour l'analyse (pas d'accélération)
  const playbackRates = [0.25, 0.5, 0.75, 1.0];

  useEffect(() => {
    loadVideo();
  }, [videoUrl]);

  const loadVideo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎥 [VideoPlayer] Loading video:', videoUrl);
      
      // Vérifier d'abord si l'URL est valide
      if (!videoUrl || videoUrl.trim() === '') {
        throw new Error('URL vidéo vide ou invalide');
      }
      
      // Obtenir la meilleure URL vidéo disponible
      const bestUrl = await mobileVideoService.getBestVideoUrl(videoUrl);
      setProcessedVideoUrl(bestUrl);
      
      console.log('✅ [VideoPlayer] Video URL ready:', bestUrl.substring(0, 100) + '...');
      
    } catch (err) {
      console.error('❌ [VideoPlayer] Error loading video:', err);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = 'Impossible de charger la vidéo';
      if (err instanceof Error) {
        if (err.message.includes('URL vidéo vide')) {
          errorMessage = 'URL vidéo manquante';
        } else if (err.message.includes('network')) {
          errorMessage = 'Problème de connexion réseau';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Délai d\'attente dépassé';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
    
    if (playbackStatus.isLoaded && onTimeUpdate) {
      const currentTime = (playbackStatus.positionMillis || 0) / 1000;
      const duration = (playbackStatus.durationMillis || 0) / 1000;
      onTimeUpdate(currentTime, duration);
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current || !status?.isLoaded) return;

    try {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const seekTo = async (positionMillis: number) => {
    if (!videoRef.current || !status?.isLoaded) return;

    try {
      await videoRef.current.setPositionAsync(positionMillis);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const skipBackward = async () => {
    if (!status?.isLoaded) return;
    const newPosition = Math.max(0, (status.positionMillis || 0) - 5000); // -5 secondes
    await seekTo(newPosition);
  };

  const skipForward = async () => {
    if (!status?.isLoaded) return;
    const maxPosition = status.durationMillis || 0;
    const newPosition = Math.min(maxPosition, (status.positionMillis || 0) + 5000); // +5 secondes
    await seekTo(newPosition);
  };

  const changePlaybackRate = async (rate: number) => {
    if (!videoRef.current || !status?.isLoaded) return;

    try {
      await videoRef.current.setRateAsync(rate, true);
      setPlaybackRate(rate);
    } catch (error) {
      console.error('Error changing playback rate:', error);
    }
  };

  const seekToPhase = async (percentage: number) => {
    if (!status?.isLoaded || !status.durationMillis) return;
    
    const position = status.durationMillis * percentage;
    await seekTo(position);
  };

  const seekPrecise = async (milliseconds: number) => {
    if (!status?.isLoaded || !videoRef.current) return;
    
    try {
      const currentPosition = status.positionMillis || 0;
      const maxPosition = status.durationMillis || 0;
      const newPosition = Math.max(0, Math.min(maxPosition, currentPosition + milliseconds));
      
      console.log(`🎯 Seeking from ${currentPosition}ms to ${newPosition}ms (${milliseconds > 0 ? '+' : ''}${milliseconds}ms)`);
      
      // Afficher un feedback visuel
      const feedbackText = milliseconds > 0 ? `+${milliseconds/1000}s` : `${milliseconds/1000}s`;
      setSeekFeedback(feedbackText);
      setTimeout(() => setSeekFeedback(null), 1000);
      
      // Utiliser setPositionAsync directement avec shouldPlay pour maintenir l'état de lecture
      await videoRef.current.setPositionAsync(newPosition, {
        toleranceMillisBefore: 50,
        toleranceMillisAfter: 50,
      });
      
    } catch (error) {
      console.error('Error in precise seek:', error);
    }
  };

  const seekBackwardPrecise = async () => {
    await seekPrecise(-100); // -0.1 seconde
  };
  
  const seekForwardPrecise = async () => {
    await seekPrecise(100);   // +0.1 seconde
  };

  // Fonction alternative pour des incréments plus grands si 0.1s ne fonctionne pas bien
  const seekBackwardFrame = async () => {
    await seekPrecise(-33); // ~1 frame à 30fps
  };
  
  const seekForwardFrame = async () => {
    await seekPrecise(33);   // ~1 frame à 30fps
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!status?.isLoaded || !status.durationMillis) return 0;
    return ((status.positionMillis || 0) / status.durationMillis) * 100;
  };

  // Masquer les contrôles automatiquement - plus rapidement
  useEffect(() => {
    if (!showControls) return;

    const timer = setTimeout(() => {
      // Masquer les contrôles même en pause après 2 secondes
      setShowControls(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [showControls]);

  // Afficher les contrôles brièvement au chargement puis les masquer
  useEffect(() => {
    if (status?.isLoaded && !status.isPlaying) {
      // Quand la vidéo est chargée mais en pause, masquer les contrôles après 1 seconde
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status?.isLoaded, status?.isPlaying]);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadVideo}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading || !processedVideoUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Chargement de la vidéo...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {status?.isLoaded && (
          <View style={styles.headerInfo}>
            <Text style={styles.playbackRateText}>{playbackRate}x</Text>
            <Text style={styles.durationText}>
              {formatTime(status.durationMillis || 0)}
            </Text>
          </View>
        )}
      </View>

      {/* Lecteur vidéo */}
      <View style={styles.videoContainer}>
        <TouchableOpacity 
          style={styles.videoTouchArea}
          onPress={() => {
            if (showControls) {
              // Si les contrôles sont visibles, les masquer
              setShowControls(false);
            } else {
              // Si les contrôles sont masqués, les afficher temporairement
              setShowControls(true);
            }
          }}
          activeOpacity={1}
        >
          <Video
            ref={videoRef}
            source={{ uri: processedVideoUrl }}
            style={[styles.video, { height: videoHeight }]}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            useNativeControls={false}
            isLooping={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onError={(error) => {
              console.error('Video playback error:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              console.error('Video URL that failed:', processedVideoUrl);
              
              // More specific error messages based on error code
              let errorMessage = 'Erreur lors de la lecture de la vidéo';
              if (error && typeof error === 'object') {
                if ('code' in error && error.code === -1008) {
                  errorMessage = 'Vidéo non accessible - Vérifiez votre connexion internet';
                } else if ('code' in error && error.code === -1009) {
                  errorMessage = 'Pas de connexion internet';
                } else if ('code' in error) {
                  errorMessage = `Erreur de lecture (Code: ${error.code})`;
                }
              }
              
              setError(errorMessage);
            }}
          />

          {/* Indicateur de pause discret */}
          {status?.isLoaded && !status.isPlaying && !showControls && (
            <View style={styles.pauseIndicator}>
              <TouchableOpacity 
                style={styles.pauseButton}
                onPress={togglePlayPause}
                activeOpacity={0.7}
              >
                <Ionicons name="play" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* Feedback de navigation précise */}
          {seekFeedback && (
            <View style={styles.seekFeedback}>
              <Text style={styles.seekFeedbackText}>{seekFeedback}</Text>
            </View>
          )}

          {/* Overlay des contrôles - Plus discret */}
          {showControls && (
            <View style={styles.controlsOverlay}>
              {/* Contrôles principaux */}
              <View style={styles.mainControls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={skipBackward}
                >
                  <Ionicons name="play-skip-back" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, styles.playButton]}
                  onPress={togglePlayPause}
                >
                  <Ionicons 
                    name={status?.isLoaded && status.isPlaying ? "pause" : "play"} 
                    size={32} 
                    color="white" 
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={skipForward}
                >
                  <Ionicons name="play-skip-forward" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Barre de progression */}
              {status?.isLoaded && (
                <View style={styles.progressContainer}>
                  <Text style={styles.timeText}>
                    {formatTime(status.positionMillis || 0)}
                  </Text>
                  
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${getProgressPercentage()}%` }
                      ]} 
                    />
                    <TouchableOpacity
                      style={[
                        styles.progressThumb,
                        { left: `${getProgressPercentage()}%` }
                      ]}
                      onPress={() => {
                        // TODO: Implémenter le drag pour la navigation
                      }}
                    />
                  </View>
                  
                  <Text style={styles.timeText}>
                    {formatTime(status.durationMillis || 0)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Contrôles d'analyse */}
      {showAnalysisControls && (
        <View style={styles.analysisControls}>
          {/* Navigation par phases */}
          <View style={styles.phaseNavigation}>
            <Text style={styles.sectionTitle}>Navigation par Phase</Text>
            <View style={styles.phaseButtons}>
              <TouchableOpacity
                style={[styles.phaseButton, { backgroundColor: '#10b981' }]}
                onPress={() => seekToPhase(0)}
              >
                <Text style={styles.phaseButtonText}>Début</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.phaseButton, { backgroundColor: '#3b82f6' }]}
                onPress={() => seekToPhase(0.25)}
              >
                <Text style={styles.phaseButtonText}>Montée</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.phaseButton, { backgroundColor: '#f59e0b' }]}
                onPress={() => seekToPhase(0.5)}
              >
                <Text style={styles.phaseButtonText}>Impact</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.phaseButton, { backgroundColor: '#8b5cf6' }]}
                onPress={() => seekToPhase(0.75)}
              >
                <Text style={styles.phaseButtonText}>Finition</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contrôles de vitesse */}
          <View style={styles.speedControls}>
            <Text style={styles.sectionTitle}>Vitesse de Lecture</Text>
            <View style={styles.speedButtons}>
              {playbackRates.map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[
                    styles.speedButton,
                    playbackRate === rate && styles.speedButtonActive
                  ]}
                  onPress={() => changePlaybackRate(rate)}
                >
                  <Text style={[
                    styles.speedButtonText,
                    playbackRate === rate && styles.speedButtonTextActive
                  ]}>
                    {rate}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Navigation précise */}
          <View style={styles.precisionControls}>
            <Text style={styles.sectionTitle}>Navigation Précise</Text>
            
            {/* Première ligne : Navigation par frames */}
            <View style={styles.precisionButtons}>
              <TouchableOpacity
                style={styles.precisionButton}
                onPress={seekBackwardFrame}
              >
                <Ionicons name="caret-back" size={14} color="#8b5cf6" />
                <Text style={styles.precisionButtonText}>Frame</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.precisionButton}
                onPress={seekBackwardPrecise}
              >
                <Ionicons name="play-skip-back" size={16} color="#3b82f6" />
                <Text style={styles.precisionButtonText}>-0.1s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.precisionButton}
                onPress={seekForwardPrecise}
              >
                <Ionicons name="play-skip-forward" size={16} color="#3b82f6" />
                <Text style={styles.precisionButtonText}>+0.1s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.precisionButton}
                onPress={seekForwardFrame}
              >
                <Ionicons name="caret-forward" size={14} color="#8b5cf6" />
                <Text style={styles.precisionButtonText}>Frame</Text>
              </TouchableOpacity>
            </View>

            {/* Deuxième ligne : Navigation par secondes */}
            <View style={styles.precisionButtons}>
              <TouchableOpacity
                style={[styles.precisionButton, styles.secondaryButton]}
                onPress={() => seekPrecise(-1000)}
              >
                <Ionicons name="chevron-back" size={16} color="#64748b" />
                <Text style={[styles.precisionButtonText, styles.secondaryButtonText]}>-1s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.precisionButton, styles.secondaryButton]}
                onPress={() => seekPrecise(-500)}
              >
                <Text style={[styles.precisionButtonText, styles.secondaryButtonText]}>-0.5s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.precisionButton, styles.secondaryButton]}
                onPress={() => seekPrecise(500)}
              >
                <Text style={[styles.precisionButtonText, styles.secondaryButtonText]}>+0.5s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.precisionButton, styles.secondaryButton]}
                onPress={() => seekPrecise(1000)}
              >
                <Ionicons name="chevron-forward" size={16} color="#64748b" />
                <Text style={[styles.precisionButtonText, styles.secondaryButtonText]}>+1s</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.precisionHint}>
              💡 Frame par frame pour l'analyse détaillée, ±0.1s pour la précision
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playbackRateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  videoContainer: {
    position: 'relative',
    backgroundColor: '#000',
  },
  videoTouchArea: {
    position: 'relative',
  },
  video: {
    width: '100%',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Beaucoup plus transparent
    justifyContent: 'space-between',
    padding: 16,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: 24,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Plus transparent
    borderRadius: 20,
    padding: 8, // Plus petit
  },
  playButton: {
    padding: 12, // Plus petit
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'monospace',
    minWidth: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    marginLeft: -8,
  },
  analysisControls: {
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  phaseNavigation: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  phaseButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  phaseButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  phaseButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  speedControls: {},
  speedButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speedButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  speedButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  speedButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  speedButtonTextActive: {
    color: 'white',
  },
  precisionControls: {
    marginTop: 20,
  },
  precisionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  precisionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    gap: 4,
  },
  precisionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  secondaryButton: {
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  secondaryButtonText: {
    color: '#64748b',
  },
  seekFeedback: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  seekFeedbackText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  pauseIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 5,
  },
  pauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 25,
    padding: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  precisionHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});