import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

// Version ultra-minimale pour éliminer toutes les sources d'erreur
export default function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'auth':
        return (
          <View style={styles.screen}>
            <Text style={styles.title}>Connexion</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setCurrentScreen('home')}
            >
              <Text style={styles.buttonText}>Se connecter (Mock)</Text>
            </TouchableOpacity>
          </View>
        );
      case 'camera':
        return (
          <View style={styles.screen}>
            <Text style={styles.title}>Caméra</Text>
            <Text style={styles.subtitle}>Fonctionnalité caméra à venir</Text>
          </View>
        );
      case 'history':
        return (
          <View style={styles.screen}>
            <Text style={styles.title}>Historique</Text>
            <Text style={styles.subtitle}>Vos analyses précédentes</Text>
          </View>
        );
      case 'profile':
        return (
          <View style={styles.screen}>
            <Text style={styles.title}>Profil</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setCurrentScreen('auth')}
            >
              <Text style={styles.buttonText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <View style={styles.screen}>
            <Text style={styles.title}>My Swing</Text>
            <Text style={styles.subtitle}>Bienvenue dans votre app de golf !</Text>
            <Text style={styles.status}>✅ App fonctionnelle sans erreur</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderScreen()}
      
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, currentScreen === 'home' && styles.activeTab]}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.tabText}>🏠 Accueil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, currentScreen === 'camera' && styles.activeTab]}
          onPress={() => setCurrentScreen('camera')}
        >
          <Text style={styles.tabText}>📷 Caméra</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, currentScreen === 'history' && styles.activeTab]}
          onPress={() => setCurrentScreen('history')}
        >
          <Text style={styles.tabText}>📊 Historique</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, currentScreen === 'profile' && styles.activeTab]}
          onPress={() => setCurrentScreen('profile')}
        >
          <Text style={styles.tabText}>👤 Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#f0fdf4',
  },
  tabText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
});