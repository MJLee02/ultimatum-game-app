import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variables in production, fallback to hardcoded values in development
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://prygnpfinhfvuajjdxnb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWducGZpbmhmdnVhampkeG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDExMTEsImV4cCI6MjA4MTA3NzExMX0.O9uw49ZqFkZifgYnixagCTp1ATPvjLUPvQtfK8QMxK0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

