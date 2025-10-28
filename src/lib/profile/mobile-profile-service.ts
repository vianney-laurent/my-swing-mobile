// Service profil mobile
import { supabase } from '../supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  golf_index: number | null;
  dominant_hand: 'right' | 'left' | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export class MobileProfileService {
  /**
   * Récupère le profil de l'utilisateur connecté
   */
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentUserProfile:', error);
      return null;
    }
  }

  /**
   * Met à jour le profil utilisateur
   */
  static async updateProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  }

  /**
   * Récupère le nom d'affichage de l'utilisateur
   */
  static getDisplayName(profile: UserProfile | null): string {
    if (!profile) return 'Champion';
    
    if (profile.first_name) {
      return profile.first_name;
    }
    
    if (profile.email) {
      return profile.email.split('@')[0];
    }
    
    return 'Champion';
  }

  /**
   * Récupère le nom complet de l'utilisateur
   */
  static getFullName(profile: UserProfile | null): string {
    if (!profile) return 'Champion';
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    
    if (firstName) {
      return firstName;
    }
    
    if (lastName) {
      return lastName;
    }
    
    return this.getDisplayName(profile);
  }
}

export const mobileProfileService = new MobileProfileService();