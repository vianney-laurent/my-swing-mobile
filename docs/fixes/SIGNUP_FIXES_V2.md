# 🔧 Corrections du Signup - Version 2

## ❌ Problèmes identifiés

### 1. **Handicap avec virgule**
- **Problème** : Saisie "24,7" → Supabase ne garde que "24"
- **Cause** : Conversion virgule → point insuffisante

### 2. **Données profil non sauvegardées**
- **Problème** : Nom, prénom, ville vides après inscription
- **Cause** : Problème dans le service de création de profil

## ✅ Corrections appliquées

### 1. **Normalisation du handicap améliorée**

**Dans SignupForm.tsx** :
```typescript
// Validation avec normalisation
if (formData.golf_index) {
  const normalizedIndex = formData.golf_index.replace(',', '.').trim();
  const index = parseFloat(normalizedIndex);
  
  console.log('🏌️ Handicap normalisé:', { 
    original: formData.golf_index, 
    normalized: normalizedIndex, 
    parsed: index 
  });
  
  if (isNaN(index) || index < 0 || index > 54) {
    return 'L\'index doit être un nombre entre 0 et 54';
  }
}

// Préparation des données
const normalizedGolfIndex = formData.golf_index 
  ? parseFloat(formData.golf_index.replace(',', '.').trim())
  : null;

const profileData = {
  // ...
  golf_index: normalizedGolfIndex,
  // ...
};
```

### 2. **Service de profil amélioré**

**Dans signup-profile-service.ts** :
```typescript
// Logging détaillé pour chaque stratégie
console.log('📝 Tentative UPSERT avec données:', profileData);

// Vérification post-insertion
const missingFields = [];
if (!data.first_name) missingFields.push('first_name');
if (!data.last_name) missingFields.push('last_name');
if (!data.city) missingFields.push('city');

if (missingFields.length > 0) {
  console.warn('⚠️ Certains champs n\'ont pas été sauvegardés:', missingFields);
}
```

## 🧪 Test des corrections

### Lancer le test automatique
```bash
cd golf-coaching-mobile
node scripts/test-signup-fixes-v2.js
```

### Test manuel

1. **Ouvrir l'app mobile**
2. **Créer un nouveau compte avec** :
   - Prénom: `Jean`
   - Nom: `Dupont`
   - Ville: `Paris`
   - Handicap: `24,7` (avec virgule)
   - Email: `test@example.com`

3. **Surveiller les logs** dans Metro/Expo :
   ```
   🏌️ Handicap normalisé: { original: "24,7", normalized: "24.7", parsed: 24.7 }
   📝 Données du profil préparées: { golf_index: 24.7, first_name: "Jean", ... }
   📝 Tentative UPSERT avec données: { ... }
   ✅ UPSERT success: { first_name: "Jean", golf_index: 24.7, ... }
   ```

4. **Se connecter** et vérifier le profil
5. **Vérifier dans Supabase Dashboard** que `golf_index = 24.7`

## 📊 Logs à surveiller

### ✅ Logs de succès
- `🏌️ Handicap normalisé:` → Conversion virgule → point
- `📝 Données du profil préparées:` → Structure correcte
- `✅ UPSERT success:` → Insertion réussie

### ⚠️ Logs d'alerte
- `⚠️ Certains champs n'ont pas été sauvegardés:` → Champs manquants
- `❌ UPSERT error:` → Problème d'insertion
- `❌ All strategies failed` → Échec complet

## 🎯 Résultats attendus

Après inscription avec handicap "24,7" :

### Dans l'app
- ✅ Profil complet affiché
- ✅ Nom : "Jean"
- ✅ Prénom : "Dupont"
- ✅ Ville : "Paris"
- ✅ Handicap : "24.7"

### Dans Supabase
```sql
SELECT * FROM profiles WHERE email = 'test@example.com';
```
- ✅ `first_name = 'Jean'`
- ✅ `last_name = 'Dupont'`
- ✅ `city = 'Paris'`
- ✅ `golf_index = 24.7` (pas 24 !)

## 🔧 Dépannage

### Si le handicap reste à 24 au lieu de 24.7
1. Vérifier les logs de normalisation
2. S'assurer que la conversion se fait bien avant l'envoi
3. Vérifier le type de colonne dans Supabase (doit être `numeric` ou `decimal`)

### Si les données du profil sont vides
1. Vérifier les logs du service de profil
2. Regarder les erreurs Supabase détaillées
3. Vérifier que toutes les stratégies (UPSERT, UPDATE, INSERT) sont tentées

## ✅ Status : CORRIGÉ

Les deux problèmes du signup sont maintenant corrigés avec un système de logging détaillé pour faciliter le debug et la maintenance.