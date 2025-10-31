import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { accountDeletionService } from '../../lib/account/account-deletion-service';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

type SettingTab = 'main' | 'appearance' | 'language' | 'notifications' | 'deleteAccount';

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingTab>('main');
  const [confirmationText, setConfirmationText] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmationText.toLowerCase() !== 'suppression') {
      Alert.alert(
        'Confirmation requise',
        'Veuillez taper "suppression" dans le champ de confirmation pour continuer.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Confirmation finale
    Alert.alert(
      'Suppression définitive',
      'Votre compte sera supprimé dans 24h. Cette action est définitive et irréversible. Voulez-vous continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await accountDeletionService.requestAccountDeletion();
              
              if (result.success) {
                Alert.alert(
                  'Suppression programmée',
                  'Votre compte sera supprimé automatiquement dans 24h. Vous avez été déconnecté.',
                  [{ 
                    text: 'OK',
                    onPress: () => {
                      // Le service a déjà déconnecté l'utilisateur
                      // La navigation sera gérée automatiquement par AppNavigator
                    }
                  }]
                );
              } else {
                Alert.alert(
                  'Erreur',
                  result.error || 'Une erreur est survenue lors de la demande de suppression.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Error during account deletion:', error);
              Alert.alert(
                'Erreur',
                'Une erreur inattendue est survenue.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const isDeleteButtonEnabled = confirmationText.toLowerCase() === 'suppression';

  const renderMainMenu = () => (
    <ScrollView style={styles.content}>
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleTabChange('appearance')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#3b82f6' }]}>
              <Ionicons name="color-palette" size={20} color="white" />
            </View>
            <Text style={styles.menuItemText}>Apparence</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.comingSoonText}>Bientôt disponible</Text>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleTabChange('language')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#10b981' }]}>
              <Ionicons name="language" size={20} color="white" />
            </View>
            <Text style={styles.menuItemText}>Langue</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.comingSoonText}>Bientôt disponible</Text>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleTabChange('notifications')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#f59e0b' }]}>
              <Ionicons name="notifications" size={20} color="white" />
            </View>
            <Text style={styles.menuItemText}>Notifications</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.comingSoonText}>Bientôt disponible</Text>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Compte</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleTabChange('deleteAccount')}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#ef4444' }]}>
              <Ionicons name="trash" size={20} color="white" />
            </View>
            <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Suppression du compte</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderComingSoonScreen = (title: string, icon: string, description: string) => (
    <View style={styles.comingSoonContainer}>
      <View style={styles.comingSoonContent}>
        <View style={styles.comingSoonIcon}>
          <Ionicons name={icon as any} size={48} color="#94a3b8" />
        </View>
        <Text style={styles.comingSoonTitle}>{title}</Text>
        <Text style={styles.comingSoonDescription}>{description}</Text>
      </View>
    </View>
  );

  const renderDeleteAccountScreen = () => (
    <KeyboardAvoidingView 
      style={styles.deleteAccountContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        style={styles.deleteAccountScrollView}
        contentContainerStyle={styles.deleteAccountScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.deleteAccountContent}>
          <View style={[styles.comingSoonIcon, { backgroundColor: '#fef2f2' }]}>
            <Ionicons name="trash" size={48} color="#ef4444" />
          </View>
          
          <Text style={styles.deleteAccountTitle}>Suppression du compte</Text>
          
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={24} color="#f59e0b" />
            <Text style={styles.warningText}>
              Cette action est définitive et irréversible. Votre compte sera supprimé dans 24h et il ne sera pas possible d'annuler cette demande.
            </Text>
          </View>

          <Text style={styles.deleteAccountDescription}>
            En supprimant votre compte, vous perdrez :
          </Text>
          
          <View style={styles.consequencesList}>
            <View style={styles.consequenceItem}>
              <Ionicons name="close-circle" size={16} color="#ef4444" />
              <Text style={styles.consequenceText}>Toutes vos analyses de swing</Text>
            </View>
            <View style={styles.consequenceItem}>
              <Ionicons name="close-circle" size={16} color="#ef4444" />
              <Text style={styles.consequenceText}>Votre profil et vos préférences</Text>
            </View>
            <View style={styles.consequenceItem}>
              <Ionicons name="close-circle" size={16} color="#ef4444" />
              <Text style={styles.consequenceText}>L'accès à votre compte</Text>
            </View>
          </View>

          <View style={styles.confirmationSection}>
            <Text style={styles.confirmationLabel}>
              Pour confirmer, tapez <Text style={styles.confirmationKeyword}>"suppression"</Text> ci-dessous :
            </Text>
            <TextInput
              style={styles.confirmationInput}
              value={confirmationText}
              onChangeText={setConfirmationText}
              placeholder="Tapez suppression"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.deleteButton,
              !isDeleteButtonEnabled && styles.deleteButtonDisabled
            ]}
            onPress={handleDeleteAccount}
            disabled={!isDeleteButtonEnabled}
          >
            <Text style={[
              styles.deleteButtonText,
              !isDeleteButtonEnabled && styles.deleteButtonTextDisabled
            ]}>
              Supprimer mon compte
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const handleClose = () => {
    setActiveTab('main');
    setConfirmationText('');
    onClose();
  };

  const handleTabChange = (tab: SettingTab) => {
    setActiveTab(tab);
    setConfirmationText(''); // Reset confirmation text when changing tabs
  };

  const getScreenTitle = () => {
    switch (activeTab) {
      case 'appearance':
        return 'Apparence';
      case 'language':
        return 'Langue';
      case 'notifications':
        return 'Notifications';
      case 'deleteAccount':
        return 'Suppression du compte';
      default:
        return 'Paramètres';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'appearance':
        return renderComingSoonScreen(
          'Thème de l\'application',
          'color-palette',
          'Choisissez entre le mode clair et sombre. Cette fonctionnalité sera bientôt disponible.'
        );
      case 'language':
        return renderComingSoonScreen(
          'Langue de l\'interface',
          'language',
          'Support multilingue en cours de développement. L\'application sera bientôt disponible en plusieurs langues.'
        );
      case 'notifications':
        return renderComingSoonScreen(
          'Gestion des notifications',
          'notifications',
          'Personnalisez vos préférences de notifications. Cette fonctionnalité sera bientôt disponible.'
        );
      case 'deleteAccount':
        return renderDeleteAccountScreen();
      default:
        return renderMainMenu();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {activeTab !== 'main' && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => handleTabChange('main')}
            >
              <Ionicons name="chevron-back" size={24} color="#3b82f6" />
            </TouchableOpacity>
          )}
          
          <Text style={styles.title}>{getScreenTitle()}</Text>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    width: 32,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
  },
  menuSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#f8fafc',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  comingSoonContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  comingSoonIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  comingSoonDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  deleteAccountContainer: {
    flex: 1,
  },
  deleteAccountScrollView: {
    flex: 1,
  },
  deleteAccountScrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  deleteAccountContent: {
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  deleteAccountTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  deleteAccountDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  consequencesList: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  consequenceText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#64748b',
  },
  confirmationSection: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  confirmationLabel: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  confirmationKeyword: {
    fontWeight: 'bold',
    color: '#ef4444',
  },
  confirmationInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonTextDisabled: {
    color: '#9ca3af',
  },
});