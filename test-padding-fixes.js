#!/usr/bin/env node

/**
 * Test des fixes de padding appliqués
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test des fixes de padding appliqués\n');

const screensToCheck = [
  { file: 'src/hooks/useSafeBottomPadding.ts', name: 'Hook useSafeBottomPadding' },
  { file: 'src/components/analysis/SwingContextForm.tsx', name: 'SwingContextForm' },
  { file: 'src/screens/AnalysisScreen.tsx', name: 'AnalysisScreen' },
  { file: 'src/screens/HomeScreen.tsx', name: 'HomeScreen' },
  { file: 'src/screens/ProfileScreen.tsx', name: 'ProfileScreen' }
];

let allGood = true;

screensToCheck.forEach(({ file, name }) => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (file.includes('useSafeBottomPadding.ts')) {
      // Vérifier le hook
      const hasHook = content.includes('export function useSafeBottomPadding');
      const hasCalculation = content.includes('containerPaddingBottom');
      
      console.log(`📱 ${name}:`);
      console.log(`   Hook défini: ${hasHook ? '✅' : '❌'}`);
      console.log(`   Calcul padding: ${hasCalculation ? '✅' : '❌'}`);
      
      if (!hasHook || !hasCalculation) allGood = false;
    } else {
      // Vérifier les écrans
      const hasImport = content.includes('useSafeBottomPadding');
      const hasHookUsage = content.includes('containerPaddingBottom');
      const hasContentContainerStyle = content.includes('contentContainerStyle');
      
      console.log(`📱 ${name}:`);
      console.log(`   Import hook: ${hasImport ? '✅' : '❌'}`);
      console.log(`   Usage hook: ${hasHookUsage ? '✅' : '❌'}`);
      console.log(`   ContentContainerStyle: ${hasContentContainerStyle ? '✅' : '❌'}`);
      
      if (!hasImport || !hasHookUsage || !hasContentContainerStyle) allGood = false;
    }
    console.log('');
  } else {
    console.log(`❌ ${name}: Fichier non trouvé`);
    allGood = false;
  }
});

console.log('🎯 Résumé du système de padding:');
console.log('');
console.log('📱 HOOK useSafeBottomPadding:');
console.log('• Calcule automatiquement le padding nécessaire');
console.log('• Prend en compte la hauteur de la tab bar (60px)');
console.log('• Ajoute un padding supplémentaire (20px)');
console.log('• Compatible avec les safe areas iOS/Android');
console.log('• Retourne containerPaddingBottom pour ScrollView');
console.log('');
console.log('🔧 ÉCRANS MODIFIÉS:');
console.log('• Import du hook dans chaque écran');
console.log('• Utilisation du hook: const { containerPaddingBottom } = useSafeBottomPadding()');
console.log('• Application via contentContainerStyle={{ paddingBottom: containerPaddingBottom }}');
console.log('• Suppression des marginBottom fixes');
console.log('');
console.log('📋 AVANTAGES:');
console.log('• Plus de boutons cachés par la barre de navigation');
console.log('• Padding adaptatif selon l\'appareil');
console.log('• Gestion centralisée et cohérente');
console.log('• Compatible avec tous les types d\'écrans');

if (allGood) {
  console.log('\n✅ Tous les fixes de padding sont correctement appliqués !');
  console.log('🎬 Les boutons ne devraient plus être cachés par la barre de navigation');
} else {
  console.log('\n⚠️ Certains fixes ne sont pas complets');
  console.log('🔧 Vérifiez les éléments marqués ❌ ci-dessus');
}

console.log('\n🧪 Test maintenant:');
console.log('1. Recharge l\'app dans Expo Go');
console.log('2. Navigue entre les différents écrans');
console.log('3. Vérifie que tous les boutons sont visibles');
console.log('4. Teste sur différentes tailles d\'écran si possible');