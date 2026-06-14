import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Users, Search, Edit2, Trash2, UserPlus, Download } from 'lucide-react';
import UserModal from '../../components/UserModal';

export default function InstructorCadets() {
  const [cadets, setCadets] = useState([]);
  const [search, setSearch] = useState('');
  const [wingFilter, setWingFilter] = useState('All');
  const [certFilter, setCertFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingCadet, setEditingCadet] = useState(null);

  const handleExportExcel = async () => {
    try {
      const dataToExport = filtered.map(c => ({
        'Cadet Name': c.full_name || 'N/A',
        'NCC Number': c.ncc_number || '—',
        'Wing': c.wing || 'N/A',
        'Certificate Level': c.certificate_level || 'N/A',
        'Date Registered': c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'
      }));

      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cadet Roster');

      worksheet['!cols'] = Object.keys(dataToExport[0] || {}).map(() => ({ wch: 20 }));

      XLSX.writeFile(workbook, `NCC_Cadets_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      alert('Failed to export: ' + (err.message || 'Unknown error'));
    }
  };

  const loadCadets = async () => {
    const { data } = await supabase.from('cadet_profiles').select('*');
    setCadets(data || []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCadets();
  }, []);

  const handleDeleteCadet = async (id) => {
    if (!confirm('Are you sure you want to remove this cadet from the platform?')) return;
    const { error } = await supabase.from('cadet_profiles').delete().eq('id', id);
    if (error) alert(error.message);
    else loadCadets();
  };

  const filtered = cadets.filter(c => {
    const matchesSearch = (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.ncc_number || '').toLowerCase().includes(search.toLowerCase());
    const matchesWing = wingFilter === 'All' || c.wing === wingFilter;
    const matchesCert = certFilter === 'All' || c.certificate_level === certFilter;
    return matchesSearch && matchesWing && matchesCert;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2">
          <Users className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> Cadet Management
        </h1>
        <p className="text-surface-700 text-sm">View, search, and manage all registered cadets</p>
      </div>

      {/* Filters */}
      <div className="ncc-glass-card p-3 md:p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
              <input
                type="text"
                placeholder="Search by name or NCC number..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="ncc-input ncc-input-icon w-full"
              />
            </div>
            <div className="flex gap-2">
              <select value={wingFilter} onChange={e => setWingFilter(e.target.value)} className="ncc-input py-2 text-sm cursor-pointer flex-1 sm:flex-none sm:w-32">
                <option value="All">All Wings</option>
                <option value="Army">Army</option>
                <option value="Navy">Navy</option>
                <option value="Air Force">Air Force</option>
              </select>
              <select value={certFilter} onChange={e => setCertFilter(e.target.value)} className="ncc-input py-2 text-sm cursor-pointer flex-1 sm:flex-none sm:w-28">
                <option value="All">All Certs</option>
                <option value="A">A Cert</option>
                <option value="B">B Cert</option>
                <option value="C">C Cert</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="ncc-btn ncc-btn-ghost py-2 px-4 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>
            <button
              onClick={() => { setEditingCadet(null); setIsUserModalOpen(true); }}
              className="ncc-btn ncc-btn-primary py-2 px-4 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Add Cadet
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs font-medium text-surface-400">
        Showing {filtered.length} of {cadets.length} cadets
      </div>

      {/* Desktop Table */}
      <div className="ncc-glass-card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="bg-surface-50 text-left text-xs font-bold text-surface-700 uppercase tracking-wider">
                <th className="p-3 md:p-4">Cadet Name</th>
                <th className="p-3 md:p-4">Wing</th>
                <th className="p-3 md:p-4">Level</th>
                <th className="p-3 md:p-4">NCC Number</th>
                <th className="p-3 md:p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((cadet, i) => (
                <tr key={cadet.id || i} className="hover:bg-surface-50 transition">
                  <td className="p-3 md:p-4 font-medium text-navy-900 text-sm">{cadet.full_name || 'N/A'}</td>
                  <td className="p-3 md:p-4">
                    <span className={`ncc-badge ${cadet.wing === 'Army' ? 'ncc-badge-army' : cadet.wing === 'Navy' ? 'ncc-badge-navy' : cadet.wing === 'Air Force' ? 'ncc-badge-airforce' : 'bg-surface-100 text-surface-700'}`}>{cadet.wing}</span>
                  </td>
                  <td className="p-3 md:p-4 text-sm">{cadet.certificate_level} Cert</td>
                  <td className="p-3 md:p-4 text-sm text-surface-700">{cadet.ncc_number || '—'}</td>
                  <td className="p-3 md:p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditingCadet(cadet); setIsUserModalOpen(true); }}
                        className="p-1.5 hover:bg-surface-200 rounded-lg text-navy-500 transition cursor-pointer">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteCadet(cadet.id)}
                        className="p-1.5 hover:bg-danger/10 rounded-lg text-danger transition cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-surface-700">No cadets found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((cadet, i) => (
          <div key={cadet.id || i} className="ncc-glass-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-navy-900 text-sm">{cadet.full_name || 'N/A'}</h3>
                <p className="text-xs text-surface-400">{cadet.ncc_number || '—'}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditingCadet(cadet); setIsUserModalOpen(true); }}
                  className="p-1.5 hover:bg-surface-200 rounded-lg text-navy-500 transition cursor-pointer">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteCadet(cadet.id)}
                  className="p-1.5 hover:bg-danger/10 rounded-lg text-danger transition cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`ncc-badge ${cadet.wing === 'Army' ? 'ncc-badge-army' : cadet.wing === 'Navy' ? 'ncc-badge-navy' : cadet.wing === 'Air Force' ? 'ncc-badge-airforce' : 'bg-surface-100 text-surface-700'}`}>{cadet.wing}</span>
              <span className="ncc-badge bg-navy-900/10 text-navy-900">{cadet.certificate_level} Cert</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="ncc-glass-card p-8 text-center text-surface-700">No cadets found.</div>
        )}
      </div>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={editingCadet}
        onSave={loadCadets}
        mode="instructor"
      />
    </div>
  );
}
