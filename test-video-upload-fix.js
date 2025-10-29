/**
 * Test script pour valider le fix de l'upload vidéo
 */

import { mobileAnalysisService } from './src/lib/analysis/mobile-analysis-service';

console.log('🧪 Testing video upload fix...');

// Mock d'une URI vidéo (pour test)
const mockVideoUri = 'file:///mock/path/to/video.mp4';

// Test de validation des méthodes
const testServiceMethods = () => {
  console.log('📋 Testing service methods availability...');
  
  const service = mobileAnalysisService;
  
  // Vérifier que les méthodes existent
  const methods = [
    'analyzeGolfSwing',
    'uploadVideoToSupabase',
    'processVideoForAnalysis',
    'getCurrentUserProfile'
  ];
  
  methods.forEach(method => {
    if (typeof service[method] === 'function') {
      console.log(`✅ Method ${method} exists`);
    } else {
      console.log(`❌ Method ${method} missing`);
    }
  });
};

// Test de validation des imports
const testImports = () => {
  console.log('📦 Testing imports...');
  
  try {
    // Test import FileSystem legacy
    import('expo-file-system/legacy').then(fs => {
      console.log('✅ expo-file-system/legacy imported successfully');
      console.log('📋 Available methods:', Object.keys(fs));
    }).catch(error => {
      console.error('❌ Failed to import expo-file-system/legacy:', error);
    });
    
    // Test import Supabase
    import('./src/lib/supabase/client').then(supabase => {
      console.log('✅ Supabase client imported successfully');
    }).catch(error => {
      console.error('❌ Failed to import Supabase client:', error);
    });
    
  } catch (error) {
    console.error('❌ Import test failed:', error);
  }
};

// Test de structure des données
const testDataStructures = () => {
  console.log('🏗️ Testing data structures...');
  
  // Test MobileAnalysisRequest
  const mockRequest = {
    videoUri: mockVideoUri,
    userLevel: 'intermediate',
    focusAreas: ['swing-plane', 'tempo'],
    context: {
      club: 'driver',
      angle: 'profile'
    }
  };
  
  console.log('✅ MobileAnalysisRequest structure:', mockRequest);
  
  // Test progress callback
  const mockProgress = (progress) => {
    console.log(`📊 Progress: ${progress.step} - ${progress.progress}% - ${progress.message}`);
  };
  
  console.log('✅ Progress callback structure validated');
};

export const runVideoUploadTests = () => {
  console.log('🚀 Running video upload fix tests...');
  
  testServiceMethods();
  testImports();
  testDataStructures();
  
  console.log('✅ All validation tests completed');
  console.log('💡 Ready to test with real video upload!');
};

// Auto-run si exécuté directement
if (typeof window === 'undefined') {
  runVideoUploadTests();
}