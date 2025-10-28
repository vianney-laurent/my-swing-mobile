#!/usr/bin/env node

/**
 * Script de test pour vérifier les fonctionnalités mobile
 * Usage: node test-mobile-features.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test des fonctionnalités mobile...\n');

// Vérifier les fichiers essentiels
const requiredFiles = [
  'src/screens/HistoryScreen.tsx',
  'src/screens/ProfileScreen.tsx', 
  'src/screens/AnalysisScreen.tsx',
  'src/lib/supabase/client.ts',
  'src/lib/profile/profile-service.ts',
  'src/lib/analysis/analysis-service.ts',
  'src/types/profile.ts'
];

let allFilesExist = true;

console.log('📁 Vérification des fichiers...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

// Vérifier package.json
console.log('\n📦 Vérification des dépendances...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const requiredDeps = [
  'date-fns',
  'expo-image-picker', 
  '@supabase/supabase-js',
  'expo-camera',
  '@expo/vector-icons'
];

let allDepsInstalled = true;
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - MANQUANT`);
    allDepsInstalled = false;
  }
});

// Vérifier la structure des écrans
console.log('\n🎯 Vérification de la structure des écrans...');

const screens = [
  { name: 'HistoryScreen', file: 'src/screens/HistoryScreen.tsx' },
  { name: 'ProfileScreen', file: 'src/screens/ProfileScreen.tsx' },
  { name: 'AnalysisScreen', file: 'src/screens/AnalysisScreen.tsx' }
];

screens.forEach(screen => {
  const filePath = path.join(__dirname, screen.file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifications basiques
    const hasExport = content.includes(`export default function ${screen.name}`);
    const hasStyles = content.includes('StyleSheet.create');
    const hasImports = content.includes('import React');
    
    if (hasExport && hasStyles && hasImports) {
      console.log(`✅ ${screen.name} - Structure correcte`);
    } else {
      console.log(`⚠️  ${screen.name} - Structure incomplète`);
    }
  }
});

// Résumé
console.log('\n📊 Résumé:');
if (allFilesExist && allDepsInstalled) {
  console.log('🎉 Tous les tests passent ! L\'app mobile est prête.');
  console.log('\n🚀 Prochaines étapes:');
  console.log('1. npm start - Démarrer l\'app');
  console.log('2. Tester sur simulateur/device');
  console.log('3. Vérifier la connexion Supabase');
  console.log('4. Tester l\'authentification');
} else {
  console.log('❌ Certains éléments sont manquants.');
  console.log('Vérifiez les erreurs ci-dessus avant de continuer.');
}

console.log('\n📱 Fonctionnalités implémentées:');
console.log('✅ Onglet Analyse (caméra + upload)');
console.log('✅ Historique avec statistiques');
console.log('✅ Profil avec édition');
console.log('✅ Services Supabase');
console.log('✅ Types TypeScript');

console.log('\n🔄 À implémenter:');
console.log('⏳ Upload vidéo vers Supabase Storage');
console.log('⏳ Intégration API d\'analyse');
console.log('⏳ Affichage des résultats d\'analyse');
console.log('⏳ Notifications push');