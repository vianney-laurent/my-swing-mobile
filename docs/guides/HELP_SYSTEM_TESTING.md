# Guide de test du système d'aide

## Tests à effectuer

### 1. Positionnement du bouton d'aide
- ✅ **Home** : Vérifier que le bouton ? est bien positionné en haut à droite
- ✅ **Camera** : Même position, pas de conflit avec les contrôles caméra
- ✅ **History** : Position cohérente avec les autres écrans
- ✅ **Profile** : Bouton visible et accessible
- ✅ **AnalysisResult** : Pas de conflit avec les éléments de l'écran

### 2. Design du bouton
- ✅ **Taille** : 40x40px (plus discret que 48x48)
- ✅ **Couleur** : Bleu semi-transparent (rgba(59, 130, 246, 0.9))
- ✅ **Ombre** : Légère (shadowOpacity: 0.15)
- ✅ **Icône** : help-circle, taille 20px
- ✅ **Animation** : activeOpacity: 0.8

### 3. Rendu markdown
- ✅ **Titres** : # ## ### correctement stylés
- ✅ **Paragraphes** : Espacement approprié
- ✅ **Listes** : Puces bleues, indentation correcte
- ✅ **Gras** : **texte** rendu en gras sans les **
- ✅ **Espacement** : Lignes vides créent des espaces

### 4. Navigation
- ✅ **Aide contextuelle** : Chaque écran ouvre sa page d'aide spécifique
- ✅ **Centre d'aide** : Accessible depuis Profil > Centre d'aide
- ✅ **Retour** : Bouton retour fonctionne correctement
- ✅ **Navigation sections** : Navigation entre les sections d'aide

## Cas de test spécifiques

### Test du markdown
Vérifier que ce contenu s'affiche correctement :

```markdown
# Titre principal
## Sous-titre
### Sous-sous-titre

Paragraphe normal avec du **texte en gras** au milieu.

- Premier élément de liste
- Deuxième élément avec **gras**
- Troisième élément

**Ligne entière en gras**

Paragraphe final.
```

### Test de positionnement
1. Ouvrir chaque écran
2. Vérifier que le bouton ? est :
   - Visible
   - Bien positionné (pas coupé)
   - Accessible (pas masqué par d'autres éléments)
   - Cohérent entre les écrans

### Test de navigation
1. **Depuis Home** : ? → Aide Home → Retour → Home
2. **Depuis Profile** : Centre d'aide → Section Camera → Retour → Centre d'aide → Retour → Profile
3. **Navigation rapide** : ? sur différents écrans pour vérifier le contexte

## Problèmes potentiels

### Positionnement
- **SafeArea** : Le bouton doit s'adapter à la safe area
- **Orientation** : Vérifier en portrait et paysage si supporté
- **Différents appareils** : Tester sur iPhone et Android

### Rendu markdown
- **Performance** : Vérifier que le parsing ne ralentit pas l'affichage
- **Caractères spéciaux** : Tester avec émojis et caractères accentués
- **Contenu long** : Vérifier le scroll sur les pages d'aide longues

### Navigation
- **État** : Vérifier que l'état de navigation est correctement géré
- **Mémoire** : Pas de fuites mémoire lors de la navigation répétée
- **Interruptions** : Comportement lors d'appels ou notifications

## Checklist de validation

### Design ✅
- [ ] Bouton discret mais visible
- [ ] Couleur cohérente avec l'app
- [ ] Ombre légère et élégante
- [ ] Taille appropriée (40px)

### Fonctionnalité ✅
- [ ] Aide contextuelle fonctionne
- [ ] Centre d'aide accessible
- [ ] Navigation fluide
- [ ] Retour correct

### Contenu ✅
- [ ] Markdown rendu correctement
- [ ] Gras sans ** visibles
- [ ] Listes bien formatées
- [ ] Titres hiérarchisés

### Performance ✅
- [ ] Chargement rapide
- [ ] Scroll fluide
- [ ] Pas de lag lors du parsing
- [ ] Mémoire stable

## Améliorations futures

### UX
- [ ] Animation d'apparition du bouton
- [ ] Feedback haptique au tap
- [ ] Tooltip au premier usage
- [ ] Raccourci clavier (si supporté)

### Contenu
- [ ] Images dans le markdown
- [ ] Liens internes entre pages
- [ ] Recherche dans l'aide
- [ ] Favoris/bookmarks

### Analytics
- [ ] Tracking de l'usage des pages d'aide
- [ ] Pages les plus consultées
- [ ] Temps passé sur chaque page
- [ ] Taux de sortie

## Validation finale

Avant de considérer le système d'aide comme terminé :

1. ✅ **Tests manuels** sur tous les écrans
2. ✅ **Validation du design** avec l'équipe
3. ✅ **Test du contenu** par un utilisateur externe
4. ✅ **Performance** vérifiée sur appareils lents
5. ✅ **Accessibilité** testée avec VoiceOver/TalkBack