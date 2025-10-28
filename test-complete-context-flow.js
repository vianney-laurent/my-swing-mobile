#!/usr/bin/env node

/**
 * Test complet du flux de contexte (club + angle)
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Test complet du flux de contexte\n');

const filesToCheck = [
  {
    file: 'src/components/analysis/SwingContextForm.tsx',
    name: 'SwingContextForm',
    checks: [
      { pattern: /onContextSelected.*club.*angle/, desc: 'Callback avec club et angle' },
      { pattern: /clubCategories.*=/, desc: 'Nouvelle liste de clubs' },
      { pattern: /fer4.*fer5.*fer6.*fer7.*fer8.*fer9/s, desc: 'Tous les fers présents' }
    ]
  },
  {
    file: 'src/screens/AnalysisScreen.tsx',
    name: 'AnalysisScreen',
    checks: [
      { pattern: /handleContextSelected.*context/, desc: 'Réception du contexte' },
      { pattern: /Analysis context.*context/, desc: 'Log du contexte' },
      { pattern: /context.*videoUri.*userLevel/s, desc: 'Transmission au service' }
    ]
  },
  {
    file: 'src/lib/analysis/mobile-analysis-service.ts',
    name: 'MobileAnalysisService',
    checks: [
      { pattern: /club_used: request\.context\?\.club/, desc: 'Sauvegarde club_used' },
      { pattern: /camera_angle: request\.context\?\.angle/, desc: 'Sauvegarde camera_angle' },
      { pattern: /Saving analysis with context/, desc: 'Log de sauvegarde' }
    ]
  }
];

let allGood = true;

filesToCheck.forEach(({ file, name, checks }) => {
  const filePath = path.join(__dirname, file);
  
  console.log(`📱 ${name}:`);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    checks.forEach(({ pattern, desc }) => {
      const found = pattern.test(content);
      console.log(`   ${found ? '✅' : '❌'} ${desc}`);
      if (!found) allGood = false;
    });
  } else {
    console.log(`   ❌ Fichier non trouvé`);
    allGood = false;
  }
  console.log('');
});

console.log('🔄 Flux de données du contexte:');
console.log('');
console.log('1️⃣ SwingContextForm:');
console.log('   • Utilisateur sélectionne angle (face/profile)');
console.log('   • Utilisateur sélectionne club (driver, fer7, etc.)');
console.log('   • onContextSelected({ club, angle })');
console.log('');
console.log('2️⃣ AnalysisScreen:');
console.log('   • handleContextSelected reçoit le contexte');
console.log('   • startAnalysis(context) avec log');
console.log('   • mobileAnalysisService.analyzeGolfSwing({ context })');
console.log('');
console.log('3️⃣ MobileAnalysisService:');
console.log('   • Reçoit request.context');
console.log('   • Log "Saving analysis with context"');
console.log('   • Sauvegarde club_used et camera_angle');
console.log('');
console.log('4️⃣ Base de données:');
console.log('   • club_used: "driver", "fer7", etc.');
console.log('   • camera_angle: "face" ou "profile"');
console.log('   • swing_data: contexte complet en JSON');

console.log('\n🎯 Nouveaux clubs disponibles:');
console.log('');
console.log('🏌️ BOIS: Driver, Bois de parcours');
console.log('🔀 HYBRIDE: Hybride');
console.log('🔢 FERS: Fer 4, 5, 6, 7, 8, 9');
console.log('📐 WEDGES: Pitch, SW');

if (allGood) {
  console.log('\n✅ Flux de contexte complet et fonctionnel !');
  console.log('🎬 Les prochaines analyses devraient avoir club_used et camera_angle remplis');
} else {
  console.log('\n⚠️ Certains éléments du flux ne sont pas complets');
}

console.log('\n🧪 Test de validation:');
console.log('1. Recharge l\'app dans Expo Go');
console.log('2. Analyse → Choisir une vidéo');
console.log('3. Sélectionne angle ET club');
console.log('4. Vérifie les logs dans la console:');
console.log('   - "Analysis context: { club: ..., angle: ... }"');
console.log('   - "Saving analysis with context: { club: ..., angle: ... }"');
console.log('5. Vérifie dans Supabase que les colonnes sont remplies');

console.log('\n🎉 Test terminé !');