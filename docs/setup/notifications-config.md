# Configuration des Notifications - My Swing

## État actuel : DÉSACTIVÉES (Phase Alpha)

### Configuration Expo

```javascript
// app.config.js
export default {
  expo: {
    notification: {
      iosDisplayInForeground: false,
      androidMode: "default",
      androidCollapsedTitle: "My Swing"
    },
    plugins: [
      [
        "expo-notifications",
        {
          "mode": "development"
        }
      ]
    ]
  }
};
```

### Configuration Code

```typescript
// src/config/notifications.ts
export const NOTIFICATIONS_CONFIG = {
  ENABLED: false, // ❌ Désactivé en alpha
  
  IOS_PERMISSIONS: {
    requestOnLaunch: false, // Ne pas demander les permissions
    badge: false,
    sound: false,
    alert: false
  }
};
```

## Pourquoi désactivées en alpha ?

1. **Simplicité** : Éviter les complications de configuration iOS
2. **Permissions** : Pas de demande de permissions intrusives
3. **Focus** : Se concentrer sur les fonctionnalités principales
4. **Apple Developer** : Éviter les problèmes de certificats

## Notifications prévues pour la production

### Types de notifications
- ✅ **Analyse terminée** : "Votre analyse de swing est prête !"
- ✅ **Conseil du jour** : "Découvrez votre nouveau conseil golf !"
- ✅ **Rappel d'entraînement** : "Il est temps de travailler votre swing !"

### Configuration future

```typescript
// Pour la production
export const NOTIFICATIONS_CONFIG = {
  ENABLED: true, // ✅ Activé en production
  
  ANALYSIS_COMPLETE: {
    enabled: true,
    title: "Analyse terminée",
    body: "Votre analyse de swing est prête !",
    sound: true,
    badge: true
  },
  
  DAILY_TIP: {
    enabled: true,
    title: "Conseil du jour",
    body: "Découvrez votre nouveau conseil golf !",
    scheduledTime: "09:00" // 9h du matin
  }
};
```

## Activation des notifications (plus tard)

### Étapes pour activer :

1. **Mettre à jour la config** :
   ```typescript
   NOTIFICATIONS_CONFIG.ENABLED = true;
   ```

2. **Configurer les permissions iOS** :
   ```javascript
   // app.config.js
   notification: {
     iosDisplayInForeground: true,
     // ... autres options
   }
   ```

3. **Implémenter le service** :
   ```typescript
   // src/services/notification-service.ts
   import * as Notifications from 'expo-notifications';
   
   export const requestPermissions = async () => {
     const { status } = await Notifications.requestPermissionsAsync();
     return status === 'granted';
   };
   ```

4. **Tester sur device** avec compte Apple Developer

## Avantages de cette approche

- ✅ **Pas de blocage** pour les tests alpha
- ✅ **Configuration propre** pour plus tard
- ✅ **Pas de permissions** demandées prématurément
- ✅ **Focus sur l'UX** principale

## Tests actuels

Pour tester l'app sans notifications :
```bash
npx expo start --tunnel
```

L'app fonctionne parfaitement sans demander de permissions de notifications.