// Service spécialisé pour la création de profil lors de l'inscription
import { supabase } from '../supabase/client';

export interface SignupProfileData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  city: string;
  golf_index?: number | null;
  dominant_hand?: 'right' | 'left' | null;
}

export class SignupProfileService {
  /**
   * Crée un profil complet lors de l'inscription
   * Utilise plusieurs stratégies pour s'assurer que le profil est créé
   */
  static async createSignupProfile(profileData: SignupProfileData): Promise<{
    success: boolean;
    error?: string;
    data?: any;
  }> {
    console.log('📝 Creating signup profile with data:', profileData);

    try {
      // Stratégie 1: Essayer UPSERT d'abord
      const upsertResult = await this.tryUpsert(profileData);
      if (upsertResult.success) {
        console.log('✅ Profile created via UPSERT');
        return upsertResult;
      }

      console.log('⚠️ UPSERT failed, trying UPDATE strategy...');
      
      // Stratégie 2: Essayer UPDATE (au cas où le profil existe déjà)
      const updateResult = await this.tryUpdate(profileData);
      if (updateResult.success) {
        console.log('✅ Profile updated via UPDATE');
        return updateResult;
      }

      console.log('⚠️ UPDATE failed, trying INSERT strategy...');
      
      // Stratégie 3: Essayer INSERT direct
      const insertResult = await this.tryInsert(profileData);
      if (insertResult.success) {
        console.log('✅ Profile created via INSERT');
        return insertResult;
      }

      console.error('❌ All strategies failed');
      return {
        success: false,
        error: 'Impossible de créer le profil après plusieurs tentatives'
      };

    } catch (error) {
      console.error('❌ Unexpected error in createSignupProfile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inattendue'
      };
    }
  }

  /**
   * Stratégie 1: UPSERT
   */
  private static async tryUpsert(profileData: SignupProfileData) {
    try {
      console.log('📝 Tentative UPSERT avec données:', profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.log('❌ UPSERT error:', error);
        console.log('❌ Error details:', JSON.stringify(error, null, 2));
        return { success: false, error: error.message };
      }

      console.log('✅ UPSERT success:', data);
      
      // Vérification que toutes les données sont bien sauvegardées
      const missingFields = [];
      if (!data.first_name) missingFields.push('first_name');
      if (!data.last_name) missingFields.push('last_name');
      if (!data.city) missingFields.push('city');
      if (profileData.golf_index && (data.golf_index === null || data.golf_index === undefined)) {
        missingFields.push('golf_index');
      }
      
      if (missingFields.length > 0) {
        console.warn('⚠️ Certains champs n\'ont pas été sauvegardés via UPSERT:', missingFields);
      }

      return { success: true, data };
    } catch (error) {
      console.log('❌ UPSERT exception:', error);
      return { success: false, error: 'UPSERT failed' };
    }
  }

  /**
   * Stratégie 2: UPDATE
   */
  private static async tryUpdate(profileData: SignupProfileData) {
    try {
      const { id, ...updateData } = profileData;
      
      console.log('📝 Tentative UPDATE avec données:', { id, updateData });
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.log('❌ UPDATE error:', error);
        console.log('❌ Error details:', JSON.stringify(error, null, 2));
        return { success: false, error: error.message };
      }

      console.log('✅ UPDATE success:', data);
      
      // Vérification que toutes les données sont bien sauvegardées
      const missingFields = [];
      if (!data.first_name) missingFields.push('first_name');
      if (!data.last_name) missingFields.push('last_name');
      if (!data.city) missingFields.push('city');
      if (profileData.golf_index && (data.golf_index === null || data.golf_index === undefined)) {
        missingFields.push('golf_index');
      }
      
      if (missingFields.length > 0) {
        console.warn('⚠️ Certains champs n\'ont pas été sauvegardés via UPDATE:', missingFields);
      }

      return { success: true, data };
    } catch (error) {
      console.log('❌ UPDATE exception:', error);
      return { success: false, error: 'UPDATE failed' };
    }
  }

  /**
   * Stratégie 3: INSERT
   */
  private static async tryInsert(profileData: SignupProfileData) {
    try {
      console.log('📝 Tentative INSERT avec données:', profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.log('❌ INSERT error:', error);
        console.log('❌ Error details:', JSON.stringify(error, null, 2));
        return { success: false, error: error.message };
      }

      console.log('✅ INSERT success:', data);
      
      // Vérification que toutes les données sont bien sauvegardées
      const missingFields = [];
      if (!data.first_name) missingFields.push('first_name');
      if (!data.last_name) missingFields.push('last_name');
      if (!data.city) missingFields.push('city');
      if (profileData.golf_index && (data.golf_index === null || data.golf_index === undefined)) {
        missingFields.push('golf_index');
      }
      
      if (missingFields.length > 0) {
        console.warn('⚠️ Certains champs n\'ont pas été sauvegardés via INSERT:', missingFields);
      }

      return { success: true, data };
    } catch (error) {
      console.log('❌ INSERT exception:', error);
      return { success: false, error: 'INSERT failed' };
    }
  }

  /**
   * Vérifie si un profil existe pour un utilisateur
   */
  static async checkProfileExists(userId: string): Promise<{
    exists: boolean;
    profile?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Pas de résultat trouvé
          return { exists: false };
        }
        return { exists: false, error: error.message };
      }

      return { exists: true, profile: data };
    } catch (error) {
      return { 
        exists: false, 
        error: error instanceof Error ? error.message : 'Erreur inattendue' 
      };
    }
  }

  /**
   * Attend que le trigger automatique crée le profil de base
   */
  static async waitForTriggerProfile(userId: string, maxWaitTime = 5000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 500; // Vérifier toutes les 500ms

    while (Date.now() - startTime < maxWaitTime) {
      const { exists } = await this.checkProfileExists(userId);
      if (exists) {
        console.log('✅ Trigger profile found after', Date.now() - startTime, 'ms');
        return true;
      }
      
      // Attendre avant la prochaine vérification
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    console.log('⚠️ Trigger profile not found after', maxWaitTime, 'ms');
    return false;
  }

  /**
   * Valide les données du profil
   */
  static validateProfileData(data: Partial<SignupProfileData>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.id) errors.push('ID utilisateur manquant');
    if (!data.email) errors.push('Email manquant');
    if (!data.first_name?.trim()) errors.push('Prénom manquant');
    if (!data.last_name?.trim()) errors.push('Nom manquant');
    if (!data.city?.trim()) errors.push('Ville manquante');

    if (data.golf_index !== null && data.golf_index !== undefined) {
      if (data.golf_index < 0 || data.golf_index > 54) {
        errors.push('Index de golf invalide (doit être entre 0 et 54)');
      }
    }

    if (data.dominant_hand && !['right', 'left'].includes(data.dominant_hand)) {
      errors.push('Main dominante invalide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}