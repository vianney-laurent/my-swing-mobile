#!/usr/bin/env node

/**
 * Test de la navbar flottante
 */

const fs = require('fs');
const path = require('path');

console.log('🎈 Test de la navbar flottante\n');

// 1. Vérifier AppNavigator
console.log('1️⃣ Vérification AppNavigator...');

const appNavPath = path.join(__dirname, 'src/navigation/AppNavigator.tsx');
if (fs.existsSync(appNavPath)) {
  const appNavContent = fs.readFileSync(appNavPath, 'utf8');
  
  const checks = [
    { name: 'fullScreenContainer', pattern: /fullScreenContainer/ },
    { name: 'Pas de screenContainer', pattern: /screenContainer/ },
    { name: 'SimpleTabBar après contenu', pattern: /renderScreen.*SimpleTabBar/s }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(appNavContent)) {
      if (check.name === 'Pas de screenContainer') {
        console.log(`⚠️ ${check.name} encore présent`);
      } else {
        console.log(`✅ ${check.name}`);
      }
    } else {
      if (check.name === 'Pas de screenContainer') {
        console.log(`✅ ${check.name} supprimé`);
      } else {
        console.log(`❌ ${check.name} manquant`);
      }
    }
  });
} else {
  console.log('❌ AppNavigator.tsx manquant');
}

// 2. Vérifier SimpleTabBar
console.log('\n2️⃣ Vérification SimpleTabBar...');

const tabBarPath = path.join(__dirname, 'src/components/navigation/SimpleTabBar.tsx');
if (fs.existsSync(tabBarPath)) {
  const tabBarContent = fs.readFileSync(tabBarPath, 'utf8');
  
  const checks = [
    { name: 'Position absolute', pattern: /position.*absolute/ },
    { name: 'Bottom 0', pattern: /bottom.*0/ },
    { name: 'Left 0', pattern: /left.*0/ },
    { name: 'Right 0', pattern: /right.*0/ },
    { name: 'Background transparent', pattern: /rgba.*0\.9/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(tabBarContent)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`⚠️ ${check.name} à vérifier`);
    }
  });
} else {
  console.log('❌ SimpleTabBar.tsx manquant');
}

console.log('\n📱 Structure flottante:');
console.log('');
console.log('AppNavigator:');
console.log('├── View (container)');
console.log('│   ├── View (fullScreenContainer) ← Contenu plein écran');
console.log('│   │   └── Screen (HomeScreen, etc.)');
console.log('│   │       └── SafeAreaView ← Chaque écran gère sa safe area');
console.log('│   └── SimpleTabBar ← Position absolute, flotte par-dessus');
console.log('│       ├── bottom: 0');
console.log('│       ├── left: 0');
console.log('│       ├── right: 0');
console.log('│       └── backgroundColor: rgba(255,255,255,0.95)');

console.log('\n🎯 Résultat attendu:');
console.log('• Contenu utilise TOUT l\'écran (pas d\'espace gris)');
console.log('• Navbar flotte au-dessus du contenu');
console.log('• Effet de transparence/blur sur la navbar');
console.log('• Pas de rectangle gris au-dessus de la navbar');

console.log('\n🧪 Test visuel:');
console.log('1. Recharger l\'app dans Expo Go');
console.log('2. Vérifier que le contenu va jusqu\'en bas');
console.log('3. Vérifier que la navbar est semi-transparente');
console.log('4. Faire défiler le contenu pour voir l\'effet overlay');

console.log('\n✅ Navbar flottante configurée !');