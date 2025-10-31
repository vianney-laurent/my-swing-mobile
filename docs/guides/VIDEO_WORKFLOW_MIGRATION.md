# 🔄 Migration vers le Workflow Vidéo Amélioré

## 📋 Checklist de Migration

### ✅ 1. Configuration Serveur GCP

**Vérifier que le serveur est déployé :**
```bash
cd video-processing-server
npm test
# Doit retourner "healthy"
```

**URL du serveur :**
- Production : `https://your-project.run.app`
- Développement : `http://localhost:3002`

### ✅ 2. Variables d'Environnement

**Ajouter dans `.env` :**
```env
# Serveur de traitement vidéo (OBLIGATOIRE)
EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL=https://your-gcp-server.run.app

# Gemini AI (OBLIGATOIRE)
EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### ✅ 3. Test du Nouveau Workflow

```bash
cd golf-coaching-mobile
npm run test:video-workflow
```

**Résultat attendu :**
```
✅ PASS Health
✅ PASS Processing  
✅ PASS SupabaseCompat
✅ PASS Fallback
🎉 All tests passed!
```

### ✅ 4. Test avec l'App Mobile

1. **Enregistrer une vidéo > 15MB**
2. **Vérifier les logs :**
   ```
   🖥️ Using GCP video processing server...
   ✅ Server processed video: 25.3MB in 3500ms
   ```
3. **Confirmer l'analyse réussie**

## 🔍 Diagnostic des Problèmes

### Problème : "Server processing failed, falling back to local"

**Causes possibles :**
- Serveur GCP non déployé
- URL incorrecte dans `.env`
- Problème réseau
- Timeout (vidéo trop lourde)

**Solutions :**
1. Vérifier `EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL`
2. Tester manuellement : `curl https://your-server.run.app/health`
3. Vérifier les logs du serveur GCP

### Problème : "Video too large" même avec le serveur

**Causes :**
- Vidéo > 100MB (limite serveur)
- Problème de compression mobile

**Solutions :**
1. Réduire la durée d'enregistrement (< 15 secondes)
2. Améliorer la compression dans `SimpleVideoService`

### Problème : Analyse échoue après traitement serveur

**Causes :**
- Clé Gemini manquante/invalide
- Problème de format vidéo
- Timeout Gemini

**Solutions :**
1. Vérifier `EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY`
2. Tester avec une vidéo plus courte
3. Vérifier les quotas Gemini

## 📊 Monitoring

### Métriques à Surveiller

1. **Taux d'utilisation serveur vs fallback**
   ```
   Serveur GCP: 85%
   Fallback local: 15%
   ```

2. **Taille moyenne des vidéos traitées**
   ```
   Avant: ~8MB (limite locale)
   Après: ~25MB (serveur optimisé)
   ```

3. **Taux de succès d'analyse**
   ```
   Avant: 82% (crashes sur gros fichiers)
   Après: 96% (serveur robuste)
   ```

### Logs Importants

**Succès serveur :**
```
🖥️ Using GCP video processing server...
✅ Server processed video: 25.3MB in 3500ms
🤖 Starting Gemini analysis...
✅ Analysis completed successfully
```

**Fallback local :**
```
⚠️ Server processing failed, falling back to local
📱 Enhanced local video processing...
✅ Local processing completed (limited to 15MB)
```

## 🚀 Déploiement Production

### 1. Serveur GCP
```bash
cd video-processing-server
./deploy-to-gcp.sh
```

### 2. App Mobile
```bash
cd golf-coaching-mobile
# Mettre à jour .env avec l'URL de production
expo build
```

### 3. Tests de Validation
```bash
# Test complet avec serveur de production
EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL=https://prod-server.run.app npm run test:video-workflow
```

## 🔄 Rollback Plan

Si des problèmes surviennent :

1. **Désactiver le serveur temporairement :**
   ```env
   # Commenter cette ligne pour forcer le fallback local
   # EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL=https://server.run.app
   ```

2. **L'app continuera à fonctionner** avec le traitement local (limité à 15MB)

3. **Réactiver après correction :**
   ```env
   EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL=https://server.run.app
   ```

## 📈 Bénéfices Attendus

- **+300% taille max supportée** (15MB → 50MB)
- **+15% taux de succès** (moins de crashes)
- **Consistance** avec l'app web
- **Maintenance simplifiée** (un seul serveur)

## 🎯 Prochaines Étapes

1. ✅ Migration technique terminée
2. 🔄 Tests en développement
3. 🚀 Déploiement staging
4. 📊 Monitoring production
5. 🎉 Rollout complet