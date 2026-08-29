'use client';

// ==============================================================================
// Eggstra Poultry Farm Management System - Master Admin & Supabase Auth Context
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase/client';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'master_admin' | 'farm_manager' | 'operator';
  fullName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'eggstra_auth_session_v1';

// Master Admin Fallback Definition
const MASTER_ADMIN_USER: AuthUser = {
  id: '00000000-0000-0000-0000-000000000001',
  username: 'admin',
  email: 'admin@eggstra.farm',
  role: 'master_admin',
  fullName: 'Master Farm Administrator',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated session on initial mount
  useEffect(() => {
    async function restoreSession() {
      setIsLoading(true);

      // 1. Check local session storage first
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.username) {
              setUser(parsed);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Error reading stored session:', e);
          }
        }
      }

      // 2. Check Supabase session if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const authUser: AuthUser = {
              id: session.user.id,
              username: session.user.email?.split('@')[0] || 'admin',
              email: session.user.email || 'admin@eggstra.farm',
              role: 'master_admin',
              fullName: session.user.user_metadata?.full_name || 'Master Farm Administrator',
            };
            setUser(authUser);
            if (typeof window !== 'undefined') {
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
            }
          }
        } catch (err) {
          console.warn('Supabase auth session check:', err);
        }
      }

      setIsLoading(false);
    }

    restoreSession();

    // Supabase auth state listener
    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'admin',
            email: session.user.email || 'admin@eggstra.farm',
            role: 'master_admin',
            fullName: session.user.user_metadata?.full_name || 'Master Farm Administrator',
          };
          setUser(authUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          }
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  const login = async (
    usernameOrEmail: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedInput = usernameOrEmail.trim().toLowerCase();
    const trimmedPass = password.trim();

    // 1. Direct validation for master admin credentials
    const isMasterAdminMatch =
      (trimmedInput === 'admin' || trimmedInput === 'admin@eggstra.farm' || trimmedInput === 'admin@eggstra.local') &&
      trimmedPass === 'password123';

    if (isMasterAdminMatch) {
      setUser(MASTER_ADMIN_USER);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(MASTER_ADMIN_USER));
      }

      // Try registering/signing in on Supabase in the background if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const email = 'admin@eggstra.farm';
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: 'password123',
          });

          if (signInError && signInError.message.includes('Invalid login credentials')) {
            // Auto sign-up master admin in Supabase
            await supabase.auth.signUp({
              email,
              password: 'password123',
              options: {
                data: {
                  full_name: 'Master Farm Administrator',
                  role: 'master_admin',
                },
              },
            });
          }
        } catch (e) {
          console.warn('Supabase master admin auto-sync notice:', e);
        }
      }

      return { success: true };
    }

    // 2. Try Supabase Auth for any other standard user credentials
    if (isSupabaseConfigured && supabase) {
      try {
        const normalizedEmail = trimmedInput.includes('@') ? trimmedInput : `${trimmedInput}@eggstra.farm`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: trimmedPass,
        });

        if (error) {
          return { success: false, error: error.message || 'Invalid username or password.' };
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            username: data.user.email?.split('@')[0] || trimmedInput,
            email: data.user.email || normalizedEmail,
            role: 'master_admin',
            fullName: data.user.user_metadata?.full_name || 'Farm Administrator',
          };

          setUser(authUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          }
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Authentication error.' };
      }
    }

    return {
      success: false,
      error: 'Invalid credentials. Master admin is username: "admin" and password: "password123".',
    };
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error during Supabase signOut:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
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
