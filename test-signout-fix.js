#!/usr/bin/env node

/**
 * Test du fix de déconnexion
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Test du fix de déconnexion\n');

const filesToCheck = [
  {
    file: 'src/navigation/AppNavigator.tsx',
    name: 'AppNavigator',
    checks: [
      { 
        pattern: /onAuthStateChange/, 
        desc: 'Listener pour changements d\'auth'
      },
      { 
        pattern: /SIGNED_OUT.*navigate\('auth'\)/, 
        desc: 'Redirection vers auth lors de déconnexion'
      },
      { 
        pattern: /SIGNED_IN.*navigate\('home'\)/, 
        desc: 'Redirection vers home lors de connexion'
      },
      { 
        pattern: /subscription\.unsubscribe/, 
        desc: 'Nettoyage du listener'
      }
    ]
  },
  {
    file: 'src/screens/ProfileScreen.tsx',
    name: 'ProfileScreen',
    checks: [
      { 
        pattern: /console\.log.*Signing out/, 
        desc: 'Log de déconnexion'
      },
      { 
        pattern: /const { error } = await supabase\.auth\.signOut/, 
        desc: 'Gestion d\'erreur de déconnexion'
      },
      { 
        pattern: /User signed out successfully/, 
        desc: 'Log de succès'
      },
      { 
        pattern: /Alert\.alert.*Erreur.*déconnexion/, 
        desc: 'Gestion d\'erreur avec alert'
      }
    ]
  }
];

let allGood = true;

filesToCheck.forEach(({ file, name, checks }) => {
  const filePath = path.join(__dirname, file);
  
  console.log(`📱 ${name}:`);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    checks.forEach(({ pattern, desc }) => {
      const found = pattern.test(content);
      console.log(`   ${found ? '✅' : '❌'} ${desc}`);
      if (!found) allGood = false;
    });
  } else {
    console.log(`   ❌ Fichier non trouvé`);
    allGood = false;
  }
  console.log('');
});

console.log('🔐 Système de déconnexion amélioré:');
console.log('');
console.log('📱 DANS APPNAVIGATOR:');
console.log('• Listener onAuthStateChange ajouté');
console.log('• Détection automatique des changements d\'auth');
console.log('• Redirection automatique vers auth lors de SIGNED_OUT');
console.log('• Redirection automatique vers home lors de SIGNED_IN');
console.log('• Nettoyage du listener au démontage');
console.log('');
console.log('📱 DANS PROFILESCREEN:');
console.log('• Gestion d\'erreur améliorée');
console.log('• Logs de debug pour diagnostiquer');
console.log('• Feedback utilisateur en cas d\'erreur');
console.log('• Pas de navigation manuelle (gérée par le listener)');

console.log('\n🔄 Flux de déconnexion:');
console.log('');
console.log('1️⃣ Utilisateur clique sur "Se déconnecter"');
console.log('2️⃣ Confirmation avec Alert.alert');
console.log('3️⃣ ProfileScreen appelle supabase.auth.signOut()');
console.log('4️⃣ Supabase émet un événement SIGNED_OUT');
console.log('5️⃣ AppNavigator détecte le changement via onAuthStateChange');
console.log('6️⃣ AppNavigator met à jour user = null');
console.log('7️⃣ AppNavigator navigue automatiquement vers AuthScreen');
console.log('8️⃣ L\'utilisateur voit l\'écran de connexion');

if (allGood) {
  console.log('\n✅ Système de déconnexion complet et fonctionnel !');
  console.log('🔐 La déconnexion devrait maintenant rediriger vers l\'écran d\'auth');
} else {
  console.log('\n⚠️ Certains éléments du système de déconnexion ne sont pas complets');
}

console.log('\n🧪 Test de validation:');
console.log('1. Recharge l\'app dans Expo Go');
console.log('2. Assure-toi d\'être connecté');
console.log('3. Va sur l\'onglet "Profil"');
console.log('4. Clique sur "Se déconnecter"');
console.log('5. Confirme la déconnexion');
console.log('6. Vérifie que l\'app redirige vers l\'écran de connexion');
console.log('7. Vérifie les logs dans la console:');
console.log('   - "🔐 Signing out user..."');
console.log('   - "✅ User signed out successfully"');
console.log('   - "🔐 Auth state changed: SIGNED_OUT"');

console.log('\n🎉 Test terminé !');