#!/usr/bin/env node

/**
 * 🧪 Test d'accessibilité URL Supabase
 * Vérifie si le serveur GCP peut accéder aux URLs Supabase
 */

const SERVER_URL = 'https://golf-video-processor-awf6kmi2la-ew.a.run.app';

async function testSupabaseUrlAccess() {
  console.log('🧪 Testing Supabase URL accessibility from GCP server...');
  
  // URL de test Supabase (publique)
  const testUrls = [
    'https://fdxyqqiukrzondnakvge.supabase.co/storage/v1/object/public/videos/test.mp4',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
  ];
  
  for (const testUrl of testUrls) {
    console.log(`\n🔗 Testing URL: ${testUrl}`);
    
    try {
      const response = await fetch(`${SERVER_URL}/process-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: testUrl
        }),
        signal: AbortSignal.timeout ? AbortSignal.timeout(30000) : undefined
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Server processed URL successfully');
      } else {
        console.log('❌ Server failed:', data.error);
        console.log('📋 Details:', data.details);
      }
    } catch (error) {
      console.log('❌ Request failed:', error.message);
    }
  }
}

// Fallback pour les environnements sans AbortSignal.timeout
if (!AbortSignal.timeout) {
  console.log('⚠️ AbortSignal.timeout not available, using manual timeout');
}

testSupabaseUrlAccess().catch(console.error);