import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type Profile } from '@/lib/supabase';

type Session = {
  user: { id: string; email: string } | null;
  profile: Profile | null;
};

type Ctx = {
  session: Session;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ user: null, profile: null });
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data as Profile | null;
  };

  const refreshProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSession({ user: null, profile: null });
      return;
    }
    const profile = await loadProfile(user.id);
    setSession({ user: { id: user.id, email: user.email ?? '' }, profile });
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!user) {
        setSession({ user: null, profile: null });
        setLoading(false);
        return;
      }
      const profile = await loadProfile(user.id);
      if (!mounted) return;
      setSession({ user: { id: user.id, email: user.email ?? '' }, profile });
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, supaSession) => {
      (async () => {
        if (!supaSession?.user) {
          setSession({ user: null, profile: null });
          return;
        }
        const profile = await loadProfile(supaSession.user.id);
        setSession({ user: { id: supaSession.user.id, email: supaSession.user.email ?? '' }, profile });
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession({ user: null, profile: null });
  };

  return (
    <AuthContext.Provider value={{ session, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
