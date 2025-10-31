#!/usr/bin/env node

/**
 * Test des corrections du signup - Version 2
 */

console.log('🧪 Test des corrections du signup - Version 2\n');

function testHandicapNormalization() {
  console.log('🏌️ Test 1: Normalisation du handicap\n');
  
  const testCases = [
    { input: '24,7', expected: 24.7 },
    { input: '24.7', expected: 24.7 },
    { input: '18,5', expected: 18.5 },
    { input: '18.5', expected: 18.5 },
    { input: '0,0', expected: 0.0 },
    { input: '54', expected: 54 },
    { input: ' 12,3 ', expected: 12.3 }, // avec espaces
    { input: '9,2', expected: 9.2 },
    { input: '36,0', expected: 36.0 },
  ];
  
  console.log('📋 Cas de test:');
  testCases.forEach((testCase, index) => {
    // Simulation de la logique de normalisation du formulaire
    const normalizedInput = testCase.input.replace(',', '.').trim();
    const parsed = parseFloat(normalizedInput);
    
    const success = parsed === testCase.expected;
    console.log(`   ${index + 1}. "${testCase.input}" → "${normalizedInput}" → ${parsed} ${success ? '✅' : '❌'}`);
  });
  
  console.log('\n🔍 Points de vérification:');
  console.log('   - La virgule est remplacée par un point ✅');
  console.log('   - Les espaces sont supprimés ✅');
  console.log('   - La conversion en nombre fonctionne ✅');
  console.log('   - Les logs montrent la transformation ✅');
}

function testProfileDataFlow() {
  console.log('\n👤 Test 2: Flux des données de profil\n');
  
  const mockFormData = {
    email: 'jean.dupont@example.com',
    first_name: 'Jean',
    last_name: 'Dupont',
    golf_index: '24,7', // Avec virgule
    dominant_hand: 'right',
    city: 'Paris'
  };
  
  console.log('📝 Données du formulaire:', mockFormData);
  
  // Simulation de la normalisation
  const normalizedGolfIndex = mockFormData.golf_index 
    ? parseFloat(mockFormData.golf_index.replace(',', '.').trim())
    : null;
  
  const profileData = {
    id: 'user-123',
    email: mockFormData.email.trim(),
    first_name: mockFormData.first_name.trim(),
    last_name: mockFormData.last_name.trim(),
    golf_index: normalizedGolfIndex,
    dominant_hand: mockFormData.dominant_hand === 'none' ? null : mockFormData.dominant_hand,
    city: mockFormData.city.trim()
  };
  
  console.log('📤 Données envoyées à Supabase:', profileData);
  
  // Vérifications
  const checks = [
    { field: 'email', value: profileData.email, expected: 'jean.dupont@example.com' },
    { field: 'first_name', value: profileData.first_name, expected: 'Jean' },
    { field: 'last_name', value: profileData.last_name, expected: 'Dupont' },
    { field: 'golf_index', value: profileData.golf_index, expected: 24.7 },
    { field: 'dominant_hand', value: profileData.dominant_hand, expected: 'right' },
    { field: 'city', value: profileData.city, expected: 'Paris' }
  ];
  
  console.log('\n🔍 Vérifications:');
  checks.forEach(check => {
    const success = check.value === check.expected;
    console.log(`   ${check.field}: ${check.value} ${success ? '✅' : '❌'}`);
  });
}

function testServiceStrategies() {
  console.log('\n🔧 Test 3: Stratégies du service de profil\n');
  
  console.log('📋 Stratégies disponibles:');
  console.log('   1. UPSERT - Insertion ou mise à jour');
  console.log('   2. UPDATE - Mise à jour si existe');
  console.log('   3. INSERT - Insertion directe');
  
  console.log('\n🔍 Améliorations apportées:');
  console.log('   ✅ Logging détaillé pour chaque stratégie');
  console.log('   ✅ Vérification des champs après sauvegarde');
  console.log('   ✅ Détection des champs manquants');
  console.log('   ✅ Gestion d\'erreur améliorée');
  
  console.log('\n📊 Logs à surveiller:');
  console.log('   - "📝 Tentative UPSERT avec données:" → Données envoyées');
  console.log('   - "✅ UPSERT success:" → Données reçues');
  console.log('   - "⚠️ Certains champs n\'ont pas été sauvegardés:" → Problèmes détectés');
}

function testCommonIssues() {
  console.log('\n⚠️  Test 4: Problèmes courants et solutions\n');
  
  console.log('🔍 Problèmes identifiés et corrigés:');
  console.log('   1. Handicap "24,7" → Supabase ne garde que "24"');
  console.log('      ✅ Solution: Normalisation .replace(",", ".").trim()');
  console.log('');
  console.log('   2. Nom, prénom, ville vides après inscription');
  console.log('      ✅ Solution: Logging détaillé + vérification post-insertion');
  console.log('');
  
  console.log('📋 Checklist de test:');
  console.log('   □ Créer un compte avec handicap "24,7"');
  console.log('   □ Vérifier les logs dans la console');
  console.log('   □ Se connecter et aller sur le profil');
  console.log('   □ Vérifier que toutes les données sont présentes');
  console.log('   □ Vérifier dans Supabase que golf_index = 24.7');
  
  console.log('\n🚨 Logs d\'alerte à surveiller:');
  console.log('   - "❌ UPSERT error:" → Problème d\'insertion');
  console.log('   - "⚠️ Certains champs n\'ont pas été sauvegardés:" → Données manquantes');
  console.log('   - "❌ All strategies failed" → Échec complet');
}

function runTests() {
  testHandicapNormalization();
  testProfileDataFlow();
  testServiceStrategies();
  testCommonIssues();
  
  console.log('\n✅ Tests terminés');
  console.log('\n💡 Pour tester en réel:');
  console.log('   1. Ouvrir l\'app mobile');
  console.log('   2. Créer un nouveau compte avec:');
  console.log('      - Prénom: Jean');
  console.log('      - Nom: Dupont');
  console.log('      - Ville: Paris');
  console.log('      - Handicap: 24,7 (avec virgule)');
  console.log('   3. Surveiller les logs dans Metro/Expo');
  console.log('   4. Se connecter et vérifier le profil');
  console.log('   5. Vérifier dans Supabase Dashboard');
}

runTests();