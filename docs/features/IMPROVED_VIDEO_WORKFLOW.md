# 🎯 Workflow Vidéo Amélioré - App Mobile

## 🚨 Problème Résolu

L'ancienne version de l'app mobile faisait du traitement vidéo local qui causait :
- Limitations de taille (max ~15MB)
- Crashes sur gros fichiers
- Performance dégradée sur mobile
- Inconsistance avec l'app web

## ✅ Nouvelle Architecture

### **Workflow Unifié Mobile/Web**

```
📱 Mobile App
    ↓ Upload
🗄️ Supabase Storage (URL publique)
    ↓ URL signée
🖥️ GCP Video Processing Server
    ↓ Base64 optimisé
🤖 Gemini 2.0 Flash Analysis
    ↓ Résultats
💾 Supabase Database
```

### **Étapes Détaillées**

1. **Capture Mobile** (CameraScreen)
   - Enregistrement local avec CameraView/ImagePicker
   - Durée max : 15 secondes (pour limiter taille)
   - Compression automatique si > 20MB

2. **Upload Supabase** (SimpleVideoService)
   ```typescript
   const uploadResult = await simpleVideoService.uploadVideo(videoUri, analysisId);
   // Résultat : URL publique Supabase
   ```

3. **Traitement Serveur GCP** (MobileAnalysisService)
   ```typescript
   const videoBase64 = await this.processVideoWithServer(supabaseVideoUrl);
   // Le serveur télécharge depuis Supabase et optimise pour Gemini
   ```

4. **Analyse Gemini** (même logique que web)
   - Prompt personnalisé selon profil utilisateur
   - Instructions spécifiques au club et angle
   - Réponse JSON structurée

5. **Sauvegarde** (même structure que web)

## 🔧 Configuration Requise

### Variables d'Environnement

```env
# Serveur de traitement vidéo (même que l'app web)
EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL=https://your-gcp-server.run.app

# Gemini AI
EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key

# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Déploiement Serveur GCP

Le serveur `video-processing-server` doit être déployé et accessible :
- Support des URLs Supabase ✅
- Limite 100MB (vs 15MB local) ✅
- Optimisation professionnelle ✅
- Timeout 3 minutes ✅

## 📊 Avantages

### **Performance**
- ✅ Traitement serveur professionnel
- ✅ Pas de limitation mémoire mobile
- ✅ Support vidéos jusqu'à 100MB
- ✅ Optimisation automatique pour Gemini

### **Fiabilité**
- ✅ Fallback local si serveur indisponible
- ✅ Retry automatique
- ✅ Gestion d'erreurs robuste
- ✅ Timeout appropriés

### **Consistance**
- ✅ Même workflow que l'app web
- ✅ Même qualité d'analyse
- ✅ Même structure de données
- ✅ Maintenance simplifiée

## 🔄 Fallback Strategy

Si le serveur GCP est indisponible :
```typescript
try {
  return await this.processVideoWithServer(supabaseVideoUrl, onProgress);
} catch (error) {
  console.warn('⚠️ Server processing failed, falling back to local:', error);
  return await this.processVideoLocallyEnhanced(videoUri, onProgress);
}
```

Le traitement local reste disponible comme backup pour les petites vidéos.

## 🧪 Tests

### Test du Workflow Complet
```bash
cd golf-coaching-mobile
npm run test:video-workflow
```

### Test du Serveur GCP
```bash
cd video-processing-server
npm test
```

## 📈 Métriques Attendues

- **Taille max supportée** : 20MB → 100MB
- **Taux de succès** : +15% (moins de crashes)
- **Temps de traitement** : Similaire (serveur optimisé)
- **Qualité analyse** : Identique à l'app web

## 🚀 Migration

### Pour les Développeurs

1. Mettre à jour `.env` avec `EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL`
2. S'assurer que le serveur GCP est déployé
3. Tester avec des vidéos > 15MB
4. Vérifier les logs de fallback

### Pour les Utilisateurs

- Aucun changement visible
- Meilleure fiabilité pour les grosses vidéos
- Temps de traitement similaire
- Qualité d'analyse améliorée

## 🔍 Monitoring

Les logs incluent maintenant :
- `🖥️ Using GCP video processing server...`
- `⚠️ Server processing failed, falling back to local`
- `✅ Server processed video: XMB in Yms`

Surveiller le taux d'utilisation serveur vs fallback local.