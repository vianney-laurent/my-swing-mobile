#!/usr/bin/env node

/**
 * Script pour générer les assets de l'app My Swing
 * Convertit les SVG en PNG aux bonnes dimensions
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Génération des assets My Swing\n');

// Vérifier si les fichiers SVG existent
const iconSvg = path.join(__dirname, '../assets/create-icon.svg');
const splashSvg = path.join(__dirname, '../assets/create-splash.svg');

if (!fs.existsSync(iconSvg)) {
  console.error('❌ Fichier create-icon.svg non trouvé');
  process.exit(1);
}

if (!fs.existsSync(splashSvg)) {
  console.error('❌ Fichier create-splash.svg non trouvé');
  process.exit(1);
}

console.log('✅ Fichiers SVG trouvés');
console.log('📁 Icon SVG:', iconSvg);
console.log('📁 Splash SVG:', splashSvg);

console.log('\n🔧 Pour générer les PNG, utilisez une de ces méthodes :');

console.log('\n1️⃣ Avec Inkscape (recommandé) :');
console.log('   brew install inkscape  # macOS');
console.log('   # Puis :');
console.log('   inkscape --export-type=png --export-width=1024 --export-height=1024 assets/create-icon.svg --export-filename=assets/icon.png');
console.log('   inkscape --export-type=png --export-width=1080 --export-height=1920 assets/create-splash.svg --export-filename=assets/splash-icon.png');

console.log('\n2️⃣ Avec ImageMagick :');
console.log('   brew install imagemagick  # macOS');
console.log('   # Puis :');
console.log('   convert -background transparent -size 1024x1024 assets/create-icon.svg assets/icon.png');
console.log('   convert -background transparent -size 1080x1920 assets/create-splash.svg assets/splash-icon.png');

console.log('\n3️⃣ En ligne :');
console.log('   • https://svgtopng.com/');
console.log('   • https://cloudconvert.com/svg-to-png');

console.log('\n📱 Après génération :');
console.log('   npx expo start --clear');

console.log('\n🎯 Assets à générer :');
console.log('   • assets/icon.png (1024x1024)');
console.log('   • assets/splash-icon.png (1080x1920)');
console.log('   • assets/adaptive-icon.png (1024x1024, optionnel)');

console.log('\n✨ Design créé avec :');
console.log('   • Thème vert My Swing (#10b981)');
console.log('   • Club de golf et balle');
console.log('   • Animation de chargement');
console.log('   • Typography moderne');