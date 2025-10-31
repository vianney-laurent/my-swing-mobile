import { supabase } from '../supabase/client';

export interface AccountDeletionResult {
  success: boolean;
  error?: string;
}

class AccountDeletionService {
  /**
   * Request account deletion - marks account for deletion in 24h
   */
  async requestAccountDeletion(): Promise<AccountDeletionResult> {
    try {
      console.log('🗑️ Requesting account deletion...');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ No authenticated user found:', userError);
        return {
          success: false,
          error: 'Utilisateur non authentifié'
        };
      }

      // Calculate deletion timestamp (24h from now)
      const now = new Date();
      const deletionScheduledFor = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h

      console.log('📅 Scheduling deletion for:', deletionScheduledFor.toISOString());

      // Update profile with deletion timestamps
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          deletion_requested_at: now.toISOString(),
          deletion_scheduled_for: deletionScheduledFor.toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Failed to update profile for deletion:', updateError);
        return {
          success: false,
          error: 'Erreur lors de la programmation de la suppression'
        };
      }

      console.log('✅ Account deletion scheduled successfully');

      // Sign out the user immediately
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('⚠️ Failed to sign out after deletion request:', signOutError);
        // Don't return error here as the deletion was scheduled successfully
      }

      return {
        success: true
      };

    } catch (error) {
      console.error('❌ Unexpected error during account deletion request:', error);
      return {
        success: false,
        error: 'Erreur inattendue lors de la demande de suppression'
      };
    }
  }

  /**
   * Check if current user has a pending deletion
   */
  async checkPendingDeletion(): Promise<{
    hasPendingDeletion: boolean;
    scheduledFor?: Date;
    error?: string;
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { hasPendingDeletion: false };
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('deletion_requested_at, deletion_scheduled_for')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error checking pending deletion:', profileError);
        return { 
          hasPendingDeletion: false, 
          error: 'Erreur lors de la vérification' 
        };
      }

      const hasPendingDeletion = !!profile?.deletion_scheduled_for;
      const scheduledFor = profile?.deletion_scheduled_for 
        ? new Date(profile.deletion_scheduled_for) 
        : undefined;

      return {
        hasPendingDeletion,
        scheduledFor
      };

    } catch (error) {
      console.error('Unexpected error checking pending deletion:', error);
      return { 
        hasPendingDeletion: false, 
        error: 'Erreur inattendue' 
      };
    }
  }
}

export const accountDeletionService = new AccountDeletionService();