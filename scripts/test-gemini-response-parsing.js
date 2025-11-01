#!/usr/bin/env node

/**
 * Script de test pour vérifier le parsing des réponses Gemini
 * Simule une réponse Gemini et teste le parsing côté client
 */

// Exemple de réponse Gemini attendue (format de l'edge function)
const mockGeminiResponse = {
  "overall_score": 78,
  "key_insights": [
    {
      "category": "setup",
      "title": "Excellente posture d'adresse",
      "description": "Position équilibrée avec un bon alignement des pieds et des épaules",
      "severity": "positive",
      "timestamp": 0.5
    },
    {
      "category": "backswing",
      "title": "Rotation des hanches limitée",
      "description": "Les hanches ne tournent pas suffisamment pendant la montée",
      "severity": "needs_attention",
      "timestamp": 1.2
    },
    {
      "category": "impact",
      "title": "Contact solide avec la balle",
      "description": "Impact centré avec une bonne compression de la balle",
      "severity": "positive",
      "timestamp": 2.1
    },
    {
      "category": "downswing",
      "title": "Séquence de mouvement incorrecte",
      "description": "Les bras descendent avant les hanches, causant une perte de puissance",
      "severity": "needs_attention",
      "timestamp": 1.8
    }
  ],
  "recommendations": [
    {
      "priority": "high",
      "title": "Améliorer la rotation des hanches",
      "description": "Travaillez la mobilité des hanches pour une meilleure rotation",
      "drill_suggestion": "Exercices de rotation avec un bâton sur les épaules"
    },
    {
      "priority": "medium",
      "title": "Synchroniser la séquence de downswing",
      "description": "Initiez le mouvement par les hanches, puis les épaules",
      "drill_suggestion": "Swings lents en se concentrant sur l'ordre des mouvements"
    },
    {
      "priority": "low",
      "title": "Maintenir la posture d'adresse",
      "description": "Continuez à travailler votre setup, c'est un point fort",
      "drill_suggestion": "Répétition de la routine d'adresse"
    }
  ],
  "swing_phases": {
    "setup": {
      "score": 85,
      "feedback": "Excellente posture avec un bon équilibre et alignement"
    },
    "backswing": {
      "score": 70,
      "feedback": "Bon mouvement général mais rotation des hanches limitée"
    },
    "downswing": {
      "score": 65,
      "feedback": "Séquence à améliorer, les bras descendent trop tôt"
    },
    "impact": {
      "score": 82,
      "feedback": "Contact solide et centré, bonne compression"
    },
    "follow_through": {
      "score": 75,
      "feedback": "Finition équilibrée mais pourrait être plus complète"
    }
  },
  "technical_analysis": {
    "tempo": "Tempo légèrement rapide, essayez de ralentir la transition",
    "balance": "Bon équilibre général avec une légère tendance à basculer vers l'avant",
    "club_path": "Chemin de club légèrement de l'intérieur, bon pour éviter le slice",
    "face_angle": "Face de club bien orientée à l'impact"
  }
};

