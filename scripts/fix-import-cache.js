#!/usr/bin/env node

/**
 * Script pour nettoyer le cache Metro et résoudre les problèmes d'import
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Nettoyage du cache Metro et résolution des imports...\n');

try {
  // 1. Nettoyer le cache Metro
  console.log('🧹 Nettoyage du cache Metro...');
  try {
    execSync('npx expo start --clear', { stdio: 'inherit', cwd: process.cwd() });
  } catch (error) {
    console.log('⚠️  Expo start failed, trying alternative cleanup...');
    
    // Alternative: nettoyer manuellement les caches
    const cacheDirectories = [
      path.join(process.cwd(), 'node_modules/.cache'),
      path.join(require('os').tmpdir(), 'metro-*'),
      path.join(require('os').tmpdir(), 'react-*')
    ];
    
    cacheDirectories.forEach(dir => {
      if (fs.existsSync(dir)) {
        console.log(`   Suppression de ${dir}`);
        try {
          fs.rmSync(dir, { recursive: true, force: true });
        } catch (e) {
          console.log(`   ⚠️  Impossible de supprimer ${dir}`);
        }
      }
    });
  }
  
  // 2. Vérifier que le fichier mobile-analysis-service.ts existe et est valide
  console.log('\n📋 Vérification du fichier mobile-analysis-service.ts...');
  const serviceFile = path.join(process.cwd(), 'src/lib/analysis/mobile-analysis-service.ts');
  
  if (!fs.existsSync(serviceFile)) {
    console.log('❌ Fichier mobile-analysis-service.ts manquant !');
    process.exit(1);
  }
  
  const content = fs.readFileSync(serviceFile, 'utf8');
  
  // Vérifier les exports essentiels
  const hasAnalysisProgress = content.includes('export interface AnalysisProgress');
  const hasMobileAnalysisService = content.includes('export const mobileAnalysisService');
  const hasClass = content.includes('export class MobileAnalysisService');
  
  console.log('   Exports trouvés:');
  console.log(`   - AnalysisProgress: ${hasAnalysisProgress ? '✅' : '❌'}`);
  console.log(`   - MobileAnalysisService class: ${hasClass ? '✅' : '❌'}`);
  console.log(`   - mobileAnalysisService instance: ${hasMobileAnalysisService ? '✅' : '❌'}`);
  
  if (!hasAnalysisProgress || !hasMobileAnalysisService || !hasClass) {
    console.log('❌ Exports manquants dans mobile-analysis-service.ts');
    process.exit(1);
  }
  
  // 3. Vérifier les imports dans CameraScreen.tsx
  console.log('\n📱 Vérification des imports dans CameraScreen.tsx...');
  const cameraScreenFile = path.join(process.cwd(), 'src/screens/CameraScreen.tsx');
  
  if (fs.existsSync(cameraScreenFile)) {
    const cameraContent = fs.readFileSync(cameraScreenFile, 'utf8');
    const hasImport = cameraContent.includes("from '../lib/analysis/mobile-analysis-service'");
    
    console.log(`   Import mobile-analysis-service: ${hasImport ? '✅' : '❌'}`);
    
    if (!hasImport) {
      console.log('⚠️  Import manquant dans CameraScreen.tsx');
    }
  }
  
  console.log('\n✅ Vérifications terminées');
  console.log('\n💡 Solutions pour résoudre le problème:');
  console.log('   1. Redémarrer Metro bundler: npx expo start --clear');
  console.log('   2. Redémarrer VS Code / votre éditeur');
  console.log('   3. Vérifier que tous les fichiers sont sauvegardés');
  console.log('   4. Si le problème persiste, redémarrer la machine');
  
} catch (error) {
  console.error('❌ Erreur lors du nettoyage:', error.message);
  process.exit(1);
}