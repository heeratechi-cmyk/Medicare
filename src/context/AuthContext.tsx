import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { getUsers, saveUserProfile, initializeStorage, logActivity } from '../lib/storage';
import { supabaseSignUp, supabaseSignIn, supabaseSignOut, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  signup: (userData: Partial<UserProfile> & { email: string; role: UserRole; fullName: string; doctorRegNumber?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'medicare_active_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load active user session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, role?: UserRole): Promise<{ success: boolean; message?: string }> => {
    // 1. Check Supabase profiles if configured
    if (isSupabaseConfigured) {
      const { user: supaUser } = await supabaseSignIn(email);
      if (supaUser) {
        setUser(supaUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(supaUser));
        saveUserProfile(supaUser);
        logActivity('USER_LOGIN', `User ${supaUser.fullName} (${supaUser.role}) logged in via Supabase`, supaUser);
        return { success: true };
      }
    }

    // 2. Check registered users in storage
    const allUsers = getUsers();
    let found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!found) {
      if (role) {
        const newUser: UserProfile = {
          id: 'user-' + Date.now(),
          email,
          fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
          role: role,
          createdAt: new Date().toISOString(),
        };
        saveUserProfile(newUser);
        found = newUser;
      } else {
        return { success: false, message: 'Account not found. Please register a new account.' };
      }
    }

    setUser(found);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    logActivity('USER_LOGIN', `User ${found.fullName} (${found.role}) logged in`, found);
    return { success: true };
  };

  const signup = async (
    userData: Partial<UserProfile> & { email: string; role: UserRole; fullName: string; doctorRegNumber?: string }
  ): Promise<{ success: boolean; message?: string }> => {
    const allUsers = getUsers();
    const existing = allUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    // Register into Supabase Auth & public.profiles
    const { user: supaUser } = await supabaseSignUp({
      email: userData.email.trim(),
      fullName: userData.fullName.trim(),
      role: userData.role,
      phone: userData.phone,
      doctorRegNumber: userData.doctorRegNumber,
    });

    const newUser: UserProfile = supaUser || {
      id: 'user-' + Date.now(),
      createdAt: new Date().toISOString(),
      email: userData.email.trim(),
      fullName: userData.fullName.trim(),
      role: userData.role,
      phone: userData.phone,
    };

    saveUserProfile(newUser);
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    logActivity('USER_SIGNUP', `New user registered: ${newUser.fullName} as ${newUser.role}`, newUser);
    return { success: true };
  };

  const logout = () => {
    if (user) {
      logActivity('USER_LOGOUT', `User ${user.fullName} logged out`, user);
    }
    supabaseSignOut();
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    saveUserProfile(updated);
    setUser(updated);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    logActivity('UPDATE_PROFILE', `Updated user profile information`, updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
