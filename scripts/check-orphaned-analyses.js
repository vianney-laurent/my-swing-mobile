#!/usr/bin/env node

/**
 * Script pour vérifier les analyses orphelines (sans vidéo)
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

async function checkOrphanedAnalyses() {
  console.log('🔍 Vérification des analyses orphelines');
  console.log('=' .repeat(50));
  console.log('');

  try {
    // 1. Vérifier l'authentification
    console.log('🔐 Vérification de l\'authentification...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Utilisateur non authentifié');
      return;
    }
    
    console.log('✅ Utilisateur authentifié:', user.email);
    console.log('');

    // 2. Récupérer toutes les analyses
    console.log('📊 Récupération de toutes les analyses...');
    const { data: analyses, error: analysesError } = await supabase
      .from('analyses')
      .select('id, video_url, created_at, overall_score, club_used')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (analysesError) {
      console.error('❌ Erreur lors de la récupération des analyses:', analysesError);
      return;
    }

    if (!analyses || analyses.length === 0) {
      console.log('ℹ️ Aucune analyse trouvée');
      return;
    }

    console.log(`✅ ${analyses.length} analyses trouvées`);
    console.log('');

    // 3. Vérifier chaque analyse
    let validCount = 0;
    let orphanedCount = 0;
    let noVideoCount = 0;

    console.log('🔍 Vérification de chaque analyse...');
    console.log('');

    for (const analysis of analyses) {
      const date = new Date(analysis.created_at).toLocaleDateString();
      const score = analysis.overall_score || 'N/A';
      const club = analysis.club_used || 'N/A';
      
      console.log(`📋 Analyse ${analysis.id.substring(0, 8)}... (${date})`);
      console.log(`   Score: ${score} | Club: ${club}`);
      
      if (!analysis.video_url) {
        console.log('   📹 Statut: Pas d\'URL vidéo');
        noVideoCount++;
        continue;
      }

      // Extraire le chemin vidéo
      let videoPath = analysis.video_url;
      if (analysis.video_url.includes('sign/')) {
        const pathMatch = analysis.video_url.match(/\/storage\/v1\/object\/sign\/videos\/(.+?)\?/);
        if (pathMatch) {
          videoPath = pathMatch[1];
        }
      }

      // Vérifier si le fichier existe
      try {
        const { data: fileData, error: fileError } = await supabase.storage
          .from('videos')
          .list(videoPath.split('/')[0], {
            search: videoPath.split('/')[1]
          });

        if (fileError || !fileData || fileData.length === 0) {
          console.log('   📹 Statut: ❌ Vidéo manquante (orpheline)');
          orphanedCount++;
        } else {
          console.log('   📹 Statut: ✅ Vidéo disponible');
          validCount++;
        }
      } catch (error) {
        console.log('   📹 Statut: ❌ Erreur de vérification');
        orphanedCount++;
      }
      
      console.log('');
    }

    // 4. Résumé
    console.log('📊 RÉSUMÉ:');
    console.log('=' .repeat(30));
    console.log(`Total analyses: ${analyses.length}`);
    console.log(`✅ Avec vidéo valide: ${validCount}`);
    console.log(`❌ Vidéo manquante (orphelines): ${orphanedCount}`);
    console.log(`ℹ️ Sans URL vidéo: ${noVideoCount}`);
    console.log('');

    if (orphanedCount > 0) {
      console.log('💡 RECOMMANDATIONS:');
      console.log(`   - ${orphanedCount} analyses ont des vidéos manquantes`);
      console.log('   - Ces analyses restent consultables (texte seulement)');
      console.log('   - L\'app gère gracieusement les vidéos manquantes');
      console.log('   - Aucune action requise côté utilisateur');
      console.log('');
      console.log('🔧 OPTIONS DE NETTOYAGE:');
      console.log('   - Garder les analyses (recommandé)');
      console.log('   - Supprimer les analyses orphelines (optionnel)');
    } else {
      console.log('🎉 Toutes les analyses ont leurs vidéos disponibles !');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

// Fonction principale
async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: node scripts/check-orphaned-analyses.js');
    console.log('');
    console.log('Ce script vérifie quelles analyses ont des vidéos manquantes.');
    console.log('Il ne supprime rien, juste un rapport informatif.');
    return;
  }
  
  await checkOrphanedAnalyses();
}

if (require.main === module) {
  main().catch(console.error);
}