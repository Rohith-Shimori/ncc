import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null); // 'cadet', 'instructor', 'admin'
  const [loading, setLoading] = useState(true);

  const normalizeWing = (raw) => {
    if (!raw) return 'Army';
    const upper = raw.toUpperCase().trim();
    if (upper === 'ARMY') return 'Army';
    if (upper === 'NAVY') return 'Navy';
    if (upper === 'AIR' || upper === 'AIR FORCE' || upper === 'AIRFORCE') return 'Air Force';
    if (upper === 'COMMON') return 'Common';
    // Already correct casing
    if (['Army', 'Navy', 'Air Force', 'Common'].includes(raw.trim())) return raw.trim();
    return 'Army';
  };

  const fetchProfile = async (userId, userObj = null) => {
    // Check cadet_profiles first
    let { data } = await supabase.from('cadet_profiles').select('*').eq('id', userId).maybeSingle();
    if (data) {
      data.wing = normalizeWing(data.wing);
      setProfile(data);
      setRole('cadet');
      return;
    }

    // Check instructor_profiles
    ({ data } = await supabase.from('instructor_profiles').select('*').eq('id', userId).maybeSingle());
    if (data) { setProfile(data); setRole('instructor'); return; }

    // Check admin_profiles
    ({ data } = await supabase.from('admin_profiles').select('*').eq('id', userId).maybeSingle());
    if (data) { setProfile(data); setRole('admin'); return; }

    // No DB profile found — build a virtual profile from auth metadata
    const currentUser = userObj || user;
    const meta = currentUser?.user_metadata || {};
    const metaRole = meta.role || currentUser?.role;

    if (metaRole === 'instructor') {
      setProfile({ id: userId, full_name: meta.full_name || 'Instructor', rank: meta.rank || '', unit: meta.unit || '' });
      setRole('instructor');
      return;
    }
    if (metaRole === 'admin') {
      setProfile({ id: userId, full_name: meta.full_name || 'Admin' });
      setRole('admin');
      return;
    }

    // Default: treat as cadet with virtual profile from metadata
    setProfile({
      id: userId,
      full_name: meta.full_name || 'Cadet',
      ncc_number: meta.ncc_number || '',
      wing: normalizeWing(meta.wing),
      certificate_level: meta.certificate_level || 'A',
      level: 1,
      exp: 0,
      current_streak: 0,
      longest_streak: 0
    });
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
