# Guide de Debug - Inscription Mobile

## Problème identifié
Les informations personnelles ne sont pas sauvegardées à cause des **politiques RLS (Row Level Security)** qui empêchent l'insertion lors de l'inscription.

**Erreur typique :** `"new row violates row-level security policy for table \"profiles\""`

## Solution implémentée

### 1. Système de profils en attente
- Sauvegarde des données dans AsyncStorage lors de l'inscription
- Création du profil lors de la première connexion (quand l'utilisateur est authentifié)
- Nettoyage automatique après création

### 2. Services créés
- `SignupProfileService` - Création de profil avec stratégies multiples
- `PendingProfileService` - Gestion des profils en attente
- `DatabaseChecker` - Diagnostic des problèmes

### 3. Workflow d'inscription
1. **Inscription** → Sauvegarde des données en local
2. **Première connexion** → Création du profil complet
3. **Nettoyage** → Suppression des données temporaires

## Comment tester

### 1. Vérifier les logs
Ouvrir la console de développement et créer un compte. Vous devriez voir :

```
🚀 Starting signup process...
✅ User created successfully: [user-id]
⏳ Waiting for trigger to create base profile...
✅ Trigger profile found after [time] ms
📝 Creating complete profile...
📝 Creating signup profile with data: { id, email, first_name, ... }
✅ Profile created via UPSERT
✅ Profile created successfully: [profile-data]
```

### 2. Vérifier en base de données
Après inscription, vérifier que le profil contient toutes les informations :

```sql
SELECT * FROM profiles WHERE email = 'votre-email@test.com';
```

Champs attendus :
- ✅ `first_name` - Prénom saisi
- ✅ `last_name` - Nom saisi
- ✅ `city` - Ville saisie
- ✅ `email` - Email saisi
- ✅ `golf_index` - Index si saisi (ou null)
- ✅ `dominant_hand` - Main dominante si saisie (ou null)

### 3. Tester avec le script
```bash
cd golf-coaching-mobile
node scripts/test-profile-creation.js
```

## Logs de debug possibles

### Inscription avec session active (rare)
```
🚀 Starting signup process...
✅ User created successfully: abc123
⏳ Waiting for user session...
✅ User session found, creating profile...
📝 Creating signup profile with data: {...}
✅ Profile created successfully
```

### Inscription normale (profil en attente)
```
🚀 Starting signup process...
✅ User created successfully: abc123
⏳ Waiting for user session...
⚠️ No active session, saving profile for later completion
💾 Profile data saved for completion on first login
```

### Première connexion (profil complété)
```
✅ User signed in successfully
🔄 Checking for pending profile for user: abc123
📝 Found pending profile, attempting to create...
✅ Pending profile completed successfully
🗑️ Pending profile cleared for user: abc123
```

### Problème RLS (attendu lors de l'inscription)
```
❌ Test profile creation failed: new row violates row-level security policy
❌ INSERT permission failed: new row violates row-level security policy
💾 Profile data saved for later completion
```

## Points de vérification

1. **Configuration Supabase** - Vérifier que les variables d'environnement sont correctes
2. **Structure de table** - S'assurer que la table `profiles` a tous les champs nécessaires
3. **Permissions RLS** - Vérifier que les politiques permettent l'insertion
4. **Trigger automatique** - S'assurer qu'il fonctionne correctement

## Dépannage

### Si les logs ne s'affichent pas
- Ouvrir les outils de développement
- Aller dans l'onglet Console
- Filtrer par "signup" ou "profile"

### Si le profil n'est pas créé
1. Vérifier les logs d'erreur
2. Tester la connexion à Supabase
3. Vérifier les permissions de la table
4. Tester manuellement en base

### Si certains champs manquent
1. Vérifier que les champs existent dans la table
2. Vérifier la validation des données
3. Vérifier les logs de création

## Structure attendue de la table profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  golf_index DECIMAL(3,1),
  dominant_hand TEXT CHECK (dominant_hand IN ('right', 'left')),
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Prochaines étapes

1. Tester l'inscription avec les nouveaux logs
2. Vérifier que toutes les informations sont sauvegardées
3. Confirmer que le profil s'affiche correctement dans l'app
4. Nettoyer les logs de debug si tout fonctionne