import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { mobileVideoService } from '../lib/video/video-service';

interface EnhancedVideoPlayerProps {
  videoUrl: string;
  title?: string;
  showAnalysisControls?: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export default function EnhancedVideoPlayer({ 
  videoUrl, 
  title = 'Vidéo d\'Analyse',
  showAnalysisControls = true,
  onTimeUpdate 
}: EnhancedVideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [seekFeedback, setSeekFeedback] = useState<string | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);

  // Dimensions de l'écran
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Calculer les dimensions optimales pour vidéo portrait
  const getOptimalVideoDimensions = () => {
    if (!videoDimensions) {
      // Dimensions par défaut pour format portrait (9:16)
      return {
        width: screenWidth - 32, // Marges de 16px de chaque côté
        height: Math.min((screenWidth - 32) * (16/9), screenHeight * 0.6) // Max 60% de la hauteur d'écran
      };
    }

    const videoAspectRatio = videoDimensions.width / videoDimensions.height;
    const containerWidth = screenWidth - 32;
    
    if (videoAspectRatio < 1) {
      // Vidéo portrait - optimiser pour réduire les bandes noires
      const maxHeight = screenHeight * 0.7; // Utiliser jusqu'à 70% de la hauteur d'écran
      const calculatedHeight = containerWidth / videoAspectRatio;
      const finalHeight = Math.min(calculatedHeight, maxHeight);
      
      return {
        width: containerWidth,
        height: finalHeight
      };
    } else {
      // Vidéo paysage - comportement standard
      const calculatedHeight = containerWidth / videoAspectRatio;
      return {
        width: containerWidth,
        height: Math.min(calculatedHeight, screenHeight * 0.4)
      };
    }
  };

  const optimalDimensions = getOptimalVideoDimensions();

  // Vitesses de lecture pour l'analyse
  const playbackRates = [0.25, 0.5, 0.75, 1.0];

  useEffect(() => {
    loadVideo();
  }, [videoUrl]);

  const loadVideo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎥 [EnhancedVideoPlayer] Loading video:', videoUrl);
      
      const bestUrl = await mobileVideoService.getBestVideoUrl(videoUrl);
      setProcessedVideoUrl(bestUrl);
      
