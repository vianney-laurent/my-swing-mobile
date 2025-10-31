#!/usr/bin/env node

/**
 * Script de test pour vérifier la création de profil
 * À exécuter depuis le dossier golf-coaching-mobile
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à adapter selon votre environnement)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_')) {
  console.error('❌ Configuration Supabase manquante');
  console.error('Définissez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans un fichier .env');
  console.error('Ou modifiez directement les valeurs dans ce script');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfileCreation() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  console.log('🧪 Test de création de profil complet');
  console.log('📧 Email de test:', testEmail);

  try {
    // 1. Créer un compte utilisateur
    console.log('1️⃣ Création du compte utilisateur...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error('❌ Erreur de création de compte:', authError);
      return;
    }

    if (!authData.user) {
      console.error('❌ Aucun utilisateur retourné');
      return;
    }

    console.log('✅ Compte créé:', authData.user.id);

    // 2. Attendre que le trigger crée le profil de base
    console.log('2️⃣ Attente du trigger automatique...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Vérifier que le profil de base existe
    console.log('3️⃣ Vérification du profil de base...');
    const { data: baseProfile, error: baseError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (baseError) {
      console.error('❌ Erreur de récupération du profil de base:', baseError);
    } else {
      console.log('✅ Profil de base trouvé:', baseProfile);
    }

    // 4. Mettre à jour le profil avec les informations complètes
    console.log('4️⃣ Mise à jour du profil avec les informations complètes...');
    const profileData = {
      id: authData.user.id,
      email: testEmail,
      first_name: 'Test',
      last_name: 'User',
      golf_index: 15.5,
      dominant_hand: 'right',
      city: 'Paris'
    };

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur de mise à jour du profil:', updateError);
      
      // Essayer avec UPDATE
      console.log('🔄 Tentative avec UPDATE...');
      const { error: updateError2 } = await supabase
        .from('profiles')
        .update({
          first_name: 'Test',
          last_name: 'User',
          golf_index: 15.5,
          dominant_hand: 'right',
          city: 'Paris'
        })
        .eq('id', authData.user.id);

      if (updateError2) {
        console.error('❌ UPDATE aussi échoué:', updateError2);
      } else {
        console.log('✅ Profil mis à jour avec UPDATE');
      }
    } else {
      console.log('✅ Profil mis à jour avec UPSERT:', updatedProfile);
    }

    // 5. Vérifier le profil final
    console.log('5️⃣ Vérification du profil final...');
    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (finalError) {
      console.error('❌ Erreur de récupération du profil final:', finalError);
    } else {
      console.log('✅ Profil final:', finalProfile);
      
      // Vérifier que tous les champs sont présents
      const requiredFields = ['first_name', 'last_name', 'city', 'email'];
      const missingFields = requiredFields.filter(field => !finalProfile[field]);
      
      if (missingFields.length > 0) {
        console.error('❌ Champs manquants:', missingFields);
      } else {
        console.log('✅ Tous les champs obligatoires sont présents');
      }
      
      const optionalFields = ['golf_index', 'dominant_hand'];
      optionalFields.forEach(field => {
        if (finalProfile[field] !== null) {
          console.log(`✅ Champ optionnel ${field}:`, finalProfile[field]);
        }
      });
    }

    // 6. Nettoyer - supprimer le compte de test
    console.log('6️⃣ Nettoyage...');
    await supabase.from('profiles').delete().eq('id', authData.user.id);
    console.log('✅ Profil de test supprimé');

    console.log('🎉 Test terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le test
testProfileCreation();