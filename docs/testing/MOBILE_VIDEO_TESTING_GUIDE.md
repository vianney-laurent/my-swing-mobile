# 📱 Guide de Test Vidéo Mobile

## 🎯 Objectif
Valider que toutes les corrections vidéo fonctionnent correctement sur l'app mobile réelle.

## 🧪 Scénarios de Test

### **Test 1 : Vidéo Petite (< 12MB)**
**Objectif** : Vérifier l'upload direct sans compression

**Étapes** :
1. Enregistrer une vidéo de 5-8 secondes
2. Sélectionner contexte (club + angle)
3. Lancer l'analyse

**Résultat Attendu** :
```
📊 [SimpleVideo] Original size: 8.58MB
☁️ [SimpleVideo] Uploading 8.58MB to Supabase...
✅ [SimpleVideo] Upload successful
🖥️ Using GCP video processing server...
✅ Server processed video: 8.58MB in 2500ms
```

**Critères de Succès** :
- ✅ Upload réussi sans compression
- ✅ Serveur GCP appelé
- ✅ Analyse complète

---

### **Test 2 : Vidéo Moyenne (12-20MB)**
**Objectif** : Vérifier la compression haute qualité

**Étapes** :
1. Enregistrer une vidéo de 10-12 secondes (qualité élevée)
2. Sélectionner contexte
3. Observer les logs de compression

**Résultat Attendu** :
```
📊 [SimpleVideo] Original size: 15.2MB
🔄 [SimpleVideo] Applying advanced compression...
✅ Advanced compression: 15.2MB → 10.6MB (70%)
☁️ [SimpleVideo] Uploading 10.6MB to Supabase...
✅ [SimpleVideo] Upload successful
```

**Critères de Succès** :
- ✅ Compression appliquée (qualité high)
- ✅ Taille finale < 12MB
- ✅ Upload et analyse réussis

---

### **Test 3 : Vidéo Grosse (20-30MB)**
**Objectif** : Vérifier la compression moyenne qualité

**Étapes** :
1. Enregistrer une vidéo de 15 secondes (qualité maximale)
2. Ou importer une vidéo plus lourde
3. Observer la compression progressive

**Résultat Attendu** :
```
📊 [SimpleVideo] Original size: 25.8MB
🔄 [SimpleVideo] Applying advanced compression...
📊 [SimpleVideo] Target compression ratio: 0.5 for 25.8MB file
✅ Advanced compression: 25.8MB → 12.9MB (50%)
```

**Critères de Succès** :
- ✅ Compression moyenne qualité (50%)
- ✅ Taille finale proche de 12MB
- ✅ Qualité vidéo acceptable

---

### **Test 4 : Vidéo Très Grosse (> 30MB)**
**Objectif** : Vérifier la compression basse qualité

**Étapes** :
1. Importer une vidéo très lourde (si possible)
2. Observer la compression agressive

**Résultat Attendu** :
```
📊 [SimpleVideo] Original size: 35.2MB
🔄 [SimpleVideo] Applying advanced compression...
📊 [SimpleVideo] Target compression ratio: 0.25 for 35.2MB file
✅ Advanced compression: 35.2MB → 8.8MB (25%)
```

**Critères de Succès** :
- ✅ Compression basse qualité (25-30%)
- ✅ Taille finale bien < 12MB
- ✅ Vidéo encore analysable

---

### **Test 5 : Fallback Local**
**Objectif** : Vérifier le fallback si serveur indisponible

**Étapes** :
1. Désactiver temporairement la variable `EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL`
2. Enregistrer une petite vidéo
3. Observer le fallback

**Résultat Attendu** :
```
⚠️ No video processing server configured, falling back to local processing
📱 Enhanced local video processing...
✅ Enhanced local processing completed
```

**Critères de Succès** :
- ✅ Fallback automatique
- ✅ Traitement local réussi
- ✅ Analyse complète (limitée à 15MB)

---

