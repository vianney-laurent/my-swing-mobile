# Gestion des Vidéos Manquantes

## 🎯 Contexte

Certaines analyses peuvent avoir leurs fichiers vidéo supprimés du storage Supabase tout en conservant les données d'analyse en base. L'app doit gérer ces cas gracieusement.

## 🔍 Détection Automatique

### Erreur Supabase
```
StorageApiError: Object not found
```

### Gestion dans le Code
```typescript
if (signedUrlError.message?.includes('Object not found')) {
  console.warn('⚠️ [Unified] Video file no longer exists in storage');
  parsedAnalysis.video_url = null; // Marquer comme manquante
}
```

## 🎨 Interface Utilisateur

### Écran de Résultats d'Analyse

#### Avec Vidéo (Normal)
```jsx
<EnhancedVideoPlayer
  videoUrl={analysisData.videoUrl}
  title="Votre Swing Analysé"
/>
```

#### Sans Vidéo (Gracieux)
```jsx
<View style={styles.missingVideoContainer}>
  <Ionicons name="videocam-off" size={48} color="#64748b" />
  <Text style={styles.missingVideoTitle}>Vidéo non disponible</Text>
  <Text style={styles.missingVideoText}>
    La vidéo de cette analyse n'est plus disponible, mais vous pouvez 
    toujours consulter les résultats détaillés ci-dessous.
  </Text>
</View>
```

### Historique des Analyses
- ✅ **Cartes d'analyse** : Pas d'impact (pas de vidéo affichée)
- ✅ **Navigation** : Fonctionne normalement
- ✅ **Données** : Toutes les analyses restent accessibles

## 📊 Cas d'Usage

### Analyses Complètes (Vidéo + Données)
- **Affichage** : Lecteur vidéo + analyse détaillée
- **Fonctionnalités** : Navigation temporelle, contrôles avancés
- **Expérience** : Optimale

### Analyses Orphelines (Données Seulement)
- **Affichage** : Message informatif + analyse détaillée
- **Fonctionnalités** : Consultation des résultats textuels
- **Expérience** : Dégradée mais utilisable

## 🛠️ Outils de Diagnostic

### Script de Vérification
```bash
node scripts/check-orphaned-analyses.js
```

**Rapport généré :**
- Nombre total d'analyses
- Analyses avec vidéo valide
- Analyses orphelines (vidéo manquante)
- Analyses sans URL vidéo

### Logs de Diagnostic
```
⚠️ [Unified] Video file no longer exists in storage
✅ [Unified] Generated fresh signed URL for video
```

## 🔄 Workflow de Gestion

### 1. Détection Automatique
- Tentative de génération d'URL signée
- Capture de l'erreur "Object not found"
- Marquage `video_url = null`

### 2. Affichage Adaptatif
- Vérification `analysisData.videoUrl`
- Affichage conditionnel du lecteur ou du message
- Préservation de l'accès aux données d'analyse

### 3. Expérience Utilisateur
- **Message clair** : "Vidéo non disponible"
- **Explication** : Données d'analyse toujours consultables
- **Pas de blocage** : Navigation normale

## 📈 Métriques

### Avant la Gestion
- ❌ Crash de l'app sur vidéo manquante
- ❌ Analyses inaccessibles
- ❌ Expérience utilisateur cassée

### Après la Gestion
- ✅ Gestion gracieuse des erreurs
- ✅ Analyses toujours accessibles
- ✅ Expérience utilisateur préservée

## 🎯 Recommandations

### Pour les Utilisateurs
- **Aucune action requise** : Gestion automatique
- **Données préservées** : Analyses toujours consultables
- **Nouvelle analyses** : Vidéos correctement sauvegardées

### Pour les Développeurs
- **Monitoring** : Surveiller les logs d'erreur storage
- **Nettoyage** : Optionnel, supprimer les analyses très anciennes
- **Prévention** : Nouveau système sauvegarde les chemins (pas URLs)

## 🚀 Évolutions Futures

### Améliorations Possibles
- **Indicateur visuel** dans l'historique (icône vidéo barrée)
- **Statistiques** : Pourcentage d'analyses avec vidéo
- **Re-upload** : Permettre d'associer une nouvelle vidéo

### Optimisations
- **Cache des vérifications** : Éviter les appels répétés
- **Batch processing** : Vérifier plusieurs vidéos en une fois
- **Cleanup automatique** : Supprimer les analyses très anciennes

La gestion des vidéos manquantes garantit une **expérience utilisateur robuste** même en cas de problèmes de storage.