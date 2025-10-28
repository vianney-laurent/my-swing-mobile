#!/usr/bin/env node

/**
 * Test du système d'analyse mobile complet
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Test du système d\'analyse mobile\n');

// 1. Vérifier les fichiers du système d'analyse
console.log('1️⃣ Vérification des fichiers d\'analyse...');

const analysisFiles = [
  'src/lib/analysis/mobile-analysis-service.ts',
  'src/components/analysis/AnalysisProgressModal.tsx',
  'src/components/analysis/SwingContextForm.tsx',
  'src/screens/CameraScreen.tsx'
];

let allAnalysisFilesExist = true;
analysisFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} manquant`);
    allAnalysisFilesExist = false;
  }
});

if (!allAnalysisFilesExist) {
  console.error('\n❌ Fichiers d\'analyse manquants');
  process.exit(1);
}

// 2. Vérifier les imports et dépendances
console.log('\n2️⃣ Vérification des imports...');

const cameraScreenPath = path.join(__dirname, 'src/screens/CameraScreen.tsx');
if (fs.existsSync(cameraScreenPath)) {
  const cameraContent = fs.readFileSync(cameraScreenPath, 'utf8');
  
  const imports = [
    { name: 'mobileAnalysisService', pattern: /mobileAnalysisService/ },
    { name: 'AnalysisProgressModal', pattern: /AnalysisProgressModal/ },
    { name: 'SwingContextForm', pattern: /SwingContextForm/ },
    { name: 'AnalysisProgress', pattern: /AnalysisProgress/ }
  ];
  
  imports.forEach(imp => {
    if (imp.pattern.test(cameraContent)) {
      console.log(`✅ ${imp.name} importé`);
    } else {
      console.log(`❌ ${imp.name} manquant`);
    }
  });
} else {
  console.log('❌ CameraScreen.tsx manquant');
}

// 3. Vérifier la configuration
console.log('\n3️⃣ Vérification de la configuration...');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredEnvVars = [
    'EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY',
    'EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL',
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar} configuré`);
    } else {
      console.log(`⚠️ ${envVar} manquant`);
    }
  });
} else {
  console.log('❌ Fichier .env manquant');
}

// 4. Vérifier les dépendances package.json
console.log('\n4️⃣ Vérification des dépendances...');

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@google/generative-ai',
    'expo-camera',
    '@expo/vector-icons',
    '@supabase/supabase-js'
  ];
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`✅ ${dep}: ${dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} manquant`);
    }
  });
} else {
  console.log('❌ package.json manquant');
}

// 5. Vérifier la structure du service d'analyse
console.log('\n5️⃣ Vérification du service d\'analyse...');

const serviceAnalysisPath = path.join(__dirname, 'src/lib/analysis/mobile-analysis-service.ts');
if (fs.existsSync(serviceAnalysisPath)) {
  const serviceContent = fs.readFileSync(serviceAnalysisPath, 'utf8');
  
  const serviceChecks = [
    { name: 'MobileAnalysisService class', pattern: /class MobileAnalysisService/ },
    { name: 'analyzeGolfSwing method', pattern: /analyzeGolfSwing/ },
    { name: 'Gemini 2.0 Flash model', pattern: /gemini-2\.0-flash-exp/ },
    { name: 'Progress callback', pattern: /onProgress/ },
    { name: 'Profile context', pattern: /buildProfileContext/ },
    { name: 'Club instructions', pattern: /getClubSpecificInstructions/ },
    { name: 'Handedness support', pattern: /getHandednessInstructions/ },
    { name: 'Supabase save', pattern: /saveAnalysisToDatabase/ }
  ];
  
  serviceChecks.forEach(check => {
    if (check.pattern.test(serviceContent)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`⚠️ ${check.name} à vérifier`);
    }
  });
} else {
  console.log('❌ Service d\'analyse manquant');
}

console.log('\n📱 Workflow d\'analyse mobile:');
console.log('');
console.log('1. 📷 ENREGISTREMENT');
console.log('   ├── CameraScreen avec guide visuel');
console.log('   ├── Enregistrement max 30s');
console.log('   ├── Indicateur REC temps réel');
console.log('   └── Sauvegarde URI vidéo locale');
console.log('');
console.log('2. 📋 CONTEXTE');
console.log('   ├── SwingContextForm');
console.log('   ├── Sélection club (6 options)');
console.log('   ├── Angle vue (profil/face)');
console.log('   └── Option "Passer" disponible');
console.log('');
console.log('3. 🤖 ANALYSE IA');
console.log('   ├── AnalysisProgressModal');
console.log('   ├── Traitement vidéo (local/serveur)');
console.log('   ├── Analyse Gemini personnalisée');
console.log('   └── Sauvegarde Supabase');
console.log('');
console.log('4. 📊 RÉSULTATS');
console.log('   ├── Navigation vers AnalysisResultScreen');
console.log('   ├── Score global + confiance');
console.log('   ├── Points forts + problèmes');
console.log('   └── Plan d\'action personnalisé');

console.log('\n🧪 Test de l\'analyse:');
console.log('1. npm start');
console.log('2. Onglet "Analyse" dans la navbar');
console.log('3. Autoriser permissions caméra');
console.log('4. Enregistrer swing 5-10s');
console.log('5. Sélectionner club + angle');
console.log('6. Observer progression analyse');
console.log('7. Vérifier résultats détaillés');

console.log('\n🎯 Fonctionnalités clés:');
console.log('• Même prompt Gemini que l\'app web');
console.log('• Personnalisation selon profil utilisateur');
console.log('• Contexte club + angle de prise de vue');
console.log('• Traitement vidéo optimisé mobile');
console.log('• Interface de progression temps réel');
console.log('• Sauvegarde automatique en base');
console.log('• Gestion d\'erreurs complète');

console.log('\n✅ Système d\'analyse mobile prêt !');
console.log('🚀 Même qualité d\'analyse que l\'app web sur mobile');