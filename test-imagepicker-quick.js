#!/usr/bin/env node

/**
 * Test rapide du fix ImagePicker
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Test rapide du fix ImagePicker\n');

const analysisScreenPath = path.join(__dirname, 'src/screens/AnalysisScreen.tsx');

if (fs.existsSync(analysisScreenPath)) {
  const content = fs.readFileSync(analysisScreenPath, 'utf8');
  
  // Vérifications
  const hasStringFormat = /mediaTypes:\s*['"]videos['"]/.test(content);
  const hasOldEnum = /ImagePicker\.MediaType\.Videos/.test(content);
  
  console.log('✅ Vérifications:');
  console.log(`   String format 'videos': ${hasStringFormat ? '✅' : '❌'}`);
  console.log(`   Ancien enum supprimé: ${!hasOldEnum ? '✅' : '❌'}`);
  
  if (hasStringFormat && !hasOldEnum) {
    console.log('\n🎉 Fix appliqué avec succès !');
    console.log('\n📱 Test maintenant:');
    console.log('1. Recharge l\'app dans Expo Go');
    console.log('2. Va sur l\'onglet "Analyse"');
    console.log('3. Clique sur "Choisir une vidéo"');
    console.log('4. La galerie devrait s\'ouvrir sans erreur');
  } else {
    console.log('\n❌ Le fix n\'est pas complet');
  }
} else {
  console.log('❌ Fichier AnalysisScreen.tsx introuvable');
}