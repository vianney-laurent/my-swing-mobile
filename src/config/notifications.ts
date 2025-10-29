/**
 * Configuration des notifications pour My Swing
 * 
 * En phase alpha : notifications désactivées
 * En production : notifications activées pour les analyses terminées
 */

export const NOTIFICATIONS_CONFIG = {
  // Désactiver les notifications en phase alpha
  ENABLED: false,
  
  // Configuration pour plus tard
  ANALYSIS_COMPLETE: {
    enabled: false, // Sera activé en production
    title: "Analyse terminée",
    body: "Votre analyse de swing est prête !"
  },
  
  DAILY_TIP: {
    enabled: false, // Sera activé en production
    title: "Conseil du jour",
    body: "Découvrez votre nouveau conseil golf !"
  },
  
  // Permissions iOS
  IOS_PERMISSIONS: {
    requestOnLaunch: false, // Ne pas demander les permissions au lancement
    badge: false,
    sound: false,
    alert: false
  }
};

/**
 * Fonction pour vérifier si les notifications sont activées
 */
export const areNotificationsEnabled = (): boolean => {
  return NOTIFICATIONS_CONFIG.ENABLED;
};

/**
 * Fonction pour activer les notifications (pour plus tard)
 */
export const enableNotifications = (): void => {
  // Sera implémenté quand on activera les notifications
  console.log('📱 Notifications will be enabled in production');
};

/**
 * Fonction pour désactiver les notifications
 */
export const disableNotifications = (): void => {
  console.log('📱 Notifications disabled for alpha phase');
};