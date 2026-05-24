import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  initialize: () => void;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',

  initialize: () => {
    try {
      const stored = localStorage.getItem('shopnow_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ user: parsed, status: 'authenticated' });
      } else {
        set({ user: null, status: 'unauthenticated' });
      }
    } catch (e) {
      set({ user: null, status: 'unauthenticated' });
    }
  },

  login: async (email, password) => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const res = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Invalid credentials');
    }

    const userData: User = await res.json();
    localStorage.setItem('shopnow_session', JSON.stringify(userData));
    set({ user: userData, status: 'authenticated' });
    return userData;
  },

  register: async (name, email, password) => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const res = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Registration failed');
    }

    const userData: User = await res.json();
    localStorage.setItem('shopnow_session', JSON.stringify(userData));
    set({ user: userData, status: 'authenticated' });
    return userData;
  },

  logout: () => {
    localStorage.removeItem('shopnow_session');
    set({ user: null, status: 'unauthenticated' });
  },
}));
