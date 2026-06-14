import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { supabase } from '../services/supabase';
import { User, Save, CheckCircle, Share2 } from 'lucide-react';

export default function Profile() {
  const { user, profile, role, fetchProfile } = useAuth();
  const [form, setForm] = useState({ full_name: '', ncc_number: '', wing: '', certificate_level: '', rank: '', unit: '' });
  const [stats, setStats] = useState({ courses: 0, tests: 0, avgScore: 0 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        full_name: profile.full_name || '',
        ncc_number: profile.ncc_number || '',
        wing: profile.wing || 'Army',
        certificate_level: profile.certificate_level || 'A',
        rank: profile.rank || '',
        unit: profile.unit || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user || role !== 'cadet') return;
    const loadStats = async () => {
      const { count: courses } = await supabase.from('course_enrollments')
        .select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { data: attempts } = await supabase.rpc('fn_get_my_csv_attempts', { p_user_id: user.id });
      const avg = attempts?.length ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length) : 0;
      setStats({ courses: courses || 0, tests: attempts?.length || 0, avgScore: avg });
    };
    loadStats();
  }, [user, role]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    let error;
    if (role === 'cadet') {
      const { error: err } = await supabase.from('cadet_profiles').upsert({
        id: user.id,
        full_name: form.full_name,
        ncc_number: form.ncc_number,
        wing: form.wing,
        certificate_level: form.certificate_level
      });
      error = err;
    } else if (role === 'instructor') {
      const { error: err } = await supabase.from('instructor_profiles').upsert({
        id: user.id,
        full_name: form.full_name,
        rank: form.rank,
        unit: form.unit
      });
      error = err;
    } else if (role === 'admin') {
      const { error: err } = await supabase.from('admin_profiles').upsert({
        id: user.id,
        full_name: form.full_name
      });
      error = err;
    }
    
    if (error) {
      alert('Error saving profile: ' + error.message);
    } else if (fetchProfile) {
      await fetchProfile(user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleShare = async () => {
    if (!navigator.share) {
      alert('Sharing is not supported on this browser. Copy the URL to share.');
      return;
    }
    try {
      await navigator.share({
        title: 'NCC Digital Training Portal',
        text: `Hey! I am training on the NCC Digital Training Platform. I am currently Level ${profile?.level || 1} with ${stats.courses} courses enrolled! 🎖️`,
        url: window.location.origin
      });
      console.log('[WebShare] Successfully shared progress!');
    } catch (err) {
      console.warn('[WebShare] Error sharing:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2">
          <User className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> My Profile
        </h1>
        <p className="text-surface-700 text-[11px] md:text-sm">Manage your account and training details</p>
      </div>

      {/* Profile card */}
      <div className="ncc-glass-card p-4 md:p-6">
        <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center text-xl md:text-2xl font-bold text-gold-400 flex-shrink-0">
            {form.full_name?.charAt(0) || 'C'}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-bold text-navy-900 truncate">{form.full_name || 'NCC Cadet'}</h2>
            <p className="text-xs md:text-sm text-surface-700 truncate">{user?.email}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {role === 'cadet' ? (
                <>
                  <span className={`ncc-badge ${form.wing === 'Army' ? 'ncc-badge-army' : form.wing === 'Navy' ? 'ncc-badge-navy' : form.wing === 'Air Force' ? 'ncc-badge-airforce' : 'bg-surface-100 text-surface-700'}`}>{form.wing}</span>
                  <span className="ncc-badge bg-navy-900/10 text-navy-900">{form.certificate_level} Cert</span>
                </>
              ) : (
                <>
                  <span className="ncc-badge bg-navy-900/10 text-navy-900">{role?.toUpperCase()}</span>
                  {form.rank && <span className="ncc-badge bg-gold-500/10 text-gold-600 font-bold">{form.rank}</span>}
                  {form.unit && <span className="ncc-badge bg-surface-100 text-surface-700 font-semibold">{form.unit}</span>}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats - Cadet Only */}
        {role === 'cadet' && (
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-5 md:mb-6">
            <div className="text-center p-2.5 md:p-3 bg-surface-50 rounded-xl">
              <p className="text-xl md:text-2xl font-bold text-navy-900">{stats.courses}</p>
              <p className="text-[10px] md:text-xs text-surface-700">Courses</p>
            </div>
            <div className="text-center p-2.5 md:p-3 bg-surface-50 rounded-xl">
              <p className="text-xl md:text-2xl font-bold text-navy-900">{stats.tests}</p>
              <p className="text-[10px] md:text-xs text-surface-700">Tests</p>
            </div>
            <div className="text-center p-2.5 md:p-3 bg-surface-50 rounded-xl">
              <p className="text-xl md:text-2xl font-bold text-navy-900">{stats.avgScore}%</p>
              <p className="text-[10px] md:text-xs text-surface-700">Avg Score</p>
            </div>
          </div>
        )}

        {/* Editable form */}
        <div className="space-y-4 md:space-y-5">
          {role === 'cadet' && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Full Name</label>
                  <input type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className="ncc-input" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">NCC Number</label>
                  <input type="text" value={form.ncc_number} onChange={e => setForm(p => ({ ...p, ncc_number: e.target.value }))} className="ncc-input" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Wing</label>
                  <select value={form.wing} onChange={e => setForm(p => ({ ...p, wing: e.target.value }))} className="ncc-input">
                    <option value="Army">Army</option>
                    <option value="Navy">Navy</option>
                    <option value="Air Force">Air Force</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Cert Level</label>
                  <select value={form.certificate_level} onChange={e => setForm(p => ({ ...p, certificate_level: e.target.value }))} className="ncc-input">
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {role === 'instructor' && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Full Name</label>
                  <input type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className="ncc-input" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Rank</label>
                  <input type="text" value={form.rank} onChange={e => setForm(p => ({ ...p, rank: e.target.value }))} className="ncc-input" placeholder="e.g. Colonel, Major" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Unit</label>
                <input type="text" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className="ncc-input" placeholder="e.g. 1st Punjab Bn NCC" />
              </div>
            </>
          )}

          {role === 'admin' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-900 uppercase tracking-wider ml-1">Full Name</label>
              <input type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className="ncc-input" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="ncc-btn ncc-btn-accent cursor-pointer flex-1 sm:flex-none">
              {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
            </button>
            {navigator.share && (
              <button onClick={handleShare} className="ncc-btn ncc-btn-ghost cursor-pointer flex-1 sm:flex-none">
                <Share2 className="w-4 h-4" /> Share Progress
              </button>
            )}
            {saved && <span className="text-sm text-mgreen-600 flex items-center gap-1 animate-fadeIn"><CheckCircle className="w-4 h-4" /> Saved!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
