# 🔧 Guide de Dépannage des Polyfills

## 🚨 Problème : web-streams-polyfill/ponyfill/es6

### Erreur rencontrée
```
Unable to resolve "web-streams-polyfill/ponyfill/es6" from "node_modules/react-native-polyfill-globals/src/readable-stream.js"
```

### ✅ Solution appliquée

#### 1. Installation des dépendances manquantes
```bash
npm install web-streams-polyfill
npm install text-encoding
```

#### 2. Configuration Metro mise à jour
```javascript
// metro.config.js
config.resolver.alias = {
  ...config.resolver.alias,
  crypto: 'react-native-quick-crypto',
  stream: 'readable-stream',
  buffer: '@craftzdog/react-native-buffer',
  'web-streams-polyfill/ponyfill/es6': 'web-streams-polyfill',
};
```

#### 3. Polyfills manuels (src/polyfills.ts)
- Évite l'import automatique `react-native-polyfill-globals/auto`
- Configuration manuelle de chaque polyfill
- Gestion des erreurs avec try/catch
- Polyfills conditionnels (seulement si non définis)

## 📦 Packages installés

| Package | Version | Usage |
|---------|---------|-------|
| `web-streams-polyfill` | Latest | ReadableStream pour React Native |
| `text-encoding` | Latest | TextEncoder/TextDecoder |
| `react-native-quick-crypto` | Latest | Crypto API |
| `@craftzdog/react-native-buffer` | Latest | Buffer global |
| `readable-stream` | Latest | Stream API |
| `process` | Latest | Process global |

## 🎯 Stratégie de polyfills

### Approche conservative
1. **Polyfills manuels** : Contrôle total sur ce qui est chargé
2. **Imports conditionnels** : Évite les erreurs si un polyfill échoue
3. **Try/catch** : Gestion gracieuse des erreurs
4. **Warnings** : Logs pour débugger sans casser l'app

### Polyfills essentiels pour Supabase
- ✅ **Buffer** : Pour les opérations binaires
- ✅ **Process** : Variables d'environnement
- ✅ **TextEncoder/Decoder** : Encodage de texte
- ✅ **ReadableStream** : Streams pour les uploads
- ✅ **Crypto** : Chiffrement et hashing
- ✅ **EventTarget** : Events pour WebSocket

## 🚀 Commandes de test

```bash
# Nettoyer complètement le cache
npm start -- --clear

# Ou avec reset complet
npm start -- --reset-cache

# Vérifier la configuration
node test-polyfills.js
```

## 🐛 Dépannage avancé

### Si l'erreur persiste :

#### Option 1 : Désactiver les polyfills automatiques
```typescript
// Commenter temporairement dans src/polyfills.ts
// import 'react-native-polyfill-globals/auto';
```

#### Option 2 : Forcer l'alias Metro
```javascript
// metro.config.js - Ajouter plus d'aliases
config.resolver.alias = {
  ...config.resolver.alias,
  'web-streams-polyfill/ponyfill/es6': 'web-streams-polyfill/dist/ponyfill.es6.js',
};
```

#### Option 3 : Version simplifiée de Supabase
```typescript
// Désactiver complètement realtime
export const supabase = createClient(url, key, {
  realtime: { disabled: true }
});
```

## 📱 Tests de validation

### 1. Test de bundling
```bash
npm start -- --clear
# Vérifier qu'il n'y a plus d'erreurs de résolution
```

### 2. Test des polyfills
```javascript
// Dans l'app, vérifier que les globals existent
console.log('Buffer:', typeof global.Buffer);
console.log('Process:', typeof global.process);
console.log('ReadableStream:', typeof global.ReadableStream);
```

### 3. Test Supabase
```javascript
// Tester une requête simple
const { data, error } = await supabase.from('profiles').select('*').limit(1);
```

## 🔄 Rollback si nécessaire

Si les polyfills causent des problèmes, rollback rapide :

```bash
# 1. Supprimer les polyfills problématiques
npm uninstall react-native-polyfill-globals

# 2. Simplifier src/polyfills.ts
# Garder seulement Buffer et Process

# 3. Désactiver realtime dans Supabase
# realtime: { disabled: true }
```

## 📊 Monitoring des performances

### Métriques à surveiller
- **Temps de bundling** : Ne doit pas augmenter significativement
- **Taille du bundle** : Vérifier l'impact des polyfills
- **Temps de démarrage** : L'app doit rester réactive
- **Mémoire** : Pas de fuites dues aux polyfills

### Outils de monitoring
```bash
# Analyser la taille du bundle
npx expo export --dump-sourcemap

# Profiler les performances
# Utiliser Flipper ou React DevTools
```

## ✅ Validation finale

Une fois tous les polyfills configurés :

1. ✅ **Bundling réussi** sans erreurs
2. ✅ **Supabase fonctionnel** (auth + requêtes)
3. ✅ **Performance acceptable** (< 5s démarrage)
4. ✅ **Pas de warnings critiques** dans les logs
5. ✅ **Compatible iOS et Android**

## 🎯 Prochaines étapes

Une fois les polyfills stables :
1. Tester l'authentification Supabase
2. Tester les requêtes de base de données
3. Implémenter l'upload de fichiers
4. Activer progressivement les fonctionnalités realtime si nécessaire