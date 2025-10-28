import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { AuthService } from '../lib/auth/auth-service';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        console.log('Initial session loaded:', session?.user?.email || 'No user');
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();
  }, []);

  return {
    user,
    loading,
    signIn: AuthService.signIn,
    signUp: AuthService.signUp,
    signOut: AuthService.signOut,
  };
}