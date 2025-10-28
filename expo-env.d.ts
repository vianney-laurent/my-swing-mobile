/// <reference types="expo/types" />

// Environment variables type definitions
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY: string;
    EXPO_PUBLIC_OPENWEATHER_API_KEY: string;
    EXPO_PUBLIC_FRAME_EXTRACTION_SERVER_URL: string;
    EXPO_PUBLIC_APP_VERSION: string;
    EXPO_PUBLIC_MAX_VIDEO_SIZE_MB: string;
    EXPO_PUBLIC_MAX_VIDEO_DURATION_SECONDS: string;
  }
}