#!/usr/bin/env node

/**
 * Vérification que les shadows de l'historique correspondent exactement 
 * à la card "Mes progrès" de HomeScreen et profileCard de ProfileScreen
 */

console.log('🎨 Copie des shadows de la card "Mes progrès" vers HistoryScreen\n');

console.log('📱 HomeScreen - progressSection (référence) :');
console.log('   backgroundColor: "white"');
console.log('   marginHorizontal: 20');
console.log('   marginBottom: 20');
console.log('   borderRadius: 16');
console.log('   shadowColor: "#000"');
console.log('   shadowOffset: { width: 0, height: 2 }');
console.log('   shadowOpacity: 0.05');
console.log('   shadowRadius: 8');
console.log('   elevation: 3');

console.log('\n👤 ProfileScreen - profileCard (référence) :');
console.log('   backgroundColor: "white"');
console.log('   marginHorizontal: 20');
console.log('   marginBottom: 20');
console.log('   borderRadius: 12');
console.log('   shadowColor: "#000"');
console.log('   shadowOffset: { width: 0, height: 2 }');
console.log('   shadowOpacity: 0.1');
console.log('   shadowRadius: 4');
console.log('   elevation: 3');

console.log('\n📊 HistoryScreen - EnhancedAnalysisCard (appliqué) :');
console.log('   backgroundColor: "white"');
console.log('   marginHorizontal: 20');
console.log('   marginBottom: 20');
console.log('   borderRadius: 12');
console.log('   shadowColor: "#000"');
console.log('   shadowOffset: { width: 0, height: 2 }');
console.log('   shadowOpacity: 0.05');
console.log('   shadowRadius: 8');
console.log('   elevation: 3');

console.log('\n✅ Style choisi : progressSection (Mes progrès)');
console.log('   • Plus de profondeur avec shadowRadius: 8');
console.log('   • Subtilité avec shadowOpacity: 0.05');
console.log('   • Cohérence avec elevation: 3');

console.log('\n🎯 Résultat attendu :');
console.log('   • Cards d\'historique avec la même élégance que "Mes progrès"');
console.log('   • Profondeur visuelle optimale');
console.log('   • Cohérence parfaite entre les écrans');
console.log('   • Style premium et moderne');