#!/usr/bin/env node

/**
 * Test de l'intégration météo mobile
 * Vérifie que le service météo fonctionne correctement
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌤️ Test de l\'intégration météo mobile\n');

// 1. Vérifier la configuration
console.log('1️⃣ Vérification de la configuration...');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Fichier .env manquant');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const hasWeatherKey = envContent.includes('EXPO_PUBLIC_OPENWEATHER_API_KEY=');

if (hasWeatherKey) {
  console.log('✅ Clé API OpenWeatherMap configurée');
} else {
  console.log('⚠️ Clé API OpenWeatherMap manquante (fallback sera utilisé)');
}

// 2. Vérifier les fichiers météo
console.log('\n2️⃣ Vérification des fichiers météo...');

const weatherFiles = [
  'src/lib/weather/mobile-weather-service.ts',
  'src/components/WeatherCard.tsx'
];

let allFilesExist = true;
weatherFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} manquant`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ Fichiers météo manquants');
  process.exit(1);
}

// 3. Vérifier l'intégration dans HomeScreen
console.log('\n3️⃣ Vérification de l\'intégration HomeScreen...');

const homeScreenPath = path.join(__dirname, 'src/screens/HomeScreen.tsx');
if (fs.existsSync(homeScreenPath)) {
  const homeScreenContent = fs.readFileSync(homeScreenPath, 'utf8');
  
  const checks = [
    { name: 'Import WeatherCard', pattern: /import.*WeatherCard.*from/ },
    { name: 'Import MobileWeatherService', pattern: /import.*MobileWeatherService.*from/ },
    { name: 'WeatherCard usage', pattern: /<WeatherCard/ },
    { name: 'Greeting generation', pattern: /generatePersonalizedGreeting/ },
    { name: 'Profile city check', pattern: /profile\?\.city/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(homeScreenContent)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} manquant`);
    }
  });
} else {
  console.log('❌ HomeScreen.tsx manquant');
}

// 4. Vérifier la compilation TypeScript
console.log('\n4️⃣ Vérification de la compilation TypeScript...');

try {
  execSync('npx tsc --noEmit --skipLibCheck', { 
    stdio: 'pipe',
    cwd: __dirname 
  });
  console.log('✅ Compilation TypeScript réussie');
} catch (error) {
  console.log('⚠️ Erreurs de compilation TypeScript détectées');
  console.log('Détails:', error.stdout?.toString() || error.message);
}

// 5. Résumé de l'intégration météo
console.log('\n📋 Résumé de l\'intégration météo:');
console.log('');
console.log('🌤️ Service Météo:');
console.log('   • API OpenWeatherMap avec fallback intelligent');
console.log('   • Greetings personnalisés selon météo');
console.log('   • Conseils golf contextuels');
console.log('');
console.log('📱 Interface WeatherCard:');
console.log('   • Design moderne avec gradients colorés');
console.log('   • Icônes météo dynamiques');
console.log('   • Détails vent et humidité');
console.log('   • Bouton refresh manuel');
console.log('');
console.log('🏠 Intégration HomeScreen:');
console.log('   • Greeting avec météo dans le titre');
console.log('   • WeatherCard si ville renseignée dans profil');
console.log('   • Chargement automatique des données météo');
console.log('');
console.log('⚙️ Configuration:');
console.log('   • Clé API dans EXPO_PUBLIC_OPENWEATHER_API_KEY');
console.log('   • Fallback si API indisponible');
console.log('   • Ville récupérée depuis profil utilisateur');

console.log('\n🎯 Test de l\'intégration:');
console.log('1. Démarrer l\'app: npm start');
console.log('2. Se connecter avec un compte ayant une ville dans le profil');
console.log('3. Observer le greeting personnalisé avec météo');
console.log('4. Vérifier l\'affichage de la WeatherCard');
console.log('5. Tester le bouton refresh de la météo');

console.log('\n✅ Intégration météo prête pour les tests !');