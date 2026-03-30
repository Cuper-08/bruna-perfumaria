import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { Navigate } from 'react-router-dom';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({} as AdminAuthContextType);

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const versionRef = useRef(0);

  const applySession = useCallback(async (newSession: Session | null) => {
    const version = ++versionRef.current;

    if (!mountedRef.current) return;

    setSession(newSession);
    setUser(newSession?.user ?? null);

    if (!newSession?.user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: newSession.user.id,
        _role: 'admin',
      });

      // Ignore stale responses
      if (version !== versionRef.current || !mountedRef.current) return;

      if (error) {
        console.error('has_role error:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
      }
    } catch (err) {
      console.error('applySession error:', err);
      if (mountedRef.current && version === versionRef.current) {
        setIsAdmin(false);
      }
    } finally {
      if (mountedRef.current && version === versionRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // 1. Register listener first (catches subsequent changes)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        // Don't do heavy async work here — just schedule applySession
        applySession(newSession);
      }
    );

    // 2. Hydrate initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      applySession(initialSession);
    }).catch(() => {
      if (mountedRef.current) setLoading(false);
    });

    // 3. Safety timeout — never stay loading forever
    const timeout = setTimeout(() => {
      if (mountedRef.current) setLoading(false);
    }, 8000);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [applySession]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // Role check — the onAuthStateChange will also fire and call applySession,
    // but we do an immediate check here for the signIn return value
    try {
      const { data: roleData } = await supabase.rpc('has_role', {
        _user_id: data.user.id,
        _role: 'admin',
      });

      if (roleData !== true) {
        await supabase.auth.signOut();
        return { error: 'Acesso negado. Você não tem permissão de administrador.' };
      }
    } catch {
      await supabase.auth.signOut();
      return { error: 'Erro ao verificar permissões. Tente novamente.' };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft text-primary text-lg font-semibold">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
