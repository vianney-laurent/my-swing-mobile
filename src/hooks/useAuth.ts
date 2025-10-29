import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { AuthService } from '../lib/auth/auth-service';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session with auto-login attempt
    const getInitialSession = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        // D'abord essayer de récupérer la session existante
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          console.log('✅ Existing session found:', session.user.email);
        } else {
          // Si pas de session, essayer l'auto-login
          console.log('🔄 No existing session, attempting auto-login...');
          const autoLoginResult = await AuthService.attemptAutoLogin();
          
          if (autoLoginResult.user) {
            setUser(autoLoginResult.user);
            console.log('✅ Auto-login successful:', autoLoginResult.user.email);
          } else {
            console.log('❌ No auto-login possible');
          }
        }
      } catch (error) {
        console.error('❌ Error during auth initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    signIn: AuthService.signIn,
    signUp: AuthService.signUp,
    signOut: AuthService.signOut,
    getLastUsedEmail: AuthService.getLastUsedEmail,
    isRememberMeEnabled: AuthService.isRememberMeEnabled,
  };
}