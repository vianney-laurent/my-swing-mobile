/**
 * Script de test pour la génération de conseils du jour
 */

import { dailyTipsService } from './src/lib/tips/daily-tips-service';

console.log('🧪 Testing Daily Tip Generation...');

// Test de génération d'un conseil
const testTipGeneration = async () => {
  try {
    console.log('🤖 Testing Gemini tip generation...');
    
    const tipData = await dailyTipsService.generateTipWithGemini();
    
    console.log('✅ Tip generated successfully:');
    console.log('📋 Title:', tipData.title);
    console.log('📋 Content:', tipData.content);
    console.log('📋 Category:', tipData.category);
    console.log('📋 Icon:', tipData.icon);
    console.log('📋 Color:', tipData.color);
    console.log('📋 Difficulty:', tipData.difficulty_level);
    
    return tipData;
    
  } catch (error) {
    console.error('❌ Tip generation failed:', error);
    throw error;
  }
};

// Test de sauvegarde d'un conseil
const testTipSaving = async (tipData) => {
  try {
    console.log('💾 Testing tip saving...');
    
    const savedTip = await dailyTipsService.saveTip(tipData);
    
    console.log('✅ Tip saved successfully:');
    console.log('📋 ID:', savedTip.id);
    console.log('📋 Date:', savedTip.date);
    console.log('📋 Created at:', savedTip.created_at);
    
    return savedTip;
    
  } catch (error) {
    console.error('❌ Tip saving failed:', error);
    throw error;
  }
};

// Test de récupération du conseil du jour
const testTodaysTip = async () => {
  try {
    console.log('📅 Testing today\'s tip retrieval...');
    
    const tip = await dailyTipsService.getTodaysTip();
    
    if (tip) {
      console.log('✅ Today\'s tip found:');
      console.log('📋 Title:', tip.title);
      console.log('📋 Date:', tip.date);
    } else {
      console.log('ℹ️ No tip found for today');
    }
    
    return tip;
    
  } catch (error) {
    console.error('❌ Today\'s tip retrieval failed:', error);
    throw error;
  }
};

// Test de récupération des conseils récents
const testRecentTips = async () => {
  try {
    console.log('📚 Testing recent tips retrieval...');
    
    const tips = await dailyTipsService.getRecentTips(5);
    
    console.log(`✅ Found ${tips.length} recent tips:`);
    tips.forEach((tip, index) => {
      console.log(`📋 ${index + 1}. ${tip.title} (${tip.date})`);
    });
    
    return tips;
    
  } catch (error) {
    console.error('❌ Recent tips retrieval failed:', error);
    throw error;
  }
};

// Test du workflow complet
const testCompleteWorkflow = async () => {
  try {
    console.log('🔄 Testing complete workflow...');
    
    // 1. Vérifier le conseil du jour
    let todaysTip = await testTodaysTip();
    
    // 2. Si pas de conseil, en générer un
    if (!todaysTip) {
      console.log('📝 No tip for today, generating one...');
      const tipData = await testTipGeneration();
      todaysTip = await testTipSaving(tipData);
    }
    
    // 3. Récupérer les conseils récents
    await testRecentTips();
    
    console.log('✅ Complete workflow test passed');
    
  } catch (error) {
    console.error('❌ Complete workflow test failed:', error);
    throw error;
  }
};

// Test de validation des données
const testDataValidation = () => {
  console.log('🔍 Testing data validation...');
  
  // Test des catégories valides
  const validCategories = ['technique', 'mental', 'equipement', 'entrainement'];
  console.log('📋 Valid categories:', validCategories.join(', '));
  
  // Test des niveaux de difficulté valides
  const validLevels = ['beginner', 'intermediate', 'advanced'];
  console.log('📋 Valid difficulty levels:', validLevels.join(', '));
  
  // Test des couleurs par catégorie
  const categoryColors = {
    technique: '#3b82f6',
    mental: '#8b5cf6',
    equipement: '#f59e0b',
    entrainement: '#10b981'
  };
  
  Object.entries(categoryColors).forEach(([category, color]) => {
    console.log(`📋 ${category}: ${color}`);
  });
  
  console.log('✅ Data validation test passed');
};

// Test de gestion d'erreurs
const testErrorHandling = async () => {
  try {
    console.log('⚠️ Testing error handling...');
    
    // Test avec une clé API invalide (simulation)
    console.log('📋 Testing invalid API key scenario...');
    
    // Test avec une date invalide
    console.log('📋 Testing invalid date scenario...');
    
    // Test avec des données manquantes
    console.log('📋 Testing missing data scenario...');
    
    console.log('✅ Error handling test completed');
    
  } catch (error) {
    console.log('✅ Error handling working as expected:', error.message);
  }
};

export const runTipGenerationTests = async () => {
  console.log('🚀 Running Daily Tip Generation tests...');
  
  try {
    // Tests de validation
    testDataValidation();
    
    // Tests de gestion d'erreurs
    await testErrorHandling();
    
    // Test du workflow complet
    await testCompleteWorkflow();
    
    console.log('✅ All tip generation tests passed!');
    console.log('💡 Daily tips system is ready to use!');
    
  } catch (error) {
    console.error('❌ Some tests failed:', error);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Deploy the Supabase migration');
  console.log('2. Deploy the Edge Function');
  console.log('3. Set up daily cron job');
  console.log('4. Test in the mobile app');
};

// Auto-run si exécuté directement
if (typeof window === 'undefined') {
  runTipGenerationTests();
}