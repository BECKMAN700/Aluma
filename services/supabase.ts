/**
 * Cliente único do Supabase, usado por todo o app.
 * Guarda a sessão no aparelho (AsyncStorage) e renova o token sozinho.
 * Lê EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY do .env.
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const chavePublica = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// No build estático da web (Node) não existe window; sem storage a sessão só vale em memória lá.
const temStorage = Platform.OS !== 'web' || typeof window !== 'undefined';

export const supabase = createClient(url, chavePublica, {
  auth: {
    storage: temStorage ? AsyncStorage : undefined,
    persistSession: temStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});