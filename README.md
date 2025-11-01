# My Swing 🏌️‍♂️

> **Un prof de golf dans votre poche !**

Application mobile React Native/Expo pour l'analyse de swing de golf avec intelligence artificielle.

[![Expo](https://img.shields.io/badge/Expo-SDK%2051-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-green.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## 📱 Fonctionnalités

- **🎥 Workflow vidéo unifié** : Enregistrement direct ou sélection galerie avec validation
- **🗜️ Compression intelligente** : Optimisation automatique pour l'analyse (limite 10MB)
- **🤖 Analyse IA avancée** : Analyse personnalisée avec Gemini 2.0 Flash
- **📊 Métriques détaillées** : Score global, points forts, axes d'amélioration
- **💡 Conseils actionnables** : Plan d'action immédiat avec exercices spécifiques
- **📈 Suivi des progrès** : Historique enrichi avec métadonnées de traitement
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
##
 🎯 Workflow Vidéo Unifié

### Nouveautés v2.0
- **Élimination du double traitement** : 1 lecture → Upload + Analyse en parallèle
- **Compression intelligente** : Adaptation automatique selon la source (caméra vs galerie)
- **Validation en temps réel** : Contrôle de qualité avant traitement
- **Gestion d'erreurs unifiée** : Messages clairs et suggestions de résolution

### Sources Vidéo Supportées
1. **📹 Enregistrement direct** : Caméra optimisée (12s max, 720p, ~8-10MB)
2. **📱 Sélection galerie** : Import avec compression automatique si nécessaire

### Limites Techniques
- **Taille optimale** : 10MB max pour analyse Gemini
- **Durée recommandée** : 5-10 secondes pour meilleurs résultats
- **Formats supportés** : MP4, MOV (recommandés), AVI, MKV

## 🔧 Architecture Technique

### Services Principaux
- `VideoSourceDetector` : Détection automatique de la source vidéo
- `VideoValidator` : Validation spécifique par type de source
- `VideoCompressor` : Compression adaptative intelligente
- `MobileAnalysisService` : Workflow unifié d'analyse

### Workflow Optimisé
```
Vidéo → Validation → Compression → Lecture 1x → [Upload + Analyse] → Sauvegarde
```

### Performance
- **50% plus rapide** que l'ancien système
- **Moins de RAM** utilisée (lecture unique)
- **Traitement parallèle** pour optimiser le temps total

## 📚 Documentation

- [Guide du Workflow Unifié](./docs/guides/UNIFIED_VIDEO_WORKFLOW.md)
- [Guide de Migration](./docs/guides/VIDEO_WORKFLOW_MIGRATION.md)
- [Tests et Validation](./docs/guides/HELP_SYSTEM_TESTING.md)

## 🧪 Tests

```bash
# Tests du workflow vidéo
npm test video-workflow.test.ts

# Tests d'intégration
npm test -- --testPathPattern=integration

# Tests de performance
npm test -- --testPathPattern=performance
```