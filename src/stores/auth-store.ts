import { create } from 'zustand';
import type { ParentProfile } from '@/types';

interface AuthState {
  token: string | null;
  parent: ParentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (token: string, parent: ParentProfile) => void;
  clearAuth: () => void;
  loadFromStorage: () => void;
  updateParent: (updates: Partial<ParentProfile>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  parent: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token, parent) => {
    // Store in sessionStorage (NOT localStorage per CLAUDE.md)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('parent', JSON.stringify(parent));
    }
    set({ token, parent, isAuthenticated: true, isLoading: false });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('parent');
    }
    set({ token: null, parent: null, isAuthenticated: false, isLoading: false });
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    const token = sessionStorage.getItem('auth_token');
    const parentStr = sessionStorage.getItem('parent');

    if (token && parentStr) {
      try {
        const parent = JSON.parse(parentStr) as ParentProfile;
        set({ token, parent, isAuthenticated: true, isLoading: false });
      } catch {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('parent');
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  updateParent: (updates) => {
    const current = get().parent;
    if (current) {
      const updated = { ...current, ...updates };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('parent', JSON.stringify(updated));
      }
      set({ parent: updated });
    }
  },
}));
