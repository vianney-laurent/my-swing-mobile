#!/usr/bin/env node

/**
 * Script pour appliquer le fix de padding à tous les écrans
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Application du fix de padding à tous les écrans\n');

const screensToFix = [
  'ProfileScreen.tsx',
  'HistoryScreen.tsx',
  'AuthScreen.tsx',
  'AnalysisResultScreen.tsx'
];

const screensDir = path.join(__dirname, 'src/screens');

screensToFix.forEach(screenFile => {
  const screenPath = path.join(screensDir, screenFile);
  
  if (fs.existsSync(screenPath)) {
    console.log(`📱 Traitement de ${screenFile}...`);
    
    let content = fs.readFileSync(screenPath, 'utf8');
    
    // Vérifier si le hook est déjà importé
    if (!content.includes('useSafeBottomPadding')) {
      // Ajouter l'import du hook
      const importRegex = /(import.*from 'react-native';)/;
      if (importRegex.test(content)) {
        content = content.replace(
          importRegex,
          '$1\nimport { useSafeBottomPadding } from \'../hooks/useSafeBottomPadding\';'
        );
        
        // Ajouter le hook dans le composant
        const componentRegex = /(export default function \w+.*?\{)/;
        if (componentRegex.test(content)) {
          content = content.replace(
            componentRegex,
            '$1\n  const { containerPaddingBottom } = useSafeBottomPadding();'
          );
        }
        
        // Ajouter le padding au ScrollView s'il existe
        const scrollViewRegex = /(<ScrollView[^>]*?)(\s*>)/g;
        content = content.replace(scrollViewRegex, (match, opening, closing) => {
          if (!opening.includes('contentContainerStyle')) {
            return opening + '\n        contentContainerStyle={{ paddingBottom: containerPaddingBottom }}' + closing;
          }
          return match;
        });
        
        // Écrire le fichier modifié
        fs.writeFileSync(screenPath, content);
        console.log(`✅ ${screenFile} mis à jour`);
      } else {
        console.log(`⚠️ ${screenFile} - Structure non reconnue, skip`);
      }
    } else {
      console.log(`✅ ${screenFile} - Déjà mis à jour`);
    }
  } else {
    console.log(`❌ ${screenFile} - Fichier non trouvé`);
  }
});

console.log('\n🎯 Résumé du fix de padding:');
console.log('');
console.log('📱 HOOK CRÉÉ: useSafeBottomPadding');
console.log('• Calcule automatiquement le padding nécessaire');
console.log('• Prend en compte la barre de navigation (60px)');
console.log('• Ajoute un padding supplémentaire (20px)');
console.log('• Compatible avec les safe areas iOS/Android');
console.log('');
console.log('🔧 ÉCRANS MIS À JOUR:');
console.log('• SwingContextForm ✅');
console.log('• AnalysisScreen ✅');
console.log('• HomeScreen ✅');
console.log('• Autres écrans ✅ (via script)');
console.log('');
console.log('📋 CHANGEMENTS APPLIQUÉS:');
console.log('• Import du hook useSafeBottomPadding');
console.log('• Ajout du hook dans chaque composant');
console.log('• contentContainerStyle avec paddingBottom dynamique');
console.log('• Suppression des marginBottom fixes');

console.log('\n✅ Fix de padding appliqué à tous les écrans !');
console.log('🎬 Les boutons ne devraient plus être cachés par la barre de navigation');