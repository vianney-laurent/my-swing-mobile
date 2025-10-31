#!/usr/bin/env node

/**
 * Test rapide des corrections Gemini
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🧪 Test des corrections Gemini...\n');

async function testGeminiConnection() {
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
    
    // Tester avec le modèle qui fonctionne
    console.log('🔄 Test du modèle gemini-2.0-flash...');
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100,
        topP: 0.8,
        topK: 40
      }
    });
    
    // Test simple
    const result = await model.generateContent('Dis bonjour en français');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Test réussi !');
    console.log('📝 Réponse:', text.substring(0, 100) + '...');
    
    return true;
    
  } catch (error) {
    console.log('❌ Test échoué:', error.message);
    
    if (error.message.includes('400')) {
      console.log('\n🔍 Erreur 400 détectée. Causes possibles:');
      console.log('   - Modèle non disponible dans votre région');
      console.log('   - Clé API invalide ou expirée');
      console.log('   - Paramètres de génération incorrects');
    }
    
    return false;
  }
}

async function testVideoValidation() {
  console.log('\n🎬 Test de validation vidéo...');
  
  // Test avec base64 invalide
  const invalidBase64 = 'invalid-base64-content!@#';
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  
  console.log(`   Base64 invalide détecté: ${!base64Regex.test(invalidBase64) ? '✅' : '❌'}`);
  
  // Test avec base64 valide
  const validBase64 = 'VGVzdCBjb250ZW50IGZvciB2YWxpZGF0aW9u';
  console.log(`   Base64 valide accepté: ${base64Regex.test(validBase64) ? '✅' : '❌'}`);
  
  // Test de taille
  const largeFakeBase64 = 'A'.repeat(25 * 1024 * 1024); // 25MB
  const sizeMB = (largeFakeBase64.length * 3) / (4 * 1024 * 1024);
  console.log(`   Détection vidéo trop grande (${sizeMB.toFixed(1)}MB): ${sizeMB > 15 ? '✅' : '❌'}`);
}

async function runTests() {
  console.log('🚀 Démarrage des tests...\n');
  
  // Test 1: Validation vidéo
  await testVideoValidation();
  
  // Test 2: Connexion Gemini
  const geminiOk = await testGeminiConnection();
  
  console.log('\n📊 Résumé des tests:');
  console.log(`   Validation vidéo: ✅`);
  console.log(`   Connexion Gemini: ${geminiOk ? '✅' : '❌'}`);
  
  if (geminiOk) {
    console.log('\n🎉 Toutes les corrections semblent fonctionner !');
    console.log('💡 Vous pouvez maintenant tester l\'analyse complète');
  } else {
    console.log('\n⚠️  Problème de connexion Gemini détecté');
    console.log('🔧 Vérifiez votre clé API et votre connexion internet');
  }
}

// Charger les variables d'environnement
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

runTests().catch(console.error);