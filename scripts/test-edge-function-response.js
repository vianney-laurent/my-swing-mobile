#!/usr/bin/env node

/**
 * Script de test pour vérifier que l'edge function retourne bien toutes les données d'analyse
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

async function testEdgeFunctionResponse() {
  console.log('🧪 Test de l\'edge function analyze-video');
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

    // 2. Récupérer une analyse récente pour tester le parsing
    console.log('📊 Récupération d\'une analyse récente...');
    const { data: analyses, error: analysesError } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (analysesError) {
      console.error('❌ Erreur lors de la récupération des analyses:', analysesError);
      return;
    }

    if (!analyses || analyses.length === 0) {
      console.log('❌ Aucune analyse trouvée');
      console.log('💡 Effectuez d\'abord une analyse dans l\'app');
      return;
    }

    const analysis = analyses[0];
    console.log('✅ Analyse trouvée:', analysis.id);
    console.log('  - Date:', new Date(analysis.created_at).toLocaleString());
    console.log('  - Club:', analysis.club_used);
    console.log('  - Score global:', analysis.overall_score);
    console.log('');

    // 3. Analyser la réponse Gemini
    console.log('🔍 Analyse de la réponse Gemini...');
    
    if (!analysis.gemini_response) {
      console.log('❌ Pas de réponse Gemini dans cette analyse');
      console.log('💡 Cette analyse utilise peut-être l\'ancien format');
      return;
    }

    let geminiResponse;
    try {
      geminiResponse = typeof analysis.gemini_response === 'string' 
        ? JSON.parse(analysis.gemini_response)
        : analysis.gemini_response;
    } catch (parseError) {
      console.error('❌ Erreur lors du parsing de la réponse Gemini:', parseError);
      console.log('Raw response preview:', 
        typeof analysis.gemini_response === 'string' 
          ? analysis.gemini_response.substring(0, 200) + '...'
          : 'Not a string'
      );
      return;
    }

    console.log('✅ Réponse Gemini parsée avec succès');
    console.log('');

    // 4. Vérifier la structure de la réponse
    console.log('📋 Structure de la réponse Gemini:');
    console.log('  - overall_score:', geminiResponse.overall_score || 'MANQUANT');
    console.log('  - key_insights:', geminiResponse.key_insights?.length || 'MANQUANT');
    console.log('  - recommendations:', geminiResponse.recommendations?.length || 'MANQUANT');
    console.log('  - swing_phases:', geminiResponse.swing_phases ? Object.keys(geminiResponse.swing_phases).length : 'MANQUANT');
    console.log('  - technical_analysis:', geminiResponse.technical_analysis ? Object.keys(geminiResponse.technical_analysis).length : 'MANQUANT');
    console.log('');

    // 5. Détail des key_insights
    if (geminiResponse.key_insights && geminiResponse.key_insights.length > 0) {
      console.log('🔍 Détail des key_insights:');
      geminiResponse.key_insights.forEach((insight, index) => {
        console.log(`  ${index + 1}. [${insight.category}] ${insight.title}`);
        console.log(`     Sévérité: ${insight.severity}`);
        console.log(`     Timestamp: ${insight.timestamp}s`);
        console.log(`     Description: ${insight.description.substring(0, 100)}...`);
        console.log('');
      });
    } else {
      console.log('❌ Aucun key_insights trouvé');
    }

    // 6. Détail des recommendations
    if (geminiResponse.recommendations && geminiResponse.recommendations.length > 0) {
      console.log('💡 Détail des recommendations:');
      geminiResponse.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. [${rec.priority}] ${rec.title}`);
        console.log(`     Description: ${rec.description.substring(0, 100)}...`);
        console.log(`     Drill: ${rec.drill_suggestion?.substring(0, 100) || 'Non spécifié'}...`);
        console.log('');
      });
    } else {
      console.log('❌ Aucune recommendation trouvée');
    }

    // 7. Détail des swing_phases
    if (geminiResponse.swing_phases) {
      console.log('🏌️ Détail des swing_phases:');
      Object.entries(geminiResponse.swing_phases).forEach(([phase, data]) => {
        console.log(`  - ${phase}: ${data.score}%`);
        console.log(`    Feedback: ${data.feedback.substring(0, 100)}...`);
        console.log('');
      });
    } else {
      console.log('❌ Aucune swing_phases trouvée');
    }

    // 8. Détail de l'analyse technique
    if (geminiResponse.technical_analysis) {
      console.log('🔧 Analyse technique:');
      Object.entries(geminiResponse.technical_analysis).forEach(([aspect, analysis]) => {
        console.log(`  - ${aspect}: ${analysis.substring(0, 100)}...`);
      });
      console.log('');
    } else {
      console.log('❌ Aucune analyse technique trouvée');
    }

    // 9. Résumé de la complétude
    console.log('📊 Résumé de la complétude des données:');
    const completeness = {
      'Score global': !!geminiResponse.overall_score,
      'Insights clés': !!(geminiResponse.key_insights && geminiResponse.key_insights.length > 0),
      'Recommandations': !!(geminiResponse.recommendations && geminiResponse.recommendations.length > 0),
      'Phases du swing': !!geminiResponse.swing_phases,
      'Analyse technique': !!geminiResponse.technical_analysis
    };

    Object.entries(completeness).forEach(([aspect, present]) => {
      console.log(`  ${present ? '✅' : '❌'} ${aspect}`);
    });

    const completeCount = Object.values(completeness).filter(Boolean).length;
    const totalCount = Object.keys(completeness).length;
    
    console.log('');
    console.log(`📈 Complétude globale: ${completeCount}/${totalCount} (${Math.round(completeCount/totalCount*100)}%)`);

    if (completeCount === totalCount) {
      console.log('🎉 Toutes les données sont présentes !');
    } else {
      console.log('⚠️ Certaines données manquent dans la réponse Gemini');
      console.log('💡 Vérifiez le prompt dans l\'edge function');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Fonction principale
async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: node scripts/test-edge-function-response.js');
    console.log('');
    console.log('Ce script teste la complétude des réponses de l\'edge function analyze-video.');
    console.log('Il vérifie qu\'une analyse récente contient bien tous les champs attendus.');
    return;
  }
  
  await testEdgeFunctionResponse();
}

if (require.main === module) {
  main().catch(console.error);
}