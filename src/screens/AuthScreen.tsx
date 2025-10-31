import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase/client';
import { AuthService } from '../lib/auth/auth-service';
import SignupForm from '../components/auth/SignupForm';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true); // Activé par défaut

  // Charger le dernier email utilisé au montage du composant
  React.useEffect(() => {
    const loadLastEmail = async () => {
      try {
        const lastEmail = await AuthService.getLastUsedEmail();
        if (lastEmail) {
          setEmail(lastEmail);
          console.log('📧 Last used email loaded:', lastEmail);
        }
      } catch (error) {
        console.error('❌ Error loading last email:', error);
      }
    };

    loadLastEmail();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      
      // Mode connexion seulement
      {
        const result = await AuthService.signIn({
          email: email.trim(),
          password: password,
          rememberMe: rememberMe,
        });
        
        if (result.error) {
          Alert.alert('Erreur de connexion', AuthService.formatAuthError(result.error));
        } else if (result.user) {
          console.log('✅ Authentication successful, remember me:', rememberMe);
          onAuthSuccess(result.user);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Email requis', 'Veuillez saisir votre adresse email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Email invalide', 'Veuillez saisir une adresse email valide');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'myswing://reset-password', // Deep link pour l'app mobile
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          Alert.alert('Trop de tentatives', 'Veuillez patienter avant de réessayer.');
        } else {
          Alert.alert('Erreur', 'Une erreur s\'est produite. Veuillez réessayer.');
        }
      } else {
        setResetEmailSent(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  // Écran de confirmation d'email envoyé
  if (resetEmailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: '#10b981' }]}>
              <Ionicons name="checkmark" size={48} color="white" />
            </View>
            <Text style={styles.title}>Email envoyé !</Text>
            <Text style={styles.subtitle}>
              Nous avons envoyé un lien de réinitialisation à {email}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.infoBox}>
              <Ionicons name="mail" size={24} color="#3b82f6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Vérifiez votre email</Text>
                <Text style={styles.infoText}>
                  Cliquez sur le lien dans l'email pour créer un nouveau mot de passe.
                </Text>
              </View>
            </View>

            <View style={styles.helpBox}>
              <Text style={styles.helpTitle}>Vous ne voyez pas l'email ?</Text>
              <Text style={styles.helpText}>• Vérifiez votre dossier spam</Text>
              <Text style={styles.helpText}>• L'email peut prendre quelques minutes</Text>
              <Text style={styles.helpText}>• Vérifiez que l'adresse est correcte</Text>
            </View>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => {
                setResetEmailSent(false);
                setShowForgotPassword(false);
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#64748b" />
              <Text style={styles.secondaryButtonText}>Retour à la connexion</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Écran de mot de passe oublié
  if (showForgotPassword) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: '#3b82f6' }]}>
                <Ionicons name="mail" size={48} color="white" />
              </View>
              <Text style={styles.title}>Mot de passe oublié ?</Text>
              <Text style={styles.subtitle}>
                Saisissez votre email pour recevoir un lien de réinitialisation
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <TouchableOpacity 
                style={[styles.authButton, loading && styles.authButtonDisabled]}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Ionicons name="mail" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.authButtonText}>
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => setShowForgotPassword(false)}
              >
                <Ionicons name="arrow-back" size={20} color="#64748b" />
                <Text style={styles.secondaryButtonText}>Retour à la connexion</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              <Text style={styles.securityText}>
                Le lien expire dans 1 heure et ne peut être utilisé qu'une seule fois.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Écran d'inscription
  if (isSignUp) {
    return (
      <SignupForm
        onSuccess={() => {
          setIsSignUp(false);
          Alert.alert(
            'Inscription réussie !',
            'Vérifiez votre email pour confirmer votre compte, puis connectez-vous.'
          );
        }}
        onBackToSignIn={() => setIsSignUp(false)}
      />
    );
  }

  // Écran principal de connexion
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="golf" size={48} color="#10b981" />
            </View>
            <Text style={styles.title}>My Swing</Text>
            <Text style={styles.subtitle}>
              Connectez-vous à votre compte
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#94a3b8"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholderTextColor="#94a3b8"
              />
            </View>
            
            {/* Se souvenir de moi - seulement en mode connexion */}
            {!isSignUp && (
              <TouchableOpacity 
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.rememberMeText}>Se souvenir de moi</Text>
              </TouchableOpacity>
            )}

            {/* Mot de passe oublié - seulement en mode connexion */}
            {!isSignUp && (
              <TouchableOpacity 
                style={styles.forgotPasswordLink}
                onPress={() => setShowForgotPassword(true)}
              >
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.authButton, loading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.authButtonText}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Text>
            </TouchableOpacity>

            {/* Toggle Auth Mode */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                Pas encore de compte ?
              </Text>
              <TouchableOpacity onPress={() => setIsSignUp(true)}>
                <Text style={styles.toggleLink}>
                  S'inscrire
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <Text style={styles.featuresTitle}>Analysez votre swing de golf</Text>
            
            <View style={styles.feature}>
              <Ionicons name="videocam" size={24} color="#10b981" />
              <Text style={styles.featureText}>Enregistrement vidéo intelligent</Text>
            </View>
            
            <View style={styles.feature}>
              <Ionicons name="analytics" size={24} color="#10b981" />
              <Text style={styles.featureText}>Analyse IA personnalisée</Text>
            </View>
            
            <View style={styles.feature}>
              <Ionicons name="trending-up" size={24} color="#10b981" />
              <Text style={styles.featureText}>Suivi de vos progrès</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    marginBottom: 48,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  authButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  toggleText: {
    fontSize: 14,
    color: '#64748b',
  },
  toggleLink: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  features: {
    flex: 1,
    justifyContent: 'center',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureText: {
    fontSize: 16,
    color: '#475569',
    marginLeft: 16,
    fontWeight: '500',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  helpBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
});