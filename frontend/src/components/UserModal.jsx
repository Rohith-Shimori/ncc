import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function UserModal({ isOpen, onClose, user, onSave, mode = 'admin' }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'cadet',
    wing: 'Army',
    certificate_level: 'A',
    ncc_number: '',
    rank: '',
    unit: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'cadet',
        wing: user.wing || 'Army',
        certificate_level: user.certificate_level || 'A',
        ncc_number: user.ncc_number || '',
        rank: user.rank || '',
        unit: user.unit || ''
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        role: 'cadet',
        wing: 'Army',
        certificate_level: 'A',
        ncc_number: '',
        rank: '',
        unit: ''
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (user) {
        // Edit existing user
        let table = 'cadet_profiles';
        if (user.role === 'instructor') table = 'instructor_profiles';
        if (user.role === 'admin') table = 'admin_profiles';

        const updates = {
          full_name: formData.full_name,
          ...(formData.role === 'cadet' && {
            wing: formData.wing,
            certificate_level: formData.certificate_level,
            ncc_number: formData.ncc_number
          }),
          ...(formData.role === 'instructor' && {
            rank: formData.rank,
            unit: formData.unit
          })
        };

        const { error: updateError } = await supabase.from(table).update(updates).eq('id', user.id);
        if (updateError) throw updateError;
      } else {
        // Create new user via Supabase Auth signUp.
        // The DB trigger `handle_new_user_signup` auto-creates the correct profile table
        // based on the role in user_metadata (cadet_profiles / instructor_profiles / admin_profiles).
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              role: formData.role,
              wing: formData.role === 'cadet' ? formData.wing : undefined,
              certificate_level: formData.role === 'cadet' ? formData.certificate_level : undefined,
              ncc_number: formData.role === 'cadet' ? formData.ncc_number : undefined,
              rank: formData.role === 'instructor' ? formData.rank : undefined,
              unit: formData.role === 'instructor' ? formData.unit : undefined
            }
          }
        });

        if (signUpError) throw signUpError;
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl my-auto flex flex-col max-h-[90vh] animate-scaleIn">
        <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50 shrink-0">
          <h3 className="font-bold text-navy-900 text-lg">
            {user ? 'Edit User' : 'Add New User'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto">
          {error && <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm font-medium">{error}</div>}

          <div>
            <label className="block text-sm font-bold text-navy-900 mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              className="ncc-input w-full"
              placeholder="Enter full name"
            />
          </div>

          {!user && (
            <>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="ncc-input w-full"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="ncc-input w-full"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </>
          )}

          {mode === 'admin' && !user && (
            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="ncc-input w-full"
              >
                <option value="cadet">Cadet</option>
                <option value="instructor">Instructor (ANO)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          {formData.role === 'cadet' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-navy-900 mb-1.5">Wing</label>
                  <select
                    value={formData.wing}
                    onChange={e => setFormData({ ...formData, wing: e.target.value })}
                    className="ncc-input w-full"
                  >
                    <option value="Army">Army</option>
                    <option value="Navy">Navy</option>
                    <option value="Air Force">Air Force</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-navy-900 mb-1.5">Certificate</label>
                  <select
                    value={formData.certificate_level}
                    onChange={e => setFormData({ ...formData, certificate_level: e.target.value })}
                    className="ncc-input w-full"
                  >
                    <option value="A">A Certificate</option>
                    <option value="B">B Certificate</option>
                    <option value="C">C Certificate</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">NCC Number</label>
                <input
                  type="text"
                  value={formData.ncc_number}
                  onChange={e => setFormData({ ...formData, ncc_number: e.target.value })}
                  className="ncc-input w-full"
                  placeholder="e.g., TS20SDA100000"
                />
              </div>
            </>
          )}

          {formData.role === 'instructor' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-navy-900 mb-1.5">Rank</label>
                  <input
                    type="text"
                    value={formData.rank}
                    onChange={e => setFormData({ ...formData, rank: e.target.value })}
                    className="ncc-input w-full"
                    placeholder="e.g., Major, Colonel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-navy-900 mb-1.5">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="ncc-input w-full"
                    placeholder="e.g., 1st Punjab Bn NCC"
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-surface-200 text-surface-700 font-bold rounded-xl hover:bg-surface-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-navy-600 text-white font-bold rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
