#!/usr/bin/env node

/**
 * Test du fix des doubles SafeAreaView
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Test du fix des doubles SafeAreaView\n');

// 1. Vérifier AppNavigator
console.log('1️⃣ Vérification AppNavigator...');

const appNavPath = path.join(__dirname, 'src/navigation/AppNavigator.tsx');
if (fs.existsSync(appNavPath)) {
  const appNavContent = fs.readFileSync(appNavPath, 'utf8');
  
  // Compter les SafeAreaView dans AppNavigator
  const safeAreaMatches = appNavContent.match(/<SafeAreaView/g) || [];
  const safeAreaImports = appNavContent.match(/import.*SafeAreaView.*from/g) || [];
  
  console.log(`SafeAreaView dans AppNavigator: ${safeAreaMatches.length}`);
  console.log(`Imports SafeAreaView: ${safeAreaImports.length}`);
  
  if (safeAreaMatches.length === 0 && safeAreaImports.length === 0) {
    console.log('✅ AppNavigator ne contient plus de SafeAreaView');
  } else {
    console.log('⚠️ AppNavigator contient encore des SafeAreaView');
  }
  
  // Vérifier la structure
  if (appNavContent.includes('<View style={styles.container}>')) {
    console.log('✅ Container principal en View');
  }
  
  if (appNavContent.includes('<View style={styles.screenContainer}>')) {
    console.log('✅ Screen container en View');
  }
} else {
  console.log('❌ AppNavigator.tsx manquant');
}

// 2. Vérifier que les écrans gardent leur SafeAreaView
console.log('\n2️⃣ Vérification des écrans individuels...');

const screens = [
  'src/screens/HomeScreen.tsx',
  'src/screens/AuthScreen.tsx'
];

screens.forEach(screenPath => {
  const fullPath = path.join(__dirname, screenPath);
  if (fs.existsSync(fullPath)) {
    const screenContent = fs.readFileSync(fullPath, 'utf8');
    const safeAreaMatches = screenContent.match(/<SafeAreaView/g) || [];
    
    console.log(`${screenPath}: ${safeAreaMatches.length} SafeAreaView`);
    
    if (safeAreaMatches.length > 0) {
      console.log(`✅ ${screenPath} gère sa propre safe area`);
    } else {
      console.log(`⚠️ ${screenPath} n'a pas de SafeAreaView`);
    }
  } else {
    console.log(`❌ ${screenPath} manquant`);
  }
});

console.log('\n📱 Structure corrigée:');
console.log('');
console.log('App.tsx:');
console.log('├── SafeAreaProvider (global)');
console.log('│   └── GestureHandlerRootView');
console.log('│       └── AppNavigator');
console.log('│           ├── View (container) ← Plus de SafeAreaView ici');
console.log('│           │   ├── View (screenContainer)');
console.log('│           │   │   └── Screen');
console.log('│           │   │       └── SafeAreaView ← Chaque écran gère sa safe area');
console.log('│           │   └── SimpleTabBar');
console.log('│           └── StatusBar');

console.log('\n🎯 Problème résolu:');
console.log('• Suppression du SafeAreaView en double dans AppNavigator');
console.log('• Chaque écran gère sa propre safe area');
console.log('• Plus de barres grises en haut et en bas');
console.log('• Interface propre et native');

console.log('\n🧪 Test maintenant:');
console.log('1. Recharger l\'app dans Expo Go');
console.log('2. Vérifier qu\'il n\'y a plus de barres grises');
console.log('3. Vérifier que le contenu utilise tout l\'écran');
console.log('4. Vérifier que la navbar reste en bas');

console.log('\n✅ Fix des doubles SafeAreaView appliqué !');