#!/usr/bin/env node

/**
 * Configuration Supabase pour désactiver la confirmation email
 */

console.log('🔧 Configuration Supabase Auth - Désactivation confirmation email\n');

function showSupabaseConfig() {
  console.log('📋 Configuration requise dans Supabase Dashboard:\n');
  
  console.log('1. 🌐 Aller sur https://supabase.com/dashboard');
  console.log('2. 📁 Sélectionner votre projet');
  console.log('3. ⚙️  Aller dans "Authentication" > "Settings"');
  console.log('4. 📧 Dans la section "User Signups":\n');
  
  console.log('   ✅ Enable email confirmations: OFF');
  console.log('   ✅ Enable phone confirmations: OFF');
  console.log('   ✅ Enable manual approval: OFF\n');
  
  console.log('5. 💾 Cliquer sur "Save"\n');
  
  console.log('📝 Alternative via SQL (dans SQL Editor):');
  console.log(`
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_confirmations = false,
  enable_phone_confirmations = false
WHERE 
  id = 'default';
  `);
}

function showTestSteps() {
  console.log('🧪 Étapes de test après configuration:\n');
  
  console.log('1. 📱 Ouvrir l\'app mobile');
  console.log('2. ➕ Créer un nouveau compte');
  console.log('3. 📝 Remplir le formulaire avec:');
  console.log('   - Email: test@example.com');
  console.log('   - Mot de passe: test123');
  console.log('   - Prénom: Test');
  console.log('   - Nom: User');
  console.log('   - Ville: Paris');
  console.log('   - Handicap: 24,7');
  console.log('4. ✅ Valider l\'inscription');
  console.log('5. 🔍 Vérifier les logs:');
  console.log('   - "✅ User created successfully"');
  console.log('   - "✅ Profile created successfully"');
  console.log('   - "✅ User automatically signed in"');
  console.log('6. 🏠 L\'utilisateur doit être connecté automatiquement');
  console.log('7. 👤 Vérifier le profil complet dans l\'app');
  console.log('8. 🗄️  Vérifier dans Supabase Dashboard que:');
  console.log('   - L\'utilisateur existe dans "Authentication" > "Users"');
  console.log('   - Le profil existe dans "Table Editor" > "profiles"');
  console.log('   - golf_index = 24.7 (pas 24)');
}

function showExpectedLogs() {
  console.log('📊 Logs attendus lors de l\'inscription:\n');
  
  console.log('✅ Logs de succès:');
  console.log('🏌️ Handicap normalisé: {"normalized": "24.7", "original": "24,7", "parsed": 24.7}');
  console.log('🚀 Starting signup process...');
  console.log('✅ User created successfully: [user-id]');
  console.log('📝 Données du profil préparées: {"golf_index": 24.7, "first_name": "Test", ...}');
  console.log('✅ User created, creating profile immediately...');
  console.log('📝 Tentative UPSERT avec données: {...}');
  console.log('✅ UPSERT success: {...}');
  console.log('✅ Profile created successfully: {...}');
  console.log('🔐 Attempting automatic sign in...');
  console.log('✅ User automatically signed in: [user-id]');
  console.log('');
  
  console.log('⚠️ Logs d\'alerte possibles:');
  console.log('⚠️ Trigger profile not found after 5000 ms → Normal, on crée directement');
  console.log('⚠️ Certains champs n\'ont pas été sauvegardés → Problème à investiguer');
  console.log('❌ Auto sign-in failed → Connexion manuelle requise');
}

function showTroubleshooting() {
  console.log('🔧 Dépannage:\n');
  
  console.log('❌ Si "User created" mais pas de connexion automatique:');
  console.log('   1. Vérifier que enable_confirmations = false dans Supabase');
  console.log('   2. Vérifier les logs d\'erreur de signInWithPassword');
  console.log('   3. Tester la connexion manuelle avec les mêmes identifiants');
  console.log('');
  
  console.log('❌ Si le profil n\'est pas créé:');
  console.log('   1. Vérifier les logs du service SignupProfileService');
  console.log('   2. Vérifier les permissions RLS sur la table profiles');
  console.log('   3. Vérifier que le trigger handle_new_user fonctionne');
  console.log('');
  
  console.log('❌ Si golf_index reste à 24 au lieu de 24.7:');
  console.log('   1. Vérifier les logs de normalisation');
  console.log('   2. Vérifier le type de colonne dans Supabase (numeric/decimal)');
  console.log('   3. Tester avec d\'autres valeurs décimales');
}

function runConfiguration() {
  console.log('🎯 Configuration Supabase Auth pour inscription directe\n');
  
  showSupabaseConfig();
  console.log('─'.repeat(60));
  showTestSteps();
  console.log('─'.repeat(60));
  showExpectedLogs();
  console.log('─'.repeat(60));
  showTroubleshooting();
  
  console.log('\n✅ Configuration terminée');
  console.log('💡 Après avoir appliqué la configuration dans Supabase Dashboard,');
  console.log('   testez l\'inscription pour vérifier que tout fonctionne !');
}

runConfiguration();