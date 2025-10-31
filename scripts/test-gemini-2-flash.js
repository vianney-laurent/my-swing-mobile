#!/usr/bin/env node

/**
 * Test rapide du modèle gemini-2.0-flash
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

console.log('🧪 Test du modèle gemini-2.0-flash...\n');

async function testGemini2Flash() {
  try {
    // Vérifier la clé API
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.log('❌ Clé API Gemini manquante');
      return false;
    }
    
    console.log('✅ Clé API Gemini trouvée');
    
    // Initialiser Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Tester avec gemini-2.0-flash
    console.log('🔄 Test du modèle gemini-2.0-flash...');
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
        topP: 0.8,
        topK: 40
      }
    });
    
    // Test simple en français
    console.log('📤 Envoi d\'une requête de test...');
    const result = await model.generateContent('Bonjour ! Peux-tu me donner un conseil de golf en français ?');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Test réussi !');
    console.log('📝 Réponse Gemini:');
    console.log('---');
    console.log(text);
    console.log('---\n');
    
    // Test avec une vidéo factice (base64 minimal)
    console.log('🎬 Test avec données vidéo factices...');
    
    const fakeVideoBase64 = 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='; // WebP minimal
    
    const videoPart = {
      inlineData: {
        data: fakeVideoBase64,
        mimeType: 'video/mp4'
      }
    };
    
    try {
      const videoResult = await model.generateContent([
        'Analyse cette vidéo de golf (même si c\'est factice, réponds juste "Vidéo reçue")',
        videoPart
      ]);
      const videoResponse = await videoResult.response;
      const videoText = videoResponse.text();
      
      console.log('✅ Test vidéo réussi !');
      console.log('📝 Réponse:', videoText.substring(0, 100) + '...');
      
    } catch (videoError) {
      console.log('⚠️  Test vidéo échoué (normal avec données factices):', videoError.message);
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Test échoué:', error.message);
    
    if (error.message.includes('400')) {
      console.log('\n🔍 Erreur 400 détectée. Causes possibles:');
      console.log('   - Modèle non disponible dans votre région');
      console.log('   - Clé API invalide ou expirée');
      console.log('   - Paramètres de génération incorrects');
      console.log('   - Quota API dépassé');
    }
    
    if (error.message.includes('404')) {
      console.log('\n🔍 Erreur 404 : Le modèle gemini-2.0-flash n\'existe pas ou n\'est pas accessible');
      console.log('   - Vérifiez que le modèle est disponible dans votre région');
      console.log('   - Essayez gemini-1.5-pro ou gemini-1.5-flash');
    }
    
    return false;
  }
}

async function runTest() {
  console.log('🚀 Démarrage du test gemini-2.0-flash...\n');
  
  const success = await testGemini2Flash();
  
  console.log('\n📊 Résultat du test:');
  console.log(`   Modèle gemini-2.0-flash: ${success ? '✅ Fonctionne' : '❌ Échec'}`);
  
  if (success) {
    console.log('\n🎉 Le modèle gemini-2.0-flash fonctionne parfaitement !');
    console.log('💡 Vous pouvez maintenant tester l\'analyse complète');
  } else {
    console.log('\n⚠️  Le modèle gemini-2.0-flash ne fonctionne pas');
    console.log('🔧 Solutions possibles:');
    console.log('   1. Vérifiez votre clé API');
    console.log('   2. Vérifiez votre connexion internet');
    console.log('   3. Essayez gemini-1.5-pro à la place');
  }
}

runTest().catch(console.error);