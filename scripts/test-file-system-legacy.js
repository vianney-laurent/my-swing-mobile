/**
 * Test script pour vérifier l'API legacy d'expo-file-system
 */

import * as FileSystem from 'expo-file-system/legacy';

console.log('🧪 Testing expo-file-system legacy API...');

// Test des méthodes disponibles
console.log('📋 Available methods:', Object.keys(FileSystem));

// Test de getInfoAsync
const testFileInfo = async () => {
  try {
    // Tester avec un fichier qui n'existe pas
    const info = await FileSystem.getInfoAsync('file://test-non-existent.mp4');
    console.log('✅ getInfoAsync works:', info);
    
    // Tester avec le répertoire de cache
    const cacheInfo = await FileSystem.getInfoAsync(FileSystem.cacheDirectory);
    console.log('✅ Cache directory info:', cacheInfo);
    
  } catch (error) {
    console.error('❌ FileSystem test failed:', error);
  }
};

// Test de readAsStringAsync
const testReadString = async () => {
  try {
    // Créer un fichier de test
    const testUri = FileSystem.cacheDirectory + 'test.txt';
    await FileSystem.writeAsStringAsync(testUri, 'Hello World', { encoding: 'utf8' });
    
    // Lire le fichier
    const content = await FileSystem.readAsStringAsync(testUri, { encoding: 'utf8' });
    console.log('✅ readAsStringAsync works:', content);
    
    // Nettoyer
    await FileSystem.deleteAsync(testUri);
    
  } catch (error) {
    console.error('❌ ReadString test failed:', error);
  }
};

export const runFileSystemTests = async () => {
  console.log('🚀 Running FileSystem legacy API tests...');
  await testFileInfo();
  await testReadString();
  console.log('✅ All tests completed');
};

// Auto-run si exécuté directement
if (typeof window === 'undefined') {
  runFileSystemTests();
}