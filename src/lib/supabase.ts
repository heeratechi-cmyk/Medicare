import { createClient } from '@supabase/supabase-js';
import { 
  UserProfile, 
  Doctor, 
  Appointment, 
  Specialty, 
  City, 
  Clinic, 
  Review, 
  ActivityLog, 
  SiteSettings, 
  UserRole 
} from '../types';

// Read Supabase credentials from environment or defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://supabase.medicare.pk';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project')
);

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ============================================================================
// Real Supabase Auth & Profile Service
// ============================================================================

export async function supabaseSignUp(params: {
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  doctorRegNumber?: string;
}): Promise<{ user: UserProfile | null; error?: string }> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: 'SecureTemporaryPassword!' + Math.floor(1000 + Math.random() * 9000),
        options: {
          data: {
            full_name: params.fullName,
            role: params.role,
            phone: params.phone,
          },
        },
      });

      if (error) {
        console.warn('[Supabase Auth Warning]:', error.message);
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: params.email,
          role: params.role,
          fullName: params.fullName,
          phone: params.phone,
          createdAt: new Date().toISOString(),
        };

        // Insert into public.profiles
        await supabase.from('profiles').upsert([
          {
            id: profile.id,
            email: profile.email,
            full_name: profile.fullName,
            role: profile.role,
            phone: profile.phone,
          }
        ]);

        return { user: profile };
      }
    }
  } catch (e: any) {
    console.error('Supabase Auth SignUp error:', e);
  }

  // Fallback to local profile
  const localProfile: UserProfile = {
    id: 'user-' + Date.now(),
    email: params.email,
    role: params.role,
    fullName: params.fullName,
    phone: params.phone,
    createdAt: new Date().toISOString(),
  };

  return { user: localProfile };
}

export async function supabaseSignIn(email: string): Promise<{ user: UserProfile | null; error?: string }> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (!error && data) {
        return {
          user: {
            id: data.id,
            email: data.email,
            role: data.role as UserRole,
            fullName: data.full_name,
            phone: data.phone,
            createdAt: data.created_at || new Date().toISOString(),
          }
        };
      }
    }
  } catch (e: any) {
    console.warn('Supabase profile query fallback:', e.message);
  }

  return { user: null };
}

export async function supabaseSignOut(): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut().catch(() => {});
  }
}
