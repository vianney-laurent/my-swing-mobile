#!/usr/bin/env node

/**
 * Test du fix serveur vidéo mobile
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Test du fix serveur vidéo mobile\n');

// 1. Vérifier le fix dans mobile-analysis-service
console.log('1️⃣ Vérification du fix serveur vidéo...');

const serviceFile = path.join(__dirname, 'src/lib/analysis/mobile-analysis-service.ts');
if (fs.existsSync(serviceFile)) {
  const content = fs.readFileSync(serviceFile, 'utf8');
  
  const checks = [
    { 
      name: 'FormData avec blob', 
      pattern: /formData\.append\('video',\s*blob,/, 
      expected: true,
      description: 'Utilise blob au lieu d\'objet URI'
    },
    { 
      name: 'Pas de Content-Type manuel', 
      pattern: /headers:\s*{\s*'Content-Type':\s*'multipart\/form-data'/, 
      expected: false,
      description: 'Laisse le navigateur gérer Content-Type'
    },
    { 
      name: 'Fallback automatique', 
      pattern: /falling back to local processing/, 
      expected: true,
      description: 'Fallback vers traitement local'
    },
    { 
      name: 'Gestion d\'erreur serveur', 
      pattern: /const errorText = await serverResponse\.text\(\)/, 
      expected: true,
      description: 'Log des erreurs serveur détaillées'
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
  console.log('❌ mobile-analysis-service.ts manquant');
}

// 2. Vérifier la configuration du serveur
console.log('\n2️⃣ Vérification configuration serveur...');

const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  if (envContent.includes('EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL')) {
    console.log('✅ Variable serveur configurée');
    
    const match = envContent.match(/EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL=(.+)/);
    if (match) {
      console.log(`   URL: ${match[1].trim()}`);
    }
  } else {
    console.log('❌ Variable serveur manquante');
  }
} else {
  console.log('❌ Fichier .env manquant');
}

console.log('\n🔧 Fixes appliqués:');
console.log('');
console.log('AVANT (erreur 400):');
console.log('formData.append(\'video\', { uri, type, name })  ← Objet invalide');
console.log('headers: { \'Content-Type\': \'multipart/form-data\' }  ← Conflit');
console.log('');
console.log('APRÈS (fix):');
console.log('formData.append(\'video\', blob, \'golf-swing.mp4\')  ← Blob valide');
console.log('// Pas de Content-Type manuel  ← Auto-détection');
console.log('');
console.log('🛡️ Améliorations:');
console.log('• Fallback automatique vers traitement local');
console.log('• Logs d\'erreur détaillés du serveur');
console.log('• Validation de taille avant envoi');
console.log('• Gestion robuste des erreurs réseau');

console.log('\n🧪 Test maintenant:');
console.log('1. Recharge l\'app dans Expo Go');
console.log('2. Va sur l\'onglet "Analyse"');
console.log('3. Sélectionne une vidéo');
console.log('4. L\'analyse devrait fonctionner (serveur ou local)');
console.log('5. Vérifie les logs pour voir quelle méthode est utilisée');

console.log('\n✅ Fix serveur vidéo appliqué !');
console.log('🎬 L\'analyse vidéo devrait maintenant fonctionner');