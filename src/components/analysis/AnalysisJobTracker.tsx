import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { UnifiedAnalysisService } from '../../lib/analysis/unified-analysis-service';
import { JobStatus } from '../../lib/analysis/analysis-job-service';

interface AnalysisJobTrackerProps {
  jobId: string;
  onCompleted: (analysisId: string) => void;
  onError: (error: string) => void;
}

export const AnalysisJobTracker: React.FC<AnalysisJobTrackerProps> = ({
  jobId,
  onCompleted,
  onError
}) => {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const startTracking = async () => {
      try {
        // Get initial status
        const initialStatus = await UnifiedAnalysisService.getJobStatus(jobId);
        if (initialStatus) {
          setJobStatus(initialStatus);
          
          if (initialStatus.status === 'completed' && initialStatus.analysisId) {
            onCompleted(initialStatus.analysisId);
            return;
          } else if (initialStatus.status === 'failed') {
            onError(initialStatus.errorDetails || 'Analysis failed');
            return;
          }
        }

        // Subscribe to updates
        unsubscribe = UnifiedAnalysisService.subscribeToJobUpdates(
          jobId,
          (status) => {
            console.log('📊 Job status update:', status);
            setJobStatus(status);

            if (status.status === 'completed' && status.analysisId) {
              onCompleted(status.analysisId);
            } else if (status.status === 'failed') {
              onError(status.errorDetails || 'Analysis failed');
            }
          },
          (error) => {
            console.error('❌ Job tracking error:', error);
            onError(error.message);
          }
        );

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) return prev;
            return prev + Math.random() * 10;
          });
        }, 1000);

        return () => {
          clearInterval(progressInterval);
        };

      } catch (error) {
        console.error('❌ Failed to start job tracking:', error);
        onError(error instanceof Error ? error.message : 'Tracking failed');
      }
    };

    startTracking();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [jobId, onCompleted, onError]);

  const getStatusText = () => {
    if (!jobStatus) return 'Initializing...';
    
    switch (jobStatus.status) {
      case 'queued':
        return 'Queued for processing...';
      case 'processing':
        return 'Analyzing your swing...';
      case 'completed':
        return 'Analysis completed!';
      case 'failed':
        return 'Analysis failed';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    if (!jobStatus) return '#666';
    
    switch (jobStatus.status) {
      case 'queued':
        return '#f39c12';
      case 'processing':
        return '#3498db';
      case 'completed':
        return '#27ae60';
      case 'failed':
        return '#e74c3c';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ActivityIndicator 
          size="large" 
          color={getStatusColor()} 
          style={styles.spinner}
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {jobStatus?.status === 'processing' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(progress, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress)}%
          </Text>
        </View>
      )}

      {jobStatus && (
        <View style={styles.details}>
          <Text style={styles.detailText}>
            Job ID: {jobStatus.id.substring(0, 8)}...
          </Text>
          <Text style={styles.detailText}>
            Started: {new Date(jobStatus.createdAt).toLocaleTimeString()}
          </Text>
          {jobStatus.startedAt && (
            <Text style={styles.detailText}>
              Processing since: {new Date(jobStatus.startedAt).toLocaleTimeString()}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  details: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
});