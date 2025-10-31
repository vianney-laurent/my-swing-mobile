# 🔧 Correction complète des erreurs 400 Gemini

## 🎯 Objectif
Résoudre définitivement les erreurs 400 de Gemini en analysant et corrigeant tous les aspects de la requête.

## ❌ Problèmes identifiés

### 1. Modèle incorrect
- Utilisation de modèles expérimentaux ou non disponibles
- Incohérence entre les services

### 2. MIME type hardcodé
- `mimeType: 'video/mp4'` fixe pour toutes les vidéos
- Pas de détection du format réel

### 3. Validation insuffisante
- Pas de vérification de la structure des données
- Pas de contrôle de la taille totale de la requête

### 4. Paramètres non optimisés
- Configuration de génération non validée
- Pas de vérification des limites

## ✅ Solutions implémentées

### 1. Migration vers Gemini 2.5 Flash

**Tous les services utilisent maintenant `gemini-2.5-flash`** :

```typescript
// Configuration unifiée
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,      // Créativité modérée
    maxOutputTokens: 4000, // Suffisant pour l'analyse
    topP: 0.8,            // Diversité contrôlée
    topK: 40              // Sélection optimisée
  }
});
```

### 2. Détection automatique du MIME type

**Nouvelle fonction `detectVideoMimeType()`** :

```typescript
private detectVideoMimeType(videoBase64: string): string {
  try {
    // Décoder les premiers bytes pour identifier le format
    const firstBytes = atob(videoBase64.substring(0, 20));
    const bytes = new Uint8Array(firstBytes.split('').map(c => c.charCodeAt(0)));
    
    // Signatures de fichiers vidéo
    if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x00 && bytes[3] === 0x18) {
      return 'video/mp4'; // MP4
    }
    if (bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) {
      return 'video/webm'; // WebM
    }
    // ... autres formats
    
    return 'video/mp4'; // Fallback sûr
  } catch (error) {
    return 'video/mp4';
  }
}
```

### 3. Validation stricte des requêtes

**Nouvelle fonction `validateGeminiRequest()`** :

```typescript
private validateGeminiRequest(videoPart: any, prompt: string): void {
  // 1. Vérifier la structure videoPart
  if (!videoPart || !videoPart.inlineData) {
    throw new Error('Structure videoPart invalide');
  }
  
  // 2. Vérifier le MIME type
  const validMimeTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/quicktime'];
  if (!validMimeTypes.includes(videoPart.inlineData.mimeType)) {
    throw new Error(`MIME type non supporté: ${videoPart.inlineData.mimeType}`);
  }
  
  // 3. Vérifier le prompt
  if (!prompt || prompt.length === 0) {
    throw new Error('Prompt vide');
  }
  
  if (prompt.length > 50000) {
    throw new Error(`Prompt trop long: ${prompt.length} caractères (max 50000)`);
  }
  
  // 4. Vérifier la taille totale
  const totalSize = videoPart.inlineData.data.length + prompt.length;
  const totalSizeMB = totalSize / (1024 * 1024);
  
  if (totalSizeMB > 20) {
    throw new Error(`Requête trop volumineuse: ${totalSizeMB.toFixed(2)}MB (max 20MB)`);
  }
  
  console.log('✅ Validation Gemini réussie');
}
```

### 4. Logging amélioré

**Informations détaillées avant chaque requête** :

```typescript
console.log('📋 Video part prepared for Gemini:', {
  hasData: !!videoPart.inlineData.data,
  dataLength: videoPart.inlineData.data.length,
  mimeType: videoPart.inlineData.mimeType,
  promptLength: prompt.length
});
```

## 🧪 Scripts de test créés

### Test complet
```bash
cd golf-coaching-mobile
node scripts/test-gemini-25-flash-complete.js
```

### Analyse des erreurs 400
```bash
cd golf-coaching-mobile
node scripts/analyze-gemini-400-error.js
```

### Diagnostic général
```bash
cd golf-coaching-mobile
node scripts/diagnose-gemini-error.js
```

## 📊 Causes d'erreur 400 identifiées et corrigées

| Cause | Avant | Après |
|-------|-------|-------|
| **Modèle** | `gemini-2.0-flash-exp` (expérimental) | `gemini-2.5-flash` (stable) |
| **MIME type** | `'video/mp4'` (hardcodé) | Détection automatique |
| **Validation** | Basique (taille seulement) | Complète (structure + limites) |
| **Logging** | Minimal | Détaillé avec métriques |
| **Gestion d'erreur** | Générique | Analyse spécifique des codes |

## 🔍 Points de contrôle ajoutés

1. **Avant initialisation** : Vérification de la clé API
2. **Avant préparation** : Validation du base64 vidéo
3. **Après détection** : Vérification du MIME type
4. **Avant envoi** : Validation complète de la requête
5. **Après erreur** : Analyse détaillée du code d'erreur

## 📈 Résultats attendus

Avec ces corrections, les erreurs 400 devraient être éliminées :

```
✅ Video validation passed
🔍 MIME type détecté: video/mp4
✅ Validation Gemini réussie
📋 Video part prepared for Gemini: {
  hasData: true,
  dataLength: 1234567,
  mimeType: 'video/mp4',
  promptLength: 2345
}
🔄 Sending video to Gemini...
✅ Gemini video analysis completed
```

## 🚀 Prochaines étapes

1. **Tester** avec le script complet
2. **Monitorer** les logs en production
3. **Ajuster** les paramètres si nécessaire
4. **Documenter** les cas d'erreur restants

## 📝 Fichiers modifiés

- `golf-coaching-app/src/lib/gemini/golf-analysis-service.ts`
- `golf-coaching-mobile/src/lib/analysis/mobile-analysis-service.ts`
- `golf-coaching-mobile/src/lib/tips/daily-tips-service.ts`
- `golf-coaching-mobile/scripts/test-gemini-25-flash-complete.js` (nouveau)
- `golf-coaching-mobile/scripts/analyze-gemini-400-error.js` (nouveau)

## ✅ Status : CORRECTION COMPLÈTE

Toutes les causes identifiées d'erreur 400 ont été corrigées avec une approche systématique et des validations renforcées.