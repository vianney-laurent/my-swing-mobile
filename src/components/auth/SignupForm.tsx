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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../../lib/supabase/client';
import { SignupProfileService } from '../../lib/profile/signup-profile-service';
import { PendingProfileService } from '../../lib/profile/pending-profile-service';


interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  golf_index: string;
  dominant_hand: 'right' | 'left' | 'none';
  city: string;
}

interface SignupFormProps {
  onSuccess: () => void;
  onBackToSignIn: () => void;
}

export default function SignupForm({ onSuccess, onBackToSignIn }: SignupFormProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    golf_index: '',
    dominant_hand: 'none',
    city: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showDebug, setShowDebug] = useState(__DEV__); // Afficher les options de debug en mode développement

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = (): string | null => {
    if (!formData.first_name.trim()) {
      return 'Le prénom est requis';
    }
    if (!formData.last_name.trim()) {
      return 'Le nom est requis';
    }
    if (!formData.city.trim()) {
      return 'La ville est requise';
    }
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!formData.email.trim()) {
      return 'L\'email est requis';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Veuillez saisir un email valide';
    }

    if (formData.password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Les mots de passe ne correspondent pas';
    }

    if (formData.golf_index) {
      // Normalisation du handicap : virgule → point et suppression des espaces
      const normalizedIndex = formData.golf_index.replace(',', '.').trim();
      const index = parseFloat(normalizedIndex);
      
      console.log('🏌️ Handicap normalisé:', { 
        original: formData.golf_index, 
        normalized: normalizedIndex, 
        parsed: index 
      });
      
      if (isNaN(index) || index < 0 || index > 54) {
        return 'L\'index doit être un nombre entre 0 et 54';
      }
    }

    return null;
  };

  const handleNextStep = () => {
    const error = validateStep1();
    if (error) {
      Alert.alert('Erreur', error);
      return;
    }
    setCurrentStep(2);
  };



  const handleSubmit = async () => {
    const error = validateStep2();
    if (error) {
      Alert.alert('Erreur', error);
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Starting signup process...');
      
      // 1. Créer le compte utilisateur sans confirmation email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: undefined, // Pas de redirection email
        }
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        console.error('❌ No user returned from signup');
        throw new Error('Erreur lors de la création du compte');
      }

      console.log('✅ User created successfully:', authData.user.id);

      // 2. Préparer les données du profil avec normalisation du handicap
      const normalizedGolfIndex = formData.golf_index 
        ? parseFloat(formData.golf_index.replace(',', '.').trim())
        : null;
      
      const profileData = {
        id: authData.user.id,
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        golf_index: normalizedGolfIndex,
        dominant_hand: formData.dominant_hand === 'none' ? null : formData.dominant_hand,
        city: formData.city.trim()
      };
      
      console.log('📝 Données du profil préparées:', profileData);

      // 3. Valider les données du profil
      const validation = SignupProfileService.validateProfileData(profileData);
      if (!validation.isValid) {
        console.error('❌ Profile data validation failed:', validation.errors);
        throw new Error('Données du profil invalides: ' + validation.errors.join(', '));
      }

      // 4. Attendre que le trigger automatique crée le profil de base
      console.log('⏳ Waiting for trigger to create base profile...');
      await SignupProfileService.waitForTriggerProfile(authData.user.id, 5000);

      // 5. Créer le profil immédiatement (pas besoin d'attendre la confirmation email)
      console.log('✅ User created, creating profile immediately...');
      
      // 6. Créer le profil complet avec le service spécialisé
      const profileResult = await SignupProfileService.createSignupProfile(profileData);

      if (!profileResult.success) {
        console.error('❌ Profile creation failed:', profileResult.error);
        // Sauvegarder pour plus tard en cas d'échec
        const saved = await PendingProfileService.savePendingProfile(authData.user.id, profileData);
        if (saved) {
          console.log('💾 Profile data saved for completion on first login');
        }
      } else {
        console.log('✅ Profile created successfully:', profileResult.data);
      }

      // 7. Connecter automatiquement l'utilisateur
      console.log('🔐 Attempting automatic sign in...');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (signInError) {
        console.error('❌ Auto sign-in failed:', signInError);
        console.log('⚠️ User will need to sign in manually');
      } else {
        console.log('✅ User automatically signed in:', signInData.user?.id);
      }
      
      // Rediriger directement vers l'app (pas de pop-up)
      console.log('🏠 Redirecting to app...');
      onSuccess();

    } catch (error) {
      console.error('❌ Signup error:', error);
      Alert.alert(
        'Erreur d\'inscription',
        error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotActive]}>
            <Text style={styles.stepDotText}>1</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepDot}>
            <Text style={styles.stepDotText}>2</Text>
          </View>
        </View>
        <Text style={styles.stepTitle}>Informations personnelles</Text>
        <Text style={styles.stepSubtitle}>Parlez-nous de vous</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputRow}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Prénom *"
              value={formData.first_name}
              onChangeText={(value) => handleInputChange('first_name', value)}
              autoCapitalize="words"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nom *"
              value={formData.last_name}
              onChangeText={(value) => handleInputChange('last_name', value)}
              autoCapitalize="words"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Ville *"
            value={formData.city}
            onChangeText={(value) => handleInputChange('city', value)}
            autoCapitalize="words"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            Votre ville nous aide à vous proposer des conseils adaptés à la météo ⛅
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNextStep}
        >
          <Text style={styles.primaryButtonText}>Continuer</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onBackToSignIn}
        >
          <Ionicons name="arrow-back" size={20} color="#64748b" />
          <Text style={styles.secondaryButtonText}>Retour à la connexion</Text>
        </TouchableOpacity>


      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotCompleted]}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
          <View style={[styles.stepLine, styles.stepLineActive]} />
          <View style={[styles.stepDot, styles.stepDotActive]}>
            <Text style={styles.stepDotText}>2</Text>
          </View>
        </View>
        <Text style={styles.stepTitle}>Compte et golf</Text>
        <Text style={styles.stepSubtitle}>Finalisez votre inscription</Text>
      </View>

      <View style={styles.form}>
        {/* Informations de connexion */}
        <View style={styles.sectionHeader}>
          <Ionicons name="mail" size={18} color="#10b981" />
          <Text style={styles.sectionTitle}>Informations de connexion</Text>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
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
            placeholder="Mot de passe (min. 6 caractères) *"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmer le mot de passe *"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>
        </View>

        {/* Informations golf */}
        <View style={styles.sectionHeader}>
          <Ionicons name="golf" size={18} color="#10b981" />
          <Text style={styles.sectionTitle}>Informations golf (optionnel)</Text>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="trophy-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Index (0-54)"
            value={formData.golf_index}
            onChangeText={(value) => handleInputChange('golf_index', value)}
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.handSelectionContainer}>
          <View style={styles.handSelectionHeader}>
            <Ionicons name="hand-left-outline" size={20} color="#64748b" />
            <Text style={styles.handSelectionTitle}>Main dominante</Text>
          </View>

          <View style={styles.handOptions}>
            <TouchableOpacity
              style={[
                styles.handOption,
                formData.dominant_hand === 'none' && styles.handOptionSelected
              ]}
              onPress={() => handleInputChange('dominant_hand', 'none')}
            >
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={formData.dominant_hand === 'none' ? '#10b981' : '#64748b'}
              />
              <Text style={[
                styles.handOptionText,
                formData.dominant_hand === 'none' && styles.handOptionTextSelected
              ]}>
                Non spécifié
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.handOption,
                formData.dominant_hand === 'right' && styles.handOptionSelected
              ]}
              onPress={() => handleInputChange('dominant_hand', 'right')}
            >
              <Ionicons
                name="hand-right-outline"
                size={20}
                color={formData.dominant_hand === 'right' ? '#10b981' : '#64748b'}
              />
              <Text style={[
                styles.handOptionText,
                formData.dominant_hand === 'right' && styles.handOptionTextSelected
              ]}>
                Droitier
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.handOption,
                formData.dominant_hand === 'left' && styles.handOptionSelected
              ]}
              onPress={() => handleInputChange('dominant_hand', 'left')}
            >
              <Ionicons
                name="hand-left-outline"
                size={20}
                color={formData.dominant_hand === 'left' ? '#10b981' : '#64748b'}
              />
              <Text style={[
                styles.handOptionText,
                formData.dominant_hand === 'left' && styles.handOptionTextSelected
              ]}>
                Gaucher
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Text style={styles.primaryButtonText}>Création du compte...</Text>
            </>
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Créer mon compte</Text>
              <Ionicons name="checkmark" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setCurrentStep(1)}
        >
          <Ionicons name="arrow-back" size={20} color="#64748b" />
          <Text style={styles.secondaryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="golf" size={48} color="#10b981" />
            </View>
            <Text style={styles.title}>My Swing</Text>
            <Text style={styles.subtitle}>Créez votre compte</Text>
          </View>

          {currentStep === 1 ? renderStep1() : renderStep2()}
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
    marginBottom: 32,
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
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#10b981',
  },
  stepDotCompleted: {
    backgroundColor: '#10b981',
  },
  stepDotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#10b981',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
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
  eyeButton: {
    padding: 4,
  },
  handSelectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  handSelectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  handSelectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  handOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  handOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  handOptionSelected: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  handOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
  },
  handOptionTextSelected: {
    color: '#10b981',
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
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
});