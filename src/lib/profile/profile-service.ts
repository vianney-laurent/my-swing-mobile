import { supabase } from '../supabase/client';
import { UserProfile, ProfileFormData } from '../../types/profile';

export class ProfileService {
  async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

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
      console.error('Profile service error:', error);
      return null;
    }
  }

  async updateProfile(profileData: ProfileFormData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const golfIndex = profileData.golf_index 
        ? parseFloat(profileData.golf_index) 
        : null;

      if (golfIndex !== null && (golfIndex < 0 || golfIndex > 54)) {
        return { success: false, error: 'L\'index doit être entre 0 et 54' };
      }

      const updateData = {
        first_name: profileData.first_name.trim(),
        last_name: profileData.last_name.trim(),
        golf_index: golfIndex,
        dominant_hand: profileData.dominant_hand === 'none' ? null : profileData.dominant_hand || null,
        city: profileData.city.trim(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'Erreur lors de la mise à jour du profil' };
      }

      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Erreur inattendue' };
    }
  }

  isProfileComplete(profile: UserProfile | null): boolean {
    return !!(profile?.first_name && profile?.last_name);
  }
}

export const profileService = new ProfileService();