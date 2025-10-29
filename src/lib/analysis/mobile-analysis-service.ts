/**
 * 🎯 Service d'analyse de golf mobile
 * Reprend la logique de l'app web avec adaptation mobile
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../supabase/client';
import * as FileSystem from 'expo-file-system/legacy';

export interface MobileAnalysisRequest {
  videoUri: string; // URI local de la vidéo sur mobile
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  focusAreas?: string[];
  context?: {
    club: string;
    angle: 'face' | 'profile';
  };
}

export interface MobileAnalysisResult {
  overallScore: number;
  confidence: number;
  
  // Points forts avec preuves temporelles
  strengths: Array<{
    strength: string;
    evidence: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  
  // Problèmes avec solutions immédiates
  criticalIssues: Array<{
    issue: string;
    timeEvidence: string;
    immediateAction: string;
    expectedImprovement: string;
    priority: 1 | 2 | 3;
  }>;
  
  // Conseils ultra-spécifiques
  actionableAdvice: Array<{
    category: string;
    instruction: string;
    howToTest: string;
    timeToSee: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  
  // Plan d'action immédiat
  immediateActions: {
    nextSession: string[];
    thisWeek: string[];
    longTerm: string[];
  };
  
  // Analyse temporelle du swing
  swingAnalysis: {
    phases: Array<{
      name: string;
      startTime: number;
      endTime: number;
      quality: number;
      observations: string[];
    }>;
    tempo: string;
    timing: string;
  };
}

export interface AnalysisProgress {
  step: 'uploading' | 'processing' | 'analyzing' | 'saving' | 'completed';
  progress: number; // 0-100
  message: string;
}

export class MobileAnalysisService {
  private genAI: GoogleGenerativeAI | null = null;
  
  private initializeGenAI() {
    if (!this.genAI) {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not configured');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Analyse complète d'un swing de golf depuis mobile
   */
  async analyzeGolfSwing(
    request: MobileAnalysisRequest,
    onProgress?: (progress: AnalysisProgress) => void
  ): Promise<{ analysisId: string; analysis: MobileAnalysisResult }> {
    
    console.log('🎯 Starting mobile golf analysis...');
    console.log(`📱 Video URI: ${request.videoUri}`);
    console.log(`👤 User level: ${request.userLevel}`);
    
    const analysisId = this.generateAnalysisId();
    
    try {
      // Étape 1: Upload vers Supabase
      onProgress?.({
        step: 'uploading',
        progress: 5,
        message: 'Upload de la vidéo vers Supabase...'
      });
      
      const supabaseVideoUrl = await this.uploadVideoToSupabase(request.videoUri, (progress) => {
        onProgress?.({
          step: 'uploading',
          progress: 5 + (progress * 0.25), // 5-30%
          message: 'Upload en cours...'
        });
      }, analysisId);
      
      // Étape 2: Traitement vidéo pour l'analyse
      onProgress?.({
        step: 'processing',
        progress: 30,
        message: 'Traitement de la vidéo...'
      });
      
      const videoBase64 = await this.processVideoForAnalysis(request.videoUri, (progress) => {
        onProgress?.({
          step: 'processing',
          progress: 30 + (progress * 0.15), // 30-45%
          message: 'Préparation pour l\'analyse...'
        });
      });
      
      // Étape 3: Récupération du profil utilisateur
      onProgress?.({
        step: 'processing',
        progress: 50,
        message: 'Récupération du profil...'
      });
      
      const userProfile = await this.getCurrentUserProfile();
      
      // Étape 4: Analyse avec Gemini
      onProgress?.({
        step: 'analyzing',
        progress: 55,
        message: 'Analyse IA en cours...'
      });
      
      const analysis = await this.performGeminiAnalysis(request, videoBase64, userProfile);
      
      // Étape 5: Sauvegarde en base avec l'URL Supabase
      onProgress?.({
        step: 'saving',
        progress: 90,
        message: 'Sauvegarde de l\'analyse...'
      });
      
      await this.saveAnalysisToDatabase(analysisId, request, analysis, supabaseVideoUrl);
      
      onProgress?.({
        step: 'completed',
        progress: 100,
        message: 'Analyse terminée !'
      });
      
      console.log('🎉 Mobile analysis completed successfully');
      console.log(`📊 Score: ${analysis.overallScore}/100`);
      
      return { analysisId, analysis };
      
    } catch (error) {
      console.error('❌ Mobile analysis failed:', error);
      throw new Error(`Analyse échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Traite la vidéo mobile pour l'analyse
   */
  private async processVideoForAnalysis(
    videoUri: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    
    console.log('🎬 Processing mobile video for analysis...');
    
    const serverUrl = process.env.EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL;
    
    // Temporairement, utilisons le traitement local avec validation renforcée
    // TODO: Redéployer le serveur avec support multer
    console.log('📱 Using enhanced local processing (temporary)...');
    return await this.processVideoLocallyEnhanced(videoUri, onProgress);
  }

  /**
   * Traite la vidéo via le serveur de traitement
   */
  private async processVideoViaServer(
    videoUri: string,
    serverUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    
    console.log('🌐 Processing video via server...');
    
    try {
      // Lire le fichier vidéo local d'abord
      onProgress?.(10);
      
      const response = await fetch(videoUri);
      const blob = await response.blob();
      
      onProgress?.(30);
      
      // Vérifier la taille
      const sizeInMB = blob.size / (1024 * 1024);
      console.log(`📊 Video size: ${sizeInMB.toFixed(2)} MB`);
      
      if (sizeInMB > 50) {
        throw new Error(`Vidéo trop volumineuse: ${sizeInMB.toFixed(2)}MB (max 50MB)`);
      }
      
      // Créer FormData correctement pour React Native
      const formData = new FormData();
      formData.append('video', blob, 'golf-swing.mp4');
      
      onProgress?.(50);
      
      const serverResponse = await fetch(`${serverUrl}/process-video`, {
        method: 'POST',
        body: formData,
        // Ne pas définir Content-Type, laissez le navigateur le faire
      });
      
      onProgress?.(80);
      
      if (!serverResponse.ok) {
        const errorText = await serverResponse.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${serverResponse.status}`);
      }
      
      const result = await serverResponse.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Server processing failed');
      }
      
      onProgress?.(100);
      
      console.log(`✅ Video processed via server: ${result.video.size.toFixed(2)}MB`);
      
      return result.video.base64;
      
    } catch (error) {
      console.error('❌ Server processing failed:', error);
      throw error;
    }
  }

  /**
   * Traitement vidéo local (fallback)
   */
  private async processVideoLocally(
    videoUri: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    
    console.log('📱 Processing video locally...');
    console.log(`📱 Video URI: ${videoUri}`);
    
    try {
      onProgress?.(30);
      
      // Vérifier que le fichier existe
      console.log('📱 Checking video file...');
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      
      if (!fileInfo.exists) {
        throw new Error('Video file does not exist');
      }
      
      console.log(`📊 Video file info:`, {
        size: 'size' in fileInfo ? fileInfo.size : 'unknown',
        uri: fileInfo.uri,
        exists: fileInfo.exists
      });
      
      onProgress?.(60);
      
      // Vérifier la taille
      const sizeInMB = ('size' in fileInfo && fileInfo.size) ? fileInfo.size / (1024 * 1024) : 0;
      if (sizeInMB > 0) {
        console.log(`📊 Video size: ${sizeInMB.toFixed(2)} MB`);
        
        if (sizeInMB > 50) {
          throw new Error(`Vidéo trop volumineuse: ${sizeInMB.toFixed(2)}MB (max 50MB)`);
        }
      } else {
        console.log(`📊 Video size: Unknown (legacy API limitation)`);
      }
      
      onProgress?.(80);
      
      // Lire directement en base64
      console.log('📱 Reading video as base64...');
      const base64 = await FileSystem.readAsStringAsync(videoUri, {
        encoding: 'base64',
      });
      
      console.log(`📱 Base64 conversion result: ${base64.length} characters`);
      console.log(`📱 Base64 preview: ${base64.substring(0, 50)}...`);
      
      if (!base64 || base64.length === 0) {
        throw new Error('Base64 conversion resulted in empty string');
      }
      
      onProgress?.(100);
      
      console.log('✅ Video processed locally');
      
      return base64;
      
    } catch (error) {
      console.error('❌ Local processing failed:', error);
      throw error;
    }
  }

  /**
   * Traitement vidéo local amélioré avec validation renforcée
   */
  private async processVideoLocallyEnhanced(
    videoUri: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    
    console.log('📱 Enhanced local video processing...');
    console.log(`📱 Video URI: ${videoUri}`);
    
    try {
      onProgress?.(10);
      
      // Vérifier que l'URI est valide
      if (!videoUri || !videoUri.startsWith('file://')) {
        throw new Error(`Invalid video URI: ${videoUri}`);
      }
      
      onProgress?.(20);
      
      // Vérifier le fichier avec retry logic
      console.log('📱 Checking video file with retry logic...');
      let fileInfo: FileSystem.FileInfo;
      let retries = 3;
      
      while (retries > 0) {
        try {
          fileInfo = await FileSystem.getInfoAsync(videoUri);
          if (fileInfo.exists) break;
          throw new Error('File does not exist');
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          console.log(`📱 Retry ${4 - retries}/3...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      onProgress?.(40);
      
      console.log(`📊 Video file info:`, {
        size: 'size' in fileInfo! ? fileInfo!.size : 'unknown',
        uri: fileInfo!.uri,
        exists: fileInfo!.exists
      });
      
      // Validation stricte du fichier
      if (!fileInfo!.exists) {
        throw new Error('Video file does not exist');
      }
      
      // Pour l'API legacy, on ne peut pas toujours obtenir la taille, donc on continue
      const sizeInMB = ('size' in fileInfo! && fileInfo!.size) ? fileInfo!.size / (1024 * 1024) : 0;
      if (sizeInMB > 0) {
        console.log(`📊 Video size: ${sizeInMB.toFixed(2)} MB`);
        
        if (sizeInMB > 50) {
          throw new Error(`Video too large: ${sizeInMB.toFixed(2)}MB (max 50MB)`);
        }
      } else {
        console.log(`📊 Video size: Unknown (legacy API limitation)`);
      }
      
      onProgress?.(60);
      
      // Lecture base64 avec validation
      console.log('📱 Reading video as base64 with validation...');
      const base64 = await FileSystem.readAsStringAsync(videoUri, {
        encoding: 'base64',
      });
      
      onProgress?.(80);
      
      // Validation finale du base64
      if (!base64 || base64.length === 0) {
        throw new Error('Base64 conversion failed - empty result');
      }
      
      if (base64.length < 1000) {
        throw new Error(`Base64 too short: ${base64.length} chars (suspicious)`);
      }
      
      console.log(`📱 Base64 validation passed: ${base64.length} characters`);
      console.log(`📱 Base64 preview: ${base64.substring(0, 50)}...`);
      
      onProgress?.(100);
      
      console.log('✅ Enhanced local processing completed');
      
      return base64;
      
    } catch (error) {
      console.error('❌ Enhanced local processing failed:', error);
      throw new Error(`Local video processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload la vidéo vers Supabase Storage
   */
  private async uploadVideoToSupabase(
    videoUri: string,
    onProgress?: (progress: number) => void,
    analysisId?: string
  ): Promise<string> {
    
    console.log('☁️ Uploading video to Supabase Storage...');
    console.log(`📱 Video URI: ${videoUri}`);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated for video upload');
      }
      
      onProgress?.(10);
      
      // Lire le fichier vidéo avec expo-file-system
      console.log('📱 Reading video file info...');
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      
      if (!fileInfo.exists) {
        throw new Error('Video file does not exist');
      }
      
      console.log(`📊 Video file info:`, {
        size: 'size' in fileInfo ? fileInfo.size : 'unknown',
        uri: fileInfo.uri,
        exists: fileInfo.exists
      });
      
      onProgress?.(30);
      
      // Vérifier la taille (limite Supabase)
      const sizeInMB = ('size' in fileInfo && fileInfo.size) ? fileInfo.size / (1024 * 1024) : 0;
      if (sizeInMB > 0) {
        console.log(`📊 Video size: ${sizeInMB.toFixed(2)} MB`);
        
        if (sizeInMB > 100) { // Limite Supabase
          throw new Error(`Video too large for upload: ${sizeInMB.toFixed(2)}MB (max 100MB)`);
        }
      } else {
        console.log(`📊 Video size: Unknown (legacy API limitation)`);
      }
      
      onProgress?.(50);
      
      // Générer le nom de fichier selon votre structure : analysis-[id]
      const fileName = analysisId ? `analysis-${analysisId}.mp4` : `analysis-${Date.now()}.mp4`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log(`📁 Upload path: ${filePath}`);
      
      onProgress?.(60);
      
      // Lire le fichier en base64 pour l'upload
      console.log('📱 Reading file as base64...');
      const base64 = await FileSystem.readAsStringAsync(videoUri, {
        encoding: 'base64',
      });
      
      if (!base64 || base64.length === 0) {
        throw new Error('Failed to read video file as base64');
      }
      
      console.log(`📊 Base64 length: ${base64.length} characters`);
      
      onProgress?.(70);
      
      // Convertir base64 en Uint8Array pour Supabase
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      onProgress?.(80);
      
      // Upload vers Supabase Storage
      console.log('☁️ Uploading to Supabase Storage...');
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, bytes, {
          contentType: 'video/mp4',
          upsert: false
        });
      
      if (error) {
        console.error('❌ Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      if (!data?.path) {
        throw new Error('No file path returned from Supabase upload');
      }
      
      onProgress?.(90);
      
      // Générer l'URL publique
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(data.path);
      
      if (!urlData?.publicUrl) {
        throw new Error('Failed to generate public URL');
      }
      
      onProgress?.(100);
      
      console.log('✅ Video uploaded successfully to Supabase');
      console.log(`🔗 Public URL: ${urlData.publicUrl}`);
      
      return urlData.publicUrl;
      
    } catch (error) {
      console.error('❌ Video upload to Supabase failed:', error);
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }



  /**
   * Récupère le profil utilisateur actuel
   */
  private async getCurrentUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('⚠️ No authenticated user found');
        return null;
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.warn('⚠️ Could not fetch user profile:', error.message);
        return null;
      }
      
      console.log('✅ User profile loaded for analysis');
      return profile;
      
    } catch (error) {
      console.warn('⚠️ Profile fetch failed:', error);
      return null;
    }
  }

  /**
   * Effectue l'analyse avec Gemini (même prompt que l'app web)
   */
  private async performGeminiAnalysis(
    request: MobileAnalysisRequest,
    videoBase64: string,
    userProfile: any
  ): Promise<MobileAnalysisResult> {
    
    console.log('🤖 Starting Gemini analysis...');
    
    try {
      // Vérifier la taille de la vidéo (limite Gemini ~20MB en base64)
      const videoSizeMB = (videoBase64.length * 3) / (4 * 1024 * 1024); // Approximation de la taille décodée
      console.log(`📊 Video size estimate: ${videoSizeMB.toFixed(2)} MB`);
      
      if (videoSizeMB > 15) {
        throw new Error(`Video trop volumineuse (${videoSizeMB.toFixed(2)} MB). Veuillez enregistrer une vidéo plus courte.`);
      }
      
      // Vérifier que le base64 n'est pas vide
      if (!videoBase64 || videoBase64.length === 0) {
        throw new Error('Video base64 is empty');
      }
      
      console.log(`📊 Video base64 length: ${videoBase64.length} characters`);
      console.log(`📊 Video base64 preview: ${videoBase64.substring(0, 50)}...`);
      
      // Construire le prompt (même logique que l'app web)
      const prompt = this.buildAnalysisPrompt(
        request.userLevel,
        request.focusAreas || [],
        userProfile,
        request.context
      );
      
      // Préparer la vidéo pour Gemini
      const videoPart = {
        inlineData: {
          data: videoBase64,
          mimeType: 'video/mp4'
        }
      };
      
      console.log('📋 Video part prepared for Gemini:', {
        hasData: !!videoPart.inlineData.data,
        dataLength: videoPart.inlineData.data.length,
        mimeType: videoPart.inlineData.mimeType
      });
      
      // Analyser avec Gemini 2.0 Flash
      const genAI = this.initializeGenAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      console.log('🔄 Sending video to Gemini...');
      const result = await model.generateContent([prompt, videoPart]);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini analysis completed');
      
      // Parser la réponse
      const analysis = this.parseGeminiResponse(text);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Gemini analysis failed:', error);
      throw error;
    }
  }

  /**
   * Construit le prompt d'analyse (même logique que l'app web)
   */
  private buildAnalysisPrompt(
    userLevel: string,
    focusAreas: string[],
    userProfile: any,
    context?: { club: string; angle: 'face' | 'profile' }
  ): string {
    
    // Instructions de base selon le niveau
    const levelInstructions = {
      beginner: "Concentrez-vous sur les bases fondamentales : grip, position, posture et mécanique simple du swing. Utilisez un langage encourageant et priorisez 1-2 améliorations clés.",
      intermediate: "Analysez le plan de swing, le tempo, le transfert de poids et la trajectoire du club. Fournissez des commentaires techniques spécifiques avec des étapes d'amélioration claires.",
      advanced: "Analyse technique approfondie incluant les problèmes de timing subtils, la mécanique avancée et l'optimisation des performances. Soyez précis et détaillé."
    };
    
    // Personnalisation selon le profil utilisateur
    const profileContext = this.buildProfileContext(userProfile);
    const handednessInstructions = this.getHandednessInstructions(userProfile?.dominant_hand);
    const indexBasedInstructions = this.getIndexBasedInstructions(userProfile?.golf_index, userLevel);
    
    // Contexte du swing (club et angle)
    const contextInstructions = this.buildContextInstructions(context);
    
    const focusText = focusAreas.length > 0 ? 
      `Portez une attention particulière à : ${focusAreas.join(', ')}.` : 
      '';
    
    return `Vous êtes un instructeur de golf expert analysant un swing de golf complet à partir d'une vidéo.

IMPORTANT: Répondez UNIQUEMENT en français. Tous les textes, commentaires et analyses doivent être en français.

${profileContext}

${contextInstructions}

Niveau du joueur : ${userLevel}
${focusText}

Instructions pour le niveau ${userLevel} :
${levelInstructions[userLevel as keyof typeof levelInstructions]}

${handednessInstructions}

${indexBasedInstructions}

Analysez la vidéo complète du swing et fournissez une évaluation détaillée dans ce format JSON EXACT :

{
  "overallScore": <nombre 1-100>,
  "confidence": <nombre 1-100>,
  "strengths": [
    {
      "strength": "<ce qu'ils font bien en français>",
      "evidence": "<à quel moment dans la vidéo en français>",
      "impact": "<high/medium/low>"
    }
  ],
  "criticalIssues": [
    {
      "issue": "<problème spécifique en français>",
      "timeEvidence": "<à X.X secondes dans la vidéo>",
      "immediateAction": "<que faire maintenant en français>",
      "expectedImprovement": "<ce qui va s'améliorer en français>",
      "priority": <1-3>
    }
  ],
  "actionableAdvice": [
    {
      "category": "<nom de catégorie en français>",
      "instruction": "<instruction spécifique en français>",
      "howToTest": "<comment vérifier l'amélioration en français>",
      "timeToSee": "<quand s'attendre aux résultats en français>",
      "difficulty": "<easy/medium/hard>"
    }
  ],
  "immediateActions": {
    "nextSession": ["<action 1 en français>", "<action 2 en français>"],
    "thisWeek": ["<action 1 en français>", "<action 2 en français>"],
    "longTerm": ["<action 1 en français>", "<action 2 en français>"]
  },
  "swingAnalysis": {
    "phases": [
      {
        "name": "<nom de la phase en français>",
        "startTime": <temps en secondes>,
        "endTime": <temps en secondes>,
        "quality": <score 1-100>,
        "observations": ["<observation 1>", "<observation 2>"]
      }
    ],
    "tempo": "<description du tempo en français>",
    "timing": "<analyse du timing en français>"
  }
}

Analysez la vidéo complète en observant le mouvement, le tempo, les transitions entre phases. Référencez les moments temporels spécifiques (en secondes) lors de vos observations.

RAPPEL IMPORTANT : Tous les textes dans le JSON doivent être en français, y compris les phases du swing (Position, Montée, Sommet, Impact, Finition), les observations, les conseils et les actions.`;
  }

  // Méthodes helper (même logique que l'app web)
  private buildProfileContext(userProfile: any): string {
    if (!userProfile) {
      return "PROFIL UTILISATEUR : Informations non disponibles";
    }

    const name = userProfile.first_name ? `${userProfile.first_name}` : "le joueur";
    const indexText = userProfile.golf_index !== null ? 
      `Index de golf : ${userProfile.golf_index}` : 
      "Index non renseigné";
    
    const handText = userProfile.dominant_hand ? 
      `Main dominante : ${userProfile.dominant_hand === 'right' ? 'Droitier' : 'Gaucher'}` : 
      "Main dominante non renseignée";

    return `PROFIL UTILISATEUR :
- Nom : ${name}
- ${indexText}
- ${handText}
- Ville : ${userProfile.city || 'Non renseignée'}

Personnalisez vos conseils en utilisant le prénom du joueur et en tenant compte de son profil spécifique.`;
  }

  private getHandednessInstructions(dominantHand?: 'right' | 'left' | null): string {
    if (!dominantHand) {
      return "MAIN DOMINANTE : Non spécifiée - Donnez des conseils génériques applicables aux droitiers et gauchers.";
    }

    if (dominantHand === 'left') {
      return `INSTRUCTIONS POUR GAUCHER :
- Analysez le swing en miroir par rapport aux droitiers
- La main gauche guide le swing, la droite accompagne
- Position : pied droit légèrement en avant, épaule droite plus basse
- Impact : rotation du corps vers la droite, transfert de poids sur pied gauche
- Finition : corps face à la cible, poids sur pied gauche
- Adaptez TOUS les conseils techniques pour un gaucher (inversez droite/gauche)`;
    }

    return `INSTRUCTIONS POUR DROITIER :
- La main droite guide le swing, la gauche accompagne  
- Position : pied gauche légèrement en avant, épaule gauche plus basse
- Impact : rotation du corps vers la gauche, transfert de poids sur pied droit
- Finition : corps face à la cible, poids sur pied droit
- Utilisez les références techniques standard pour droitiers`;
  }

  private getIndexBasedInstructions(golfIndex?: number | null, userLevel?: string): string {
    if (golfIndex === null || golfIndex === undefined) {
      return "INDEX DE GOLF : Non renseigné - Basez-vous uniquement sur le niveau déclaré.";
    }

    let indexCategory = "";
    let specificInstructions = "";

    if (golfIndex <= 5) {
      indexCategory = "Joueur de très haut niveau";
      specificInstructions = `
- Analysez les détails techniques subtils et les micro-ajustements
- Concentrez-vous sur l'optimisation des performances et la constance
- Recherchez les problèmes de timing et de séquence avancés
- Proposez des ajustements fins pour gagner en précision et distance`;
    } else if (golfIndex <= 15) {
      indexCategory = "Bon joueur";
      specificInstructions = `
- Analysez la technique avec un niveau de détail élevé
- Identifiez les incohérences dans la mécanique du swing
- Proposez des améliorations pour passer au niveau supérieur
- Concentrez-vous sur la répétabilité et l'optimisation`;
    } else if (golfIndex <= 25) {
      indexCategory = "Joueur intermédiaire";
      specificInstructions = `
- Équilibrez technique et simplicité dans les conseils
- Identifiez 2-3 points d'amélioration prioritaires
- Proposez des exercices pratiques et progressifs
- Encouragez la consolidation des acquis avant d'ajouter de la complexité`;
    } else {
      indexCategory = "Joueur en progression";
      specificInstructions = `
- Priorisez les fondamentaux : grip, posture, alignement
- Simplifiez les conseils techniques
- Encouragez et motivez avec des objectifs atteignables
- Concentrez-vous sur 1-2 améliorations majeures maximum`;
    }

    return `INDEX DE GOLF : ${golfIndex} (${indexCategory})
${specificInstructions}

Adaptez le niveau de technicité de vos conseils à cet index. Un index plus bas nécessite des analyses plus poussées.`;
  }

  private buildContextInstructions(context?: { club: string; angle: 'face' | 'profile' }): string {
    if (!context) {
      return "CONTEXTE DU SWING : Non spécifié - Analysez de manière générale.";
    }

    const clubInstructions = this.getClubSpecificInstructions(context.club);
    const angleInstructions = this.getAngleSpecificInstructions(context.angle);

    return `CONTEXTE DU SWING :
${clubInstructions}

${angleInstructions}

Adaptez votre analyse en tenant compte de ces spécificités techniques.`;
  }

  private getClubSpecificInstructions(club: string): string {
    const clubData: { [key: string]: { name: string; category: string; instructions: string } } = {
      'driver': {
        name: 'Driver',
        category: 'Bois',
        instructions: `- Analysez la montée large et le plan de swing plus plat
- Vérifiez le transfert de poids et la rotation des hanches
- Concentrez-vous sur l'angle d'attaque légèrement ascendant
- Évaluez la finition haute et l'équilibre
- Recherchez la maximisation de la vitesse de tête de club`
      },
      'bois3': {
        name: 'Bois 3',
        category: 'Bois',
        instructions: `- Analysez la frappe descendante légère avec ce bois de parcours
- Vérifiez la position de balle (légèrement en arrière du pied gauche)
- Concentrez-vous sur la compression et le contact balle-sol
- Évaluez la trajectoire et le contrôle de distance`
      },
      'fer7': {
        name: 'Fer 7',
        category: 'Fer moyen',
        instructions: `- Analysez la frappe descendante avec compression
- Vérifiez la position de balle au centre du stance
- Concentrez-vous sur le contact balle puis sol (divot après la balle)
- Évaluez la trajectoire moyenne et le contrôle de distance
- Recherchez la constance et la précision`
      },
      'pw': {
        name: 'Pitching Wedge',
        category: 'Wedge',
        instructions: `- Analysez la frappe descendante prononcée
- Vérifiez la position de balle légèrement en arrière du centre
- Concentrez-vous sur le contrôle de distance et la précision
- Évaluez la trajectoire haute et l'effet rétro
- Recherchez la technique de compression`
      },
      'sw': {
        name: 'Sand Wedge',
        category: 'Wedge',
        instructions: `- Analysez la technique spécifique au sable ou aux coups courts
- Vérifiez l'ouverture de la face et l'angle d'attaque
- Concentrez-vous sur l'utilisation du bounce
- Évaluez la trajectoire haute et l'arrêt rapide de la balle`
      },
      'putter': {
        name: 'Putter',
        category: 'Putting',
        instructions: `- Analysez le mouvement pendulaire des épaules
- Vérifiez l'alignement et la posture de putting
- Concentrez-vous sur la régularité du tempo
- Évaluez le contact et le roulement de la balle
- Recherchez la stabilité du bas du corps`
      }
    };

    const clubInfo = clubData[club];
    if (!clubInfo) {
      return `Club utilisé : ${club} (non reconnu) - Analysez de manière générale.`;
    }

    return `Club utilisé : ${clubInfo.name} (${clubInfo.category})
INSTRUCTIONS SPÉCIFIQUES :
${clubInfo.instructions}`;
  }

  private getAngleSpecificInstructions(angle: 'face' | 'profile'): string {
    if (angle === 'profile') {
      return `ANGLE DE PRISE DE VUE : De profil (vue latérale)
ÉLÉMENTS À ANALYSER PRIORITAIREMENT :
- Plan de swing et trajectoire du club
- Transfert de poids (avant/arrière)
- Posture et angles du corps (colonne, genoux)
- Séquence de mouvement et timing
- Extension et rotation du tronc
- Position au sommet et à l'impact
- Finition et équilibre

Cette vue permet une analyse complète de la mécanique du swing.`;
    } else {
      return `ANGLE DE PRISE DE VUE : De face (vue frontale)
ÉLÉMENTS À ANALYSER PRIORITAIREMENT :
- Alignement et position des pieds
- Transfert de poids latéral (gauche/droite)
- Largeur du stance et équilibre
- Mouvement des hanches et rotation
- Trajectoire des mains et du club (intérieur/extérieur)
- Stabilité du bas du corps
- Finition face à la cible

Cette vue permet d'analyser l'alignement et les mouvements latéraux.`;
    }
  }

  /**
   * Parse la réponse de Gemini
   */
  private parseGeminiResponse(text: string): MobileAnalysisResult {
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Valider la structure
      const required = ['overallScore', 'confidence', 'strengths', 'criticalIssues', 'actionableAdvice', 'immediateActions'];
      const missing = required.filter(field => !parsed.hasOwnProperty(field));
      
      if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }
      
      console.log('✅ Analysis parsed successfully');
      
      return parsed as MobileAnalysisResult;
      
    } catch (error) {
      console.error('❌ Failed to parse Gemini response:', error);
      console.log('Raw response:', text);
      throw new Error(`Failed to parse analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sauvegarde l'analyse en base de données
   */
  private async saveAnalysisToDatabase(
    analysisId: string,
    request: MobileAnalysisRequest,
    analysis: MobileAnalysisResult,
    supabaseVideoUrl: string
  ): Promise<void> {
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Adapter au format de la version web existante
      const swingData = {
        totalTime: Date.now(),
        userLevel: request.userLevel,
        videoHash: this.generateVideoHash(request.videoUri),
        videoSize: 0, // Sera calculé si nécessaire
        confidence: analysis.confidence,
        videoMethod: 'mobile-local-processing',
        context: request.context
      };

      // Log du contexte pour debug
      console.log('💾 Saving analysis with context:', {
        club: request.context?.club,
        angle: request.context?.angle,
        fullContext: request.context
      });

      const { error } = await supabase
        .from('analyses')
        .insert({
          id: analysisId,
          user_id: user.id,
          video_url: supabaseVideoUrl, // Utiliser l'URL Supabase au lieu de l'URI local
          analysis_type: 'coaching', // Utiliser le type existant
          target_issue: null,
          status: 'completed',
          gemini_response: JSON.stringify(analysis), // Utiliser gemini_response au lieu d'analysis_data
          swing_data: JSON.stringify(swingData),
          recommendations: null,
          overall_score: analysis.overallScore,
          club_used: request.context?.club || null, // Ajouter le club utilisé
          camera_angle: request.context?.angle || null, // Ajouter l'angle de caméra
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('❌ Database save failed:', error);
        throw error;
      }
      
      console.log('✅ Analysis saved to database');
      
    } catch (error) {
      console.error('❌ Failed to save analysis:', error);
      throw error;
    }
  }

  /**
   * Génère un ID unique pour l'analyse (UUID v4 compatible)
   */
  private generateAnalysisId(): string {
    // Génère un UUID v4 compatible sans dépendance externe
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Génère un hash simple pour la vidéo
   */
  private generateVideoHash(videoUri: string): string {
    // Hash simple basé sur l'URI et le timestamp
    const timestamp = Date.now().toString();
    const uriHash = videoUri.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0);
    return Math.abs(uriHash).toString(16) + timestamp.slice(-6);
  }

  /**
   * Supprime une analyse et sa vidéo associée
   */
  async deleteAnalysis(analysisId: string): Promise<void> {
    console.log('🗑️ Starting analysis deletion:', analysisId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // 1. Récupérer l'analyse pour obtenir l'URL de la vidéo
      console.log('📋 Fetching analysis data...');
      const { data: analysis, error: fetchError } = await supabase
        .from('analyses')
        .select('video_url')
        .eq('id', analysisId)
        .eq('user_id', user.id) // Sécurité : s'assurer que l'utilisateur possède l'analyse
        .single();

      if (fetchError) {
        console.error('❌ Error fetching analysis:', fetchError);
        throw new Error(`Failed to fetch analysis: ${fetchError.message}`);
      }

      if (!analysis) {
        throw new Error('Analysis not found or access denied');
      }

      // 2. Supprimer la vidéo de Supabase Storage si elle existe
      if (analysis.video_url) {
        console.log('🎥 Deleting video from Supabase Storage...');
        
        try {
          // Extraire le chemin du fichier depuis l'URL Supabase
          const urlParts = analysis.video_url.split('/storage/v1/object/public/videos/');
          if (urlParts.length === 2) {
            const filePath = urlParts[1];
            console.log('📁 Video file path:', filePath);

            const { error: deleteVideoError } = await supabase.storage
              .from('videos')
              .remove([filePath]);

            if (deleteVideoError) {
              console.warn('⚠️ Warning: Could not delete video file:', deleteVideoError.message);
              // Ne pas faire échouer la suppression si la vidéo n'existe plus
            } else {
              console.log('✅ Video deleted successfully from storage');
            }
          } else {
            console.warn('⚠️ Warning: Invalid video URL format, skipping video deletion');
          }
        } catch (videoError) {
          console.warn('⚠️ Warning: Error deleting video:', videoError);
          // Ne pas faire échouer la suppression de l'analyse si la vidéo ne peut pas être supprimée
        }
      }

      // 3. Supprimer l'analyse de la base de données
      console.log('📊 Deleting analysis from database...');
      const { error: deleteAnalysisError } = await supabase
        .from('analyses')
        .delete()
        .eq('id', analysisId)
        .eq('user_id', user.id); // Double sécurité

      if (deleteAnalysisError) {
        console.error('❌ Error deleting analysis:', deleteAnalysisError);
        throw new Error(`Failed to delete analysis: ${deleteAnalysisError.message}`);
      }

      console.log('✅ Analysis deleted successfully');
      
    } catch (error) {
      console.error('❌ Analysis deletion failed:', error);
      throw new Error(`Deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const mobileAnalysisService = new MobileAnalysisService();