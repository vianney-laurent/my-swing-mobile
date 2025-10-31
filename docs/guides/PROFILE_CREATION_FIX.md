# Fix - Création de Profil Complet (Mobile)

## Problèmes identifiés

### 1. Informations personnelles non sauvegardées
- Le prénom, nom et ville n'apparaissaient pas dans le profil
- L'UPSERT ne fonctionnait pas correctement
- Pas assez de logs pour débugger

### 2. Code d'inscription incomplet
- Gestion d'erreurs insuffisante
- Pas de validation des données
- Pas de stratégie de fallback

## Solutions appliquées (Mobile uniquement)

### 1. Service spécialisé créé
- `SignupProfileService` avec stratégies multiples
- Validation des données avant insertion
- Attente intelligente du trigger automatique
- Logs détaillés pour débugger

### 2. Code d'inscription robuste
- Stratégie de fallback : UPSERT → UPDATE → INSERT
- Validation des données du profil
- Attente du trigger automatique
- Gestion d'erreurs améliorée

### 3. Suppression du golf_level
- Supprimé de `AuthService.signUp()` mobile
- Plus utilisé dans les analyses (remplacé par golf_index)
- Code simplifié

### 4. Outils de debug ajoutés
- `DatabaseChecker` pour diagnostiquer les problèmes
- Bouton de test dans le formulaire d'inscription (mode dev)
- Logs détaillés à chaque étape

## Structure finale de la table profiles

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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deletion_requested_at TIMESTAMPTZ,
  deletion_scheduled_for TIMESTAMPTZ
);
```

## Workflow de création de profil

1. **Inscription utilisateur** - `supabase.auth.signUp()`
2. **Trigger automatique** - Crée profil minimal (id + email)
3. **Délai de 2 secondes** - Laisse le temps au trigger
4. **UPSERT** - Ajoute toutes les informations du formulaire
5. **Fallback UPDATE** - Si UPSERT échoue
6. **Fallback INSERT** - Si UPDATE échoue aussi

## Tests à effectuer

### 1. Appliquer la migration
```bash
cd golf-coaching-app
node scripts/apply-profiles-fix.js
```

### 2. Tester l'inscription
1. Créer un nouveau compte via l'app mobile
2. Vérifier les logs dans la console
3. Vérifier que le profil est créé avec toutes les infos

### 3. Vérifier en base de données
```sql
SELECT * FROM profiles WHERE email = 'test@example.com';
```

## Logs de debug

Le nouveau code affiche des logs détaillés :

```
🚀 Starting signup process...
✅ User created successfully: [user-id]
📝 Profile data to insert: { id, email, first_name, ... }
✅ Profile upserted successfully: [profile-data]
```

En cas d'erreur :
```
❌ Profile upsert error: [error]
🔄 Trying alternative approach: UPDATE then INSERT...
✅ Profile updated successfully
```

## Points d'attention

1. **Migration nécessaire** - Appliquer `fix_profiles_structure.sql`
2. **Délai de 2 secondes** - Nécessaire pour laisser le trigger s'exécuter
3. **Stratégie de fallback** - Assure que le profil est créé même en cas d'erreur
4. **Logs détaillés** - Permettent de débugger les problèmes

## Vérification du succès

Après inscription, le profil doit contenir :
- ✅ `first_name` - Prénom saisi
- ✅ `last_name` - Nom saisi  
- ✅ `city` - Ville saisie
- ✅ `email` - Email saisi
- ✅ `golf_index` - Index si saisi (ou null)
- ✅ `dominant_hand` - Main dominante si saisie (ou null)

## Nettoyage effectué

- ❌ Supprimé `golf_level` de la table
- ❌ Supprimé `golf_level` du code
- ❌ Supprimé la logique de création de profil dans `AuthService.signUp()`
- ✅ Simplifié le workflow d'inscription