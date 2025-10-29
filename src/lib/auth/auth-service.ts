// Authentication service for React Native
import { supabase } from '../supabase/client';
import { SecureStorageService } from './secure-storage';

export interface SignUpData {
  email: string;
  password: string;
  golfLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
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
  static async signIn({ email, password, rememberMe = false }: SignInData): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        return { user: null, error };
      }

      // Sauvegarder les credentials si connexion réussie et rememberMe activé
      if (data?.user && data?.session) {
        await SecureStorageService.saveCredentials(
          email, 
          data.session.access_token, 
          rememberMe
        );
        console.log('✅ User signed in successfully, credentials saved:', { rememberMe });
      }

      return { user: data?.user || null, error: null };
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
  static async signOut(clearCredentials: boolean = false): Promise<{ error: any | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Supprimer les credentials si demandé ou désactiver juste remember me
      if (clearCredentials) {
        await SecureStorageService.clearCredentials();
        console.log('✅ User signed out, credentials cleared');
      } else {
        await SecureStorageService.disableRememberMe();
        console.log('✅ User signed out, remember me disabled');
      }
      
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

  // Tentative de reconnexion automatique avec les credentials sauvegardés
  static async attemptAutoLogin(): Promise<AuthResult> {
    try {
      console.log('🔄 Attempting auto login...');
      
      // Vérifier si remember me est activé
      const isEnabled = await SecureStorageService.isRememberMeEnabled();
      if (!isEnabled) {
        console.log('❌ Remember me not enabled');
        return { user: null, error: null };
      }

      // Vérifier si les credentials ne sont pas expirés
      const isExpired = await SecureStorageService.areCredentialsExpired();
      if (isExpired) {
        console.log('❌ Stored credentials expired');
        await SecureStorageService.clearCredentials();
        return { user: null, error: null };
      }

      // Essayer de récupérer la session existante
      const session = await this.getCurrentSession();
      if (session?.user) {
        console.log('✅ Auto login successful with existing session');
        return { user: session.user, error: null };
      }

      console.log('❌ No valid session found');
      return { user: null, error: null };
    } catch (error) {
      console.error('❌ Auto login error:', error);
      return { user: null, error };
    }
  }

  // Obtenir le dernier email utilisé pour pré-remplir le formulaire
  static async getLastUsedEmail(): Promise<string | null> {
    return await SecureStorageService.getLastEmail();
  }

  // Vérifier si remember me est activé
  static async isRememberMeEnabled(): Promise<boolean> {
    return await SecureStorageService.isRememberMeEnabled();
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