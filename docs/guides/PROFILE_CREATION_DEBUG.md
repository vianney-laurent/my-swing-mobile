# Debug - Création de Profil lors de l'Inscription

## Problème identifié et résolu

### Problème initial
- Le prénom et nom n'étaient pas enregistrés dans le profil
- Erreur de nom de table : `user_profiles` au lieu de `profiles`
- Conflit potentiel entre le trigger automatique et l'insertion manuelle

### Solutions appliquées

#### 1. Correction du nom de table
```typescript
// AVANT (incorrect)
.from('user_profiles')

// APRÈS (correct)
.from('profiles')
```

#### 2. Utilisation d'UPSERT au lieu d'INSERT
```typescript
// AVANT (risque de conflit)
.insert({...})

// APRÈS (robuste)
.upsert({...}, { onConflict: 'id' })
```

### Workflow de création de profil

1. **Inscription utilisateur** - `supabase.auth.signUp()`
2. **Trigger automatique** - Crée un profil basique avec `id` et `email`
3. **UPSERT manuel** - Met à jour le profil avec toutes les informations du formulaire

### Champs enregistrés

#### Obligatoires
- ✅ `first_name` - Prénom
- ✅ `last_name` - Nom
- ✅ `city` - Ville
- ✅ `email` - Email

#### Optionnels
- ✅ `golf_index` - Index de golf (0-54)
- ✅ `dominant_hand` - Main dominante ('right', 'left', ou null)

### Test de vérification

Pour vérifier que le profil est bien créé :

1. **Créer un compte** via l'app mobile
2. **Vérifier en base** :
```sql
SELECT * FROM profiles WHERE email = 'test@example.com';
```

3. **Vérifier dans l'app** :
   - Aller dans le profil utilisateur
   - Tous les champs doivent être pré-remplis

### Gestion d'erreurs

- Si l'UPSERT échoue, l'inscription continue
- L'utilisateur peut compléter son profil plus tard
- Les erreurs sont loggées pour le debug

### Structure de la table profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  golf_index DECIMAL(3,1),
  dominant_hand TEXT CHECK (dominant_hand IN ('right', 'left')),
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Points d'attention

1. **Trigger automatique** - Le trigger `on_auth_user_created` crée automatiquement un profil basique
2. **UPSERT** - Permet de mettre à jour le profil existant ou d'en créer un nouveau
3. **Validation** - Les données sont validées côté client avant envoi
4. **Sécurité** - RLS (Row Level Security) activé sur la table

### Logs de debug

Pour débugger les problèmes de création de profil :

```typescript
console.log('User created:', authData.user.id);
console.log('Profile data:', {
  first_name: formData.first_name.trim(),
  last_name: formData.last_name.trim(),
  // ...
});
console.log('Profile error:', profileError);
```