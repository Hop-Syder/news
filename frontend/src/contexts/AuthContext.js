import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔵 [AUTH] Auth state changed:', event);
      setSession(session);

      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser) => {
    try {
      // Get user profile from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error) throw error;

      setUser({
        id: authUser.id,
        email: authUser.email,
        first_name: data?.first_name,
        last_name: data?.last_name,
        has_profile: data?.has_profile || false
      });
    } catch (error) {
      console.error('❌ [AUTH] Error loading profile:', error);
      // Set basic user data even if profile load fails
      setUser({
        id: authUser.id,
        email: authUser.email,
        first_name: null,
        last_name: null,
        has_profile: false
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      console.log('🔵 [AUTH] Starting registration with Supabase...');

      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Registration failed - no user returned');
      }

      console.log('✅ [AUTH] Registration successful');

      // User profile is created automatically by database trigger
      // Session and user are set by onAuthStateChange listener

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          first_name: firstName,
          last_name: lastName,
          has_profile: false
        }
      };
    } catch (error) {
      console.error('❌ [AUTH] Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔵 [AUTH] Starting login with Supabase...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Login failed - no user returned');
      }

      console.log('✅ [AUTH] Login successful');

      // Session and user are set by onAuthStateChange listener

      return { success: true };
    } catch (error) {
      console.error('❌ [AUTH] Login error:', error);

      // User-friendly error messages
      let errorMessage = 'Login failed';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Veuillez confirmer votre email';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('🔵 [AUTH] Starting Google Sign-In...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;

      console.log('✅ [AUTH] Google OAuth initiated');

      // OAuth flow will redirect to Google
      // User will be set when they return via onAuthStateChange

      return { success: true };
    } catch (error) {
      console.error('❌ [AUTH] Google login error:', error);
      return {
        success: false,
        error: error.message || 'Google login failed'
      };
    }
  };

  const logout = async () => {
    try {
      console.log('🔵 [AUTH] Logging out...');

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);
      setSession(null);

      console.log('✅ [AUTH] Logout successful');
    } catch (error) {
      console.error('❌ [AUTH] Logout error:', error);
      // Clear local state even if server logout fails
      setUser(null);
      setSession(null);
    }
  };

  const value = {
    user,
    session,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
    // Expose access token for API calls if needed
    getAccessToken: () => session?.access_token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
