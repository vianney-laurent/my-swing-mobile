import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Bonjour !</Text>
          <Text style={styles.subtitle}>
            Prêt à améliorer votre swing ?
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => navigation.navigate('Camera')}
          >
            <Ionicons name="camera" size={32} color="white" />
            <Text style={styles.primaryActionText}>Analyser mon swing</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => navigation.navigate('History')}
            >
              <Ionicons name="time" size={24} color="#10b981" />
              <Text style={styles.secondaryActionText}>Historique</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person" size={24} color="#10b981" />
              <Text style={styles.secondaryActionText}>Profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Conseils du jour</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              📱 Tenez votre téléphone à la verticale pour une meilleure analyse
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              🏌️ Filmez votre swing de profil pour des résultats optimaux
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  quickActions: {
    padding: 20,
  },
  primaryAction: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryActionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryActionText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  tips: {
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});