import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null); // 'cadet', 'instructor', 'admin'
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId, userObj = null) => {
    // Check cadet_profiles first
    let { data } = await supabase.from('cadet_profiles').select('*').eq('id', userId).maybeSingle();
    if (data) { setProfile(data); setRole('cadet'); return; }

    // Check instructor_profiles
    ({ data } = await supabase.from('instructor_profiles').select('*').eq('id', userId).maybeSingle());
    if (data) { setProfile(data); setRole('instructor'); return; }

    // Check admin_profiles
    ({ data } = await supabase.from('admin_profiles').select('*').eq('id', userId).maybeSingle());
    if (data) { setProfile(data); setRole('admin'); return; }

    // Check user_metadata for role fallback
    const currentUser = userObj || user;
    const metaRole = currentUser?.user_metadata?.role || currentUser?.role;
    if (metaRole && ['cadet', 'instructor', 'admin'].includes(metaRole)) {
      setProfile(null);
      setRole(metaRole);
      return;
    }

    // Default to cadet if no profile found yet
    setProfile(null);
    setRole('cadet');
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id, currentUser);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id, currentUser);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut failed, clearing local session anyway:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, signOut, fetchProfile, refreshProfile: () => user && fetchProfile(user.id, user) }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