      console.log('✅ [EnhancedVideoPlayer] Video URL ready');
      
    } catch (err) {
      console.error('❌ [EnhancedVideoPlayer] Error loading video:', err);
      setError('Impossible de charger la vidéo');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
    
    if (playbackStatus.isLoaded) {
      // Récupérer les dimensions de la vidéo
      if (playbackStatus.naturalSize && !videoDimensions) {
        setVideoDimensions({
          width: playbackStatus.naturalSize.width,
          height: playbackStatus.naturalSize.height
        });
      }
      
      if (onTimeUpdate) {
        const currentTime = (playbackStatus.positionMillis || 0) / 1000;
        const duration = (playbackStatus.durationMillis || 0) / 1000;
        onTimeUpdate(currentTime, duration);
      }
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
      await videoRef.current.setPositionAsync(positionMillis, {
        toleranceMillisBefore: 50,
        toleranceMillisAfter: 50,
      });
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const seekPrecise = async (milliseconds: number) => {
    if (!status?.isLoaded || !videoRef.current) return;
    
    try {
      const currentPosition = status.positionMillis || 0;
      const maxPosition = status.durationMillis || 0;
      const newPosition = Math.max(0, Math.min(maxPosition, currentPosition + milliseconds));
      
      // Afficher un feedback visuel
      const feedbackText = milliseconds > 0 ? `+${Math.abs(milliseconds/1000)}s` : `-${Math.abs(milliseconds/1000)}s`;
      setSeekFeedback(feedbackText);
      setTimeout(() => setSeekFeedback(null), 800);
      
      await seekTo(newPosition);
      
    } catch (error) {
      console.error('Error in precise seek:', error);
    }
  };

  // Gestion du swipe pour navigation avec PanResponder
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Activer le pan responder si le mouvement horizontal est significatif
      return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderGrant: () => {
      // Début du geste
    },
    onPanResponderMove: (evt, gestureState) => {
      // Pendant le mouvement - on pourrait afficher un preview
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, vx } = gestureState;
      
      // Seuil de détection du swipe
      if (Math.abs(dx) > 50 || Math.abs(vx) > 0.5) {
        if (dx > 0) {
          // Swipe vers la droite - avancer
          const seekAmount = Math.min(5000, Math.abs(dx) * 10); // Max 5s
          seekPrecise(seekAmount);
        } else {
          // Swipe vers la gauche - reculer
          const seekAmount = Math.min(5000, Math.abs(dx) * 10); // Max 5s
          seekPrecise(-seekAmount);
        }
      }
    },
  });

  const changePlaybackRate = async (rate: number) => {
    if (!videoRef.current || !status?.isLoaded) return;

    try {
      await videoRef.current.setRateAsync(rate, true);
      setPlaybackRate(rate);
    } catch (error) {
      console.error('Error changing playback rate:', error);
    }
  };

  // Gestion du curseur draggable
  const progressPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsDragging(true);
      setShowControls(true);
      // Calculer la position initiale
      const { locationX } = evt.nativeEvent;
      const progressBarWidth = screenWidth - 120; // Largeur approximative de la barre
      const percentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
      setDragPosition(percentage);
    },
    onPanResponderMove: (evt, gestureState) => {
      const progressBarWidth = screenWidth - 120;
      const { dx } = gestureState;
      const startX = evt.nativeEvent.pageX - dx;
      const currentX = evt.nativeEvent.pageX;
      const percentage = Math.max(0, Math.min(1, (currentX - startX) / progressBarWidth));
      setDragPosition(percentage);
    },
    onPanResponderRelease: async () => {
      if (status?.isLoaded && status.durationMillis) {
        const newPosition = status.durationMillis * dragPosition;
        await seekTo(newPosition);
      }
      setIsDragging(false);
    },
  });

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!status?.isLoaded || !status.durationMillis) return 0;
    if (isDragging) return dragPosition * 100;
    return ((status.positionMillis || 0) / status.durationMillis) * 100;
  };

  const getCurrentTime = () => {
    if (!status?.isLoaded) return 0;
    if (isDragging && status.durationMillis) {
      return status.durationMillis * dragPosition;
    }
    return status.positionMillis || 0;
  };

  // Masquer les contrôles automatiquement
  useEffect(() => {
    if (!showControls) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

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
        <View style={[styles.loadingContainer, { height: optimalDimensions.height }]}>
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

      {/* Lecteur vidéo avec gestion du swipe */}
      <View style={[styles.videoContainer, optimalDimensions]} {...panResponder.panHandlers}>
        <TouchableOpacity 
          style={styles.videoTouchArea}
          onPress={() => setShowControls(!showControls)}
          activeOpacity={1}
        >
            <Video
              ref={videoRef}
              source={{ uri: processedVideoUrl }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
              useNativeControls={false}
              isLooping={false}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              onError={(error) => {
                console.error('Video playback error:', error);
                setError('Erreur lors de la lecture de la vidéo');
              }}
            />

            {/* Bouton play discret en bas à droite */}
            {status?.isLoaded && !status.isPlaying && !showControls && (
              <TouchableOpacity 
                style={styles.discretePlayButton}
                onPress={togglePlayPause}
                activeOpacity={0.8}
              >
                <Ionicons name="play" size={20} color="white" />
              </TouchableOpacity>
            )}

            {/* Feedback de navigation */}
            {seekFeedback && (
              <View style={styles.seekFeedback}>
                <Text style={styles.seekFeedbackText}>{seekFeedback}</Text>
              </View>
            )}

            {/* Overlay des contrôles */}
            {showControls && (
              <View style={styles.controlsOverlay}>
                {/* Contrôles principaux */}
                <View style={styles.mainControls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => seekPrecise(-5000)}
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
                    onPress={() => seekPrecise(5000)}
                  >
                    <Ionicons name="play-skip-forward" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Barre de progression avec curseur draggable */}
                {status?.isLoaded && (
                  <View style={styles.progressContainer}>
                    <Text style={styles.timeText}>
                      {formatTime(getCurrentTime())}
                    </Text>
                    
                    <View style={styles.progressBarContainer} {...progressPanResponder.panHandlers}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${getProgressPercentage()}%` }
                          ]} 
                        />
                        <View 
                          style={[
                            styles.progressThumb,
                            { 
                              left: `${getProgressPercentage()}%`,
                              transform: [{ scale: isDragging ? 1.3 : 1 }],
                              backgroundColor: isDragging ? '#1d4ed8' : '#3b82f6'
                            }
                          ]}
                        />
                      </View>
                    </View>
                    
                    <Text style={styles.timeText}>
                      {formatTime(status.durationMillis || 0)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Indicateur de swipe */}
            <View style={styles.swipeHint}>
              <Text style={styles.swipeHintText}>← Swipez pour naviguer →</Text>
            </View>
          </TouchableOpacity>
        </View>

      {/* Contrôles intégrés au lecteur */}
      {showAnalysisControls && (
        <View style={styles.integratedControls}>
          {/* Contrôles de vitesse */}
          <View style={styles.speedControlsRow}>
            <Text style={styles.controlLabel}>Vitesse:</Text>
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
          <View style={styles.precisionControlsRow}>
            <Text style={styles.controlLabel}>Navigation:</Text>
            <View style={styles.precisionButtons}>
              <TouchableOpacity
                style={styles.precisionButton}
                onPress={() => seekPrecise(-1000)}
              >
                <Ionicons name="play-skip-back" size={16} color="#3b82f6" />
                <Text style={styles.precisionButtonText}>-1s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.precisionButton}
                onPress={() => seekPrecise(-100)}
              >
                <Text style={styles.precisionButtonText}>-0.1s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.precisionButton}
                onPress={() => seekPrecise(100)}
              >
                <Text style={styles.precisionButtonText}>+0.1s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.precisionButton}
                onPress={() => seekPrecise(1000)}
              >
                <Ionicons name="play-skip-forward" size={16} color="#3b82f6" />
                <Text style={styles.precisionButtonText}>+1s</Text>
              </TouchableOpacity>
            </View>
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
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 16,
  },
  videoTouchArea: {
    flex: 1,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  discretePlayButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'space-between',
    padding: 16,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: 32,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    padding: 12,
  },
  playButton: {
    padding: 16,
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
  progressBarContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 18,
    height: 18,
    backgroundColor: '#3b82f6',
    borderRadius: 9,
    marginLeft: -9,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
  swipeHint: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  integratedControls: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  speedControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  precisionControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    minWidth: 80,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  speedButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    minWidth: 40,
  },
  speedButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  speedButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  speedButtonTextActive: {
    color: 'white',
  },
  precisionButtons: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  precisionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    gap: 2,
    flex: 1,
  },
  precisionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    margin: 16,
    borderRadius: 12,
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