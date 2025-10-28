// Application configuration for Expo
import Constants from 'expo-constants';

export const config = {
  supabase: {
    url: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  gemini: {
    apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY || '',
  },
  weather: {
    apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENWEATHER_API_KEY || process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
  },
  frameExtraction: {
    serverUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL || process.env.EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL || '',
  },
  app: {
    name: 'My Swing',
    shortName: 'My Swing',
    description: 'Un prof de golf dans votre poche !',
    version: Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_VERSION || process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0-mobile',
  },
  video: {
    maxSizeMB: parseInt(Constants.expoConfig?.extra?.EXPO_PUBLIC_MAX_VIDEO_SIZE_MB || process.env.EXPO_PUBLIC_MAX_VIDEO_SIZE_MB || '10'),
    maxDurationSeconds: parseInt(Constants.expoConfig?.extra?.EXPO_PUBLIC_MAX_VIDEO_DURATION_SECONDS || process.env.EXPO_PUBLIC_MAX_VIDEO_DURATION_SECONDS || '30'),
    supportedFormats: ['video/mp4', 'video/mov', 'video/quicktime'],
  },
  analysis: {
    timeoutMs: 120000, // 2 minutes
    retryAttempts: 3,
  },
} as const;

// Validate required environment variables
export function validateConfig() {
  const required = [
    { key: 'SUPABASE_URL', value: config.supabase.url },
    { key: 'SUPABASE_ANON_KEY', value: config.supabase.anonKey },
    { key: 'GOOGLE_GENERATIVE_AI_API_KEY', value: config.gemini.apiKey },
  ];

  const missing = required.filter(item => !item.value);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.map(item => item.key).join(', ')}`);
    return false;
  }
  
  return true;
}