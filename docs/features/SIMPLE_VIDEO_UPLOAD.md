# Upload Vidéo Simplifié

## 🎯 Objectif

Workflow d'upload vidéo simple et rapide sans compression, utilisant la limite Supabase augmentée à 100MB.

## 🚀 Fonctionnalités

### SimpleVideoService
- **Upload direct** vers Supabase Storage
- **Pas de compression** - workflow plus rapide
- **Support jusqu'à 100MB** - limite Supabase configurée
- **Gestion d'erreurs simple** et claire
- **Logging propre** pour le debug

## 📋 Workflow

1. **Vérification** - Fichier existe et taille < 100MB
2. **Lecture** - Via fetch() pour efficacité maximale
3. **Conversion** - Blob → ArrayBuffer → Uint8Array
4. **Upload** - Direct vers Supabase Storage
5. **URL** - Génération de l'URL publique

## 🔧 Utilisation

```typescript
import { simpleVideoService } from '../video/simple-video-service';

const result = await simpleVideoService.uploadVideo(videoUri, analysisId);

if (result.success) {
  console.log('Video uploaded:', result.videoUrl);
  console.log('File size:', result.fileSize);
} else {
  console.error('Upload failed:', result.error);
}
```

## 📊 Avantages vs Compression

| Aspect | Compression | Simple Upload |
|--------|-------------|---------------|
| Vitesse | Lent (compression + upload) | Rapide (upload direct) |
| Complexité | Élevée | Faible |
| Qualité | Dégradée | Originale |
| Bugs | Risque élevé | Risque faible |
| Maintenance | Difficile | Facile |

## 🧪 Tests

```bash
node scripts/test-simple-upload.js
```

## 🔍 Logs à surveiller

- `✅ [SimpleVideo] Upload successful` - Upload réussi
- `📊 [SimpleVideo] File size: XMB` - Taille du fichier
- `❌ [SimpleVideo] Upload failed` - Échec à investiguer

## 🚨 Gestion d'erreurs

- **File too large** - Fichier > 100MB
- **File does not exist** - URI invalide
- **Supabase upload failed** - Problème côté serveur
- **Failed to generate public URL** - Problème de configuration

## 🎉 Résultat

Workflow beaucoup plus simple, rapide et fiable pour l'upload vidéo mobile.