// Fonction de parsing (copiée depuis AnalysisResultScreen)
function parseGeminiResponse(geminiResponse) {
  console.log('🔍 Parsing Gemini response...');
  console.log('Response keys:', Object.keys(geminiResponse));
  
  // Extraire les points forts depuis key_insights
  const strengths = geminiResponse?.key_insights?.filter(insight => 
    insight.severity === 'positive'
  ).map(insight => ({
    strength: insight.title,
    evidence: insight.description,
    impact: `Observé à ${insight.timestamp}s`
  })) || [];

  // Extraire les problèmes critiques depuis key_insights
  const criticalIssues = geminiResponse?.key_insights?.filter(insight => 
    insight.severity === 'needs_attention'
  ).map((insight, index) => ({
    issue: insight.title,
    timeEvidence: `Observé à ${insight.timestamp}s - ${insight.description}`,
    immediateAction: geminiResponse?.recommendations?.[index]?.description || 'Travaillez sur cet aspect',
    expectedImprovement: geminiResponse?.recommendations?.[index]?.drill_suggestion || 'Amélioration progressive',
    priority: geminiResponse?.recommendations?.[index]?.priority === 'high' ? 1 : 
             geminiResponse?.recommendations?.[index]?.priority === 'medium' ? 2 : 3
  })) || [];

  // Extraire les conseils actionnables depuis recommendations
  const actionableAdvice = geminiResponse?.recommendations?.map((rec, index) => ({
    category: rec.priority === 'high' ? 'Technique' : 'Amélioration',
    instruction: rec.description,
    howToTest: rec.drill_suggestion || 'Pratiquez régulièrement et observez les résultats',
    timeToSee: rec.priority === 'high' ? 'Quelques séances' : 'Plusieurs semaines',
    difficulty: rec.priority === 'high' ? 'medium' : 'easy'
  })) || [];

  // Extraire l'analyse technique depuis swing_phases et technical_analysis
  const swingAnalysis = {
    phases: geminiResponse?.swing_phases ? Object.entries(geminiResponse.swing_phases).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      quality: data.score || 75,
      observations: [data.feedback || 'Analyse en cours...']
    })) : [],
    tempo: geminiResponse?.technical_analysis?.tempo || 'Tempo analysé automatiquement',
    timing: geminiResponse?.technical_analysis?.balance || 'Équilibre évalué'
  };

  // Actions immédiates
  const immediateActions = {
    nextSession: geminiResponse?.recommendations?.filter(r => r.priority === 'high')
      .map(r => r.description).slice(0, 3) || [],
    thisWeek: geminiResponse?.recommendations?.filter(r => r.priority === 'medium')
      .map(r => r.description).slice(0, 3) || [],
    longTerm: geminiResponse?.recommendations?.filter(r => r.priority === 'low')
      .map(r => r.description).slice(0, 3) || []
  };

  return {
    overallScore: geminiResponse?.overall_score || 0,
    strengths,
    criticalIssues,
    actionableAdvice,
    immediateActions,
    swingAnalysis
  };
}

// Test principal
function testGeminiResponseParsing() {
  console.log('🧪 Test du parsing des réponses Gemini');
  console.log('=' .repeat(50));
  console.log('');

  try {
    const parsed = parseGeminiResponse(mockGeminiResponse);
    
    console.log('✅ Parsing réussi !');
    console.log('');
    
    console.log('📊 Résultats du parsing:');
    console.log('  - Score global:', parsed.overallScore);
    console.log('  - Points forts:', parsed.strengths.length);
    console.log('  - Problèmes critiques:', parsed.criticalIssues.length);
    console.log('  - Conseils actionnables:', parsed.actionableAdvice.length);
    console.log('  - Phases analysées:', parsed.swingAnalysis.phases.length);
    console.log('');
    
    console.log('🎯 Points forts détectés:');
    parsed.strengths.forEach((strength, index) => {
      console.log(`  ${index + 1}. ${strength.strength}`);
      console.log(`     Evidence: ${strength.evidence}`);
      console.log(`     Impact: ${strength.impact}`);
      console.log('');
    });
    
    console.log('⚠️  Problèmes critiques détectés:');
    parsed.criticalIssues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.issue} (Priorité ${issue.priority})`);
      console.log(`     Moment: ${issue.timeEvidence}`);
      console.log(`     Action: ${issue.immediateAction}`);
      console.log('');
    });
    
    console.log('💪 Conseils actionnables:');
    parsed.actionableAdvice.forEach((advice, index) => {
      console.log(`  ${index + 1}. [${advice.category}] ${advice.instruction}`);
      console.log(`     Test: ${advice.howToTest}`);
      console.log(`     Délai: ${advice.timeToSee}`);
      console.log('');
    });
    
    console.log('🔧 Analyse technique par phases:');
    parsed.swingAnalysis.phases.forEach(phase => {
      console.log(`  - ${phase.name}: ${phase.quality}%`);
      console.log(`    ${phase.observations[0]}`);
    });
    console.log('');
    
    console.log('⏱️  Tempo & Timing:');
    console.log(`  - Tempo: ${parsed.swingAnalysis.tempo}`);
    console.log(`  - Timing: ${parsed.swingAnalysis.timing}`);
    console.log('');
    
    console.log('📋 Plan d\'action:');
    console.log(`  - Prochaine séance: ${parsed.immediateActions.nextSession.length} actions`);
    console.log(`  - Cette semaine: ${parsed.immediateActions.thisWeek.length} actions`);
    console.log(`  - Long terme: ${parsed.immediateActions.longTerm.length} actions`);
    
  } catch (error) {
    console.error('❌ Erreur lors du parsing:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Exécution du test
if (require.main === module) {
  testGeminiResponseParsing();
}

module.exports = { parseGeminiResponse, mockGeminiResponse };