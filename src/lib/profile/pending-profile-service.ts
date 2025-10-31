// Service pour gérer les profils en attente de création
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase/client';
import { SignupProfileService, SignupProfileData } from './signup-profile-service';

export class PendingProfileService {
  private static readonly PENDING_PROFILE_PREFIX = 'pending_profile_';

  /**
   * Sauvegarde les données de profil en attente
   */
  static async savePendingProfile(userId: string, profileData: SignupProfileData): Promise<boolean> {
    try {
      const key = `${this.PENDING_PROFILE_PREFIX}${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(profileData));
      console.log('💾 Pending profile saved for user:', userId);
      return true;
    } catch (error) {
      console.error('❌ Failed to save pending profile:', error);
      return false;
    }
  }

  /**
   * Récupère les données de profil en attente
   */
  static async getPendingProfile(userId: string): Promise<SignupProfileData | null> {
    try {
      const key = `${this.PENDING_PROFILE_PREFIX}${userId}`;
      const data = await AsyncStorage.getItem(key);
      
      if (data) {
        const profileData = JSON.parse(data) as SignupProfileData;
        console.log('📋 Pending profile found for user:', userId);
        return profileData;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to get pending profile:', error);
      return null;
    }
  }

  /**
   * Supprime les données de profil en attente
   */
  static async clearPendingProfile(userId: string): Promise<boolean> {
    try {
      const key = `${this.PENDING_PROFILE_PREFIX}${userId}`;
      await AsyncStorage.removeItem(key);
      console.log('🗑️ Pending profile cleared for user:', userId);
      return true;
    } catch (error) {
      console.error('❌ Failed to clear pending profile:', error);
      return false;
    }
  }

  /**
   * Tente de compléter un profil en attente lors de la connexion
   */
  static async completePendingProfile(userId: string): Promise<{
    success: boolean;
    completed: boolean;
    error?: string;
  }> {
    try {
      console.log('🔄 Checking for pending profile for user:', userId);
      
      // Vérifier s'il y a un profil en attente
      const pendingData = await this.getPendingProfile(userId);
      
      if (!pendingData) {
        console.log('ℹ️ No pending profile found');
        return { success: true, completed: false };
      }

      console.log('📝 Found pending profile, attempting to create...');
      
      // Vérifier si le profil existe déjà
      const existingCheck = await SignupProfileService.checkProfileExists(userId);
      
      if (existingCheck.exists && existingCheck.profile) {
        // Vérifier si le profil existant est complet
        const profile = existingCheck.profile;
        const isComplete = profile.first_name && profile.last_name && profile.city;
        
        if (isComplete) {
          console.log('✅ Profile already complete, clearing pending data');
          await this.clearPendingProfile(userId);
          return { success: true, completed: true };
        }
        
        console.log('⚠️ Profile exists but incomplete, updating...');
      }

      // Créer ou mettre à jour le profil
      const result = await SignupProfileService.createSignupProfile(pendingData);
      
      if (result.success) {
        console.log('✅ Pending profile completed successfully');
        await this.clearPendingProfile(userId);
        return { success: true, completed: true };
      } else {
        console.error('❌ Failed to complete pending profile:', result.error);
        return { success: false, completed: false, error: result.error };
      }

    } catch (error) {
      console.error('❌ Error completing pending profile:', error);
      return { 
        success: false, 
        completed: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Nettoie tous les profils en attente (utilitaire de maintenance)
   */
  static async clearAllPendingProfiles(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pendingKeys = keys.filter(key => key.startsWith(this.PENDING_PROFILE_PREFIX));
      
      if (pendingKeys.length > 0) {
        await AsyncStorage.multiRemove(pendingKeys);
        console.log(`🧹 Cleared ${pendingKeys.length} pending profiles`);
      }
      
      return pendingKeys.length;
    } catch (error) {
      console.error('❌ Failed to clear pending profiles:', error);
      return 0;
    }
  }

  /**
   * Liste tous les profils en attente (pour debug)
   */
  static async listPendingProfiles(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pendingKeys = keys.filter(key => key.startsWith(this.PENDING_PROFILE_PREFIX));
      
      const userIds = pendingKeys.map(key => 
        key.replace(this.PENDING_PROFILE_PREFIX, '')
      );
      
      console.log('📋 Pending profiles for users:', userIds);
      return userIds;
    } catch (error) {
      console.error('❌ Failed to list pending profiles:', error);
      return [];
    }
  }
}