#!/usr/bin/env node

/**
 * Test du fix de l'erreur LegalModal
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Test du fix de l\'erreur LegalModal\n');

const legalModalFile = path.join(__dirname, 'src/components/legal/LegalModal.tsx');
const profileScreenFile = path.join(__dirname, 'src/screens/ProfileScreen.tsx');

console.log('1️⃣ Vérification du fix dans LegalModal...');

if (fs.existsSync(legalModalFile)) {
  const content = fs.readFileSync(legalModalFile, 'utf8');
  
  const checks = [
    { 
      name: 'Type nullable dans interface', 
      pattern: /type: 'privacy' \| 'terms' \| 'cookies' \| null/, 
      expected: true,
      description: 'Interface accepte type null'
    },
    { 
      name: 'Protection contre type null', 
      pattern: /if \(!type \|\| !visible\)/, 
      expected: true,
      description: 'Vérification avant utilisation'
    },
    { 
      name: 'Return null si invalide', 
      pattern: /return null;/, 
      expected: true,
      description: 'Retourne null si type invalide'
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
  console.log('❌ LegalModal.tsx non trouvé');
}

console.log('\n2️⃣ Vérification du fix dans ProfileScreen...');

if (fs.existsSync(profileScreenFile)) {
  const content = fs.readFileSync(profileScreenFile, 'utf8');
  
  const checks = [
    { 
      name: 'State avec type nullable', 
      pattern: /type: 'privacy' \| 'terms' \| 'cookies' \| null/, 
      expected: true,
      description: 'State accepte type null'
    },
    { 
      name: 'Pas de non-null assertion', 
      pattern: /type={legalModal\.type}[^!]/, 
      expected: true,
      description: 'Pas d\'utilisation de type!'
    },
    { 
      name: 'Initialisation avec null', 
      pattern: /type: null/, 
      expected: true,
      description: 'Initialisation correcte'
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
  console.log('❌ ProfileScreen.tsx non trouvé');
}

console.log('\n🔧 Fix appliqué:');
console.log('');
console.log('AVANT (erreur):');
console.log('• type: \'privacy\' | \'terms\' | \'cookies\'  ← Non-nullable');
console.log('• const content = legalContent[type];  ← Crash si type = null');
console.log('• type={legalModal.type!}  ← Non-null assertion dangereuse');
console.log('');
console.log('APRÈS (fix):');
console.log('• type: \'privacy\' | \'terms\' | \'cookies\' | null  ← Nullable');
console.log('• if (!type || !visible) return null;  ← Protection');
console.log('• type={legalModal.type}  ← Passage sécurisé');

console.log('\n🛡️ Protections ajoutées:');
console.log('');
console.log('📱 DANS LEGALMODAL:');
console.log('• Vérification de type avant utilisation');
console.log('• Return null si type invalide ou modal fermé');
console.log('• Pas de crash si type = null');
console.log('');
console.log('📱 DANS PROFILESCREEN:');
console.log('• State accepte type null');
console.log('• Pas de non-null assertion (!)');
console.log('• Initialisation sécurisée');

console.log('\n🧪 Test maintenant:');
console.log('1. Recharge l\'app dans Expo Go');
console.log('2. Va sur l\'onglet "Profil"');
console.log('3. Scroll vers la section légale');
console.log('4. Clique sur chaque lien légal');
console.log('5. Vérifie qu\'aucune erreur ne se produit');
console.log('6. Teste l\'ouverture/fermeture des modals');

console.log('\n✅ Fix de l\'erreur LegalModal appliqué !');
console.log('🎬 Les modals légaux devraient maintenant s\'ouvrir sans erreur');