# Fonctionnalité "Se souvenir de moi" - My Swing

## Vue d'ensemble

La fonctionnalité "Se souvenir de moi" permet aux utilisateurs de rester connectés entre les sessions de l'app, améliorant significativement l'expérience utilisateur.

## Fonctionnalités implémentées

### 🔐 Stockage sécurisé des credentials
- **Expo SecureStore** : Chiffrement des données sensibles
- **Expiration automatique** : 30 jours maximum
- **Gestion des tokens** : Sauvegarde des sessions Supabase

### 🎯 Interface utilisateur
- **Checkbox "Se souvenir de moi"** : Activée par défaut
- **Pré-remplissage de l'email** : Dernier email utilisé
- **Reconnexion automatique** : Au lancement de l'app

### 🛡️ Sécurité
- **Chiffrement natif** : Utilise le Keychain iOS
- **Expiration des credentials** : Nettoyage automatique
- **Déconnexion sélective** : Garder ou supprimer les credentials

## Architecture technique

### Services créés

#### 1. SecureStorageService
```typescript
// src/lib/auth/secure-storage.ts
- saveCredentials() : Sauvegarder email + token
- getStoredCredentials() : Récupérer les credentials
- clearCredentials() : Supprimer toutes les données
- areCredentialsExpired() : Vérifier l'expiration
```

#### 2. AuthService (mis à jour)
```typescript
// src/lib/auth/auth-service.ts
- signIn() : Avec paramètre rememberMe
- attemptAutoLogin() : Reconnexion automatique
- getLastUsedEmail() : Pré-remplissage du formulaire
```

#### 3. useAuth Hook (amélioré)
```typescript
// src/hooks/useAuth.ts
- Auto-login au démarrage
- Écoute des changements d'état
- Méthodes d'accès aux credentials
```

## Flux utilisateur

### 1. Première connexion
1. Utilisateur saisit email/mot de passe
2. Coche "Se souvenir de moi" (activé par défaut)
3. Connexion réussie → Credentials sauvegardés chiffrés
4. Accès à l'app

### 2. Reconnexion automatique
1. Lancement de l'app
2. Vérification des credentials stockés
3. Si valides → Reconnexion automatique
4. Si expirés → Écran de connexion avec email pré-rempli

### 3. Déconnexion
1. **Déconnexion normale** : Garde l'email, supprime le token
2. **Déconnexion complète** : Supprime tout (option future)

## Configuration de sécurité

### Expiration des credentials
- **Durée** : 30 jours maximum
- **Vérification** : À chaque tentative d'auto-login
- **Nettoyage** : Automatique si expirés

### Stockage sécurisé
- **iOS** : Keychain Services (chiffrement matériel)
- **Android** : Android Keystore (chiffrement matériel)
- **Données stockées** :
  - Email utilisateur
  - Token de session Supabase
  - Timestamp de dernière connexion
  - Flag remember me

## Interface utilisateur

### Checkbox "Se souvenir de moi"
```typescript
// Styles appliqués
- Position : Sous les champs email/mot de passe
- État : Activé par défaut
- Design : Checkbox verte avec icône checkmark
- Interaction : Toggle au tap
```

### Pré-remplissage de l'email
```typescript
// Comportement
- Chargement : Au montage du composant AuthScreen
- Source : Dernier email utilisé avec succès
- Condition : Si remember me était activé
```

## Logs et debugging

### Messages de log
```typescript
✅ Credentials saved securely
🔄 Attempting auto login...
✅ Auto login successful with existing session
📧 Last used email loaded: user@example.com
❌ Stored credentials expired
```

### États possibles
- **Première utilisation** : Pas de credentials
- **Credentials valides** : Auto-login réussi
- **Credentials expirés** : Nettoyage + écran de connexion
- **Session invalide** : Retour à l'authentification

## Avantages UX

### Pour l'utilisateur
- ✅ **Connexion rapide** : Plus besoin de retaper les credentials
- ✅ **Expérience fluide** : Accès immédiat à l'app
- ✅ **Email mémorisé** : Pré-remplissage automatique
- ✅ **Sécurité** : Expiration automatique des credentials

### Pour le développement
- ✅ **Code propre** : Services séparés et réutilisables
- ✅ **Sécurité native** : Utilise les APIs de chiffrement du système
- ✅ **Debugging facile** : Logs détaillés pour le troubleshooting
- ✅ **Maintenance** : Gestion automatique de l'expiration

## Tests recommandés

### Scénarios à tester
1. **Première connexion** avec remember me activé
2. **Reconnexion automatique** après fermeture/réouverture
3. **Expiration des credentials** après 30+ jours
4. **Déconnexion** et comportement du remember me
5. **Changement d'utilisateur** avec nouveaux credentials

### Cas d'erreur
1. **Perte de connectivité** pendant l'auto-login
2. **Credentials corrompus** dans le stockage
3. **Session Supabase expirée** côté serveur
4. **Changement de mot de passe** sur un autre device

## Prochaines améliorations possibles

### Fonctionnalités futures
- **Biométrie** : Touch ID / Face ID pour déverrouiller
- **Multi-comptes** : Gestion de plusieurs utilisateurs
- **Déconnexion sélective** : Option "Oublier cet appareil"
- **Synchronisation** : Invalidation cross-device des sessions