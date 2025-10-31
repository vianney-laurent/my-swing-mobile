#!/usr/bin/env node

/**
 * Test final de gemini-2.0-flash avec toutes les améliorations
 * Prêt pour les tests mobiles
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

console.log('🎯 Test final de gemini-2.0-flash pour mobile...\n');

// Fonction de détection MIME type (identique au service)
function detectVideoMimeType(videoBase64) {
  try {
    const firstBytes = Buffer.from(videoBase64.substring(0, 20), 'base64');
    const bytes = new Uint8Array(firstBytes);
    
    // Signatures de fichiers vidéo
    if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x00 && bytes[3] === 0x18) {
      return 'video/mp4'; // MP4
    }
    if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x00 && bytes[3] === 0x20) {
      return 'video/mp4'; // MP4 variant
    }
    if (bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) {
      return 'video/webm'; // WebM
    }
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      return 'video/avi'; // AVI
    }
    
    return 'video/mp4'; // Fallback sûr
    
  } catch (error) {
    return 'video/mp4';
  }
}

// Fonction de validation (identique au service)
function validateGeminiRequest(videoPart, prompt) {
  console.log('🔍 Validation finale de la requête...');
  
  if (!videoPart || !videoPart.inlineData) {
    throw new Error('Structure videoPart invalide');
  }
  
  if (!videoPart.inlineData.data || !videoPart.inlineData.mimeType) {
    throw new Error('Données videoPart incomplètes');
  }
  
  const validMimeTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/quicktime'];
  if (!validMimeTypes.includes(videoPart.inlineData.mimeType)) {
    throw new Error(`MIME type non supporté: ${videoPart.inlineData.mimeType}`);
  }
  
  if (!prompt || prompt.length === 0) {
    throw new Error('Prompt vide');
  }
  
  if (prompt.length > 50000) {
    throw new Error(`Prompt trop long: ${prompt.length} caractères (max 50000)`);
  }
  
  const totalSize = videoPart.inlineData.data.length + prompt.length;
  const totalSizeMB = totalSize / (1024 * 1024);
  
  if (totalSizeMB > 20) {
    throw new Error(`Requête trop volumineuse: ${totalSizeMB.toFixed(2)}MB (max 20MB)`);
  }
  
  console.log('✅ Validation réussie');
  console.log(`   MIME type: ${videoPart.inlineData.mimeType}`);
  console.log(`   Taille vidéo: ${(videoPart.inlineData.data.length / 1024).toFixed(0)} KB`);
  console.log(`   Taille prompt: ${prompt.length} caractères`);
  console.log(`   Taille totale: ${totalSizeMB.toFixed(2)} MB`);
}

async function testGemini2FlashComplete() {
  try {
    console.log('🚀 Test complet de gemini-2.0-flash...\n');
    
    // 1. Vérifier la configuration
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.log('❌ Clé API Gemini manquante');
      return false;
    }
    
    console.log('✅ Clé API Gemini configurée');
    console.log(`   Format: ${apiKey.startsWith('AIza') ? 'Valide' : 'Invalide'}`);
    
    // 2. Initialiser Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 3. Test simple d'abord
    console.log('\n🔄 Test simple...');
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
        topP: 0.8,
        topK: 40
      }
    });
    
    const simpleResult = await model.generateContent('Bonjour ! Réponds "Test simple réussi" en français.');
    const simpleResponse = await simpleResult.response;
    const simpleText = simpleResponse.text();
    
    console.log('✅ Test simple réussi !');
    console.log('📝 Réponse:', simpleText.trim());
    
    // 4. Test avec vidéo réaliste
    console.log('\n🎬 Test avec vidéo simulée...');
    
    // Créer une vidéo MP4 factice mais avec structure correcte
    const mp4Header = Buffer.from([
      0x00, 0x00, 0x00, 0x20, // Box size
      0x66, 0x74, 0x79, 0x70, // ftyp
      0x69, 0x73, 0x6F, 0x6D, // isom
      0x00, 0x00, 0x02, 0x00, // minor version
      0x69, 0x73, 0x6F, 0x6D, // compatible brands
      0x69, 0x73, 0x6F, 0x32,
      0x61, 0x76, 0x63, 0x31,
      0x6D, 0x70, 0x34, 0x31
    ]);
    
    // Ajouter du contenu pour simuler une vraie vidéo
    const videoContent = Buffer.alloc(5000, 0x42); // 5KB de données
    const fakeVideo = Buffer.concat([mp4Header, videoContent]);
    const videoBase64 = fakeVideo.toString('base64');
    
    // Détecter le MIME type
    const detectedMimeType = detectVideoMimeType(videoBase64);
    console.log(`🔍 MIME type détecté: ${detectedMimeType}`);
    
    // Préparer les données comme dans le vrai service
    const videoPart = {
      inlineData: {
        data: videoBase64,
        mimeType: detectedMimeType
      }
    };
    
    // Prompt réaliste mais simplifié
    const golfPrompt = `Vous êtes un instructeur de golf expert analysant un swing de golf complet à partir d'une vidéo.

IMPORTANT: Répondez UNIQUEMENT en français.

PROFIL UTILISATEUR :
- Nom : Test User
- Index de golf : 15
- Main dominante : Droitier

Niveau du joueur : intermediate

Analysez la vidéo complète du swing et fournissez une évaluation détaillée dans ce format JSON EXACT :

{
  "overallScore": 85,
  "confidence": 90,
  "strengths": [
    {
      "strength": "Position stable à l'adresse",
      "evidence": "Visible dans les premières secondes",
      "impact": "high"
    }
  ],
  "criticalIssues": [
    {
      "issue": "Transfert de poids incomplet",
      "timeEvidence": "À 1.2 secondes dans la vidéo",
      "immediateAction": "Travailler l'appui sur le pied avant",
      "expectedImprovement": "Plus de puissance et de précision",
      "priority": 1
    }
  ],
  "actionableAdvice": [
    {
      "category": "Technique",
      "instruction": "Améliorer le transfert de poids",
      "howToTest": "Finir en équilibre sur le pied avant",
      "timeToSee": "2-3 séances d'entraînement",
      "difficulty": "medium"
    }
  ],
  "immediateActions": {
    "nextSession": ["Travailler le transfert de poids"],
    "thisWeek": ["Exercices d'équilibre"],
    "longTerm": ["Améliorer la constance"]
  },
  "swingAnalysis": {
    "phases": [
      {
        "name": "Position",
        "startTime": 0.0,
        "endTime": 0.5,
        "quality": 85,
        "observations": ["Bonne posture générale"]
      }
    ],
    "tempo": "Légèrement rapide",
    "timing": "Bon dans l'ensemble"
  }
}`;
    
    // Valider avant envoi
    validateGeminiRequest(videoPart, golfPrompt);
    
    // Envoyer la requête complète
    console.log('\n📤 Envoi de la requête complète...');
    const videoResult = await model.generateContent([golfPrompt, videoPart]);
    const videoResponse = await videoResult.response;
    const videoText = videoResponse.text();
    
    console.log('✅ Test avec vidéo réussi !');
    console.log('📝 Réponse (extrait):');
    console.log(videoText.substring(0, 300) + '...');
    
    // Vérifier que c'est du JSON valide
    try {
      const jsonMatch = videoText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON valide parsé');
        console.log(`   Score: ${parsed.overallScore || 'N/A'}`);
        console.log(`   Confiance: ${parsed.confidence || 'N/A'}`);
      } else {
        console.log('⚠️  Pas de JSON trouvé dans la réponse');
      }
    } catch (parseError) {
      console.log('⚠️  JSON invalide:', parseError.message);
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Test échoué:', error.message);
    
    if (error.message.includes('400')) {
      console.log('\n🔍 Erreur 400 - Causes possibles:');
      console.log('   • Données vidéo corrompues ou format non supporté');
      console.log('   • Prompt trop long ou contient des caractères invalides');
      console.log('   • Paramètres de génération incorrects');
      console.log('   • Quota API dépassé');
    }
    
    return false;
  }
}

async function runFinalTest() {
  console.log('🎯 Test final pour déploiement mobile...\n');
  
  const success = await testGemini2FlashComplete();
  
  console.log('\n📊 Résultat final:');
  console.log(`   Gemini 2.0 Flash: ${success ? '✅ PRÊT' : '❌ PROBLÈME'}`);
  
  if (success) {
    console.log('\n🎉 Configuration optimale confirmée !');
    console.log('💡 Prêt pour les tests mobiles avec:');
    console.log('   • Modèle: gemini-2.0-flash');
    console.log('   • Détection MIME automatique');
    console.log('   • Validation stricte des données');
    console.log('   • Gestion d\'erreur robuste');
    console.log('\n🚀 Vous pouvez maintenant tester sur mobile !');
  } else {
    console.log('\n⚠️  Configuration non fonctionnelle');
    console.log('🔧 Vérifiez:');
    console.log('   1. Clé API Google Generative AI');
    console.log('   2. Quotas et limites du compte');
    console.log('   3. Connexion internet');
  }
}

runFinalTest().catch(console.error);