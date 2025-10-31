#!/usr/bin/env node

/**
 * Script de diagnostic pour les erreurs 400 de Gemini
 * Analyse les paramètres envoyés à l'API Gemini pour identifier les problèmes
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic des erreurs 400 Gemini...\n');

// Vérifier les variables d'environnement
function checkEnvironmentVariables() {
  console.log('📋 Vérification des variables d\'environnement:');
  
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ Fichier .env manquant');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasGeminiKey = envContent.includes('EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY');
  const hasSupabaseUrl = envContent.includes('EXPO_PUBLIC_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY');

  console.log(`   Gemini API Key: ${hasGeminiKey ? '✅' : '❌'}`);
  console.log(`   Supabase URL: ${hasSupabaseUrl ? '✅' : '❌'}`);
  console.log(`   Supabase Key: ${hasSupabaseKey ? '✅' : '❌'}`);

  return hasGeminiKey && hasSupabaseUrl && hasSupabaseKey;
}

// Analyser la configuration Gemini
function analyzeGeminiConfig() {
  console.log('\n🤖 Analyse de la configuration Gemini:');
  
  const servicePath = path.join(__dirname, '..', 'src', 'lib', 'analysis', 'mobile-analysis-service.ts');
  if (!fs.existsSync(servicePath)) {
    console.log('❌ Service mobile-analysis-service.ts manquant');
    return;
  }

  const serviceContent = fs.readFileSync(servicePath, 'utf8');
  
  // Vérifier le modèle utilisé
  const modelMatch = serviceContent.match(/model:\s*['"`]([^'"`]+)['"`]/);
  if (modelMatch) {
    console.log(`   Modèle configuré: ${modelMatch[1]}`);
    
    // Vérifier si c'est un modèle valide
    const validModels = [
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-2.0-flash'
    ];
    
    const isValidModel = validModels.includes(modelMatch[1]);
    console.log(`   Modèle valide: ${isValidModel ? '✅' : '❌'}`);
    
    if (!isValidModel) {
      console.log('   ⚠️  Modèles valides: ' + validModels.join(', '));
    }
  } else {
    console.log('❌ Modèle non trouvé dans la configuration');
  }

  // Vérifier la configuration des paramètres de génération
  const generationConfigMatch = serviceContent.match(/generationConfig:\s*{([^}]+)}/);
  if (generationConfigMatch) {
    console.log('   Configuration de génération: ✅');
    const config = generationConfigMatch[1];
    
    // Vérifier temperature
    const tempMatch = config.match(/temperature:\s*([\d.]+)/);
    if (tempMatch) {
      const temp = parseFloat(tempMatch[1]);
      console.log(`   Temperature: ${temp} ${temp >= 0 && temp <= 2 ? '✅' : '❌ (doit être entre 0 et 2)'}`);
    }
    
    // Vérifier maxOutputTokens
    const tokensMatch = config.match(/maxOutputTokens:\s*(\d+)/);
    if (tokensMatch) {
      const tokens = parseInt(tokensMatch[1]);
      console.log(`   Max tokens: ${tokens} ${tokens > 0 && tokens <= 8192 ? '✅' : '❌ (doit être entre 1 et 8192)'}`);
    }
  }
}

// Analyser les paramètres de requête
function analyzeRequestParameters() {
  console.log('\n📤 Analyse des paramètres de requête:');
  
  const servicePath = path.join(__dirname, '..', 'src', 'lib', 'analysis', 'mobile-analysis-service.ts');
  const serviceContent = fs.readFileSync(servicePath, 'utf8');
  
  // Vérifier la validation du base64
  const hasBase64Validation = serviceContent.includes('base64') && serviceContent.includes('startsWith');
  console.log(`   Validation base64: ${hasBase64Validation ? '✅' : '❌'}`);
  
  // Vérifier la validation de la taille
  const hasSizeValidation = serviceContent.includes('length') || serviceContent.includes('size');
  console.log(`   Validation taille: ${hasSizeValidation ? '✅' : '❌'}`);
  
  // Vérifier le format des parts
  const hasPartsValidation = serviceContent.includes('parts') && serviceContent.includes('inlineData');
  console.log(`   Format parts: ${hasPartsValidation ? '✅' : '❌'}`);
}

// Vérifier les causes communes d'erreur 400
function checkCommonIssues() {
  console.log('\n⚠️  Causes communes d\'erreur 400:');
  
  const issues = [
    {
      name: 'Modèle inexistant ou incorrect',
      description: 'Le modèle spécifié peut ne pas être disponible dans votre région',
      solution: 'Utiliser gemini-1.5-pro ou gemini-1.5-flash'
    },
    {
      name: 'Base64 invalide',
      description: 'Le contenu vidéo n\'est pas correctement encodé en base64',
      solution: 'Vérifier l\'encodage et la compression vidéo'
    },
    {
      name: 'Taille de contenu excessive',
      description: 'La vidéo est trop volumineuse pour l\'API',
      solution: 'Réduire la taille/qualité de la vidéo'
    },
    {
      name: 'Format MIME incorrect',
      description: 'Le type MIME ne correspond pas au contenu',
      solution: 'Vérifier que mimeType correspond au format vidéo'
    },
    {
      name: 'Paramètres de génération invalides',
      description: 'Temperature ou maxOutputTokens hors limites',
      solution: 'Temperature: 0-2, maxOutputTokens: 1-8192'
    }
  ];
  
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue.name}`);
    console.log(`      Cause: ${issue.description}`);
    console.log(`      Solution: ${issue.solution}\n`);
  });
}

// Proposer des solutions
function proposeSolutions() {
  console.log('🔧 Solutions recommandées:\n');
  
  console.log('1. Utiliser le bon modèle Gemini:');
  console.log('   - Utiliser "gemini-2.0-flash" (modèle qui fonctionne)');
  console.log('   - Alternative: "gemini-1.5-pro" (plus stable)\n');
  
  console.log('2. Améliorer la validation des données:');
  console.log('   - Vérifier que le base64 commence par "data:video/"');
  console.log('   - Limiter la taille des vidéos à 10MB maximum');
  console.log('   - Valider le format MIME\n');
  
  console.log('3. Ajuster les paramètres de génération:');
  console.log('   - Temperature: 0.7 (recommandé)');
  console.log('   - maxOutputTokens: 4000 (suffisant pour l\'analyse)\n');
  
  console.log('4. Ajouter des logs détaillés:');
  console.log('   - Logger la taille du contenu envoyé');
  console.log('   - Logger les paramètres de la requête');
  console.log('   - Capturer la réponse complète d\'erreur');
}

// Exécuter le diagnostic
async function runDiagnostic() {
  try {
    const envOk = checkEnvironmentVariables();
    if (!envOk) {
      console.log('\n❌ Configuration d\'environnement incomplète');
      return;
    }
    
    analyzeGeminiConfig();
    analyzeRequestParameters();
    checkCommonIssues();
    proposeSolutions();
    
    console.log('\n✅ Diagnostic terminé');
    console.log('💡 Consultez les solutions ci-dessus pour résoudre l\'erreur 400');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error.message);
  }
}

runDiagnostic();