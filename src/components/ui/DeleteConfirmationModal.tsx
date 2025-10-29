import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  title?: string;
  message?: string;
}

export default function DeleteConfirmationModal({
  visible,
  onConfirm,
  onCancel,
  isDeleting = false,
  title = "Supprimer l'analyse",
  message = "Êtes-vous sûr de vouloir supprimer cette analyse ? Cette action est irréversible et supprimera également la vidéo associée."
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Icône d'alerte */}
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={48} color="#ef4444" />
          </View>
          
          {/* Titre */}
          <Text style={styles.title}>{title}</Text>
          
          {/* Message */}
          <Text style={styles.message}>{message}</Text>
          
          {/* Boutons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isDeleting}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
              onPress={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="trash" size={16} color="white" />
              )}
              <Text style={styles.deleteButtonText}>
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 50,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: '#fca5a5',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});