# Guide de Débogage - Navbar Mobile

## 🔍 Problème : Navbar n'apparaît pas sur iPhone

### 📱 Vérifications Étape par Étape

#### 1. **État de Connexion**
La navbar n'apparaît QUE si l'utilisateur est connecté.

```javascript
// Dans AppNavigator.tsx
if (currentScreen === 'auth') {
  return renderScreen(); // ← PAS de navbar sur l'écran auth
}

// Navbar visible seulement ici ↓
return (
  <View style={styles.container}>
    <SafeAreaView style={styles.screenContainer}>
      {renderScreen()}
    </SafeAreaView>
    <SimpleTabBar /> // ← Navbar ici
  </View>
);
```

**✅ Solution** : Se connecter d'abord pour voir la navbar

#### 2. **Logs de Debug à Ajouter**

Ajoute ces logs dans `AppNavigator.tsx` pour diagnostiquer :

```javascript
// Après const { currentScreen, analysisId, navigate, goBack } = useNavigation();
console.log('🔍 [AppNavigator] Current screen:', currentScreen);
console.log('🔍 [AppNavigator] User connected:', !!user);

// Avant le return final
console.log('🔍 [AppNavigator] Showing navbar:', currentScreen !== 'auth');
```

#### 3. **Vérification de l'État Initial**

L'état initial est maintenant `'auth'` :

```javascript
// Dans useNavigation.ts
const [navigationState, setNavigationState] = useState<NavigationState>({
  currentScreen: 'auth', // ← Commence par auth
});
```

#### 4. **Flux de Navigation Attendu**

```
1. App démarre → currentScreen = 'auth' → Écran de connexion (PAS de navbar)
2. Utilisateur se connecte → navigate('home') → currentScreen = 'home'
3. currentScreen !== 'auth' → Navbar apparaît
```

### 🧪 Tests à Effectuer

#### Test 1 : Vérifier l'État Initial
```bash
# Dans Expo Go, ouvrir la console et chercher :
🔍 [AppNavigator] Current screen: auth
🔍 [AppNavigator] User connected: false
🔍 [AppNavigator] Showing navbar: false
```

#### Test 2 : Après Connexion
```bash
# Après connexion réussie :
🔍 [AppNavigator] Current screen: home
🔍 [AppNavigator] User connected: true
🔍 [AppNavigator] Showing navbar: true
```

#### Test 3 : Vérifier SimpleTabBar
```bash
# Si navbar toujours invisible, ajouter dans SimpleTabBar.tsx :
console.log('🔍 [SimpleTabBar] Rendering with screen:', currentScreen);
```

### 🔧 Solutions par Problème

#### Problème A : Navbar invisible même connecté

**Cause** : SimpleTabBar ne se rend pas
**Solution** :
```javascript
// Dans SimpleTabBar.tsx, ajouter au début du composant :
console.log('🔍 [SimpleTabBar] Props:', { currentScreen, onTabPress });

// Vérifier que le style container n'a pas display: 'none'
```

#### Problème B : Erreur de compilation bloque l'app

**Cause** : Erreurs TypeScript
**Solution** :
```bash
# Ignorer temporairement les erreurs TS
npx expo start --no-typescript-check
```

#### Problème C : Icônes ne s'affichent pas

**Cause** : @expo/vector-icons pas chargé
**Solution** :
```javascript
// Vérifier dans SimpleTabBar.tsx :
import { Ionicons } from '@expo/vector-icons';

// Test avec icône simple :
<Ionicons name="home" size={24} color="blue" />
```

#### Problème D : Safe Area pas respectée

**Cause** : useSafeAreaInsets pas importé
**Solution** :
```javascript
// Dans SimpleTabBar.tsx :
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const insets = useSafeAreaInsets();
```

### 📱 Test Complet sur iPhone

#### Étapes de Test :
1. **Démarrer Expo** : `npm start`
2. **Scanner QR Code** avec Expo Go
3. **Ouvrir Console** : Secouer iPhone → "Debug Remote JS"
4. **Observer Logs** : Chercher les logs `🔍 [AppNavigator]`
5. **Se Connecter** : Utiliser email/password valide
6. **Vérifier Navbar** : Doit apparaître après connexion

#### Logs Attendus :
```
🔍 [AppNavigator] Current screen: auth
🔍 [AppNavigator] User connected: false
🔍 [AppNavigator] Showing navbar: false
[Connexion...]
🔍 [AppNavigator] Current screen: home
🔍 [AppNavigator] User connected: true
🔍 [AppNavigator] Showing navbar: true
🔍 [SimpleTabBar] Rendering with screen: home
```

### 🚨 Cas d'Urgence : Navbar Forcée

Si rien ne fonctionne, force l'affichage :

```javascript
// Dans AppNavigator.tsx, remplacer :
if (currentScreen === 'auth') {
  return renderScreen();
}

// Par :
if (currentScreen === 'auth') {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.screenContainer}>
        {renderScreen()}
      </SafeAreaView>
      {/* Navbar forcée même sur auth pour debug */}
      <SimpleTabBar 
        currentScreen={currentScreen}
        onTabPress={(screen) => navigate(screen as Screen)}
      />
    </View>
  );
}
```

### ✅ Checklist de Résolution

- [ ] App démarre sans crash
- [ ] Logs `🔍 [AppNavigator]` visibles dans console
- [ ] État initial = 'auth'
- [ ] Écran de connexion s'affiche
- [ ] Connexion réussie → navigate('home')
- [ ] currentScreen change vers 'home'
- [ ] Navbar SimpleTabBar apparaît
- [ ] Icônes Ionicons visibles
- [ ] Navigation entre onglets fonctionne

### 📞 Debug en Temps Réel

Pour debug en direct :

1. **Ajouter breakpoint** dans SimpleTabBar render
2. **Vérifier props** : currentScreen, onTabPress
3. **Tester style** : backgroundColor temporaire
4. **Forcer re-render** : key={Date.now()}

---

**🎯 Objectif** : Navbar visible après connexion avec icônes natives
**📱 Plateforme** : iOS avec Expo Go
**🔧 Fallback** : Version simplifiée sans BlurView pour compatibilité