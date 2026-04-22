import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AccountType = 'cliente' | 'vendedor' | 'admin';

interface UsuarioRow {
  id: string;
  auth_user_id: string;
  email: string;
  nome: string;
  sobrenome: string | null;
  tipo_conta: AccountType | null;
  status: string | null;
  avatar_url: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  usuario: UsuarioRow | null;
  role: AccountType | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<UsuarioRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsuario = async (authUserId: string) => {
    const { data } = await supabase
      .from('usuarios')
      .select('id, auth_user_id, email, nome, sobrenome, tipo_conta, status, avatar_url')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    setUsuario((data as UsuarioRow) ?? null);
  };

  useEffect(() => {
    // CRITICAL ORDER: subscribe first, then getSession.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        // defer to avoid deadlock with auth callback
        setTimeout(() => fetchUsuario(newSession.user.id), 0);
      } else {
        setUsuario(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchUsuario(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setUsuario(null);
  };

  const refreshUsuario = async () => {
    if (user) await fetchUsuario(user.id);
  };

  let role: AccountType | null = (usuario?.tipo_conta ?? null) as AccountType | null;
  // Normalize 'vendas' to 'vendedor' for internal logic
  if (role === 'vendas' as any) role = 'vendedor';

  return (
    <AuthContext.Provider value={{ session, user, usuario, role, loading, signOut, refreshUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
