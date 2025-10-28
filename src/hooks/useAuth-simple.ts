import { useState } from 'react';

// Version simplifiée pour tester sans Supabase
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (data: any) => {
    console.log('Mock sign in:', data);
    // Simuler une connexion réussie
    setUser({ id: '1', email: data.email });
    return { user: { id: '1', email: data.email }, error: null };
  };

  const signUp = async (data: any) => {
    console.log('Mock sign up:', data);
    // Simuler une inscription réussie
    setUser({ id: '1', email: data.email });
    return { user: { id: '1', email: data.email }, error: null };
  };

  const signOut = async () => {
    console.log('Mock sign out');
    setUser(null);
    return { error: null };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}