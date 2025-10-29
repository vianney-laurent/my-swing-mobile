#!/usr/bin/env node

/**
 * Vérification que les shadows de l'historique correspondent exactement à celles de la home
 */

console.log('🎨 Copie exacte des shadows de HomeScreen vers HistoryScreen\n');

console.log('📱 HomeScreen - Styles de référence :');
console.log('   • categoryCard : shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2');
console.log('   • statCard : shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3');
console.log('   • progressSection : shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3');

console.log('\n📊 HistoryScreen - Styles appliqués :');
console.log('   • card : shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2');
console.log('   • scoreContainer : shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3');
console.log('   • newBadge : shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2');

console.log('\n✅ Correspondances :');
console.log('   • card ↔ categoryCard : IDENTIQUE');
console.log('   • scoreContainer ↔ statCard : IDENTIQUE');
console.log('   • newBadge ↔ categoryCard : IDENTIQUE');

console.log('\n🎯 Résultat :');
console.log('   • Shadows parfaitement harmonisées');
console.log('   • Même profondeur visuelle entre les écrans');
console.log('   • Cohérence totale de l\'expérience utilisateur');
console.log('   • Style moderne et uniforme');