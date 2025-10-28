import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeBottomPadding } from '../../hooks/useSafeBottomPadding';

interface SwingContext {
  club: string;
  angle: 'face' | 'profile';
}

interface SwingContextFormProps {
  onContextSelected: (context: SwingContext) => void;
  onSkip: () => void;
}

export default function SwingContextForm({ onContextSelected, onSkip }: SwingContextFormProps) {
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [selectedAngle, setSelectedAngle] = useState<'face' | 'profile'>('profile');
  const { containerPaddingBottom } = useSafeBottomPadding();

  const clubCategories = [
    {
      name: 'Bois',
      clubs: [
        { id: 'driver', name: 'Driver', icon: '🏌️' },
        { id: 'bois_parcours', name: 'Bois de parcours', icon: '🌳' },
      ]
    },
    {
      name: 'Hybride',
      clubs: [
        { id: 'hybride', name: 'Hybride', icon: '🔀' },
      ]
    },
    {
      name: 'Fers',
      clubs: [
        { id: 'fer4', name: 'Fer 4', icon: '4️⃣' },
        { id: 'fer5', name: 'Fer 5', icon: '5️⃣' },
        { id: 'fer6', name: 'Fer 6', icon: '6️⃣' },
        { id: 'fer7', name: 'Fer 7', icon: '7️⃣' },
        { id: 'fer8', name: 'Fer 8', icon: '8️⃣' },
        { id: 'fer9', name: 'Fer 9', icon: '9️⃣' },
      ]
    },
    {
      name: 'Wedges',
      clubs: [
        { id: 'pitch', name: 'Pitch', icon: '📐' },
        { id: 'sw', name: 'SW', icon: '🏖️' },
      ]
    }
  ];

  const angles = [
    {
      id: 'profile' as const,
      name: 'De profil',
      description: 'Vue latérale (recommandé)',
      icon: 'person-outline',
      recommended: true
    },
    {
      id: 'face' as const,
      name: 'De face',
      description: 'Vue frontale',
      icon: 'eye-outline',
      recommended: false
    }
  ];

  const handleSubmit = () => {
    if (selectedClub) {
      onContextSelected({
        club: selectedClub,
        angle: selectedAngle
      });
    }
  };

  const canSubmit = selectedClub !== '';

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: containerPaddingBottom }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Contexte du swing</Text>
        <Text style={styles.subtitle}>
          Ces informations permettront une analyse plus précise
        </Text>
      </View>

      {/* Angle Selection - En premier */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Angle de prise de vue</Text>
        <View style={styles.angleContainer}>
          {angles.map((angle) => (
            <TouchableOpacity
              key={angle.id}
              style={[
                styles.angleCard,
                selectedAngle === angle.id && styles.angleCardSelected
              ]}
              onPress={() => setSelectedAngle(angle.id)}
            >
              <View style={styles.angleHeader}>
                <Ionicons 
                  name={angle.icon as any} 
                  size={24} 
                  color={selectedAngle === angle.id ? '#3b82f6' : '#64748b'} 
                />
                {angle.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommandé</Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.angleName,
                selectedAngle === angle.id && styles.angleNameSelected
              ]}>
                {angle.name}
              </Text>
              <Text style={[
                styles.angleDescription,
                selectedAngle === angle.id && styles.angleDescriptionSelected
              ]}>
                {angle.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Club Selection - Organisé par catégories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quel club utilisez-vous ?</Text>
        {clubCategories.map((category) => (
          <View key={category.name} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <View style={styles.clubGrid}>
              {category.clubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={[
                    styles.clubCard,
                    selectedClub === club.id && styles.clubCardSelected
                  ]}
                  onPress={() => setSelectedClub(club.id)}
                >
                  <Text style={styles.clubIcon}>{club.icon}</Text>
                  <Text style={[
                    styles.clubName,
                    selectedClub === club.id && styles.clubNameSelected
                  ]}>
                    {club.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkip}
        >
          <Text style={styles.skipButtonText}>Passer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={[
            styles.submitButtonText,
            !canSubmit && styles.submitButtonTextDisabled
          ]}>
            Continuer
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={16} 
            color={canSubmit ? 'white' : '#94a3b8'} 
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
    paddingLeft: 4,
  },
  clubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  clubCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    minWidth: '30%',
    flex: 1,
    maxWidth: '32%',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  clubCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
  },
  clubIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  clubName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  clubNameSelected: {
    color: '#3b82f6',
  },
  angleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  angleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  angleCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
  },
  angleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recommendedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  angleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  angleNameSelected: {
    color: '#3b82f6',
  },
  angleDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  angleDescriptionSelected: {
    color: '#3b82f6',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    // marginBottom supprimé - géré par le hook useSafeBottomPadding
  },
  skipButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#f1f5f9',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  submitButtonTextDisabled: {
    color: '#94a3b8',
  },
});