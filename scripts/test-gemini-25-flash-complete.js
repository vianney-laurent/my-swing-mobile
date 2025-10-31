#!/usr/bin/env node

/**
 * Test complet de gemini-2.5-flash avec toutes les améliorations
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

console.log('🧪 Test complet de gemini-2.5-flash...\n');

// Fonction de détection MIME type (copie de celle du service)
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
    
    return 'video/mp4'; // Fallback
    
  } catch (error) {
    return 'video/mp4'; // Fallback sûr
  }
}

// Fonction de validation (copie de celle du service)
function validateGeminiRequest(videoPart, prompt) {
  console.log('🔍 Validation de la requête...');
  
  // 1. Vérifier la structure videoPart
  if (!videoPart || !videoPart.inlineData) {
    throw new Error('Structure videoPart invalide');
  }
  
  if (!videoPart.inlineData.data || !videoPart.inlineData.mimeType) {
    throw new Error('Données videoPart incomplètes');
  }
  
  // 2. Vérifier le MIME type
  const validMimeTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/quicktime'];
  if (!validMimeTypes.includes(videoPart.inlineData.mimeType)) {
    throw new Error(`MIME type non supporté: ${videoPart.inlineData.mimeType}`);
  }
  
  // 3. Vérifier le prompt
  if (!prompt || prompt.length === 0) {
    throw new Error('Prompt vide');
  }
  
  if (prompt.length > 50000) {
    throw new Error(`Prompt trop long: ${prompt.length} caractères (max 50000)`);
  }
  
  // 4. Vérifier la taille totale
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

async function testGemini25Flash() {
  try {
    // 1. Vérifier la clé API
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.log('❌ Clé API Gemini manquante');
      return false;
    }
    
    console.log('✅ Clé API Gemini trouvée');
    
    // 2. Initialiser Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 3. Test simple d'abord
    console.log('\n🔄 Test simple avec gemini-2.5-flash...');
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
        topP: 0.8,
        topK: 40
      }
    });
    
    const simpleResult = await model.generateContent('Bonjour ! Réponds juste "Test réussi" en français.');
    const simpleResponse = await simpleResult.response;
    const simpleText = simpleResponse.text();
    
    console.log('✅ Test simple réussi !');
    console.log('📝 Réponse:', simpleText.trim());
    
    // 4. Test avec vidéo factice mais structure correcte
    console.log('\n🎬 Test avec données vidéo...');
    
    // Créer une vidéo factice mais avec une signature MP4 valide
    const fakeMP4Header = Buffer.from([
      0x00, 0x00, 0x00, 0x18, // MP4 signature
      0x66, 0x74, 0x79, 0x70, // ftyp
      0x6D, 0x70, 0x34, 0x32  // mp42
    ]);
    const fakeVideoData = Buffer.concat([
      fakeMP4Header,
      Buffer.alloc(1000, 0) // Padding pour avoir une taille raisonnable
    ]);
    const fakeVideoBase64 = fakeVideoData.toString('base64');
    
    // Détecter le MIME type
    const detectedMimeType = detectVideoMimeType(fakeVideoBase64);
    console.log(`🔍 MIME type détecté: ${detectedMimeType}`);
    
    // Préparer les données
    const videoPart = {
      inlineData: {
        data: fakeVideoBase64,
        mimeType: detectedMimeType
      }
    };
    
    const prompt = `Analysez cette vidéo de golf et répondez en JSON:
{
  "overallScore": 85,
  "confidence": 90,
  "message": "Test avec vidéo réussi"
}`;
    
    // Valider avant envoi
    validateGeminiRequest(videoPart, prompt);
    
    // Envoyer la requête
    console.log('📤 Envoi de la requête avec vidéo...');
    const videoResult = await model.generateContent([prompt, videoPart]);
    const videoResponse = await videoResult.response;
    const videoText = videoResponse.text();
    
    console.log('✅ Test avec vidéo réussi !');
    console.log('📝 Réponse:', videoText.substring(0, 200) + '...');
    
    return true;
    
  } catch (error) {
    console.log('❌ Test échoué:', error.message);
    
    // Analyse détaillée de l'erreur
    if (error.message.includes('400')) {
      console.log('\n🔍 Analyse de l\'erreur 400:');
      console.log('   Causes possibles:');
      console.log('   • Modèle gemini-2.5-flash non disponible dans votre région');
      console.log('   • Paramètres de génération invalides');
      console.log('   • Format de données vidéo incorrect');
      console.log('   • Quota API dépassé');
      
      console.log('\n🔧 Solutions à essayer:');
      console.log('   1. Utiliser gemini-1.5-pro à la place');
      console.log('   2. Réduire la taille des données');
      console.log('   3. Simplifier le prompt');
      console.log('   4. Vérifier les quotas API');
    }
    
    if (error.message.includes('404')) {
      console.log('\n🔍 Erreur 404: Modèle non trouvé');
      console.log('   Le modèle gemini-2.5-flash n\'existe peut-être pas encore');
      console.log('   Essayez gemini-2.0-flash ou gemini-1.5-pro');
    }
    
    return false;
  }
}

async function testFallbackModels() {
  console.log('\n🔄 Test des modèles de fallback...\n');
  
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const fallbackModels = [
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
  ];
  
  for (const modelName of fallbackModels) {
    try {
      console.log(`   Testing ${modelName}...`);
      
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100
        }
      });
      
      const result = await model.generateContent('Réponds "OK" en français');
      const response = await result.response;
      const text = response.text();
      
      console.log(`   ✅ ${modelName}: Fonctionne (${text.trim()})`);
      
    } catch (error) {
      console.log(`   ❌ ${modelName}: ${error.message.substring(0, 100)}...`);
    }
  }
}

async function runCompleteTest() {
  console.log('🚀 Démarrage du test complet...\n');
  
  const gemini25Success = await testGemini25Flash();
  await testFallbackModels();
  
  console.log('\n📊 Résumé des tests:');
  console.log(`   Gemini 2.5 Flash: ${gemini25Success ? '✅ Fonctionne' : '❌ Échec'}`);
  
  if (gemini25Success) {
    console.log('\n🎉 Gemini 2.5 Flash fonctionne parfaitement !');
    console.log('💡 Toutes les améliorations sont opérationnelles:');
    console.log('   • Détection automatique du MIME type');
    console.log('   • Validation stricte des données');
    console.log('   • Configuration optimisée');
  } else {
    console.log('\n⚠️  Gemini 2.5 Flash ne fonctionne pas');
    console.log('🔧 Utilisez un modèle de fallback qui fonctionne');
  }
}

runCompleteTest().catch(console.error);