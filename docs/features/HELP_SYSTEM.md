# Système d'aide contextuel - My Swing Mobile

## Vue d'ensemble

Le système d'aide contextuel permet aux utilisateurs d'accéder facilement à de l'aide spécifique à chaque écran de l'application, ainsi qu'à un centre d'aide global.

## Fonctionnalités

### 1. Bouton d'aide fixe
- **Position** : En haut à droite de chaque écran (sauf auth et help)
- **Icône** : Point d'interrogation dans un cercle
- **Comportement** : Redirige vers l'aide contextuelle de l'écran courant

### 2. Aide contextuelle
Chaque écran a sa propre page d'aide avec :
- **Contenu spécifique** : Instructions détaillées pour l'écran
- **Conseils d'utilisation** : Bonnes pratiques
- **Résolution de problèmes** : Solutions aux problèmes courants

### 3. Centre d'aide global
- **Accès** : Via le profil utilisateur > "Centre d'aide"
- **Navigation** : Index de toutes les pages d'aide
- **Recherche** : Accès rapide par catégorie

## Architecture technique

### Composants

#### HelpButton
```typescript
// Bouton d'aide fixe affiché sur tous les écrans
<HelpButton 
  currentScreen={currentScreen}
  onPress={() => navigateToHelp(currentScreen)}
/>
```

#### HelpScreen
```typescript
// Écran d'affichage de l'aide avec navigation
<HelpScreen 
  helpScreen={helpScreen || 'helpIndex'}
  onBack={goBackFromHelp}
  onNavigateToSection={navigateToHelpSection}
/>
```

#### MarkdownRenderer
```typescript
// Rendu du contenu markdown avec styles natifs
<MarkdownRenderer content={helpContent} />
```

### Services

#### HelpContentService
- **getHelpContent(screenName)** : Récupère le contenu d'aide pour un écran
- **getAllHelpSections()** : Liste toutes les sections d'aide disponibles

### Navigation

#### Types étendus
```typescript
export type Screen = 'home' | 'camera' | 'history' | 'profile' | 'analysisResult' | 'auth' | 'help';
export type HelpScreen = 'home' | 'camera' | 'analysis' | 'history' | 'profile' | 'auth' | 'analysisResult' | 'helpIndex';
```

#### Nouvelles fonctions
- **navigateToHelp(fromScreen)** : Navigation vers l'aide contextuelle
- **navigateToHelpSection(section)** : Navigation vers une section spécifique
- **goBackFromHelp()** : Retour à l'écran précédent

## Contenu d'aide

### Structure des fichiers
```
src/content/help/
├── home.md              # Aide pour l'écran d'accueil
├── camera.md            # Aide pour l'enregistrement
├── analysis.md          # Aide pour l'analyse en cours
├── history.md           # Aide pour l'historique
├── profile.md           # Aide pour le profil
├── auth.md              # Aide pour l'authentification
├── analysisResult.md    # Aide pour les résultats
└── index.md             # Centre d'aide principal
```

### Format markdown supporté
- **Titres** : # ## ###
- **Paragraphes** : Texte normal
- **Listes** : - Item
- **Gras** : **texte**
- **Espacement** : Lignes vides

## Utilisation

### Pour les développeurs

#### Ajouter une nouvelle page d'aide
1. Créer le fichier markdown dans `src/content/help/`
2. Ajouter le contenu dans `HelpContentService`
3. Ajouter la section dans `getAllHelpSections()`

#### Modifier le contenu existant
1. Éditer directement les fichiers markdown
2. Le contenu est chargé dynamiquement

### Pour les utilisateurs

#### Accéder à l'aide contextuelle
1. Appuyer sur l'icône "?" en haut à droite
2. Lire les instructions spécifiques à l'écran

#### Accéder au centre d'aide
1. Aller dans Profil
2. Appuyer sur "Centre d'aide"
3. Naviguer vers la section souhaitée

## Personnalisation

### Styles
Les styles sont définis dans chaque composant :
- **HelpButton** : Position fixe, couleur bleue
- **HelpScreen** : Header avec navigation, contenu scrollable
- **MarkdownRenderer** : Styles typographiques cohérents

### Contenu
Le contenu peut être :
- **Statique** : Défini dans le code (actuel)
- **Dynamique** : Chargé depuis un serveur (futur)
- **Multilingue** : Support de plusieurs langues (futur)

## Améliorations futures

### Fonctionnalités avancées
- **Recherche** : Recherche dans le contenu d'aide
- **Favoris** : Marquer les pages d'aide utiles
- **Feedback** : Noter l'utilité des pages d'aide
- **Vidéos** : Intégrer des tutoriels vidéo

### Contenu enrichi
- **Captures d'écran** : Images explicatives
- **Animations** : GIFs démonstratifs
- **Liens interactifs** : Navigation entre les pages
- **Mise à jour automatique** : Contenu depuis un CMS

## Maintenance

### Mise à jour du contenu
1. Éditer les fichiers markdown
2. Tester le rendu dans l'app
3. Vérifier la navigation
4. Déployer les changements

### Monitoring
- **Analytics** : Suivi de l'utilisation des pages d'aide
- **Feedback** : Retours utilisateurs sur l'utilité
- **Performance** : Temps de chargement du contenu

## Conclusion

Le système d'aide contextuel améliore significativement l'expérience utilisateur en fournissant une assistance immédiate et pertinente. L'architecture modulaire permet une maintenance facile et des évolutions futures.