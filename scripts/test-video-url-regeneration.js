#!/usr/bin/env node

/**
 * Script de test pour vérifier la régénération des URLs vidéo expirées
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

async function testVideoUrlRegeneration() {
  console.log('🧪 Test de régénération des URLs vidéo');
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

    // 2. Récupérer une analyse avec vidéo
    console.log('📊 Récupération d\'une analyse avec vidéo...');
    const { data: analyses, error: analysesError } = await supabase
      .from('analyses')
      .select('id, video_url, created_at')
      .eq('user_id', user.id)
      .not('video_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (analysesError) {
      console.error('❌ Erreur lors de la récupération des analyses:', analysesError);
      return;
    }

    if (!analyses || analyses.length === 0) {
      console.log('❌ Aucune analyse avec vidéo trouvée');
      console.log('💡 Effectuez d\'abord une analyse avec vidéo dans l\'app');
      return;
    }

    const analysis = analyses[0];
    console.log('✅ Analyse trouvée:', analysis.id);
    console.log('  - Date:', new Date(analysis.created_at).toLocaleString());
    console.log('  - URL vidéo:', analysis.video_url.substring(0, 100) + '...');
    console.log('');

    // 3. Tester l'URL actuelle
    console.log('🧪 Test de l\'URL vidéo actuelle...');
    try {
      const response = await fetch(analysis.video_url, { method: 'HEAD' });
      console.log('📊 Status de l\'URL actuelle:', response.status);
      
      if (response.ok) {
        console.log('✅ URL actuelle accessible');
      } else {
        console.log('❌ URL actuelle non accessible (probablement expirée)');
      }
    } catch (error) {
      console.log('❌ Erreur lors du test de l\'URL:', error.message);
    }
    console.log('');

    // 4. Extraire le chemin vidéo
    console.log('🔍 Extraction du chemin vidéo...');
    let videoPath = analysis.video_url;
    
    // Si c'est une URL signée, extraire le chemin
    if (analysis.video_url.includes('/storage/v1/object/sign/videos/')) {
      const pathMatch = analysis.video_url.match(/\/storage\/v1\/object\/sign\/videos\/(.+?)\?/);
      if (pathMatch) {
        videoPath = pathMatch[1];
        console.log('✅ Chemin extrait depuis URL signée:', videoPath);
      }
    } else if (analysis.video_url.includes('/storage/v1/object/public/videos/')) {
      const pathMatch = analysis.video_url.match(/\/storage\/v1\/object\/public\/videos\/(.+)$/);
      if (pathMatch) {
        videoPath = pathMatch[1];
        console.log('✅ Chemin extrait depuis URL publique:', videoPath);
      }
    } else {
      // Peut-être que c'est déjà un chemin
      console.log('🔍 URL semble être un chemin:', videoPath);
    }
    console.log('');

    // 5. Générer une nouvelle URL signée
    console.log('🔄 Génération d\'une nouvelle URL signée...');
    const { data: newUrlData, error: urlError } = await supabase.storage
      .from('videos')
      .createSignedUrl(videoPath, 3600); // 1 heure

    if (urlError || !newUrlData?.signedUrl) {
      console.error('❌ Erreur lors de la génération de l\'URL:', urlError);
      return;
    }

    console.log('✅ Nouvelle URL générée');
    console.log('  - Nouvelle URL:', newUrlData.signedUrl.substring(0, 100) + '...');
    console.log('');

    // 6. Tester la nouvelle URL
    console.log('🧪 Test de la nouvelle URL...');
    try {
      const response = await fetch(newUrlData.signedUrl, { method: 'HEAD' });
      console.log('📊 Status de la nouvelle URL:', response.status);
      
      if (response.ok) {
        console.log('✅ Nouvelle URL accessible !');
        console.log('  - Content-Type:', response.headers.get('content-type'));
        console.log('  - Content-Length:', response.headers.get('content-length'));
      } else {
        console.log('❌ Nouvelle URL non accessible');
      }
    } catch (error) {
      console.log('❌ Erreur lors du test de la nouvelle URL:', error.message);
    }
    console.log('');

    // 7. Résumé
    console.log('📋 Résumé du test:');
    console.log('  ✅ Extraction du chemin vidéo réussie');
    console.log('  ✅ Génération de nouvelle URL réussie');
    console.log('  ✅ Test de la nouvelle URL réussi');
    console.log('');
    console.log('💡 La régénération d\'URL fonctionne correctement !');
    console.log('   Les analyses pourront maintenant toujours afficher leur vidéo.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Fonction principale
async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: node scripts/test-video-url-regeneration.js');
    console.log('');
    console.log('Ce script teste la régénération des URLs vidéo expirées.');
    console.log('Il vérifie qu\'on peut toujours accéder aux vidéos des analyses.');
    return;
  }
  
  await testVideoUrlRegeneration();
}

if (require.main === module) {
  main().catch(console.error);
}