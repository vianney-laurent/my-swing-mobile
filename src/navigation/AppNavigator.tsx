import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase/client';
import AnalysisScreen from '../screens/AnalysisScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnalysisResultScreen from '../screens/AnalysisResultScreen';
import HomeScreen from '../screens/HomeScreen';
import AuthScreen from '../screens/AuthScreen';
import SimpleTabBar from '../components/navigation/SimpleTabBar';
import { useNavigation, Screen } from '../hooks/useNavigation';

export default function AppNavigator() {
  const { currentScreen, analysisId, navigate, goBack } = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Logs de debug pour diagnostiquer la navbar
  console.log('🔍 [AppNavigator] Current screen:', currentScreen);
  console.log('🔍 [AppNavigator] User connected:', !!user);
  console.log('🔍 [AppNavigator] Loading:', loading);

  // Vérifier la session au démarrage et écouter les changements
  useEffect(() => {
    checkSession();
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, !!session?.user);
      
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        navigate('auth');
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        navigate('home');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (!session?.user) {
        navigate('auth');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      navigate('auth');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    navigate('home');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingScreen}>
          <Text style={styles.title}>My Swing</Text>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.subtitle}>Chargement...</Text>
        </View>
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'auth':
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
      case 'camera':
        return <AnalysisScreen navigation={{ 
          navigate: (screen: string, params?: any) => {
            if (screen === 'AnalysisResult' && params?.analysisId) {
              navigate('analysisResult', { analysisId: params.analysisId });
            } else {
              navigate(screen as Screen);
            }
          }, 
          goBack: () => navigate('home') 
        }} />;
      case 'history':
        return <HistoryScreen navigation={{ 
          navigate: (screen: string, params?: any) => {
            if (screen === 'AnalysisResult' && params?.analysisId) {
              navigate('analysisResult', { analysisId: params.analysisId });
            } else {
              navigate(screen as Screen);
            }
          }, 
          goBack: () => navigate('home') 
        }} />;
      case 'analysisResult':
        return analysisId ? <AnalysisResultScreen 
          route={{ params: { analysisId } }} 
          navigation={{ goBack }} 
        /> : null;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen navigation={{ 
          navigate: (screen: string, params?: any) => {
            if (screen === 'AnalysisResult' && params?.analysisId) {
              navigate('analysisResult', { analysisId: params.analysisId });
            } else {
              navigate(screen as Screen);
            }
          }, 
          goBack: () => navigate('home') 
        }} />;
    }
  };

  // Ne montrer les onglets que si l'utilisateur est connecté
  const showNavbar = currentScreen !== 'auth';
  console.log('🔍 [AppNavigator] Showing navbar:', showNavbar);

  if (currentScreen === 'auth') {
    return renderScreen();
  }

  return (
    <View style={styles.container}>
      {/* Contenu plein écran qui passe derrière la navbar */}
      <View style={styles.fullScreenContainer}>
        {renderScreen()}
      </View>
      
      {/* Navbar flottante en position absolue */}
      <SimpleTabBar 
        currentScreen={currentScreen}
        onTabPress={(screen) => navigate(screen as Screen)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  fullScreenContainer: {
    flex: 1,
    // Le contenu utilise tout l'écran, la navbar flotte par-dessus
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
});