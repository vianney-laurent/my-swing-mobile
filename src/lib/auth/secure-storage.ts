/**
 * Service de stockage sécurisé pour les credentials
 * Utilise Expo SecureStore pour chiffrer les données sensibles
 */

import * as SecureStore from 'expo-secure-store';

const KEYS = {
  REMEMBER_ME: 'remember_me_enabled',
  USER_EMAIL: 'user_email',
  USER_SESSION: 'user_session_token',
  LAST_LOGIN: 'last_login_timestamp'
};

export interface StoredCredentials {
  email: string;
  sessionToken?: string;
  lastLogin: string;
  rememberMe: boolean;
}

export class SecureStorageService {
  /**
   * Sauvegarder les credentials après connexion réussie
   */
  static async saveCredentials(email: string, sessionToken?: string, rememberMe: boolean = true): Promise<void> {
    try {
      if (rememberMe) {
        await SecureStore.setItemAsync(KEYS.REMEMBER_ME, 'true');
        await SecureStore.setItemAsync(KEYS.USER_EMAIL, email);
        await SecureStore.setItemAsync(KEYS.LAST_LOGIN, new Date().toISOString());
        
        if (sessionToken) {
          await SecureStore.setItemAsync(KEYS.USER_SESSION, sessionToken);
        }
        
        console.log('✅ Credentials saved securely');
      } else {
        // Si l'utilisateur ne veut pas être retenu, supprimer les credentials
        await this.clearCredentials();
      }
    } catch (error) {
      console.error('❌ Error saving credentials:', error);
    }
  }

  /**
   * Récupérer les credentials sauvegardés
   */
  static async getStoredCredentials(): Promise<StoredCredentials | null> {
    try {
      const rememberMe = await SecureStore.getItemAsync(KEYS.REMEMBER_ME);
      
      if (rememberMe !== 'true') {
        return null;
      }

      const email = await SecureStore.getItemAsync(KEYS.USER_EMAIL);
      const sessionToken = await SecureStore.getItemAsync(KEYS.USER_SESSION);
      const lastLogin = await SecureStore.getItemAsync(KEYS.LAST_LOGIN);

      if (!email) {
        return null;
      }

      return {
        email,
        sessionToken: sessionToken || undefined,
        lastLogin: lastLogin || new Date().toISOString(),
        rememberMe: true
      };
    } catch (error) {
      console.error('❌ Error getting stored credentials:', error);
      return null;
    }
  }

  /**
   * Vérifier si l'utilisateur a activé "Se souvenir de moi"
   */
  static async isRememberMeEnabled(): Promise<boolean> {
    try {
      const rememberMe = await SecureStore.getItemAsync(KEYS.REMEMBER_ME);
      return rememberMe === 'true';
    } catch (error) {
      console.error('❌ Error checking remember me status:', error);
      return false;
    }
  }

  /**
   * Obtenir le dernier email utilisé
   */
  static async getLastEmail(): Promise<string | null> {
    try {
      const isEnabled = await this.isRememberMeEnabled();
      if (!isEnabled) {
        return null;
      }
      
      return await SecureStore.getItemAsync(KEYS.USER_EMAIL);
    } catch (error) {
      console.error('❌ Error getting last email:', error);
      return null;
    }
  }

  /**
   * Mettre à jour le token de session
   */
  static async updateSessionToken(sessionToken: string): Promise<void> {
    try {
      const isEnabled = await this.isRememberMeEnabled();
      if (isEnabled) {
        await SecureStore.setItemAsync(KEYS.USER_SESSION, sessionToken);
        await SecureStore.setItemAsync(KEYS.LAST_LOGIN, new Date().toISOString());
      }
    } catch (error) {
      console.error('❌ Error updating session token:', error);
    }
  }

  /**
   * Supprimer tous les credentials stockés
   */
  static async clearCredentials(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(KEYS.REMEMBER_ME);
      await SecureStore.deleteItemAsync(KEYS.USER_EMAIL);
      await SecureStore.deleteItemAsync(KEYS.USER_SESSION);
      await SecureStore.deleteItemAsync(KEYS.LAST_LOGIN);
      
      console.log('✅ Credentials cleared');
    } catch (error) {
      console.error('❌ Error clearing credentials:', error);
    }
  }

  /**
   * Vérifier si les credentials sont expirés (plus de 30 jours)
   */
  static async areCredentialsExpired(): Promise<boolean> {
    try {
      const lastLogin = await SecureStore.getItemAsync(KEYS.LAST_LOGIN);
      
      if (!lastLogin) {
        return true;
      }

      const lastLoginDate = new Date(lastLogin);
      const now = new Date();
      const daysDiff = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Expirer après 30 jours
      return daysDiff > 30;
    } catch (error) {
      console.error('❌ Error checking credentials expiration:', error);
      return true;
    }
  }

  /**
   * Désactiver "Se souvenir de moi" sans supprimer l'email
   */
  static async disableRememberMe(): Promise<void> {
    try {
      await SecureStore.setItemAsync(KEYS.REMEMBER_ME, 'false');
      await SecureStore.deleteItemAsync(KEYS.USER_SESSION);
      console.log('✅ Remember me disabled');
    } catch (error) {
      console.error('❌ Error disabling remember me:', error);
    }
  }
}