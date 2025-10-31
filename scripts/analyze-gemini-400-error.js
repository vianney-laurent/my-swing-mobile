#!/usr/bin/env node

/**
 * Analyse approfondie des erreurs 400 Gemini
 * Examine en détail les données envoyées à l'API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

console.log('🔍 Analyse approfondie des erreurs 400 Gemini...\n');

async function analyzeRequestData() {
  console.log('📋 1. Analyse des données de requête...\n');
  
  // Test 1: Vérifier la clé API
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.log('❌ ERREUR CRITIQUE: Clé API manquante');
    return false;
  }
  
  console.log('✅ Clé API présente');
  console.log(`   Longueur: ${apiKey.length} caractères`);
  console.log(`   Format: ${apiKey.startsWith('AIza') ? 'Valide' : 'Invalide'}`);
  
  // Test 2: Initialiser Gemini
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ GoogleGenerativeAI initialisé');
    
    // Test 3: Tester différents modèles
    const modelsToTest = [
      'gemini-2.5-flash',
      'gemini-2.0-flash', 
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ];
    
    console.log('\n🧪 Test des modèles disponibles:');
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`\n   Testing ${modelName}...`);
        
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
            topP: 0.8,
            topK: 40
          }
        });
        
        const result = await model.generateContent('Bonjour, réponds juste "OK"');
        const response = await result.response;
        const text = response.text();
        
        console.log(`   ✅ ${modelName}: Fonctionne (${text.trim()})`);
        
      } catch (error) {
        console.log(`   ❌ ${modelName}: ${error.message}`);
        
        if (error.message.includes('400')) {
          console.log(`      → Erreur 400: Modèle invalide ou paramètres incorrects`);
        } else if (error.message.includes('404')) {
          console.log(`      → Erreur 404: Modèle non trouvé`);
        } else if (error.message.includes('403')) {
          console.log(`      → Erreur 403: Accès refusé (quota/permissions)`);
        }
      }
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Erreur d\'initialisation:', error.message);
    return false;
  }
}

async function analyzeVideoData() {
  console.log('\n🎬 2. Analyse des données vidéo...\n');
  
  // Test avec différents formats de données vidéo
  const testCases = [
    {
      name: 'Base64 vide',
      data: '',
      shouldFail: true
    },
    {
      name: 'Base64 invalide (caractères spéciaux)',
      data: 'invalid-base64-with-special-chars!@#$%',
      shouldFail: true
    },
    {
      name: 'Base64 trop court',
      data: 'VGVzdA==', // "Test" en base64
      shouldFail: true
    },
    {
      name: 'Base64 valide mais pas vidéo',
      data: 'VGVzdCBjb250ZW50IGZvciB2YWxpZGF0aW9u'.repeat(100), // Texte répété
      shouldFail: true
    },
    {
      name: 'WebP minimal (fake video)',
      data: 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=',
      shouldFail: false
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n   Test: ${testCase.name}`);
    
    // Validation base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    const isValidBase64 = base64Regex.test(testCase.data);
    console.log(`   Format base64: ${isValidBase64 ? '✅' : '❌'}`);
    
    // Validation taille
    const sizeMB = (testCase.data.length * 3) / (4 * 1024 * 1024);
    console.log(`   Taille estimée: ${sizeMB.toFixed(4)} MB`);
    
    // Validation longueur
    console.log(`   Longueur: ${testCase.data.length} caractères`);
    
    const shouldPass = !testCase.shouldFail && isValidBase64 && testCase.data.length >= 10000 && sizeMB <= 15;
    console.log(`   Validation attendue: ${shouldPass ? '✅ Devrait passer' : '❌ Devrait échouer'}`);
  }
}

async function analyzePromptData() {
  console.log('\n📝 3. Analyse des prompts...\n');
  
  // Analyser la structure du prompt
  const samplePrompt = `Vous êtes un instructeur de golf expert analysant un swing de golf complet à partir d'une vidéo.

IMPORTANT: Répondez UNIQUEMENT en français. Tous les textes, commentaires et analyses doivent être en français.

PROFIL UTILISATEUR :
- Nom : Test User
- Index de golf : 15
- Main dominante : Droitier
- Ville : Paris

CONTEXTE DU SWING :
Club utilisé : Driver (Bois)
INSTRUCTIONS SPÉCIFIQUES :
- Analysez la montée large et le plan de swing plus plat
- Vérifiez le transfert de poids et la rotation des hanches

ANGLE DE PRISE DE VUE : De profil (vue latérale)

Niveau du joueur : intermediate

Instructions pour le niveau intermediate :
Analysez le plan de swing, le tempo, le transfert de poids et la trajectoire du club.

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
  ]
}`;

  console.log('   Longueur du prompt:', samplePrompt.length, 'caractères');
  console.log('   Contient des caractères spéciaux:', /[^\x00-\x7F]/.test(samplePrompt) ? '✅ Oui (accents français)' : '❌ Non');
  console.log('   Format JSON demandé:', samplePrompt.includes('"overallScore"') ? '✅ Oui' : '❌ Non');
  
  // Vérifier les caractères problématiques
  const problematicChars = samplePrompt.match(/[^\x00-\x7F]/g);
  if (problematicChars) {
    const uniqueChars = [...new Set(problematicChars)];
    console.log('   Caractères non-ASCII:', uniqueChars.join(', '));
  }
}

async function testActualRequest() {
  console.log('\n🚀 4. Test de requête réelle...\n');
  
  try {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Utiliser le modèle qui fonctionne le mieux
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topP: 0.8,
        topK: 40
      }
    });
    
    // Prompt simplifié pour test
    const testPrompt = `Analysez cette vidéo de golf et répondez en JSON:
{
  "score": 85,
  "message": "Test réussi"
}`;
    
    // Données vidéo minimales mais valides
    const minimalVideoBase64 = 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    
    const videoPart = {
      inlineData: {
        data: minimalVideoBase64,
        mimeType: 'video/mp4'
      }
    };
    
    console.log('   Envoi de la requête test...');
    console.log('   Prompt:', testPrompt.length, 'caractères');
    console.log('   Vidéo:', minimalVideoBase64.length, 'caractères');
    console.log('   MIME type:', videoPart.inlineData.mimeType);
    
    const result = await model.generateContent([testPrompt, videoPart]);
    const response = await result.response;
    const text = response.text();
    
    console.log('   ✅ Requête réussie !');
    console.log('   Réponse:', text.substring(0, 200) + '...');
    
    return true;
    
  } catch (error) {
    console.log('   ❌ Requête échouée:', error.message);
    
    // Analyse détaillée de l'erreur
    if (error.message.includes('400')) {
      console.log('\n   🔍 Analyse de l\'erreur 400:');
      
      if (error.message.includes('invalid argument')) {
        console.log('   → "Invalid argument" peut indiquer:');
        console.log('     • Modèle inexistant ou non accessible');
        console.log('     • Paramètres de génération invalides');
        console.log('     • Format de données incorrect');
        console.log('     • MIME type non supporté');
      }
      
      if (error.message.includes('INVALID_ARGUMENT')) {
        console.log('   → Code INVALID_ARGUMENT indique:');
        console.log('     • Structure de requête malformée');
        console.log('     • Champs requis manquants');
        console.log('     • Valeurs hors limites');
      }
    }
    
    return false;
  }
}

async function runFullAnalysis() {
  console.log('🚀 Démarrage de l\'analyse complète...\n');
  
  const step1 = await analyzeRequestData();
  await analyzeVideoData();
  await analyzePromptData();
  const step4 = await testActualRequest();
  
  console.log('\n📊 Résumé de l\'analyse:');
  console.log(`   Configuration API: ${step1 ? '✅' : '❌'}`);
  console.log(`   Test de requête: ${step4 ? '✅' : '❌'}`);
  
  if (!step1 || !step4) {
    console.log('\n🔧 Actions recommandées:');
    console.log('   1. Vérifiez votre clé API Google Generative AI');
    console.log('   2. Testez avec gemini-1.5-pro si 2.5-flash ne fonctionne pas');
    console.log('   3. Vérifiez les quotas et limites de votre compte');
    console.log('   4. Simplifiez le prompt et les données vidéo');
  } else {
    console.log('\n🎉 Configuration fonctionnelle !');
    console.log('   Le problème pourrait venir des données spécifiques envoyées');
  }
}

runFullAnalysis().catch(console.error);