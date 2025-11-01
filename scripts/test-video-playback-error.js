#!/usr/bin/env node

/**
 * Test script for debugging video playback errors
 * This script helps identify the root cause of NSURLErrorDomain -1008 errors
 */

const { diagnoseVideoUrl } = require('./diagnose-video-url');

// Common test URLs to verify network connectivity
const TEST_URLS = [
  // Public test video
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  // Your Supabase storage (replace with actual URL)
  'https://fdxyqqiukrzondnakvge.supabase.co/storage/v1/object/public/videos/test.mp4'
];

async function testVideoPlaybackError() {
  console.log('🔍 Test de diagnostic des erreurs de lecture vidéo');
  console.log('=' .repeat(60));
  console.log('');

  // Test 1: Network connectivity with known working URL
  console.log('📡 Test 1: Connectivité réseau');
  console.log('-' .repeat(30));
  
  const publicVideoWorking = await diagnoseVideoUrl(TEST_URLS[0]);
  
  if (publicVideoWorking) {
    console.log('✅ Connexion internet OK');
  } else {
    console.log('❌ Problème de connexion internet');
    console.log('💡 Vérifiez votre connexion réseau');
    return;
  }
  
  console.log('');

  // Test 2: Supabase storage accessibility
  console.log('🗄️  Test 2: Accès au stockage Supabase');
  console.log('-' .repeat(30));
  
  const supabaseWorking = await diagnoseVideoUrl(TEST_URLS[1]);
  
  if (supabaseWorking) {
    console.log('✅ Stockage Supabase accessible');
  } else {
    console.log('❌ Problème d\'accès au stockage Supabase');
    console.log('💡 Suggestions:');
    console.log('  - Vérifiez que le fichier existe dans Supabase Storage');
    console.log('  - Vérifiez les politiques RLS (Row Level Security)');
    console.log('  - Vérifiez la configuration CORS');
  }
  
  console.log('');

  // Test 3: Custom video URL (if provided)
  const customUrl = process.argv[2];
  if (customUrl) {
    console.log('🎥 Test 3: URL vidéo personnalisée');
    console.log('-' .repeat(30));
    console.log('URL:', customUrl);
    console.log('');
    
    const customWorking = await diagnoseVideoUrl(customUrl);
    
    if (customWorking) {
      console.log('✅ URL vidéo personnalisée accessible');
    } else {
      console.log('❌ URL vidéo personnalisée non accessible');
      
      // Analyse de l'URL
      try {
        const url = new URL(customUrl);
        console.log('');
        console.log('🔍 Analyse de l\'URL:');
        console.log('  - Domaine:', url.hostname);
        console.log('  - Protocole:', url.protocol);
        console.log('  - Chemin:', url.pathname);
        
        if (url.hostname.includes('supabase.co')) {
          console.log('');
          console.log('💡 URL Supabase détectée - Suggestions:');
          console.log('  - Vérifiez que le fichier existe dans le bucket "videos"');
          console.log('  - Essayez de générer une URL signée');
          console.log('  - Vérifiez les permissions du bucket');
        }
        
      } catch (urlError) {
        console.log('❌ URL invalide:', urlError.message);
      }
    }
  }

  console.log('');
  console.log('📋 Résumé des tests:');
  console.log('  - Connexion internet:', publicVideoWorking ? '✅' : '❌');
  console.log('  - Stockage Supabase:', supabaseWorking ? '✅' : '❌');
  if (customUrl) {
    console.log('  - URL personnalisée:', await diagnoseVideoUrl(customUrl) ? '✅' : '❌');
  }
  
  console.log('');
  console.log('📖 Pour plus d\'aide, consultez:');
  console.log('  docs/troubleshooting/VIDEO_PLAYBACK_ERRORS.md');
}

// Fonction principale
async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: node scripts/test-video-playback-error.js [video-url]');
    console.log('');
    console.log('Ce script teste les causes communes des erreurs de lecture vidéo.');
    console.log('');
    console.log('Exemples:');
    console.log('  node scripts/test-video-playback-error.js');
    console.log('  node scripts/test-video-playback-error.js "https://example.com/video.mp4"');
    return;
  }
  
  await testVideoPlaybackError();
}

if (require.main === module) {
  main().catch(console.error);
}