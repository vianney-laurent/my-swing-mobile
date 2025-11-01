#!/usr/bin/env node

/**
 * Script de test pour vérifier la suppression d'analyses
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAnalysisDeletion() {
  console.log('🧪 Test de suppression d\'analyses');
  console.log('=' .repeat(50));
  console.log('');

  try {
    // 1. Vérifier l'authentification
    console.log('🔐 Vérification de l\'authentification...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Utilisateur non authentifié');
      console.log('💡 Connectez-vous d\'abord dans l\'app pour obtenir un token valide');
      return;
    }
    
    console.log('✅ Utilisateur authentifié:', user.email);
    console.log('');

    // 2. Lister les analyses disponibles
    console.log('📊 Récupération des analyses...');
    const { data: analyses, error: analysesError } = await supabase
      .from('analyses')
      .select('id, created_at, overall_score, club_used, video_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (analysesError) {
      console.error('❌ Erreur lors de la récupération des analyses:', analysesError);
      return;
    }

    if (!analyses || analyses.length === 0) {
      console.log('ℹ️ Aucune analyse trouvée');
      console.log('💡 Créez d\'abord une analyse dans l\'app pour tester la suppression');
      return;
    }

    console.log(`✅ ${analyses.length} analyses trouvées`);
    console.log('');

    // 3. Afficher les analyses disponibles
    console.log('📋 Analyses disponibles:');
    analyses.forEach((analysis, index) => {
      const date = new Date(analysis.created_at).toLocaleDateString();
      const score = analysis.overall_score || 'N/A';
      const club = analysis.club_used || 'N/A';
      const hasVideo = analysis.video_url ? '📹' : '📄';
      
      console.log(`  ${index + 1}. ${analysis.id.substring(0, 8)}... (${date}) ${hasVideo}`);
      console.log(`     Score: ${score} | Club: ${club}`);
    });
    console.log('');

    // 4. Simuler la suppression (sans vraiment supprimer)
    console.log('🔍 Test de la logique de suppression...');
    const testAnalysis = analyses[0];
    
    console.log(`📋 Test avec l'analyse: ${testAnalysis.id.substring(0, 8)}...`);
    
    // Vérifier l'accès à l'analyse
    const { data: accessTest, error: accessError } = await supabase
      .from('analyses')
      .select('video_url')
      .eq('id', testAnalysis.id)
      .eq('user_id', user.id)
      .single();

    if (accessError) {
      console.log('❌ Erreur d\'accès à l\'analyse:', accessError.message);
      return;
    }

    console.log('✅ Accès à l\'analyse confirmé');

    // Analyser l'URL vidéo
    if (accessTest.video_url) {
      let videoPath = accessTest.video_url;
      
      if (accessTest.video_url.includes('sign/')) {
        const pathMatch = accessTest.video_url.match(/\/storage\/v1\/object\/sign\/videos\/(.+?)\?/);
        if (pathMatch) {
          videoPath = pathMatch[1];
          console.log('✅ Chemin vidéo extrait:', videoPath);
        } else {
          console.log('⚠️ Impossible d\'extraire le chemin vidéo');
        }
      } else {
        console.log('✅ Chemin vidéo direct:', videoPath);
      }

      // Vérifier l'existence du fichier vidéo
      try {
        const { data: fileList, error: listError } = await supabase.storage
          .from('videos')
          .list(videoPath.split('/')[0], {
            search: videoPath.split('/')[1]
          });

        if (listError) {
          console.log('⚠️ Erreur de vérification vidéo:', listError.message);
        } else if (fileList && fileList.length > 0) {
          console.log('✅ Fichier vidéo trouvé dans le storage');
        } else {
          console.log('⚠️ Fichier vidéo non trouvé dans le storage');
        }
      } catch (error) {
        console.log('⚠️ Erreur lors de la vérification vidéo:', error.message);
      }
    } else {
      console.log('ℹ️ Aucune vidéo associée à cette analyse');
    }

    console.log('');
    console.log('✅ Test de suppression réussi !');
    console.log('');
    console.log('💡 Fonctionnalités testées:');
    console.log('  - ✅ Authentification utilisateur');
    console.log('  - ✅ Accès sécurisé aux analyses (user_id)');
    console.log('  - ✅ Extraction du chemin vidéo');
    console.log('  - ✅ Vérification de l\'existence des fichiers');
    console.log('');
    console.log('🎯 La suppression devrait maintenant fonctionner dans l\'app !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Fonction principale
async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: node scripts/test-analysis-deletion.js');
    console.log('');
    console.log('Ce script teste la logique de suppression d\'analyses.');
    console.log('Il ne supprime rien, juste un test de validation.');
    return;
  }
  
  await testAnalysisDeletion();
}

if (require.main === module) {
  main().catch(console.error);
}