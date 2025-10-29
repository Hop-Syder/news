// Section : Importations nécessaires
import { createClient } from '@supabase/supabase-js'

// Supabase configuration from environment variables
// Section : Logique métier et structure du module
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://temp-placeholder.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.temp'

// Warn if using temporary credentials
if (supabaseUrl.includes('temp-placeholder')) {
  console.warn('⚠️  Using temporary Supabase credentials. Please configure Supabase and update .env')
  console.warn('📖 See SUPABASE_SETUP.md for instructions')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'nexus-connect-auth',
    storage: window.localStorage
  }
})

export default supabase

// ──────────────────────────────────
// Hop-Syder Développeur
// Full Stack & Data Scientist Nexus Partners
// 📧 daoudaabassichristian@gmail.com
// 📱 +229 0196701733
// 🌐 nexuspartners.xyz
// ──────────────────────────────────
