#!/usr/bin/env node

/**
 * Test de génération UUID mobile
 */

console.log('🧪 Test de génération UUID mobile\n');

// Fonction de génération UUID (copie de celle du service)
function generateAnalysisId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Test de validation UUID
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

console.log('1️⃣ Test de génération UUID...');

// Générer plusieurs UUIDs pour tester
for (let i = 0; i < 5; i++) {
  const uuid = generateAnalysisId();
  const isValid = isValidUUID(uuid);
  
  console.log(`UUID ${i + 1}: ${uuid}`);
  console.log(`   Valide: ${isValid ? '✅' : '❌'}`);
  
  if (!isValid) {
    console.log('❌ UUID invalide généré !');
    process.exit(1);
  }
}

console.log('\n2️⃣ Vérification du format...');

const testUuid = generateAnalysisId();
console.log(`UUID test: ${testUuid}`);

const checks = [
  { name: 'Longueur 36 caractères', test: testUuid.length === 36 },
  { name: 'Format avec tirets', test: testUuid.includes('-') },
  { name: 'Version 4 (4 en position 14)', test: testUuid[14] === '4' },
  { name: 'Variant correct (8,9,a,b en pos 19)', test: ['8','9','a','b'].includes(testUuid[19]) }
];

checks.forEach(check => {
  console.log(`${check.test ? '✅' : '❌'} ${check.name}`);
});

console.log('\n🔧 Fix appliqué:');
console.log('');
console.log('AVANT (erreur):');
console.log('analysis_1761678907775_7tk2540pruy  ← Pas un UUID');
console.log('');
console.log('APRÈS (fix):');
console.log(`${testUuid}  ← UUID v4 valide`);

console.log('\n✅ Génération UUID fonctionnelle !');
console.log('🎬 L\'analyse devrait maintenant se sauvegarder en base');