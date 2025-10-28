# My Swing 🏌️‍♂️

> **Un prof de golf dans votre poche !**

Application mobile React Native/Expo pour l'analyse de swing de golf avec intelligence artificielle.

[![Expo](https://img.shields.io/badge/Expo-SDK%2051-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-green.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## 📱 Fonctionnalités

- **🎥 Analyse vidéo IA** : Filmez votre swing et obtenez une analyse détaillée
- **📊 Métriques avancées** : Tempo, équilibre, puissance, précision
- **💡 Conseils personnalisés** : Recommandations d'amélioration basées sur votre niveau
- **📈 Suivi des progrès** : Historique de vos analyses et évolution
- **🔐 Authentification sécurisée** : Comptes utilisateur avec Supabase

## 🎯 Screenshots

*Screenshots à venir une fois l'app testée*

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- Expo CLI : `npm install -g @expo/cli`
- App Expo Go sur votre téléphone

### Installation
```bash
cd golf-coaching-mobile
npm install
```

### Configuration
1. Copiez le fichier `.env` et ajustez les variables si nécessaire
2. Les variables d'environnement sont déjà configurées pour pointer vers votre backend existant

### Lancement
```bash
# Démarrer le serveur de développement
npx expo start

# Scanner le QR code avec Expo Go sur votre téléphone
```

## 📱 Fonctionnalités

### ✅ Implémenté
- **Authentification** : Connexion/inscription avec Supabase
- **Navigation** : Navigation par onglets (Home, Camera, History, Profile)
- **Interface** : Design mobile natif avec Tailwind-like styling
- **Caméra** : Accès caméra native avec guide visuel
- **Profil** : Gestion du profil utilisateur

### 🚧 À implémenter
- **Analyse vidéo** : Intégration avec votre API d'analyse existante
- **Historique** : Récupération des analyses depuis Supabase
- **Notifications** : Push notifications pour les analyses terminées
- **Stockage local** : Cache des vidéos et analyses

## 🏗️ Architecture

```
src/
├── lib/           # Services (auth, supabase, config)
├── screens/       # Écrans principaux
├── navigation/    # Configuration navigation
├── hooks/         # Hooks React personnalisés
├── components/    # Composants réutilisables (à ajouter)
└── types/         # Types TypeScript
```

## 🔧 Services réutilisés

L'app mobile réutilise directement :
- **Supabase** : Base de données et authentification
- **API Vercel** : Endpoints d'analyse existants
- **Google Cloud** : Serveur de traitement vidéo
- **Gemini AI** : Service d'analyse IA

## 📦 Build & Deploy

### Development Build
```bash
# Créer un build de développement
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Production Build
```bash
# Build pour les stores
eas build --profile production --platform all
```

### Submit aux stores
```bash
# App Store
eas submit --platform ios

# Google Play Store  
eas submit --platform android
```

## 🎯 Prochaines étapes

1. **Tester l'app** avec Expo Go
2. **Implémenter l'analyse vidéo** (migration du code web)
3. **Ajouter les notifications push**
4. **Optimiser les performances vidéo**
5. **Créer les builds de production**

## 🔗 Liens utiles

- [Documentation Expo](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Supabase React Native](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)