# Guide de Test - Nouvelle Page d'Inscription

## Vue d'ensemble

La nouvelle page d'inscription a été créée avec une interface en 2 étapes inspirée de l'app web, mais adaptée pour mobile avec une UX optimisée.

## Fonctionnalités

### Étape 1 - Informations personnelles
- ✅ Prénom et nom (obligatoires)
- ✅ Ville (obligatoire) - pour les conseils météo
- ✅ Interface responsive avec champs côte à côte
- ✅ Message informatif sur l'utilité de la ville
- ✅ Validation avant passage à l'étape 2

### Étape 2 - Compte et golf
- ✅ Email et mot de passe (obligatoires)
- ✅ Confirmation du mot de passe
- ✅ Boutons pour afficher/masquer les mots de passe
- ✅ Index de golf (optionnel, 0-54)
- ✅ Main dominante (optionnel, boutons de sélection)
- ✅ Validation complète avant soumission

## Interface utilisateur

### Design
- 🎨 Indicateur de progression avec étapes
- 🎨 Sections organisées avec icônes
- 🎨 Couleurs cohérentes avec l'app (vert #10b981)
- 🎨 Animations et transitions fluides
- 🎨 Boutons avec icônes pour une meilleure UX

### Navigation
- ↩️ Retour à la connexion depuis l'étape 1
- ↩️ Retour à l'étape 1 depuis l'étape 2
- ➡️ Progression naturelle entre les étapes

## Tests à effectuer

### Test 1 - Navigation
1. Ouvrir l'app mobile
2. Sur l'écran de connexion, cliquer sur "S'inscrire"
3. Vérifier que la page d'inscription s'affiche
4. Tester les boutons de retour

### Test 2 - Validation Étape 1
1. Essayer de continuer sans remplir les champs
2. Vérifier les messages d'erreur
3. Remplir partiellement et tester
4. Remplir complètement et passer à l'étape 2

### Test 3 - Validation Étape 2
1. Tester avec email invalide
2. Tester avec mot de passe trop court
3. Tester avec mots de passe différents
4. Tester avec index invalide (négatif, > 54)

### Test 4 - Inscription complète
1. Remplir tous les champs obligatoires
2. Ajouter les informations golf optionnelles
3. Soumettre le formulaire
4. Vérifier l'email de confirmation
5. Vérifier le retour à l'écran de connexion

### Test 5 - UX Mobile
1. Tester sur différentes tailles d'écran
2. Vérifier le comportement du clavier
3. Tester le scroll dans les formulaires longs
4. Vérifier l'accessibilité des boutons

## Intégration

### Modifications apportées
- ✅ Nouveau composant `SignupForm.tsx` créé
- ✅ `AuthScreen.tsx` modifié pour utiliser le nouveau composant
- ✅ Sélecteur de main dominante avec boutons personnalisés
- ✅ Mode inscription séparé du mode connexion

### Dépendances
- `@expo/vector-icons` - pour les icônes
- `react-native-safe-area-context` - pour les zones sûres

## Notes techniques

### Structure des données
```typescript
interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  golf_index: string;
  dominant_hand: 'right' | 'left' | 'none';
  city: string;
}
```

### Validation
- Email : regex standard
- Mot de passe : minimum 6 caractères
- Index : nombre entre 0 et 54
- Champs obligatoires : prénom, nom, ville, email, mot de passe

### Gestion d'erreurs
- Messages d'erreur contextuels
- Validation en temps réel
- Gestion des erreurs Supabase
- Feedback utilisateur approprié

## Prochaines améliorations possibles

1. **Validation en temps réel** - Valider les champs pendant la saisie
2. **Sauvegarde temporaire** - Sauvegarder les données entre les étapes
3. **Intégration sociale** - Ajouter Google/Apple Sign-In
4. **Onboarding** - Guide après inscription
5. **Géolocalisation** - Suggestion automatique de ville