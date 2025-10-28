import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSafeBottomPadding } from '../../hooks/useSafeBottomPadding';

interface LegalModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms' | 'cookies' | null;
}

const legalContent = {
  privacy: {
    title: 'Politique de Confidentialité',
    content: `## 1. Introduction

My Swing s'engage à protéger votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles.

## 2. Données Collectées

### Informations de Compte
• Nom et prénom
• Adresse email
• Niveau de golf (index)
• Ville (pour la météo)

### Données d'Utilisation
• Vidéos de swing uploadées
• Historique des analyses
• Préférences d'utilisation

### Données Techniques
• Adresse IP
• Type d'appareil
• Données de performance

## 3. Utilisation des Données

Nous utilisons vos données pour :
• Fournir le service d'analyse de swing
• Personnaliser votre expérience
• Améliorer nos algorithmes d'IA
• Vous envoyer des notifications importantes
• Assurer la sécurité du service

## 4. Vos Droits

Vous avez le droit de :
• Accéder à vos données personnelles
• Rectifier des informations incorrectes
• Supprimer vos données (droit à l'oubli)
• Limiter le traitement de vos données
• Portabilité de vos données

## 5. Sécurité

Nous protégeons vos données avec :
• Chiffrement des données
• Accès restreint aux données personnelles
• Surveillance continue de la sécurité
• Audits réguliers

## 6. Contact

Pour exercer vos droits ou pour toute question :
• Email : contact@myswing.app
• DPO : privacy@myswing.app`
  },
  terms: {
    title: 'Conditions d\'Utilisation',
    content: `## 1. Présentation

My Swing est développée par Processin, SASU au capital de 1 000 €.
Siège social : 44 rue du Docteur Guy Martin, 59262 Sainghin-en-Mélantois
Contact : contact@myswing.app

## 2. Utilisation de l'application

L'utilisateur s'engage à :
• Fournir des informations exactes
• Ne pas détourner l'usage de l'application
• Ne pas publier de contenus inappropriés
• Respecter la propriété intellectuelle

## 3. Données et Confidentialité

Les données collectées :
• Vidéos de swing envoyées
• Métadonnées associées (club, angle, date)
• Informations d'inscription

Hébergement : Supabase (Union Européenne)
Traitement IA : Gemini (Google)

Vous conservez la propriété de vos vidéos et pouvez les supprimer à tout moment.

## 4. Limitation de Responsabilité

Processin ne saurait être tenue responsable :
• Des interruptions ou erreurs de fonctionnement
• Des inexactitudes dans les résultats IA
• Des pertes de données

Les conseils de l'IA ne constituent pas des recommandations médicales ou professionnelles.

## 5. Propriété Intellectuelle

Tous les éléments de My Swing sont la propriété exclusive de Processin et protégés par le droit de la propriété intellectuelle.

## 6. Contact

Pour toute question : contact@myswing.app`
  },
  cookies: {
    title: 'Politique des Cookies',
    content: `## 1. Qu'est-ce qu'un Cookie ?

Un cookie est un petit fichier texte stocké sur votre appareil pour améliorer votre expérience utilisateur.

## 2. Types de Cookies

### Cookies Essentiels
• Session utilisateur : Maintient votre connexion
• Préférences : Sauvegarde vos paramètres
• Sécurité : Protection contre les attaques

### Cookies de Performance
• Analytics : Mesure de l'utilisation
• Erreurs : Détection des problèmes
• Performance : Optimisation

### Cookies de Personnalisation
• Préférences d'interface : Thème, langue
• Historique : Analyses récentes
• Recommandations : Conseils personnalisés

## 3. Services Tiers

Nous utilisons :
• Supabase : Authentification et base de données
• Vercel : Hébergement et analytics
• Axiom : Monitoring et logs

## 4. Gestion des Cookies

Vous pouvez gérer les cookies dans les paramètres de votre navigateur. La désactivation peut affecter le fonctionnement de l'application.

## 5. Contact

Pour toute question : privacy@myswing.app`
  }
};

export default function LegalModal({ visible, onClose, type }: LegalModalProps) {
  const { containerPaddingBottom } = useSafeBottomPadding();
  
  // Protection contre type null
  if (!type || !visible) {
    return null;
  }
  
  const content = legalContent[type];

  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return (
          <Text key={index} style={styles.sectionTitle}>
            {line.replace('## ', '')}
          </Text>
        );
      } else if (line.startsWith('### ')) {
        return (
          <Text key={index} style={styles.subTitle}>
            {line.replace('### ', '')}
          </Text>
        );
      } else if (line.startsWith('• ')) {
        return (
          <Text key={index} style={styles.bulletPoint}>
            {line}
          </Text>
        );
      } else if (line.trim() === '') {
        return <View key={index} style={styles.spacer} />;
      } else {
        return (
          <Text key={index} style={styles.paragraph}>
            {line}
          </Text>
        );
      }
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.title}>{content.title}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: containerPaddingBottom }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {formatContent(content.content)}
          </View>
        </ScrollView>
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
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
    marginBottom: 4,
    marginLeft: 8,
  },
  spacer: {
    height: 12,
  },
});