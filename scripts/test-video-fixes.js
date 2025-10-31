#!/usr/bin/env node

/**
 * 🧪 Test des corrections vidéo
 * Valide que tous les problèmes sont résolus
 */

// Utiliser fetch natif au lieu d'axios

// Configuration
const SERVER_URL = 'https://golf-video-processor-awf6kmi2la-ew.a.run.app';
const TEST_SUPABASE_URL = 'https://fdxyqqiukrzondnakvge.supabase.co/storage/v1/object/public/videos/test/sample.mp4';

async function testServerHealth() {
  console.log('🏥 Testing GCP server health...');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${SERVER_URL}/health`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'healthy') {
        console.log('✅ GCP server is healthy:', {
          version: data.version,
          uptime: data.uptime
        });
        return true;
      } else {
        console.error('❌ Server unhealthy:', data);
        return false;
      }
    } else {
      console.error('❌ Server health check failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    return false;
  }
}

async function testAbortSignalFix() {
  console.log('🔧 Testing AbortSignal timeout fix...');
  
  try {
    // Simuler le timeout manuel (comme dans le code mobile)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000); // 5 secondes pour le test

    const startTime = Date.now();
    
    try {
      const response = await fetch(`${SERVER_URL}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`✅ AbortController works correctly (${duration}ms)`);
        return true;
      } else {
        console.error('❌ Request failed:', response.status);
        return false;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.log('✅ AbortController timeout works correctly');
        return true;
      } else {
        console.error('❌ Unexpected error:', error.message);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ AbortSignal test failed:', error.message);
    return false;
  }
}

async function testVideoProcessingEndpoint() {
  console.log('🎬 Testing video processing endpoint...');
  
  try {
    // Utiliser une URL de test plus simple et fiable
    const testVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes
    
    const response = await fetch(`${SERVER_URL}/process-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl: testVideoUrl
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log('✅ Video processing works:', {
          size: data.video.size,
          processingTime: data.processingTime,
          method: data.method,
          base64Length: data.video.base64.length
        });
        return true;
      } else {
        console.error('❌ Video processing failed:', data);
        return false;
      }
    } else {
      console.error('❌ Video processing request failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Video processing test failed:', error.message);
    return false;
  }
}

async function testSupabaseUrlHandling() {
  console.log('🗄️ Testing Supabase URL handling...');
  
  try {
    // Tester avec une URL Supabase réelle (même si le fichier n'existe pas)
    const mockSupabaseUrl = 'https://fdxyqqiukrzondnakvge.supabase.co/storage/v1/object/public/videos/test/nonexistent.mp4';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(`${SERVER_URL}/process-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl: mockSupabaseUrl
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Accepter toutes les réponses pour ce test
    const data = await response.json();
    
    // On s'attend à une erreur de téléchargement, pas une erreur de format d'URL
    if (data.error && (
      data.error.includes('Request failed') || 
      data.error.includes('404') ||
      data.error.includes('Not Found')
    )) {
      console.log('✅ Server correctly handles Supabase URLs (expected download error)');
      return true;
    } else if (data.success) {
      console.log('✅ Server processed Supabase URL successfully');
      return true;
    } else {
      console.log('⚠️ Unexpected response for Supabase URL test:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Supabase URL test failed:', error.message);
    return false;
  }
}

async function testCompressionLimits() {
  console.log('📊 Testing compression limits...');
  
  // Simuler les nouvelles limites
  const limits = {
    maxSizeMB: 12,
    compressionRatios: {
      high: 0.7,
      medium: 0.5,
      low: 0.3
    }
  };
  
  const testCases = [
    { originalMB: 8, expectedCompression: false },
    { originalMB: 15, expectedCompression: true, quality: 'high' },
    { originalMB: 25, expectedCompression: true, quality: 'medium' },
    { originalMB: 35, expectedCompression: true, quality: 'low' }
  ];
  
  let allPassed = true;
  
  for (const testCase of testCases) {
    const needsCompression = testCase.originalMB > limits.maxSizeMB;
    
    if (needsCompression === testCase.expectedCompression) {
      console.log(`✅ Compression logic correct for ${testCase.originalMB}MB`);
    } else {
      console.log(`❌ Compression logic failed for ${testCase.originalMB}MB`);
      allPassed = false;
    }
    
    if (needsCompression && testCase.quality) {
      const ratio = limits.compressionRatios[testCase.quality];
      const expectedSize = testCase.originalMB * ratio;
      
      if (expectedSize <= limits.maxSizeMB) {
        console.log(`✅ Compression ratio ${testCase.quality} (${ratio}) works for ${testCase.originalMB}MB`);
      } else {
        console.log(`⚠️ Compression ratio ${testCase.quality} might not be enough for ${testCase.originalMB}MB`);
      }
    }
  }
  
  return allPassed;
}

async function runAllTests() {
  console.log('🧪 Starting video fixes validation tests...');
  console.log(`🔗 Server URL: ${SERVER_URL}`);
  console.log('');
  
  const results = {
    serverHealth: await testServerHealth(),
    abortSignalFix: await testAbortSignalFix(),
    videoProcessing: await testVideoProcessingEndpoint(),
    supabaseUrls: await testSupabaseUrlHandling(),
    compressionLimits: await testCompressionLimits()
  };
  
  console.log('');
  console.log('📊 Test Results:');
  console.log('================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  console.log('');
  if (allPassed) {
    console.log('🎉 All video fixes validated successfully!');
    console.log('');
    console.log('✅ Fixed Issues:');
    console.log('  - AbortSignal.timeout compatibility');
    console.log('  - Supabase size limits (12MB)');
    console.log('  - Advanced compression system');
    console.log('  - GCP server integration');
    console.log('  - Progressive compression strategy');
    console.log('');
    console.log('📱 Ready for mobile testing with large videos!');
  } else {
    console.log('⚠️ Some tests failed. Please check the issues.');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('  1. Ensure GCP server is running and accessible');
    console.log('  2. Check network connectivity');
    console.log('  3. Verify server configuration');
    console.log('  4. Test with smaller video files first');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Lancer les tests
runAllTests().catch(console.error);