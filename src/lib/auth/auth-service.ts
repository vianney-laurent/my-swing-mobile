// Authentication service for React Native
import { supabase } from '../supabase/client';

export interface SignUpData {
  email: string;
  password: string;
  golfLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: any | null;
  error: any | null;
}

export class AuthService {
  // Sign up new user
  static async signUp({ email, password, golfLevel = 'beginner' }: SignUpData): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        return { user: null, error };
      }

      // Create profile if user was created successfully
      if (data?.user) {
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email || email,
            golf_level: golfLevel,
          });
        } catch (profileError) {
          console.warn('Profile creation failed, but user was created:', profileError);
        }
      }

      return { user: data?.user || null, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        user: null, 
        error: { 
          message: 'Une erreur inattendue s\'est produite'
        }
      };
    }
  }

  // Sign in existing user
  static async signIn({ email, password }: SignInData): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { user: data?.user || null, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        user: null, 
        error: { 
          message: 'Une erreur inattendue s\'est produite'
        }
      };
    }
  }

  // Sign out user
  static async signOut(): Promise<{ error: any | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { 
        error: { 
          message: 'Erreur lors de la déconnexion'
        }
      };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<any | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting current user:', error);
        return null;
      }
      return user;
    } catch (error) {
      console.error('Network error getting user:', error);
      return null;
    }
  }

  // Get current session
  static async getCurrentSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get current session error:', error);
      return null;
    }
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
    }
    return { isValid: true };
  }

  // Format auth error messages in French
  static formatAuthError(error: any): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Email ou mot de passe incorrect';
      case 'Email not confirmed':
        return 'Veuillez confirmer votre email avant de vous connecter';
      case 'User already registered':
        return 'Un compte existe déjà avec cet email';
      case 'Password should be at least 6 characters':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      case 'Unable to validate email address: invalid format':
        return 'Format d\'email invalide';
      default:
        return error.message || 'Une erreur s\'est produite';
    }
  }
}