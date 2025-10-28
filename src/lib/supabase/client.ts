// Supabase client configuration for React Native
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config';
import type { Database } from '../types/supabase';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  'https://fdxyqqiukrzondnakvge.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkeHlxcWl1a3J6b25kbmFrdmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODQ5NDAsImV4cCI6MjA3NjI2MDk0MH0.voOuR-grQSP3ozAHWjtb9uz8WwPheIF5VnFHRUlDjN0'
);