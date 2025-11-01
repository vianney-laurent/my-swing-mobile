import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase/client';
import { profileService } from '../lib/profile/profile-service';
// ProfileScreen no longer needs direct analysis service import
import { UserProfile, ProfileFormData } from '../types/profile';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSafeBottomPadding } from '../hooks/useSafeBottomPadding';
import LegalModal from '../components/legal/LegalModal';
import SettingsModal from '../components/settings/SettingsModal';
import { ShimmerStatCard, ShimmerProfileField } from '../components/ui/ShimmerEffect';

interface UserStats {
  totalAnalyses: number;
  averageScore: number;
  bestScore: number;
}

interface ProfileScreenProps {
  onNavigateToHelp?: () => void;
}

export default function ProfileScreen({ onNavigateToHelp }: ProfileScreenProps) {
  const { containerPaddingBottom } = useSafeBottomPadding();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalAnalyses: 0,
    averageScore: 0,
    bestScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [legalModal, setLegalModal] = useState<{ visible: boolean; type: 'privacy' | 'terms' | 'cookies' | null }>({
    visible: false,
    type: null
  });
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [editForm, setEditForm] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    golf_index: '',
    dominant_hand: 'none',
    city: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // Get user profile
      const profileData = await profileService.getCurrentProfile();
      setProfile(profileData);

      if (profileData) {
        setEditForm({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          golf_index: profileData.golf_index?.toString() || '',
          dominant_hand: profileData.dominant_hand || 'none',
          city: profileData.city || '',
        });
      }

      // Get user analyses for stats - using empty array for now
      const analyses: any[] = [];
      const totalAnalyses = analyses.length;
      const scores = analyses.filter((a: any) => a.overall_score).map((a: any) => a.overall_score);
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a: any, b: any) => a + b, 0) / scores.length) : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

      setStats({ totalAnalyses, averageScore, bestScore });

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔐 Signing out user...');
              const { error } = await supabase.auth.signOut();
              
              if (error) {
                console.error('❌ Sign out error:', error);
                Alert.alert('Erreur', 'Erreur lors de la déconnexion');
              } else {
                console.log('✅ User signed out successfully');
                // La navigation sera gérée automatiquement par le listener dans AppNavigator
              }
            } catch (error) {
              console.error('❌ Sign out failed:', error);
              Alert.alert('Erreur', 'Erreur lors de la déconnexion');
            }
          }
        }
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      const result = await profileService.updateProfile(editForm);
      
      if (result.success) {
        Alert.alert('Succès', 'Profil mis à jour avec succès');
        setIsEditing(false);
        loadUserData();
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur inattendue');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
        <Text style={styles.subtitle}>Gérez vos informations</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingBottom: containerPaddingBottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {loading ? (
            <>
              <ShimmerStatCard />
              <ShimmerStatCard />
              <ShimmerStatCard />
            </>
          ) : (
            <>
              <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
                <Ionicons name="bar-chart" size={20} color="white" />
                <Text style={styles.statNumber}>{stats.totalAnalyses}</Text>
                <Text style={styles.statLabel}>Analyses</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
                <Ionicons name="analytics" size={20} color="white" />
                <Text style={styles.statNumber}>{stats.averageScore}</Text>
                <Text style={styles.statLabel}>Moyenne</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="trophy" size={20} color="white" />
                <Text style={styles.statNumber}>{stats.bestScore}</Text>
                <Text style={styles.statLabel}>Meilleur</Text>
              </View>
            </>
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileTitle}>Informations Personnelles</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil" size={16} color="#3b82f6" />
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileFields}>
            {loading ? (
              <>
                <ShimmerProfileField />
                <ShimmerProfileField />
                <ShimmerProfileField />
                <ShimmerProfileField />
                <ShimmerProfileField />
                <ShimmerProfileField />
              </>
            ) : (
              <>
                <View style={styles.profileField}>
                  <Ionicons name="person" size={20} color="#64748b" />
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Nom complet</Text>
                    <Text style={styles.fieldValue}>
                      {profile?.first_name && profile?.last_name 
                        ? `${profile.first_name} ${profile.last_name}`
                        : 'Non renseigné'
                      }
                    </Text>
                  </View>
                </View>

                <View style={styles.profileField}>
                  <Ionicons name="mail" size={20} color="#64748b" />
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <Text style={styles.fieldValue}>{user?.email}</Text>
                  </View>
                </View>

                <View style={styles.profileField}>
                  <Ionicons name="location" size={20} color="#64748b" />
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Ville</Text>
                    <Text style={styles.fieldValue}>
                      {profile?.city || 'Non renseignée'}
                    </Text>
                  </View>
                </View>

                <View style={styles.profileField}>
                  <Ionicons name="trophy" size={20} color="#64748b" />
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Index de golf</Text>
                    <Text style={styles.fieldValue}>
                      {profile?.golf_index ? profile.golf_index.toString() : 'Non renseigné'}
                    </Text>
                  </View>
                </View>

                <View style={styles.profileField}>
                  <Ionicons name="hand-left" size={20} color="#64748b" />
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Main dominante</Text>
                    <Text style={styles.fieldValue}>
                      {profile?.dominant_hand === 'right' ? 'Droitier' : 
                       profile?.dominant_hand === 'left' ? 'Gaucher' : 
                       'Non renseigné'}
                    </Text>
                  </View>
                </View>

                <View style={styles.profileField}>
                  <Ionicons name="calendar" size={20} color="#64748b" />
                  <View style={styles.fieldContent}>
                    <Text style={styles.fieldLabel}>Membre depuis</Text>
                    <Text style={styles.fieldValue}>
                      {user?.created_at ? formatDistanceToNow(new Date(user.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      }) : 'Récemment'}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Support & Legal Section */}
        <View style={styles.legalSection}>
          <Text style={styles.legalSectionTitle}>Support & Informations légales</Text>
          
          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => setLegalModal({ visible: true, type: 'privacy' })}
          >
            <View style={styles.legalItemContent}>
              <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
              <Text style={styles.legalItemText}>Politique de confidentialité</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => setLegalModal({ visible: true, type: 'terms' })}
          >
            <View style={styles.legalItemContent}>
              <Ionicons name="document-text" size={20} color="#3b82f6" />
              <Text style={styles.legalItemText}>Conditions d'utilisation</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => setLegalModal({ visible: true, type: 'cookies' })}
          >
            <View style={styles.legalItemContent}>
              <Ionicons name="settings" size={20} color="#3b82f6" />
              <Text style={styles.legalItemText}>Politique des cookies</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => {
              if (onNavigateToHelp) {
                onNavigateToHelp();
              } else {
                Alert.alert(
                  'Centre d\'aide',
                  'Utilisez l\'icône ? en haut à droite de chaque écran pour obtenir de l\'aide contextuelle.',
                  [{ text: 'OK' }]
                );
              }
            }}
          >
            <View style={styles.legalItemContent}>
              <Ionicons name="help-circle" size={20} color="#3b82f6" />
              <Text style={styles.legalItemText}>Centre d'aide</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => {
              // Ouvrir l'email
              const email = 'contact@myswing.app';
              const subject = 'Support My Swing';
              const body = 'Bonjour,\n\nJ\'ai une question concernant l\'application My Swing.\n\n';
              const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              
              // Note: Dans une vraie app, utiliser Linking.openURL(mailto)
              Alert.alert(
                'Contact Support',
                'Envoyez un email à contact@myswing.app pour toute question ou assistance.',
                [{ text: 'OK' }]
              );
            }}
          >
            <View style={styles.legalItemContent}>
              <Ionicons name="mail" size={20} color="#3b82f6" />
              <Text style={styles.legalItemText}>Contacter le support</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setSettingsModalVisible(true)}
          >
            <Ionicons name="settings" size={20} color="#3b82f6" />
            <Text style={styles.settingsText}>Paramètres</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditing(false)}>
              <Text style={styles.modalCancel}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalSave}>Sauver</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Prénom</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.first_name}
                onChangeText={(text) => setEditForm({...editForm, first_name: text})}
                placeholder="Votre prénom"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nom</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.last_name}
                onChangeText={(text) => setEditForm({...editForm, last_name: text})}
                placeholder="Votre nom"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ville</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.city}
                onChangeText={(text) => setEditForm({...editForm, city: text})}
                placeholder="Votre ville"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Index de golf</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.golf_index}
                onChangeText={(text) => setEditForm({...editForm, golf_index: text})}
                placeholder="Votre index (0-54)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Main dominante</Text>
              <View style={styles.radioGroup}>
                {[
                  { value: 'right', label: 'Droitier' },
                  { value: 'left', label: 'Gaucher' },
                  { value: 'none', label: 'Non renseigné' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.radioOption}
                    onPress={() => setEditForm({...editForm, dominant_hand: option.value as any})}
                  >
                    <View style={[
                      styles.radioCircle,
                      editForm.dominant_hand === option.value && styles.radioSelected
                    ]} />
                    <Text style={styles.radioLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />

      {/* Legal Modal */}
      <LegalModal
        visible={legalModal.visible}
        type={legalModal.type}
        onClose={() => setLegalModal({ visible: false, type: null })}
      />
    </SafeAreaView>
  );
}const 
styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  profileFields: {
    gap: 16,
  },
  profileField: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  fieldContent: {
    flex: 1,
    marginLeft: 12,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  legalSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  legalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legalItemText: {
    fontSize: 14,
    color: '#374151',
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  settingsText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCancel: {
    color: '#64748b',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalSave: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  radioLabel: {
    fontSize: 16,
    color: '#1e293b',
  },
});