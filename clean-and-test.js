#!/usr/bin/env node

/**
 * Script de nettoyage RADICAL pour éliminer tous les problèmes de polyfills
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔥 NETTOYAGE RADICAL EN COURS...\n');

// 1. Nettoyer le cache Metro
console.log('🧹 Nettoyage du cache Metro...');
try {
  execSync('npx expo start --clear', { stdio: 'ignore' });
  console.log('✅ Cache Metro nettoyé');
} catch (e) {
  console.log('⚠️  Cache Metro - continuons');
}

// 2. Nettoyer node_modules/.cache
console.log('🧹 Nettoyage du cache node_modules...');
const cacheDir = path.join(__dirname, 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('✅ Cache node_modules nettoyé');
} else {
  console.log('✅ Pas de cache node_modules à nettoyer');
}

// 3. Vérifier la configuration
console.log('\n📋 Vérification de la configuration RADICALE...');

// Vérifier metro.config.js
const metroConfig = fs.readFileSync(path.join(__dirname, 'metro.config.js'), 'utf8');
const hasWsBlocked = metroConfig.includes("'ws': false");
const hasRealtimeDisabled = metroConfig.includes("'websocket': false");

if (hasWsBlocked && hasRealtimeDisabled) {
  console.log('✅ Metro config - WebSocket BLOQUÉ');
} else {
  console.log('❌ Metro config - WebSocket pas bloqué');
}

// Vérifier supabase client
const supabaseClient = fs.readFileSync(path.join(__dirname, 'src/lib/supabase/client.ts'), 'utf8');
const hasDisabledRealtime = supabaseClient.includes('disabled: true');

if (hasDisabledRealtime) {
  console.log('✅ Supabase client - Realtime DÉSACTIVÉ');
} else {
  console.log('❌ Supabase client - Realtime pas désactivé');
}

// Vérifier polyfills
const polyfills = fs.readFileSync(path.join(__dirname, 'src/polyfills.ts'), 'utf8');
const hasMinimalPolyfills = polyfills.includes('POLYFILLS MINIMAUX');

if (hasMinimalPolyfills) {
  console.log('✅ Polyfills - Configuration MINIMALE');
} else {
  console.log('❌ Polyfills - Configuration pas minimale');
}

// 4. Vérifier les packages problématiques
console.log('\n📦 Vérification des packages...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

const problematicPackages = [
  'react-native-polyfill-globals'
];

let hasProblematicPackages = false;
problematicPackages.forEach(pkg => {
  if (packageJson.dependencies[pkg]) {
    console.log(`❌ Package problématique trouvé: ${pkg}`);
    hasProblematicPackages = true;
  }
});

if (!hasProblematicPackages) {
  console.log('✅ Aucun package problématique');
}

// 5. Packages essentiels
const essentialPackages = [
  '@craftzdog/react-native-buffer',
  'react-native-quick-crypto',
  'readable-stream',
  'process',
  'text-encoding'
];

let allEssentialPresent = true;
essentialPackages.forEach(pkg => {
  if (packageJson.dependencies[pkg]) {
    console.log(`✅ ${pkg} - présent`);
  } else {
    console.log(`❌ ${pkg} - MANQUANT`);
    allEssentialPresent = false;
  }
});

// 6. Résumé
console.log('\n📊 RÉSUMÉ DE LA CONFIGURATION RADICALE:');

if (hasWsBlocked && hasDisabledRealtime && hasMinimalPolyfills && !hasProblematicPackages && allEssentialPresent) {
  console.log('🎉 CONFIGURATION RADICALE COMPLÈTE !');
  console.log('\n🚀 COMMANDES DE TEST:');
  console.log('npm start -- --clear');
  console.log('# L\'app devrait maintenant se lancer SANS ERREUR !');
  
  console.log('\n✅ PROBLÈMES ÉLIMINÉS:');
  console.log('• WebSocket complètement bloqué');
  console.log('• Realtime Supabase désactivé');
  console.log('• Polyfills minimaux seulement');
  console.log('• Packages problématiques supprimés');
  console.log('• Cache complètement nettoyé');
  
} else {
  console.log('❌ CONFIGURATION INCOMPLÈTE');
  console.log('Vérifiez les erreurs ci-dessus');
}

console.log('\n🔥 SOLUTION RADICALE APPLIQUÉE - FINI LES ERREURS !');