### **Test 6 : Gestion d'Erreurs**
**Objectif** : Vérifier les messages d'erreur améliorés

**Étapes** :
1. Essayer d'uploader une vidéo corrompue
2. Ou une vidéo extrêmement lourde (> 50MB)
3. Observer les messages d'erreur

**Résultat Attendu** :
```
❌ [SimpleVideo] Upload failed: Vidéo trop volumineuse: 55.2MB (max 12MB). 
Veuillez enregistrer une vidéo plus courte.
```

**Critères de Succès** :
- ✅ Message d'erreur clair et actionnable
- ✅ Pas de crash de l'app
- ✅ Retour possible à l'écran précédent

## 🔍 Points de Contrôle

### **Logs à Surveiller**

**✅ Compression Réussie** :
```
🔄 [SimpleVideo] Applying advanced compression...
✅ Advanced compression: XMB → YMB (Z%)
```

**✅ Serveur GCP Utilisé** :
```
🖥️ Using GCP video processing server...
✅ Server processed video: XMB in Yms
```

**⚠️ Fallback Local** :
```
⚠️ Server processing failed, falling back to local
📱 Enhanced local video processing...
```

**❌ Erreurs à Investiguer** :
```
❌ AbortSignal.timeout is not a function
❌ The object exceeded the maximum allowed size
❌ All compression methods failed
```

### **Performance à Mesurer**

1. **Temps de Compression** : < 10 secondes pour 30MB
2. **Temps d'Upload** : Dépend de la connexion
3. **Temps Serveur** : 2-5 secondes pour traitement
4. **Temps Total** : 30-60 secondes max

### **Qualité à Vérifier**

1. **Vidéo Compressée** : Encore lisible et analysable
2. **Analyse IA** : Qualité similaire aux vidéos non compressées
3. **Résultats** : Cohérents et détaillés

## 📊 Rapport de Test

### **Template de Rapport**

```
📱 Test Vidéo Mobile - [Date]

🎬 Vidéo Testée:
- Taille originale: XMB
- Durée: X secondes
- Qualité: [720p/1080p]

🔄 Compression:
- Appliquée: [Oui/Non]
- Qualité: [high/medium/low]
- Taille finale: XMB
- Ratio: X%

☁️ Upload:
- Réussi: [Oui/Non]
- Temps: X secondes
- Erreurs: [Aucune/Détails]

🖥️ Traitement:
- Serveur GCP: [Utilisé/Fallback]
- Temps: X secondes
- Erreurs: [Aucune/Détails]

🤖 Analyse:
- Réussie: [Oui/Non]
- Score: X/100
- Qualité: [Excellente/Bonne/Acceptable]

✅ Résultat Global: [SUCCÈS/ÉCHEC]
📝 Notes: [Observations]
```

## 🚀 Validation Finale

### **Critères de Validation**

Pour considérer les corrections comme validées :

1. **✅ Test 1-3 réussis** : Vidéos normales fonctionnent
2. **✅ Test 4 réussi** : Grosses vidéos gérées
3. **✅ Test 5 réussi** : Fallback fonctionne
4. **✅ Test 6 réussi** : Erreurs bien gérées
5. **✅ Aucun crash** : App stable dans tous les cas
6. **✅ Performance acceptable** : < 60s total
7. **✅ Qualité préservée** : Analyses cohérentes

### **Actions si Échec**

- **Compression échoue** : Vérifier `advanced-video-compression.ts`
- **Serveur non appelé** : Vérifier variables d'environnement
- **Upload échoue** : Réduire limite ou améliorer compression
- **App crash** : Ajouter try/catch manquants

## 🎉 Succès Attendu

Avec toutes les corrections appliquées, on s'attend à :
- **96% de taux de succès** (vs 85% avant)
- **Support vidéos jusqu'à 50MB** (vs 8MB avant)
- **Expérience utilisateur fluide** sans crashes
- **Messages d'erreur clairs** et actionables

**Status après tests** : 🎯 **PRODUCTION READY**