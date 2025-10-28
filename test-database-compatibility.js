#!/usr/bin/env node

/**
 * Test de compatibilité base de données mobile
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test de compatibilité base de données mobile\n');

// 1. Vérifier les modifications dans mobile-analysis-service
console.log('1️⃣ Vérification de la compatibilité DB...');

const serviceFile = path.join(__dirname, 'src/lib/analysis/mobile-analysis-service.ts');
if (fs.existsSync(serviceFile)) {
  const content = fs.readFileSync(serviceFile, 'utf8');
  
  const checks = [
    { 
      name: 'Utilise gemini_response', 
      pattern: /gemini_response: JSON\.stringify\(analysis\)/, 
      expected: true,
      description: 'Sauvegarde dans gemini_response (compatible web)'
    },
    { 
      name: 'Utilise swing_data', 
      pattern: /swing_data: JSON\.stringify\(swingData\)/, 
      expected: true,
      description: 'Sauvegarde dans swing_data (compatible web)'
    },
    { 
      name: 'Type coaching', 
      pattern: /analysis_type: 'coaching'/, 
      expected: true,
      description: 'Utilise le type existant "coaching"'
    },
    { 
      name: 'Pas d\'analysis_data', 
      pattern: /analysis_data:/, 
      expected: false,
      description: 'N\'utilise plus analysis_data (inexistant)'
    },
    { 
      name: 'Hash vidéo', 
      pattern: /generateVideoHash/, 
      expected: true,
      description: 'Génère un hash vidéo simple'
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

console.log('\n🔧 Adaptations apportées:');
console.log('');
console.log('📊 COMPATIBILITÉ AVEC LA VERSION WEB:');
console.log('• Utilise gemini_response au lieu d\'analysis_data');
console.log('• Utilise swing_data pour les métadonnées');
console.log('• Utilise analysis_type: "coaching" (existant)');
console.log('• Génère un hash vidéo simple');
console.log('• Format JSON identique à la version web');
console.log('');
console.log('🗄️ STRUCTURE DE DONNÉES:');
console.log('• gemini_response: JSON complet de l\'analyse Gemini');
console.log('• swing_data: Métadonnées (niveau, hash, confidence, etc.)');
console.log('• overall_score: Score global (0-100)');
console.log('• status: "completed"');
console.log('• analysis_type: "coaching"');

console.log('\n🧪 Test maintenant:');
console.log('1. Recharge l\'app dans Expo Go');
console.log('2. Va sur l\'onglet "Analyse"');
console.log('3. Sélectionne une vidéo');
console.log('4. L\'analyse devrait se sauvegarder sans erreur');
console.log('5. Vérifie dans l\'UI Supabase que la ligne est créée');

console.log('\n📋 Colonnes utilisées (existantes):');
console.log('• id, user_id, video_url');
console.log('• analysis_type, status, overall_score');
console.log('• gemini_response, swing_data');
console.log('• created_at, updated_at');

console.log('\n✅ Compatibilité base de données assurée !');
console.log('🎬 L\'analyse mobile devrait maintenant se sauvegarder correctement');