import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ensureSession,
  clearSession as clearSessionCookie,
  createSession,
  getSessionMeta,
} from '@/utils/session';

const AuthContext = createContext(null);
const LOGOUT_EVENT_KEY = 'nexus-connect-auth-logout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const EMAIL_REDIRECT_TO =
  process.env.REACT_APP_SUPABASE_EMAIL_REDIRECT_TO ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? `${window.location.origin}/auth/callback`
    : undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(() => getSessionMeta());

  const clearAuthState = useCallback(() => {
    setUser(null);
    setSession(null);
    setLoading(false);
    setSessionInfo(null);
  }, []);

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
        clearAuthState();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [clearAuthState]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === LOGOUT_EVENT_KEY && event.newValue) {
        console.log('🔴 [AUTH] Logout broadcast received, clearing local state');
        clearAuthState();
        setLoading(false);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [clearAuthState]);

  const loadUserProfile = async (authUser) => {
    try {
      // Get user profile from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error) throw error;

      const ensuredSession = ensureSession(authUser.id);
      setSessionInfo(ensuredSession);

      setUser({
        id: authUser.id,
        email: authUser.email,
        first_name: data?.first_name,
        last_name: data?.last_name,
        has_profile: data?.has_profile || false,
        created_at: authUser.created_at
      });
    } catch (error) {
      console.error('❌ [AUTH] Error loading profile:', error);
      // Set basic user data even if profile load fails
      setUser({
        id: authUser.id,
        email: authUser.email,
        first_name: null,
        last_name: null,
        has_profile: false,
        created_at: authUser.created_at
      });
      const ensuredSession = ensureSession(authUser.id);
      setSessionInfo(ensuredSession);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      console.log('🔵 [AUTH] Starting registration with Supabase...');

      // Register with Supabase
      const options = {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      };

      if (EMAIL_REDIRECT_TO) {
        options.emailRedirectTo = EMAIL_REDIRECT_TO;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Registration failed - no user returned');
      }

      console.log('✅ [AUTH] Registration successful');

      // User profile is created automatically by database trigger
      // Session and user are set by onAuthStateChange listener

      if (data.session?.user) {
        const createdSession = createSession(data.session.user.id);
        setSessionInfo(createdSession);
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          first_name: firstName,
          last_name: lastName,
          has_profile: false,
          created_at: data.user.created_at
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
      const ensuredSession = ensureSession(data.user.id);
      setSessionInfo(ensuredSession);

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
          redirectTo: `${window.location.origin}/ma-carte`,
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

  const broadcastLogout = (reason) => {
    try {
      window.localStorage.setItem(
        LOGOUT_EVENT_KEY,
        JSON.stringify({ reason, ts: Date.now() })
      );
    } catch (error) {
      console.warn('⚠️ [AUTH] Failed to broadcast logout event:', error);
    }
  };

  const logout = async (reason = 'manual') => {
    try {
      console.log('🔵 [AUTH] Logging out...');

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      clearAuthState();
      clearSessionCookie();
      try {
        window.localStorage.clear();
      } catch (storageError) {
        console.warn('⚠️ [AUTH] Impossible de vider localStorage:', storageError);
      }
      broadcastLogout(reason);

      console.log('✅ [AUTH] Logout successful');
    } catch (error) {
      console.error('❌ [AUTH] Logout error:', error);
      // Clear local state even if server logout fails
      clearAuthState();
      clearSessionCookie();
      try {
        window.localStorage.clear();
      } catch (storageError) {
        console.warn('⚠️ [AUTH] Impossible de vider localStorage:', storageError);
      }
      broadcastLogout(reason);
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
    sessionInfo,
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
