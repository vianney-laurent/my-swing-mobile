import { useState } from 'react';
import { AnalysisService, VideoAnalysisRequest, AnalysisResult } from '../lib/analysis/analysis-service';

export function useVideoAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeVideo = async (request: VideoAnalysisRequest) => {
    setIsAnalyzing(true);
    setError(null);
    setCurrentAnalysis(null);

    try {
      const result = await AnalysisService.analyzeVideo(request);
      
      if (result) {
        setCurrentAnalysis(result);
        
        if (result.status === 'failed') {
          setError(result.error || 'Échec de l\'analyse');
        }
      } else {
        setError('Échec de l\'analyse vidéo');
      }
    } catch (err) {
      setError('Erreur inattendue lors de l\'analyse');
      console.error('Video analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const checkAnalysisStatus = async (analysisId: string) => {
    try {
      const result = await AnalysisService.getAnalysisStatus(analysisId);
      if (result) {
        setCurrentAnalysis(result);
      }
    } catch (err) {
      console.error('Check analysis status error:', err);
    }
  };

  const resetAnalysis = () => {
    setCurrentAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return {
    isAnalyzing,
    currentAnalysis,
    error,
    analyzeVideo,
    checkAnalysisStatus,
    resetAnalysis,
  };
}