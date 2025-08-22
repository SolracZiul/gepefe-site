import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUserRole('member'); // default role
      } else {
        setUserRole(data?.role || 'member');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUserRole('member');
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer the profile fetch to avoid potential deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Limpar estado local primeiro
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      // Tentar fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      // Mesmo se houver erro (como session not found), considerar logout como sucesso
      // porque o estado local já foi limpo
      if (error && !error.message.includes('Session not found')) {
        console.warn('Logout warning:', error.message);
      }
      
      return { error: null }; // Sempre retornar sucesso para evitar loops
    } catch (err) {
      console.error('Logout error:', err);
      return { error: null }; // Retornar sucesso mesmo em caso de erro
    }
  };

  return {
    user,
    session,
    loading,
    userRole,
    isAdmin: userRole === 'admin',
    signOut
  };
};