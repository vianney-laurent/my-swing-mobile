# Guide d'installation iOS - My Swing

## Solutions pour installer l'app sur iPhone

### Option 1 : Expo Go (Solution immédiate - GRATUITE)

#### Étapes :
1. **Installer Expo Go** sur ton iPhone depuis l'App Store
2. **Démarrer le serveur de développement** :
   ```bash
   npx expo start --tunnel
   ```
3. **Scanner le QR code** avec l'app Expo Go
4. **L'app se lance** directement sur ton téléphone

#### Avantages :
- ✅ Gratuit et immédiat
- ✅ Hot reload en temps réel
- ✅ Toutes les fonctionnalités disponibles

#### Inconvénients :
- ❌ Nécessite Expo Go installé
- ❌ Pas d'icône personnalisée sur l'écran d'accueil

---

### Option 2 : EAS Development Build (Solution native)

#### Prérequis :
- **Compte Apple Developer** (99€/an)
- **Certificats iOS** configurés

#### Étapes :
1. **S'inscrire au programme Apple Developer** : https://developer.apple.com/programs/
2. **Configurer les certificats** :
   ```bash
   eas build --platform ios --profile development
   ```
3. **Installer via TestFlight** ou directement

#### Avantages :
- ✅ App native complète
- ✅ Icône personnalisée
- ✅ Pas besoin d'Expo Go
- ✅ Performance optimale

#### Inconvénients :
- ❌ Coût du compte Apple Developer
- ❌ Configuration plus complexe

---

### Option 3 : Simulateur iOS (Pour développement)

#### Prérequis :
- **Xcode** installé sur Mac
- **iOS Simulator**

#### Étapes :
1. **Installer Xcode** depuis l'App Store
2. **Lancer le simulateur** :
   ```bash
   npx expo start --ios
   ```
3. **L'app s'ouvre** dans le simulateur

#### Avantages :
- ✅ Gratuit
- ✅ Debugging avancé
- ✅ Pas de compte Apple requis

#### Inconvénients :
- ❌ Pas sur un vrai téléphone
- ❌ Certaines fonctionnalités limitées (caméra, etc.)

---

## Recommandation actuelle

### Pour tester immédiatement :
```bash
# Dans le dossier golf-coaching-mobile
npx expo start --tunnel
```

Puis scanner le QR code avec Expo Go sur ton iPhone.

### Pour une app native plus tard :
1. S'inscrire au programme Apple Developer
2. Utiliser EAS Build pour créer une vraie app iOS

---

## Configuration actuelle

L'app est configurée avec :
- **Bundle ID** : `com.myswing.golfcoach`
- **Nom** : "My Swing"
- **Permissions** : Caméra, Microphone
- **Orientation** : Portrait uniquement

## Prochaines étapes

1. **Tester avec Expo Go** (solution immédiate)
2. **Générer les assets** (icône + splash screen)
3. **Souscrire Apple Developer** si app native souhaitée
4. **Publier sur TestFlight** pour distribution privée