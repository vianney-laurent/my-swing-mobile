#!/usr/bin/env node

/**
 * Script de test pour vérifier la correction des URLs expirées
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

async function testExpiredUrlFix() {
  console.log('🧪 Test de correction des URLs expirées');
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

    // 2. Récupérer les analyses avec URLs signées
    console.log('📊 Récupération des analyses avec URLs signées...');
    const { data: analyses, error: analysesError } = await supabase
      .from('analyses')
      .select('id, video_url, created_at')
      .eq('user_id', user.id)
      .not('video_url', 'is', null)
      .like('video_url', '%sign%')
      .order('created_at', { ascending: false })
      .limit(5);

    if (analysesError) {
      console.error('❌ Erreur lors de la récupération des analyses:', analysesError);
      return;
    }

    if (!analyses || analyses.length === 0) {
      console.log('ℹ️ Aucune analyse avec URL signée trouvée');
      console.log('💡 Cela signifie que toutes vos analyses utilisent le nouveau format !');
      return;
    }

    console.log(`✅ ${analyses.length} analyses avec URLs signées trouvées`);
    console.log('');

    // 3. Tester l'extraction de chemin pour chaque analyse
    for (const analysis of analyses) {
      console.log(`🔍 Test analyse ${analysis.id}:`);
      console.log(`  - Date: ${new Date(analysis.created_at).toLocaleString()}`);
      console.log(`  - URL actuelle: ${analysis.video_url.substring(0, 80)}...`);
      
      // Extraire le chemin
      const pathMatch = analysis.video_url.match(/\/storage\/v1\/object\/sign\/videos\/(.+?)\?/);
      if (pathMatch) {
        const extractedPath = pathMatch[1];
        console.log(`  - Chemin extrait: ${extractedPath}`);
        
        // Tester la génération d'une nouvelle URL
        try {
          const { data: newUrlData, error: newUrlError } = await supabase.storage
            .from('videos')
            .createSignedUrl(extractedPath, 3600);
          
          if (newUrlError) {
            console.log(`  - ❌ Erreur génération URL: ${newUrlError.message}`);
          } else if (newUrlData?.signedUrl) {
            console.log(`  - ✅ Nouvelle URL générée avec succès`);
            
            // Tester l'accessibilité
            try {
              const testResponse = await fetch(newUrlData.signedUrl, { method: 'HEAD' });
              console.log(`  - 🧪 Test accessibilité: ${testResponse.ok ? '✅ OK' : '❌ Échec'} (${testResponse.status})`);
            } catch (testError) {
              console.log(`  - 🧪 Test accessibilité: ❌ Erreur réseau`);
            }
          } else {
            console.log(`  - ❌ Aucune URL retournée`);
          }
        } catch (error) {
          console.log(`  - ❌ Erreur: ${error.message}`);
        }
      } else {
        console.log(`  - ❌ Impossible d'extraire le chemin`);
      }
      
      console.log('');
    }

    // 4. Résumé
    console.log('📋 Résumé:');
    console.log(`  - Analyses testées: ${analyses.length}`);
    console.log('  - La correction automatique devrait maintenant fonctionner');
    console.log('  - Les URLs seront régénérées à chaque chargement d\'analyse');
    console.log('');
    console.log('💡 Prochaines étapes:');
    console.log('  1. Testez le chargement d\'une analyse dans l\'app');
    console.log('  2. Vérifiez que la vidéo s\'affiche correctement');
    console.log('  3. Les logs devraient montrer "Generated fresh signed URL"');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Fonction principale
async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: node scripts/test-expired-url-fix.js');
    console.log('');
    console.log('Ce script teste la correction des URLs vidéo expirées.');
    return;
  }
  
  await testExpiredUrlFix();
}

if (require.main === module) {
  main().catch(console.error);
}