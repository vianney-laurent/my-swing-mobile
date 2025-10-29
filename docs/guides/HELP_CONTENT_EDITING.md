# Guide d'édition du contenu d'aide

## Édition rapide

### Localisation des fichiers
Le contenu d'aide est stocké dans :
```
golf-coaching-mobile/src/lib/help/help-content-service.ts
```

### Structure du contenu
Chaque section d'aide est définie comme une propriété de l'objet `helpContent` :

```typescript
const helpContent: Record<string, string> = {
  home: `# Aide - Écran d'accueil
  
Votre contenu markdown ici...`,
  
  camera: `# Aide - Enregistrement vidéo
  
Votre contenu markdown ici...`,
  
  // ... autres sections
};
```

## Syntaxe markdown supportée

### Titres
```markdown
# Titre principal
## Sous-titre
### Sous-sous-titre
```

### Paragraphes
```markdown
Texte normal qui sera affiché comme un paragraphe.

Nouveau paragraphe après une ligne vide.
```

### Listes
```markdown
- Premier élément
- Deuxième élément
- Troisième élément
```

### Texte en gras
```markdown
**Texte important en gras**
```

### Espacement
```markdown
Paragraphe 1

Paragraphe 2 avec espacement
```

## Sections disponibles

### 1. home - Écran d'accueil
**Contenu suggéré :**
- Présentation des fonctionnalités principales
- Navigation dans l'app
- Conseils d'utilisation

### 2. camera - Enregistrement vidéo
**Contenu suggéré :**
- Positionnement de la caméra
- Conditions d'éclairage
- Conseils pour un bon enregistrement
- Résolution des problèmes courants

### 3. analysis - Analyse en cours
**Contenu suggéré :**
- Processus d'analyse
- Temps d'attente
- Que faire pendant l'attente
- Résolution des problèmes

### 4. history - Historique
**Contenu suggéré :**
- Navigation dans l'historique
- Gestion des analyses
- Suivi des progrès
- Actions disponibles

### 5. profile - Profil utilisateur
**Contenu suggéré :**
- Modification des informations
- Statistiques personnelles
- Paramètres de sécurité
- Support et aide

### 6. auth - Authentification
**Contenu suggéré :**
- Création de compte
- Connexion
- Mot de passe oublié
- Sécurité du compte

### 7. analysisResult - Résultats d'analyse
**Contenu suggéré :**
- Interprétation des scores
- Utilisation des conseils
- Actions disponibles
- Suivi des progrès

### 8. helpIndex - Centre d'aide principal
**Contenu suggéré :**
- Navigation rapide
- Questions fréquentes
- Conseils pour débuter
- Support technique

## Bonnes pratiques

### Structure du contenu
1. **Titre principal** avec # 
2. **Introduction** courte et claire
3. **Sections organisées** avec ##
4. **Listes** pour les étapes ou conseils
5. **Conseils pratiques** en fin de page

### Ton et style
- **Langage simple** et accessible
- **Phrases courtes** et directes
- **Exemples concrets** quand possible
- **Ton bienveillant** et encourageant

### Longueur
- **Contenu concis** mais complet
- **Sections courtes** pour faciliter la lecture
- **Points clés** mis en évidence

## Exemple de modification

### Avant
```typescript
home: `# Aide - Écran d'accueil

Contenu basique...`
```

### Après
```typescript
home: `# Aide - Écran d'accueil

Bienvenue sur l'écran d'accueil de My Swing !

## Fonctionnalités principales

### Conseil du jour
- Recevez des conseils personnalisés
- Adaptés à votre niveau
- Mis à jour quotidiennement

### Actions rapides
- **Nouvelle analyse** : Enregistrez votre swing
- **Historique** : Consultez vos progrès
- **Profil** : Gérez votre compte

## Navigation

Utilisez la barre en bas pour naviguer entre les sections.

**Astuce** : Appuyez sur l'icône ? pour obtenir de l'aide sur chaque écran.`
```

## Test des modifications

### Après modification
1. **Sauvegardez** le fichier
2. **Rechargez** l'application
3. **Naviguez** vers l'aide
4. **Vérifiez** le rendu du contenu
5. **Testez** la navigation

### Points de vérification
- ✅ Titres bien formatés
- ✅ Listes correctement affichées
- ✅ Texte en gras visible
- ✅ Espacement approprié
- ✅ Navigation fonctionnelle

## Déploiement

### Environnement de développement
Les modifications sont immédiatement visibles après sauvegarde et rechargement.

### Production
Les modifications nécessitent une nouvelle version de l'application.

## Support

Pour toute question sur l'édition du contenu d'aide :
1. Consultez ce guide
2. Testez dans l'environnement de développement
3. Contactez l'équipe technique si nécessaire