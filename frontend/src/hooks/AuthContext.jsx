import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null); // 'cadet', 'instructor', 'admin'
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  const fetchProfile = useCallback(async (userId, userObj = null) => {
    try {
      // Check cadet_profiles first
      let { data, error } = await supabase.from('cadet_profiles').select('*').eq('id', userId).maybeSingle();
      if (data) {
        data.wing = normalizeWing(data.wing);
        setProfile(data);
        setRole('cadet');
        return;
      }

      // Check instructor_profiles
      ({ data, error } = await supabase.from('instructor_profiles').select('*').eq('id', userId).maybeSingle());
      if (data) {
        setProfile(data);
        setRole('instructor');
        return;
      }

      // Check admin_profiles
      ({ data, error } = await supabase.from('admin_profiles').select('*').eq('id', userId).maybeSingle());
      if (data) {
        setProfile(data);
        setRole('admin');
        return;
      }
    } catch (err) {
      console.warn('[AuthContext] Database profile lookup failed:', err);
    }

    // No DB profile found — build a virtual profile from auth metadata
    const currentUser = userObj || user;
    const meta = currentUser?.user_metadata || {};
    const metaRole = meta.role || currentUser?.role;

    if (metaRole === 'instructor') {
      const virtualInstructor = { id: userId, full_name: meta.full_name || 'Instructor', rank: meta.rank || '', unit: meta.unit || '' };
      setProfile(virtualInstructor);
      setRole('instructor');
      return;
    }
    if (metaRole === 'admin') {
      const virtualAdmin = { id: userId, full_name: meta.full_name || 'Admin' };
      setProfile(virtualAdmin);
      setRole('admin');
      return;
    }

    // Default: treat as cadet with virtual profile from metadata
    const virtualCadet = {
      id: userId,
      full_name: meta.full_name || 'Cadet',
      ncc_number: meta.ncc_number || '',
      wing: normalizeWing(meta.wing),
      certificate_level: meta.certificate_level || 'A',
      level: 1,
      exp: 0,
      current_streak: 0,
      longest_streak: 0
    };
    setProfile(virtualCadet);
    setRole('cadet');
  }, [user]);

  // Hook 1: Listen to auth state changes and update user state synchronously
  useEffect(() => {
    let active = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setAuthInitialized(true);

      if (!currentUser) {
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Hook 2: Fetch profile asynchronously after user session is detected and auth is initialized
  useEffect(() => {
    if (!authInitialized) return;

    let active = true;

    // Safety timeout in case fetchProfile hangs or takes too long
    const timeout = setTimeout(() => {
      if (active) {
        setLoading(false);
      }
    }, 3000);

    const loadProfileData = async () => {
      if (!user) {
        clearTimeout(timeout);
        return;
      }

      try {
        await fetchProfile(user.id, user);
      } catch (err) {
        console.error('[AuthContext] Error in fetchProfile inside useEffect:', err);
      } finally {
        if (active) {
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    };

    loadProfileData();

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [user, authInitialized, fetchProfile]);

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
