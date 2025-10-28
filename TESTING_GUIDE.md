# Guide de Test - My Swing Mobile

## 🧪 Tests à effectuer

### 1. Test avec Expo Go (Recommandé pour commencer)
```bash
# Dans le terminal, scanner le QR code avec Expo Go
npx expo start
```

### 2. Test avec simulateur iOS (une fois Xcode installé)
```bash
# Lancer le simulateur iOS
npx expo start --ios
```

### 3. Test sur appareil physique
- Scanner le QR code avec l'app Expo Go
- Ou utiliser un development build

## ✅ Checklist de fonctionnalités

### Authentification
- [ ] Inscription avec email/mot de passe
- [ ] Connexion avec compte existant
- [ ] Messages d'erreur en français
- [ ] Validation des champs

### Navigation
- [ ] Navigation entre les onglets
- [ ] Retour automatique à l'auth si déconnecté
- [ ] Icônes et labels corrects

### Écran d'accueil
- [ ] Affichage du message de bienvenue
- [ ] Boutons d'action fonctionnels
- [ ] Navigation vers caméra/historique/profil

### Caméra
- [ ] Demande de permission caméra
- [ ] Affichage de la caméra
- [ ] Bouton d'enregistrement
- [ ] Guide visuel (ligne verticale)
- [ ] Basculement caméra avant/arrière

### Profil
- [ ] Affichage des informations utilisateur
- [ ] Statistiques (mock data)
- [ ] Déconnexion fonctionnelle

### Historique
- [ ] Affichage de l'état vide
- [ ] Mock data des analyses précédentes

## 🐛 Problèmes connus

### Permissions
- La première fois, l'app demande l'accès caméra
- Sur iOS, vérifier les permissions dans Réglages > Confidentialité

### Performance
- Expo Go peut être plus lent que les builds natifs
- Normal pour le développement

## 🔧 Debug

### Logs
```bash
# Voir les logs en temps réel
npx expo start
# Puis appuyer sur 'j' pour ouvrir le debugger
```

### Reload
- Secouer le téléphone pour ouvrir le menu dev
- Ou appuyer sur 'r' dans le terminal

### Erreurs communes
1. **"Network request failed"** → Vérifier la connexion WiFi
2. **"Camera permission denied"** → Autoriser dans les paramètres
3. **"Module not found"** → Relancer `npm install`

## 📱 Test sur différents appareils

### iOS
- iPhone 12+ recommandé
- iOS 13+ minimum

### Android  
- Android 8+ minimum
- Tester sur différentes tailles d'écran

## 🚀 Prochains tests

Une fois les fonctionnalités de base validées :
1. **Intégration analyse vidéo**
2. **Upload vers Supabase**
3. **Notifications push**
4. **Performance vidéo**