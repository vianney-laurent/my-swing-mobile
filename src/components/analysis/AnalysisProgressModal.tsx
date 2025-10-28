import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnalysisProgress } from '../../lib/analysis/mobile-analysis-service';

interface AnalysisProgressModalProps {
  visible: boolean;
  progress: AnalysisProgress;
}

export default function AnalysisProgressModal({ visible, progress }: AnalysisProgressModalProps) {
  const getStepIcon = (step: string, currentStep: string) => {
    const isActive = step === currentStep;
    const isCompleted = getStepOrder(step) < getStepOrder(currentStep);
    
    if (isCompleted) {
      return <Ionicons name="checkmark-circle" size={24} color="#10b981" />;
    }
    
    if (isActive) {
      return <ActivityIndicator size="small" color="#3b82f6" />;
    }
    
    return <Ionicons name="ellipse-outline" size={24} color="#d1d5db" />;
  };

  const getStepOrder = (step: string): number => {
    const order = {
      'uploading': 1,
      'processing': 2,
      'analyzing': 3,
      'saving': 4,
      'completed': 5
    };
    return order[step as keyof typeof order] || 0;
  };

  const getStepLabel = (step: string): string => {
    const labels = {
      'uploading': 'Préparation',
      'processing': 'Traitement',
      'analyzing': 'Analyse IA',
      'saving': 'Sauvegarde',
      'completed': 'Terminé'
    };
    return labels[step as keyof typeof labels] || step;
  };

  const steps = ['uploading', 'processing', 'analyzing', 'saving', 'completed'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="analytics" size={32} color="#3b82f6" />
            </View>
            <Text style={styles.title}>Analyse en cours</Text>
            <Text style={styles.subtitle}>Analyse de votre swing de golf</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress.progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress.progress)}%</Text>
          </View>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => {
              const isActive = step === progress.step;
              const isCompleted = getStepOrder(step) < getStepOrder(progress.step);
              
              return (
                <View key={step} style={styles.step}>
                  <View style={styles.stepIcon}>
                    {getStepIcon(step, progress.step)}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[
                      styles.stepLabel,
                      isActive && styles.stepLabelActive,
                      isCompleted && styles.stepLabelCompleted
                    ]}>
                      {getStepLabel(step)}
                    </Text>
                    {isActive && (
                      <Text style={styles.stepMessage}>{progress.message}</Text>
                    )}
                  </View>
                  {index < steps.length - 1 && (
                    <View style={[
                      styles.stepConnector,
                      isCompleted && styles.stepConnectorCompleted
                    ]} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Current Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.currentMessage}>{progress.message}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'center',
  },
  stepsContainer: {
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  stepIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 2,
  },
  stepLabelActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: '#10b981',
  },
  stepMessage: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  stepConnector: {
    position: 'absolute',
    left: 11,
    top: 28,
    width: 2,
    height: 20,
    backgroundColor: '#e2e8f0',
  },
  stepConnectorCompleted: {
    backgroundColor: '#10b981',
  },
  messageContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  currentMessage: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    textAlign: 'center',
  },
});