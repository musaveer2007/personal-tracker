/**
 * Auth Service Foundation (Upgrade 01)
 * This prepares the application for real authentication (Upgrade 02).
 */
import { create } from 'zustand';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

export interface UserIdentity {
  id: string; // The real auth user ID (e.g. from Supabase auth.users)
  email: string;
}

interface AuthState {
  user: UserIdentity | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, 
  session: null,
  isAuthenticated: false,
  isLoading: true, // Start loading

  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ 
        session, 
        user: session?.user ? { id: session.user.id, email: session.user.email || '' } : null,
        isAuthenticated: !!session,
        isLoading: false 
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          session, 
          user: session?.user ? { id: session.user.id, email: session.user.email || '' } : null,
          isAuthenticated: !!session,
          isLoading: false 
        });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },
}));
