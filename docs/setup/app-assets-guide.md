# Guide des Assets de l'App My Swing

## Icônes et Splash Screen

### Fichiers créés

1. **Icon SVG** : `assets/create-icon.svg`
   - Design moderne avec club de golf et balle
   - Gradient vert (thème My Swing)
   - Dimensions : 1024x1024px
   - Texte "My Swing" intégré

2. **Splash Screen SVG** : `assets/create-splash.svg`
   - Design élégant plein écran
   - Animation de chargement
   - Gradient de fond vert
   - Dimensions : 1080x1920px (format mobile)

### Génération des assets PNG

Pour convertir les SVG en PNG (requis par Expo), utilisez un outil comme :

#### Option 1 : En ligne
- [SVG to PNG Converter](https://svgtopng.com/)
- [CloudConvert](https://cloudconvert.com/svg-to-png)

#### Option 2 : Avec Inkscape (recommandé)
```bash
# Installer Inkscape
brew install inkscape  # macOS
# ou télécharger depuis https://inkscape.org/

# Convertir l'icône
inkscape --export-type=png --export-width=1024 --export-height=1024 assets/create-icon.svg --export-filename=assets/icon.png

# Convertir le splash screen
inkscape --export-type=png --export-width=1080 --export-height=1920 assets/create-splash.svg --export-filename=assets/splash-icon.png
```

#### Option 3 : Avec ImageMagick
```bash
# Installer ImageMagick
brew install imagemagick  # macOS

# Convertir les fichiers
convert -background transparent -size 1024x1024 assets/create-icon.svg assets/icon.png
convert -background transparent -size 1080x1920 assets/create-splash.svg assets/splash-icon.png
```

### Tailles requises par Expo

#### Icône principale
- **icon.png** : 1024x1024px (utilisé pour toutes les plateformes)

#### Icône adaptative Android
- **adaptive-icon.png** : 1024x1024px (avec zone de sécurité)

#### Splash Screen
- **splash-icon.png** : Recommandé 1080x1920px ou plus

### Configuration actuelle

```javascript
// app.config.js
export default {
  expo: {
    name: "My Swing",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#10b981"
    }
  }
};
```

### Couleurs du thème

- **Vert principal** : `#10b981`
- **Vert foncé** : `#059669`
- **Vert très foncé** : `#047857`
- **Blanc** : `#ffffff`
- **Gris clair** : `#f8fafc`

### Test des assets

Après génération des PNG :

```bash
# Nettoyer le cache Expo
npx expo start --clear

# Tester sur simulateur
npx expo start --ios
npx expo start --android
```

### Notes importantes

1. **Icône** : Éviter le texte trop petit (lisibilité sur petites tailles)
2. **Splash** : Garder les éléments importants au centre (safe area)
3. **Couleurs** : Respecter le contraste pour l'accessibilité
4. **Format** : PNG requis pour Expo (pas de SVG direct)

### Prochaines étapes

1. Générer les PNG à partir des SVG
2. Remplacer les assets existants
3. Tester sur différents appareils
4. Ajuster si nécessaire selon les retours