'use client';

// ==============================================================================
// Eggstra Poultry Farm Management System - Supabase RBAC Auth Context
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { UserRole, UserStatus, UserProfile } from '../types/poultry';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  fullName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMasterAdmin: boolean;
  isManager: boolean;
  isFarmHand: boolean;
  isViewer: boolean;
  hasRole: (roles: UserRole[]) => boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'eggstra_auth_session_v2';

// Master Admin Fallback Definition
const MASTER_ADMIN_USER: AuthUser = {
  id: '00000000-0000-0000-0000-000000000001',
  username: 'admin',
  email: 'admin@eggstra.farm',
  role: 'master_admin',
  status: 'active',
  fullName: 'Master Farm Administrator',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch full user profile and role from Supabase user_profiles
  const fetchUserProfile = useCallback(async (userId: string, email: string): Promise<AuthUser | null> => {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        const profile = data as UserProfile;
        if (profile.status === 'inactive') {
          return null;
        }

        return {
          id: profile.id,
          username: email.split('@')[0],
          email: profile.email || email,
          role: profile.role || 'farm_hand',
          status: profile.status || 'active',
          fullName: profile.full_name || email.split('@')[0],
        };
      }
    } catch (err) {
      console.warn('Could not fetch user profile from user_profiles table:', err);
    }

    // Default active profile fallback
    return {
      id: userId,
      username: email.split('@')[0],
      email: email,
      role: email === 'admin@eggstra.farm' ? 'master_admin' : 'farm_hand',
      status: 'active',
      fullName: email.split('@')[0],
    };
  }, []);

  // Restore authenticated session on mount
  useEffect(() => {
    async function restoreSession() {
      setIsLoading(true);

      // 1. Check local session storage first
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.email) {
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
            const profile = await fetchUserProfile(session.user.id, session.user.email || 'user@eggstra.farm');
            if (profile) {
              setUser(profile);
              if (typeof window !== 'undefined') {
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
              }
            } else {
              // Account is inactive or invalid
              await supabase.auth.signOut();
              setUser(null);
              if (typeof window !== 'undefined') {
                localStorage.removeItem(AUTH_STORAGE_KEY);
              }
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
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { data: authListener } = client.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id, session.user.email || 'user@eggstra.farm');
          if (profile) {
            setUser(profile);
            if (typeof window !== 'undefined') {
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
            }
          } else {
            if (client) {
              await client.auth.signOut();
            }
            setUser(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem(AUTH_STORAGE_KEY);
            }
          }
        } else {
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, [fetchUserProfile]);

  const refreshProfile = async (): Promise<void> => {
    if (!user) return;
    const profile = await fetchUserProfile(user.id, user.email);
    if (profile) {
      setUser(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      }
    }
  };

  const login = async (
    emailOrUsername: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedInput = emailOrUsername.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedInput || !trimmedPass) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    // Standardize input (if user typed "admin", resolve to "admin@eggstra.farm")
    const email = trimmedInput.includes('@') ? trimmedInput : `${trimmedInput}@eggstra.farm`;

    // 1. Direct master admin credential bypass if offline or default admin
    const isMasterAdminMatch =
      (trimmedInput === 'admin' || trimmedInput === 'admin@eggstra.farm') &&
      trimmedPass === 'password123';

    if (isMasterAdminMatch) {
      setUser(MASTER_ADMIN_USER);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(MASTER_ADMIN_USER));
      }

      // Sync master admin in Supabase in background
      if (isSupabaseConfigured && supabase) {
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: 'admin@eggstra.farm',
            password: 'password123',
          });

          if (signInError && signInError.message.includes('Invalid login credentials')) {
            await supabase.auth.signUp({
              email: 'admin@eggstra.farm',
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

    // 2. Standard Supabase Auth authentication
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: trimmedPass,
        });

        if (error) {
          return { success: false, error: error.message || 'Invalid username or password.' };
        }

        if (data.user) {
          const profile = await fetchUserProfile(data.user.id, data.user.email || email);
          if (!profile) {
            await supabase.auth.signOut();
            return {
              success: false,
              error: 'This account has been deactivated. Please contact the farm administrator.',
            };
          }

          setUser(profile);
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          }
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Authentication failed. Please check connection.' };
      }
    }

    return {
      success: false,
      error: 'Invalid credentials. Please verify your username and password.',
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

  // Role helper checks
  const role = user?.role || 'viewer';
  const isMasterAdmin = role === 'master_admin';
  const isManager = role === 'manager' || isMasterAdmin;
  const isFarmHand = role === 'farm_hand' || isManager || isMasterAdmin;
  const isViewer = Boolean(user);

  const hasRole = useCallback(
    (allowedRoles: UserRole[]): boolean => {
      if (!user) return false;
      if (user.role === 'master_admin') return true;
      return allowedRoles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isMasterAdmin,
        isManager,
        isFarmHand,
        isViewer,
        hasRole,
        login,
        logout,
        refreshProfile,
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
