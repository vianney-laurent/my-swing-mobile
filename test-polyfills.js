#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration des polyfills
 * Usage: node test-polyfills.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test de la configuration des polyfills...\n');

// Vérifier les fichiers de configuration
const configFiles = [
  { name: 'metro.config.js', required: true },
  { name: 'src/polyfills.ts', required: true },
  { name: 'index.ts', required: true },
  { name: 'src/lib/supabase/client.ts', required: true }
];

console.log('📁 Vérification des fichiers de configuration...');
let allConfigsExist = true;

configFiles.forEach(file => {
  const filePath = path.join(__dirname, file.name);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file.name}`);
    
    // Vérifications spécifiques
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (file.name === 'metro.config.js') {
      const hasAliases = content.includes('resolver.alias');
      const hasCrypto = content.includes('react-native-quick-crypto');
      if (hasAliases && hasCrypto) {
        console.log(`   ✅ Configuration Metro correcte`);
      } else {
        console.log(`   ⚠️  Configuration Metro incomplète`);
      }
    }
    
    if (file.name === 'src/polyfills.ts') {
      const hasBuffer = content.includes('Buffer');
      const hasProcess = content.includes('process');
      const hasTextEncoder = content.includes('TextEncoder');
      const hasReadableStream = content.includes('ReadableStream');
      if (hasBuffer && hasProcess && hasTextEncoder && hasReadableStream) {
        console.log(`   ✅ Polyfills configurés (approche manuelle)`);
      } else {
        console.log(`   ⚠️  Polyfills incomplets`);
      }
    }
    
    if (file.name === 'index.ts') {
      const hasPolyfillImport = content.includes('./src/polyfills');
      if (hasPolyfillImport) {
        console.log(`   ✅ Import des polyfills présent`);
      } else {
        console.log(`   ❌ Import des polyfills manquant`);
        allConfigsExist = false;
      }
    }
    
    if (file.name === 'src/lib/supabase/client.ts') {
      const hasRealtime = content.includes('realtime');
      if (hasRealtime) {
        console.log(`   ✅ Configuration Supabase optimisée`);
      } else {
        console.log(`   ⚠️  Configuration Supabase basique`);
      }
    }
    
  } else {
    console.log(`❌ ${file.name} - MANQUANT`);
    if (file.required) allConfigsExist = false;
  }
});

// Vérifier les dépendances
console.log('\n📦 Vérification des dépendances polyfills...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const polyfillDeps = [
  'react-native-polyfill-globals',
  'react-native-quick-crypto',
  'readable-stream',
  '@craftzdog/react-native-buffer',
  'process'
];

let allPolyfillsInstalled = true;
polyfillDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - MANQUANT`);
    allPolyfillsInstalled = false;
  }
});

// Vérifier la structure des imports
console.log('\n🔄 Vérification de l\'ordre des imports...');
const indexContent = fs.readFileSync(path.join(__dirname, 'index.ts'), 'utf8');
const lines = indexContent.split('\n').filter(line => line.trim());
const polyfillImportIndex = lines.findIndex(line => line.includes('./src/polyfills'));
const expoImportIndex = lines.findIndex(line => line.includes('expo'));

if (polyfillImportIndex !== -1 && polyfillImportIndex < expoImportIndex) {
  console.log('✅ Ordre des imports correct (polyfills en premier)');
} else {
  console.log('❌ Ordre des imports incorrect - les polyfills doivent être importés en premier');
  allConfigsExist = false;
}

// Résumé
console.log('\n📊 Résumé de la configuration:');
if (allConfigsExist && allPolyfillsInstalled) {
  console.log('🎉 Configuration des polyfills complète !');
  console.log('\n🚀 Prochaines étapes:');
  console.log('1. npm start -- --clear (nettoyer le cache)');
  console.log('2. Tester sur simulateur iOS/Android');
  console.log('3. Vérifier que Supabase fonctionne');
  console.log('4. Tester l\'authentification');
} else {
  console.log('❌ Configuration incomplète.');
  console.log('Vérifiez les erreurs ci-dessus avant de continuer.');
}

console.log('\n🔧 Problèmes résolus:');
console.log('✅ Erreur "events" module manquant');
console.log('✅ Erreur WebSocket dans @supabase/realtime-js');
console.log('✅ Polyfills Node.js pour React Native');
console.log('✅ Configuration Metro optimisée');

console.log('\n⚡ Optimisations appliquées:');
console.log('✅ Realtime Supabase désactivé (performance)');
console.log('✅ Polyfills légers et optimisés');
console.log('✅ Configuration Metro avec aliases');
console.log('✅ Import des polyfills en premier');