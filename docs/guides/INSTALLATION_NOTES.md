# Notes d'installation

## Nouvelles dépendances ajoutées

### expo-image-picker
Pour permettre la sélection de vidéos depuis la galerie.

```bash
npm install expo-image-picker
```

## Changements apportés

1. **Onglet renommé** : "Caméra" → "Analyse"
2. **Nouveau composant AnalysisScreen** : Permet de choisir entre :
   - Se filmer avec la caméra
   - Uploader une vidéo existante
3. **CameraScreen modifié** : Ajout d'un bouton retour quand utilisé depuis AnalysisScreen

## Fonctionnalités

- **Sélection de mode** : Interface claire pour choisir entre caméra et galerie
- **Permissions gérées** : Demande automatique des permissions pour la galerie
- **Navigation fluide** : Retour facile entre les écrans
- **Design cohérent** : Interface utilisateur moderne et intuitive

## Prochaines étapes

- Implémenter l'upload vers Supabase
- Connecter à l'API d'analyse
- Ajouter la gestion des erreurs avancée