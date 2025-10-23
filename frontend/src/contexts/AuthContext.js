import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

const AuthContext = createContext(null);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [token]);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      console.log('🔵 [AUTH] Starting registration with Firebase...');
      
      // Register with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ [AUTH] Firebase registration successful');
      
      // Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      console.log('✅ [AUTH] Firebase ID token obtained');
      
      // Send to backend
      console.log('🔵 [AUTH] Sending to backend:', `${API}/auth/firebase`);
      const response = await axios.post(`${API}/auth/firebase`, { idToken });
      console.log('✅ [AUTH] Backend response received');
      
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ [AUTH] Registration error:', error);
      console.error('❌ [AUTH] Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Registration failed'
      };
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔵 [AUTH] Starting login with Firebase...');
      
      // Login with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ [AUTH] Firebase login successful');
      
      // Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      console.log('✅ [AUTH] Firebase ID token obtained');
      
      // Send to backend
      console.log('🔵 [AUTH] Sending to backend:', `${API}/auth/firebase`);
      const response = await axios.post(`${API}/auth/firebase`, { idToken });
      console.log('✅ [AUTH] Backend response received');
      
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ [AUTH] Login error:', error);
      console.error('❌ [AUTH] Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Login failed'
      };
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('🔵 [AUTH] Starting Google Sign-In...');
      
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ [AUTH] Google Sign-In successful');
      
      // Get Firebase ID token
      const idToken = await result.user.getIdToken();
      console.log('✅ [AUTH] Firebase ID token obtained');
      
      // Send to backend
      console.log('🔵 [AUTH] Sending to backend:', `${API}/auth/firebase`);
      const response = await axios.post(`${API}/auth/firebase`, { idToken });
      console.log('✅ [AUTH] Backend response received');
      
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ [AUTH] Google login error:', error);
      console.error('❌ [AUTH] Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Google login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Firebase sign out error:', error);
    }
    
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user
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
