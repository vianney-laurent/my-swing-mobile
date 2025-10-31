#!/usr/bin/env node

/**
 * Vérification que tous les pop-ups d'inscription ont été supprimés
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des pop-ups d\'inscription supprimés\n');

function checkFile(filePath, description) {
  console.log(`📁 Vérification: ${description}`);
  console.log(`   Fichier: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Rechercher les patterns problématiques
    const problematicPatterns = [
      /Alert\.alert.*Vérifiez votre email/gi,
      /Alert\.alert.*confirm.*email/gi,
      /Alert\.alert.*Inscription réussie.*email/gi,
    ];
    
    let foundIssues = false;
    
    problematicPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`   ❌ Pattern ${index + 1} trouvé: ${matches[0]}`);
        foundIssues = true;
      }
    });
    
    if (!foundIssues) {
      console.log('   ✅ Aucun pop-up problématique trouvé');
    }
    
    // Vérifier les Alert.alert restants (pour info)
    const alertMatches = content.match(/Alert\.alert/g);
    if (alertMatches) {
      console.log(`   ℹ️  ${alertMatches.length} Alert.alert restants (probablement OK)`);
    }
    
    console.log('');
    return !foundIssues;
    
  } catch (error) {
    console.log(`   ❌ Erreur de lecture: ${error.message}\n`);
    return false;
  }
}

function verifyFiles() {
  console.log('🧪 Vérification des fichiers d\'authentification\n');
  
  const filesToCheck = [
    {
      path: 'golf-coaching-mobile/src/components/auth/SignupForm.tsx',
      description: 'Formulaire d\'inscription'
    },
    {
      path: 'golf-coaching-mobile/src/screens/AuthScreen.tsx',
      description: 'Écran d\'authentification'
    }
  ];
  
  let allGood = true;
  
  filesToCheck.forEach(file => {
    const isOk = checkFile(file.path, file.description);
    if (!isOk) {
      allGood = false;
    }
  });
  
  return allGood;
}

function showExpectedBehavior() {
  console.log('🎯 Comportement attendu après inscription:\n');
  
  console.log('✅ Ce qui DOIT se passer:');
  console.log('   1. Utilisateur remplit le formulaire');
  console.log('   2. Clique sur "Créer mon compte"');
  console.log('   3. Logs dans la console (pas de pop-up)');
  console.log('   4. Redirection automatique vers l\'app');
  console.log('   5. Utilisateur connecté avec profil complet\n');
  
  console.log('❌ Ce qui NE DOIT PAS se passer:');
  console.log('   - Pop-up "Inscription réussie !"');
  console.log('   - Pop-up "Vérifiez votre email..."');
  console.log('   - Retour à l\'écran de connexion');
  console.log('   - Attente d\'email de confirmation\n');
}

function showTroubleshooting() {
  console.log('🔧 Si le pop-up apparaît encore:\n');
  
  console.log('1. 🔄 Redémarrer Metro/Expo:');
  console.log('   - Ctrl+C pour arrêter');
  console.log('   - npm start ou expo start');
  console.log('   - Appuyer sur "r" pour reload\n');
  
  console.log('2. 📱 Vider le cache de l\'app:');
  console.log('   - Fermer complètement l\'app');
  console.log('   - Rouvrir l\'app\n');
  
  console.log('3. 🧹 Nettoyer le cache Metro:');
  console.log('   - npm start -- --clear');
  console.log('   - ou expo start -c\n');
  
  console.log('4. 🔍 Vérifier les logs:');
  console.log('   - Regarder la console Metro');
  console.log('   - Chercher "🏠 Redirecting to app..."');
  console.log('   - S\'assurer qu\'il n\'y a pas d\'erreur\n');
}

function runVerification() {
  console.log('🔍 Vérification des pop-ups d\'inscription supprimés\n');
  console.log('═'.repeat(60));
  
  const allGood = verifyFiles();
  
  console.log('─'.repeat(60));
  showExpectedBehavior();
  console.log('─'.repeat(60));
  showTroubleshooting();
  
  if (allGood) {
    console.log('✅ Vérification terminée - Aucun pop-up problématique trouvé');
    console.log('💡 Si le pop-up apparaît encore, essayez de redémarrer Metro/Expo');
  } else {
    console.log('❌ Vérification terminée - Des pop-ups problématiques ont été trouvés');
    console.log('🔧 Veuillez corriger les fichiers mentionnés ci-dessus');
  }
}

runVerification();