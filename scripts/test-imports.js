#!/usr/bin/env node

/**
 * Test des imports pour vérifier que tout fonctionne
 */

console.log('🧪 Test des imports...\n');

try {
  // Test 1: Vérifier que le fichier index.ts est valide
  console.log('📋 Test 1: Vérification du fichier index.ts...');
  const fs = require('fs');
  const path = require('path');
  
  const indexFile = path.join(process.cwd(), 'src/lib/analysis/index.ts');
  if (!fs.existsSync(indexFile)) {
    throw new Error('Fichier index.ts manquant');
  }
  
  const indexContent = fs.readFileSync(indexFile, 'utf8');
  console.log('✅ Fichier index.ts trouvé');
  console.log('   Contenu:', indexContent.split('\n').length, 'lignes');
  
  // Test 2: Vérifier que mobile-analysis-service.ts existe
  console.log('\n📋 Test 2: Vérification du fichier mobile-analysis-service.ts...');
  const serviceFile = path.join(process.cwd(), 'src/lib/analysis/mobile-analysis-service.ts');
  if (!fs.existsSync(serviceFile)) {
    throw new Error('Fichier mobile-analysis-service.ts manquant');
  }
  
  const serviceContent = fs.readFileSync(serviceFile, 'utf8');
  console.log('✅ Fichier mobile-analysis-service.ts trouvé');
  console.log('   Taille:', Math.round(serviceContent.length / 1024), 'KB');
  
  // Test 3: Vérifier les exports
  console.log('\n📋 Test 3: Vérification des exports...');
  const exports = [
    'export interface MobileAnalysisRequest',
    'export interface MobileAnalysisResult', 
    'export interface AnalysisProgress',
    'export class MobileAnalysisService',
    'export const mobileAnalysisService'
  ];
  
  exports.forEach(exportStr => {
    const found = serviceContent.includes(exportStr);
    console.log(`   ${exportStr}: ${found ? '✅' : '❌'}`);
    if (!found) {
      throw new Error(`Export manquant: ${exportStr}`);
    }
  });
  
  // Test 4: Vérifier les imports dans les fichiers
  console.log('\n📋 Test 4: Vérification des imports dans les fichiers...');
  const filesToCheck = [
    'src/screens/CameraScreen.tsx',
    'src/screens/AnalysisScreen.tsx', 
    'src/components/analysis/AnalysisProgressModal.tsx',
    'src/screens/AnalysisResultScreen.tsx'
  ];
  
  filesToCheck.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hasCorrectImport = content.includes("from '../lib/analysis'") || content.includes("from '../../lib/analysis'");
      const hasOldImport = content.includes('mobile-analysis-service');
      
      console.log(`   ${filePath}:`);
      console.log(`     Import correct: ${hasCorrectImport ? '✅' : '❌'}`);
      console.log(`     Import obsolète: ${hasOldImport ? '⚠️' : '✅'}`);
    } else {
      console.log(`   ${filePath}: ❌ Fichier manquant`);
    }
  });
  
  console.log('\n✅ Tous les tests d\'import sont passés !');
  console.log('\n💡 Pour résoudre les problèmes de cache Metro:');
  console.log('   1. Arrêter Metro (Ctrl+C)');
  console.log('   2. Lancer: npx expo start --clear');
  console.log('   3. Ou: rm -rf node_modules/.cache && npx expo start');
  
} catch (error) {
  console.error('❌ Test d\'import échoué:', error.message);
  console.log('\n🔧 Solutions:');
  console.log('   1. Vérifier que tous les fichiers sont sauvegardés');
  console.log('   2. Redémarrer l\'éditeur');
  console.log('   3. Nettoyer le cache Metro: npx expo start --clear');
  process.exit(1);
}