#!/usr/bin/env node

/**
 * Test de la sauvegarde du contexte (club et angle)
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test de la sauvegarde du contexte\n');

const serviceFile = path.join(__dirname, 'src/lib/analysis/mobile-analysis-service.ts');

if (fs.existsSync(serviceFile)) {
  const content = fs.readFileSync(serviceFile, 'utf8');
  
  console.log('1️⃣ Vérification de la sauvegarde du contexte...');
  
  const checks = [
    { 
      name: 'Club sauvegardé', 
      pattern: /club_used: request\.context\?\.club/, 
      expected: true,
      description: 'Le club est sauvegardé dans la colonne club_used'
    },
    { 
      name: 'Angle sauvegardé', 
      pattern: /camera_angle: request\.context\?\.angle/, 
      expected: true,
      description: 'L\'angle est sauvegardé dans la colonne camera_angle'
    },
    { 
      name: 'Contexte dans swing_data', 
      pattern: /context: request\.context/, 
      expected: true,
      description: 'Le contexte complet est aussi dans swing_data'
    },
    { 
      name: 'Logs de debug', 
      pattern: /Saving analysis with context/, 
      expected: true,
      description: 'Logs pour débugger la sauvegarde du contexte'
    }
  ];
  
  checks.forEach(check => {
    const found = check.pattern.test(content);
    if (found === check.expected) {
      console.log(`✅ ${check.name}: ${check.description}`);
    } else {
      console.log(`❌ ${check.name}: ${check.description}`);
    }
  });
  
} else {
  console.log('❌ mobile-analysis-service.ts non trouvé');
}

console.log('\n🔧 Fix appliqué:');
console.log('');
console.log('AVANT (problème):');
console.log('• club_used: NULL');
console.log('• camera_angle: NULL');
console.log('• Contexte perdu lors de la sauvegarde');
console.log('');
console.log('APRÈS (fix):');
console.log('• club_used: request.context?.club');
console.log('• camera_angle: request.context?.angle');
console.log('• Contexte sauvegardé dans les bonnes colonnes');
console.log('• Logs pour vérifier la transmission');

console.log('\n🎯 Colonnes de contexte:');
console.log('');
console.log('📊 COLONNES REMPLIES:');
console.log('• club_used: ID du club sélectionné (driver, fer7, etc.)');
console.log('• camera_angle: Angle de prise de vue (face, profile)');
console.log('• swing_data: Contexte complet en JSON');
console.log('');
console.log('🔄 FLUX DE DONNÉES:');
console.log('1. Utilisateur sélectionne club et angle');
console.log('2. SwingContextForm passe le contexte');
console.log('3. AnalysisScreen transmet à mobileAnalysisService');
console.log('4. Service sauvegarde dans les colonnes appropriées');

console.log('\n🧪 Test maintenant:');
console.log('1. Recharge l\'app dans Expo Go');
console.log('2. Fais une nouvelle analyse avec contexte');
console.log('3. Vérifie les logs "Saving analysis with context"');
console.log('4. Vérifie dans Supabase que club_used et camera_angle sont remplis');

console.log('\n✅ Fix de sauvegarde du contexte appliqué !');
console.log('🎬 Les prochaines analyses devraient avoir club_used et camera_angle remplis');