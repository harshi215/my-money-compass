import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CustomUser {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: CustomUser | null;
  session: any | null;
  loading: boolean;
  username: string;
  signUp: (username: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('custom_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    // Mock getSession on the supabase client so other hooks can fetch properly
    supabase.auth.getSession = async () => {
      const stored = localStorage.getItem('custom_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          data: {
            session: {
              access_token: ANON_KEY,
              user: parsed,
            } as any
          },
          error: null
        };
      }
      return { data: { session: null }, error: null };
    };
  }, []);

  const signUp = async (username: string, password: string, fullName?: string) => {
    const { error } = await (supabase as any).from('pending_signups').insert([{
      username,
      password,
      full_name: fullName
    }]);
    return { error };
  };

  const signIn = async (username: string, password: string) => {
    const { data, error } = await (supabase as any)
      .from('users')
      .select('id, username')
      .eq('username', username)
      .eq('password', password)
      .maybeSingle();

    if (error) return { error };
    if (!data) return { error: new Error('Invalid username or password') };

    const customUser: CustomUser = {
      id: data.id,
      username: data.username,
      email: data.username, // Fallback so {user.email} works in the sidebar and settings
    };

    setUser(customUser);
    localStorage.setItem('custom_user', JSON.stringify(customUser));
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('custom_user');
  };

  const username = user?.username || '';

  return (
    <AuthContext.Provider value={{ user, session: user ? { user } : null, loading, username, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
