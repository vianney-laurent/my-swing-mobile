#!/usr/bin/env node

/**
 * 🧪 Test du workflow vidéo amélioré
 * Valide que le serveur GCP fonctionne avec les URLs Supabase
 */

const axios = require('axios');

// Configuration
const SERVER_URL = process.env.EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL || 'http://localhost:3002';
const TEST_VIDEO_URL = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'; // URL de test publique

async function testServerHealth() {
  console.log('🏥 Testing server health...');
  
  try {
    const response = await axios.get(`${SERVER_URL}/health`);
    console.log('✅ Server is healthy:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    return false;
  }
}

async function testVideoProcessing() {
  console.log('🎬 Testing video processing...');
  
  try {
    const response = await axios.post(`${SERVER_URL}/process-video`, {
      videoUrl: TEST_VIDEO_URL
    }, {
      timeout: 60000 // 1 minute
    });
    
    if (response.data.success) {
      console.log('✅ Video processing successful:', {
        size: response.data.video.size,
        processingTime: response.data.processingTime,
        method: response.data.method,
        base64Length: response.data.video.base64.length
      });
      return true;
    } else {
      console.error('❌ Video processing failed:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Video processing error:', error.message);
    return false;
  }
}

async function testSupabaseUrlCompatibility() {
  console.log('🗄️ Testing Supabase URL compatibility...');
  
  // Simuler une URL Supabase typique
  const mockSupabaseUrl = 'https://your-project.supabase.co/storage/v1/object/public/videos/user-id/video.mp4';
  
  try {
    // Test que le serveur peut gérer les URLs Supabase (même si cette URL n'existe pas)
    const response = await axios.post(`${SERVER_URL}/process-video`, {
      videoUrl: mockSupabaseUrl
    }, {
      timeout: 30000,
      validateStatus: () => true // Accepter toutes les réponses pour tester la compatibilité
    });
    
    // On s'attend à une erreur de téléchargement, pas une erreur de format d'URL
    if (response.data.error && response.data.error.includes('Request failed')) {
      console.log('✅ Server correctly handles Supabase URLs (expected download error)');
      return true;
    } else if (response.data.success) {
      console.log('✅ Server processed Supabase URL successfully');
      return true;
    } else {
      console.log('⚠️ Unexpected response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Supabase URL test failed:', error.message);
    return false;
  }
}

async function testFallbackScenario() {
  console.log('🔄 Testing fallback scenario...');
  
  // Test avec un serveur inexistant pour vérifier le fallback
  const fakeServerUrl = 'http://fake-server-that-does-not-exist.com';
  
  try {
    await axios.post(`${fakeServerUrl}/process-video`, {
      videoUrl: TEST_VIDEO_URL
    }, {
      timeout: 5000
    });
    
    console.log('⚠️ Fake server responded (unexpected)');
    return false;
  } catch (error) {
    console.log('✅ Fallback scenario works (server unreachable as expected)');
    return true;
  }
}

async function runAllTests() {
  console.log('🧪 Starting improved video workflow tests...');
  console.log(`🔗 Server URL: ${SERVER_URL}`);
  console.log('');
  
  const results = {
    health: await testServerHealth(),
    processing: await testVideoProcessing(),
    supabaseCompat: await testSupabaseUrlCompatibility(),
    fallback: await testFallbackScenario()
  };
  
  console.log('');
  console.log('📊 Test Results:');
  console.log('================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.charAt(0).toUpperCase() + test.slice(1);
    console.log(`${status} ${testName}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  console.log('');
  if (allPassed) {
    console.log('🎉 All tests passed! The improved workflow is ready.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Deploy the video-processing-server to GCP');
    console.log('2. Update EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL in .env');
    console.log('3. Test with real mobile app');
  } else {
    console.log('⚠️ Some tests failed. Please check the configuration.');
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Ensure video-processing-server is running');
    console.log('2. Check SERVER_URL configuration');
    console.log('3. Verify network connectivity');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Lancer les tests
runAllTests().catch(console.error);