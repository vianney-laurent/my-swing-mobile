import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Analysis } from '../../types/profile';

interface EnhancedAnalysisCardProps {
  analysis: Analysis;
  onPress: (analysis: Analysis) => void;
  index: number; // Ajout de l'index pour l'alternance
}

const { width: screenWidth } = Dimensions.get('window');

export default function EnhancedAnalysisCard({ analysis, onPress, index }: EnhancedAnalysisCardProps) {
  // Système de couleurs amélioré avec alternance
  const getCardTheme = (score: number, cardIndex: number) => {
    const isEven = cardIndex % 2 === 0;
    
    if (score >= 80) {
      return {
        primary: isEven ? '#10b981' : '#059669', // Vert émeraude
        secondary: isEven ? '#059669' : '#047857',
        accent: '#d1fae5',
        text: '#065f46'
      };
    }
    
    if (score >= 60) {
      return {
        primary: isEven ? '#3b82f6' : '#2563eb', // Bleu au lieu d'orange
        secondary: isEven ? '#2563eb' : '#1d4ed8',
        accent: '#dbeafe',
        text: '#1e40af'
      };
    }
    
    return {
      primary: isEven ? '#ef4444' : '#dc2626', // Rouge
      secondary: isEven ? '#dc2626' : '#b91c1c',
      accent: '#fee2e2',
      text: '#991b1b'
    };
  };

  const getAnalysisTypeIcon = (type: string) => {
    return type === 'correction' ? 'build' : 'analytics';
  };

  const getAnalysisTypeColor = (cardIndex: number) => {
    const isEven = cardIndex % 2 === 0;
    return isEven ? '#8b5cf6' : '#7c3aed'; // Violet avec alternance
  };

  const getStatusInfo = (status: string) => {
    if (status === 'completed') {
      return {
        icon: 'checkmark-circle' as const,
        color: '#10b981',
        text: 'Terminée',
        bgColor: '#f0fdf4'
      };
    }
    return {
      icon: 'time' as const,
      color: '#f59e0b',
      text: 'En cours',
      bgColor: '#fffbeb'
    };
  };

  const formatAnalysisDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const score = analysis.overall_score || 0;
  const cardTheme = getCardTheme(score, index);
  const statusInfo = getStatusInfo(analysis.status);
  const analysisTypeColor = getAnalysisTypeColor(index);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(analysis)}
      activeOpacity={0.8}
    >
      {/* Header avec gradient de score */}
      <View style={[styles.header, { backgroundColor: cardTheme.primary }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.typeIcon, { backgroundColor: analysisTypeColor }]}>
            <Ionicons 
              name={getAnalysisTypeIcon(analysis.analysis_type)} 
              size={16} 
              color="white" 
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.analysisType}>
              {analysis.analysis_type === 'correction' ? 'Correction' : 'Analyse'}
            </Text>
            <Text style={styles.analysisDate}>
              {formatAnalysisDate(analysis.created_at)}
            </Text>
          </View>
        </View>
        
        <View style={[styles.scoreContainer, { backgroundColor: cardTheme.secondary }]}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreLabel}>/100</Text>
        </View>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Barre de progression du score */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${score}%`,
                  backgroundColor: cardTheme.primary
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressLabel, { color: cardTheme.text }]}>Score global</Text>
        </View>

        {/* Informations détaillées */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <View style={[styles.detailItem, { backgroundColor: cardTheme.accent }]}>
              <Ionicons name="golf" size={16} color={cardTheme.text} />
              <Text style={[styles.detailText, { color: cardTheme.text }]}>
                {(analysis as any).club_used || 'Club non spécifié'}
              </Text>
            </View>
            
            <View style={[styles.detailItem, { backgroundColor: cardTheme.accent }]}>
              <Ionicons name="videocam" size={16} color={cardTheme.text} />
              <Text style={[styles.detailText, { color: cardTheme.text }]}>
                {(analysis as any).camera_angle === 'profile' ? 'Profil' : 
                 (analysis as any).camera_angle === 'face' ? 'Face' : 'Standard'}
              </Text>
            </View>
          </View>

          {/* Statut avec badge */}
          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
              <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </View>
        </View>
      </View>


    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  
  // Header avec gradient
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  analysisType: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  analysisDate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    lineHeight: 24,
  },
  scoreLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },

  // Contenu principal
  content: {
    padding: 16,
    paddingTop: 12,
  },
  
  // Section progression
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },

  // Section détails
  detailsSection: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Section statut
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },


});