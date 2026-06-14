import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Users, Search, Trash2, UserPlus, Edit2, Shield } from 'lucide-react';
import UserModal from '../../components/UserModal';

export default function UserManagement({ defaultRole = 'all' }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(defaultRole);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = async () => {
    // Get all cadets
    const { data: cadets } = await supabase.from('cadet_profiles').select('id, full_name, wing, certificate_level, ncc_number');
    // Get instructors
    const { data: instructors } = await supabase.from('instructor_profiles').select('id, full_name, department');
    // Get admins
    const { data: admins } = await supabase.from('admin_profiles').select('id, full_name');

    const allUsers = [
      ...(cadets || []).map(c => ({ ...c, role: 'cadet', status: 'active' })),
      ...(instructors || []).map(i => ({ ...i, role: 'instructor', wing: 'Common', status: 'active' })),
      ...(admins || []).map(a => ({ ...a, role: 'admin', wing: 'Common', status: 'active' })),
    ];
    setUsers(allUsers);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, []);

  const handleDeleteUser = async (user) => {
    if (!confirm(`Are you sure you want to delete ${user.full_name || 'this user'}? This will not delete their auth account without backend API.`)) return;
    
    let table = 'cadet_profiles';
    if (user.role === 'instructor') table = 'instructor_profiles';
    if (user.role === 'admin') table = 'admin_profiles';

    const { error } = await supabase.from(table).delete().eq('id', user.id);
    if (error) alert('Error deleting user: ' + error.message);
    else loadUsers();
  };

  const filtered = users.filter(u => {
    const matchesSearch = (u.full_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  const getPageTitle = () => {
    if (defaultRole === 'cadet') return 'Cadet Accounts';
    if (defaultRole === 'instructor') return 'ANO / Instructor Accounts';
    if (defaultRole === 'admin') return 'Administrator Accounts';
    return 'All System Users';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2">
          {defaultRole === 'admin' ? <Shield className="w-6 h-6 text-gold-500" /> : <Users className="w-6 h-6 text-gold-500" />}
          {getPageTitle()}
        </h1>
        <p className="text-surface-700 text-sm">Manage user accounts and permissions</p>
      </div>

      <div className="ncc-glass-card overflow-hidden">
        <div className="p-3 md:p-4 border-b border-surface-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-50">
          <div className="relative w-full sm:w-80 flex items-center gap-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} className="ncc-input ncc-input-icon py-2 w-full text-sm h-10" />
            
            {defaultRole === 'all' && (
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="ncc-input py-2 text-sm cursor-pointer h-10 w-32">
                <option value="all">All Roles</option>
                <option value="cadet">Cadets</option>
                <option value="instructor">ANOs</option>
                <option value="admin">Admins</option>
              </select>
            )}
          </div>
          <button 
            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
            className="ncc-btn ncc-btn-primary py-2 px-4 whitespace-nowrap text-sm h-10 w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>
        
        {/* Desktop Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full min-w-[420px]">
            <thead>
              <tr className="bg-surface-50 text-left text-xs font-bold text-surface-700 uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Wing</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map((u, i) => (
                <tr key={i} className="hover:bg-surface-50 transition">
                  <td className="p-4 font-medium text-navy-900 text-sm">{u.full_name || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`ncc-badge uppercase text-[10px] ${u.role === 'admin' ? 'bg-navy-900/10 text-navy-900' : u.role === 'instructor' ? 'bg-gold-500/10 text-gold-600' : 'bg-surface-100 text-surface-700'}`}>{u.role}</span>
                  </td>
                  <td className="p-4 text-sm">{u.wing || '—'}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-mgreen-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-mgreen-600" /> active
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => { setEditingUser(u); setIsModalOpen(true); }}
                        className="p-1.5 hover:bg-surface-200 rounded-lg text-navy-500 transition cursor-pointer"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 hover:bg-danger/10 rounded-lg text-danger transition cursor-pointer"
                        title="Delete User Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-surface-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-surface-100">
           {filtered.map((u, i) => (
             <div key={i} className="p-4 space-y-2">
               <div className="flex justify-between items-start">
                 <div>
                   <h3 className="font-bold text-navy-900 text-sm">{u.full_name || 'N/A'}</h3>
                   <span className={`ncc-badge uppercase text-[10px] mt-1 ${u.role === 'admin' ? 'bg-navy-900/10 text-navy-900' : u.role === 'instructor' ? 'bg-gold-500/10 text-gold-600' : 'bg-surface-100 text-surface-700'}`}>{u.role}</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <button onClick={() => { setEditingUser(u); setIsModalOpen(true); }} className="p-2 hover:bg-surface-200 rounded-lg text-navy-500 transition cursor-pointer">
                     <Edit2 className="w-4 h-4" />
                   </button>
                   <button onClick={() => handleDeleteUser(u)} className="p-2 hover:bg-danger/10 rounded-lg text-danger transition cursor-pointer">
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
               <div className="flex gap-3 text-xs text-surface-700">
                  <span>Wing: {u.wing || '—'}</span>
                  <span className="text-mgreen-600 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-mgreen-600"></span> Active</span>
               </div>
             </div>
           ))}
           {filtered.length === 0 && (
             <div className="p-8 text-center text-surface-400">No users found.</div>
           )}
        </div>
      </div>

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={editingUser} 
        onSave={loadUsers} 
        mode="admin"
      />
    </div>
  );
}
