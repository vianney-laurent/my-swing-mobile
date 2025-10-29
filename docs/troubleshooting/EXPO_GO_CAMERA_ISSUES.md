# Problèmes de caméra avec Expo Go

## Problème identifié

L'erreur `Camera is not ready yet. Wait for 'onCameraReady' callback` est un problème connu avec `expo-camera` dans Expo Go.

### Cause du problème

- **Expo Go** a des limitations avec certaines APIs natives
- **expo-camera** ne fonctionne pas de manière fiable dans l'environnement Expo Go
- Le callback `onCameraReady` se déclenche mais la caméra n'est pas vraiment prête pour l'enregistrement

## Solutions implémentées

### 1. Fallback automatique vers ImagePicker

Quand l'erreur "Camera is not ready" est détectée :
```typescript
const useImagePickerFallback = async () => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    allowsEditing: false,
    quality: 0.8,
    videoMaxDuration: 30,
  });
  // ...
};
```

### 2. Bouton alternatif

Un bouton "Utiliser la caméra système" permet d'accéder directement à ImagePicker.

## Recommandations

### Pour le développement

1. **Utiliser un build de développement** au lieu d'Expo Go :
   ```bash
   npx expo run:ios
   # ou
   npx expo run:android
   ```

2. **Tester sur un appareil physique** avec un build natif

### Pour la production

- **Build natif obligatoire** : expo-camera nécessite un build natif
- **Pas de limitation** : Fonctionne parfaitement en production

## Différences de comportement

### Expo Go
- ❌ expo-camera ne fonctionne pas de manière fiable
- ✅ ImagePicker fonctionne parfaitement
- ⚠️ Interface de caméra limitée

### Build natif
- ✅ expo-camera fonctionne parfaitement
- ✅ Interface de caméra complète
- ✅ Contrôles avancés disponibles

## Workaround temporaire

Le code actuel détecte automatiquement les erreurs de caméra et bascule vers ImagePicker :

```typescript
catch (error) {
  if (error.message.includes('Camera is not ready')) {
    console.log('🔄 Using ImagePicker fallback for Expo Go...');
    await useImagePickerFallback();
  }
}
```

## Tests recommandés

### Dans Expo Go
- ✅ Tester le bouton "Utiliser la caméra système"
- ✅ Vérifier que l'analyse fonctionne avec les vidéos ImagePicker
- ✅ Tester le fallback automatique

### En build natif
- ✅ Tester l'enregistrement direct avec expo-camera
- ✅ Vérifier tous les contrôles de caméra
- ✅ Tester les différents modes (face/profil)

## Conclusion

Ce problème est **temporaire** et **spécifique à Expo Go**. En production avec un build natif, tout fonctionnera parfaitement.

Le fallback vers ImagePicker permet de continuer le développement et les tests dans Expo Go sans blocage.