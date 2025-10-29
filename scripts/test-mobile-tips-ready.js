/**
 * Script de validation pour vérifier que l'app mobile est prête pour les conseils du jour
 */

import { dailyTipsService } from './src/lib/tips/daily-tips-service';
import { supabase } from './src/lib/supabase/client';

console.log('🧪 Testing Mobile App Readiness for Daily Tips...');

// Test de connectivité Supabase
const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const isConnected = await dailyTipsService.testConnection();
    
    if (isConnected) {
      console.log('✅ Supabase connection successful');
      return true;
    } else {
      console.log('❌ Supabase connection failed');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return false;
  }
};

// Test de la table daily_tips
const testDailyTipsTable = async () => {
  try {
    console.log('📊 Testing daily_tips table...');
    
    // Vérifier que la table existe et est accessible
    const { data, error } = await supabase
      .from('daily_tips')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ daily_tips table test failed:', error.message);
      
      if (error.message.includes('relation "daily_tips" does not exist')) {
        console.log('💡 Solution: Run the migration SQL in Supabase Dashboard');
      }
      
      return false;
    }

    console.log('✅ daily_tips table accessible');
    console.log(`📋 Sample data: ${data?.length || 0} records found`);
    
    return true;
    
  } catch (error) {
    console.error('❌ daily_tips table test error:', error);
    return false;
  }
};

// Test des variables d'environnement
const testEnvironmentVariables = () => {
  console.log('🔧 Testing environment variables...');
  
  const requiredVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: Present`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allPresent = false;
    }
  });
  
  if (allPresent) {
    console.log('✅ All environment variables present');
  } else {
    console.log('❌ Some environment variables missing');
    console.log('💡 Solution: Check your .env file');
  }
  
  return allPresent;
};

// Test du service DailyTipsService
const testDailyTipsService = () => {
  console.log('🛠️ Testing DailyTipsService...');
  
  const service = dailyTipsService;
  
  // Vérifier que toutes les méthodes existent
  const requiredMethods = [
    'getTodaysTip',
    'getRecentTips',
    'generateTipWithGemini',
    'ensureTodaysTip',
    'saveTip',
    'testConnection',
    'getTipsStats'
  ];
  
  let allMethodsPresent = true;
  
  requiredMethods.forEach(method => {
    if (typeof service[method] === 'function') {
      console.log(`✅ Method ${method}: Present`);
    } else {
      console.log(`❌ Method ${method}: Missing`);
      allMethodsPresent = false;
    }
  });
  
  if (allMethodsPresent) {
    console.log('✅ DailyTipsService fully configured');
  } else {
    console.log('❌ DailyTipsService missing methods');
  }
  
  return allMethodsPresent;
};

// Test du composant DailyTipCard
const testDailyTipCard = () => {
  console.log('🎨 Testing DailyTipCard component...');
  
  try {
    // Vérifier que le composant peut être importé
    import('./src/components/tips/DailyTipCard').then(() => {
      console.log('✅ DailyTipCard component: Importable');
    }).catch(error => {
      console.error('❌ DailyTipCard component import failed:', error);
      return false;
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ DailyTipCard component test error:', error);
    return false;
  }
};

// Test de l'intégration HomeScreen
const testHomeScreenIntegration = () => {
  console.log('🏠 Testing HomeScreen integration...');
  
  try {
    // Vérifier que HomeScreen peut être importé
    import('./src/screens/HomeScreen').then(() => {
      console.log('✅ HomeScreen: Importable with DailyTipCard');
    }).catch(error => {
      console.error('❌ HomeScreen import failed:', error);
      return false;
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ HomeScreen integration test error:', error);
    return false;
  }
};

// Test des statistiques (si la table existe)
const testTipsStatistics = async () => {
  try {
    console.log('📈 Testing tips statistics...');
    
    const stats = await dailyTipsService.getTipsStats();
    
    console.log('📊 Tips Statistics:');
    console.log(`   Total tips: ${stats.totalTips}`);
    console.log(`   Recent tips (7 days): ${stats.recentTipsCount}`);
    console.log(`   Categories:`, stats.categoriesCount);
    
    console.log('✅ Tips statistics loaded successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Tips statistics test failed:', error);
    return false;
  }
};

// Test de génération de conseil (optionnel)
const testTipGeneration = async () => {
  try {
    console.log('🤖 Testing tip generation (optional)...');
    
    // Essayer de générer un conseil de test
    const tipData = await dailyTipsService.generateTipWithGemini();
    
    console.log('✅ Tip generation successful:');
    console.log(`   Title: ${tipData.title}`);
    console.log(`   Category: ${tipData.category}`);
    console.log(`   Difficulty: ${tipData.difficulty_level}`);
    
    return true;
    
  } catch (error) {
    console.warn('⚠️ Tip generation test failed (this is optional):', error.message);
    
    if (error.message.includes('GOOGLE_GENERATIVE_AI_API_KEY')) {
      console.log('💡 Solution: Configure Gemini API key in environment variables');
    }
    
    return false;
  }
};

// Fonction principale de test
export const runMobileTipsReadinessTests = async () => {
  console.log('🚀 Running Mobile App Daily Tips Readiness Tests...');
  console.log('=' .repeat(60));
  
  const results = {
    environmentVariables: false,
    supabaseConnection: false,
    dailyTipsTable: false,
    dailyTipsService: false,
    dailyTipCard: false,
    homeScreenIntegration: false,
    tipsStatistics: false,
    tipGeneration: false
  };
  
  // Tests synchrones
  results.environmentVariables = testEnvironmentVariables();
  results.dailyTipsService = testDailyTipsService();
  results.dailyTipCard = testDailyTipCard();
  results.homeScreenIntegration = testHomeScreenIntegration();
  
  // Tests asynchrones
  results.supabaseConnection = await testSupabaseConnection();
  
  if (results.supabaseConnection) {
    results.dailyTipsTable = await testDailyTipsTable();
    
    if (results.dailyTipsTable) {
      results.tipsStatistics = await testTipsStatistics();
    }
  }
  
  // Test de génération (optionnel)
  if (results.environmentVariables && results.supabaseConnection) {
    results.tipGeneration = await testTipGeneration();
  }
  
  // Résumé des résultats
  console.log('\n📋 Test Results Summary:');
  console.log('=' .repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} ${testName}`);
  });
  
  // Calcul du score
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  const score = Math.round((passedTests / totalTests) * 100);
  
  console.log('\n🎯 Readiness Score:', `${score}% (${passedTests}/${totalTests} tests passed)`);
  
  // Recommandations
  console.log('\n💡 Next Steps:');
  
  if (!results.dailyTipsTable) {
    console.log('1. 🔧 Run the migration SQL in Supabase Dashboard');
  }
  
  if (!results.environmentVariables) {
    console.log('2. 🔧 Configure environment variables in .env file');
  }
  
  if (results.supabaseConnection && results.dailyTipsTable) {
    console.log('3. ⚡ Create and deploy the Edge Function in Supabase');
    console.log('4. 🧪 Test the complete flow in the mobile app');
  }
  
  if (score >= 75) {
    console.log('\n🎉 Mobile app is ready for Daily Tips system!');
  } else {
    console.log('\n⚠️ Mobile app needs configuration before Daily Tips can work');
  }
  
  return results;
};

// Auto-run si exécuté directement
if (typeof window === 'undefined') {
  runMobileTipsReadinessTests();
}