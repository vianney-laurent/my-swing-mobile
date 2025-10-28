// Simplified Supabase client for React Native - REST API only
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = 'https://fdxyqqiukrzondnakvge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkeHlxcWl1a3J6b25kbmFrdmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODQ5NDAsImV4cCI6MjA3NjI2MDk0MH0.voOuR-grQSP3ozAHWjtb9uz8WwPheIF5VnFHRUlDjN0';

// Simplified Supabase client using REST API
export class SupabaseClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = supabaseUrl;
    this.apiKey = supabaseAnonKey;
  }

  // Auth methods
  async signUp(email: string, password: string) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      return { data, error: response.ok ? null : data };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.access_token) {
        // Store session
        await AsyncStorage.setItem('supabase_session', JSON.stringify(data));
        return { data: { user: data.user, session: data }, error: null };
      }
      
      return { data: null, error: data };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      await AsyncStorage.removeItem('supabase_session');
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async getSession() {
    try {
      const sessionData = await AsyncStorage.getItem('supabase_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return { data: { session }, error: null };
      }
      return { data: { session: null }, error: null };
    } catch (error) {
      return { data: { session: null }, error };
    }
  }

  async getUser() {
    try {
      const sessionData = await AsyncStorage.getItem('supabase_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return { data: { user: session.user }, error: null };
      }
      return { data: { user: null }, error: null };
    } catch (error) {
      return { data: { user: null }, error };
    }
  }

  // Database methods
  async insertProfile(profile: any) {
    try {
      const sessionData = await AsyncStorage.getItem('supabase_session');
      const session = sessionData ? JSON.parse(sessionData) : null;
      
      const response = await fetch(`${this.baseUrl}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
          'Authorization': session ? `Bearer ${session.access_token}` : '',
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();
      return { data: response.ok ? data : null, error: response.ok ? null : data };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const supabase = new SupabaseClient();