import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Shield, Users, BookOpen, Activity, AlertTriangle, Search, Trash2, UserPlus, Edit2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserModal from '../components/UserModal';
import CourseEditorModal from '../components/CourseEditorModal';
import AnnouncementModal from '../components/AnnouncementModal';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'courses', label: 'Course Management', icon: BookOpen },
  { id: 'announcements', label: 'Announcements', icon: Shield } // Added Announcements tab
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [courseWingFilter, setCourseWingFilter] = useState('All');
  const [courseCertFilter, setCourseCertFilter] = useState('All');
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState({ users: 0, courses: 0, tests: 0, flagged: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [announcements, setAnnouncements] = useState([]);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const load = useCallback(async () => {
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

      // Courses
      const { data: courseList } = await supabase.from('courses').select('*').order('certificate_level');
      setCourses(courseList || []);
      const courseCount = courseList?.length || 0;
      // Today's tests
      const { count: testCount } = await supabase.from('csv_exam_attempts').select('id', { count: 'exact', head: true });
      // Flagged
      const { count: flaggedCount } = await supabase.from('csv_exam_attempts')
        .select('id', { count: 'exact', head: true }).eq('status', 'flagged');

      setStats({
        users: allUsers.length,
        courses: courseCount || 0,
        tests: testCount || 0,
        flagged: flaggedCount || 0
      });

      // Announcements
      const { data: anns } = await supabase.from('announcements')
        .select('*').order('created_at', { ascending: false });
      setAnnouncements(anns || []);

      // Recent activity from test attempts
      const { data: recentAttempts } = await supabase.from('csv_exam_attempts')
        .select('percentage, status, submitted_at, csv_mock_exams(test_name)')
        .order('submitted_at', { ascending: false }).limit(5);
      setActivity((recentAttempts || []).map(a => ({
        text: `${a.status === 'flagged' ? '🚩 Flagged' : '✅'} ${a.csv_mock_exams?.test_name || 'Mock Exam'} — Score: ${a.percentage || 0}%`,
        time: a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '',
        type: a.status === 'flagged' ? 'warning' : 'success'
      })));

      setLoading(false);
    }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleDeleteUser = async (user) => {
    if (!confirm(`Are you sure you want to delete ${user.full_name || 'this user'}? This will not delete their auth account without backend API.`)) return;
    
    let table = 'cadet_profiles';
    if (user.role === 'instructor') table = 'instructor_profiles';
    if (user.role === 'admin') table = 'admin_profiles';

    const { error } = await supabase.from(table).delete().eq('id', user.id);
    if (error) alert('Error deleting user: ' + error.message);
    else load();
  };

  const handleDeleteAnnouncement = async (ann) => {
    if (!confirm(`Are you sure you want to delete the announcement "${ann.title}"?`)) return;
    const { error } = await supabase.from('announcements').delete().eq('id', ann.id);
    if (error) alert('Error deleting announcement: ' + error.message);
    else load();
  };

  const filtered = users.filter(u => (u.full_name || '').toLowerCase().includes(search.toLowerCase()));

  const filteredCourses = courses.filter(c => {
    const matchesSearch = (c.title || '').toLowerCase().includes(courseSearch.toLowerCase()) || 
                          (c.description || '').toLowerCase().includes(courseSearch.toLowerCase());
    const matchesWing = courseWingFilter === 'All' || c.target_wing === courseWingFilter;
    const matchesCert = courseCertFilter === 'All' || c.certificate_level === courseCertFilter;
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
          <Shield className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> Admin Panel
        </h1>
        <p className="text-surface-700 text-sm">Platform management and monitoring</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white text-navy-900 shadow-sm' : 'text-surface-700 hover:text-navy-900'
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: 'Total Users', value: stats.users, icon: Users, color: 'text-navy-500', bg: 'bg-navy-500/10' },
              { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'text-mgreen-600', bg: 'bg-mgreen-600/10' },
              { label: 'Attempts', value: stats.tests, icon: Activity, color: 'text-gold-500', bg: 'bg-gold-500/10' },
              { label: 'Flagged', value: stats.flagged, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger-bg' },
            ].map((s, i) => (
              <div key={i} className="ncc-stat-card">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl ${s.bg} flex items-center justify-center mb-2 md:mb-3`}>
                  <s.icon className={`w-4 h-4 md:w-5 md:h-5 ${s.color}`} />
                </div>
                <p className="text-xl md:text-2xl font-bold text-navy-900">{s.value}</p>
                <p className="text-xs md:text-sm text-surface-700">{s.label}</p>
              </div>
            ))}
          </div>
          
          {/* Activity */}
          <div className="ncc-glass-card p-4 md:p-5 mt-6">
            <h2 className="font-bold text-navy-900 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base"><Activity className="w-5 h-5 text-gold-500" /> Recent Activity</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-surface-700">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {activity.map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${act.type === 'warning' ? 'bg-warning' : 'bg-mgreen-600'}`} />
                    <div>
                      <p className="text-sm text-navy-900">{act.text}</p>
                      <p className="text-xs text-surface-300 mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="grid lg:grid-cols-1 gap-4 md:gap-6">
        {/* User table */}
        <div className="lg:col-span-2 ncc-glass-card overflow-hidden">
          <div className="p-3 md:p-4 border-b border-surface-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="font-bold text-navy-900 text-sm md:text-base">User Management</h2>
            <div className="relative w-full sm:w-auto flex items-center gap-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="ncc-input ncc-input-icon py-1.5 text-sm w-full sm:w-48" />
              <button 
                onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                className="ncc-btn ncc-btn-primary py-1.5 px-3 whitespace-nowrap text-sm h-full"
              >
                <UserPlus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px]">
              <thead>
                <tr className="bg-surface-50 text-left text-xs font-bold text-surface-700 uppercase tracking-wider">
                  <th className="p-2.5 md:p-3">Name</th>
                  <th className="p-2.5 md:p-3">Role</th>
                  <th className="p-2.5 md:p-3">Wing</th>
                  <th className="p-2.5 md:p-3">Status</th>
                  <th className="p-2.5 md:p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((u, i) => (
                  <tr key={i} className="hover:bg-surface-50 transition">
                    <td className="p-2.5 md:p-3 font-medium text-navy-900 text-sm">{u.full_name || 'N/A'}</td>
                    <td className="p-2.5 md:p-3">
                      <span className={`ncc-badge ${u.role === 'admin' ? 'bg-navy-900/10 text-navy-900' : u.role === 'instructor' ? 'bg-gold-500/10 text-gold-600' : 'bg-surface-100 text-surface-700'}`}>{u.role}</span>
                    </td>
                    <td className="p-2.5 md:p-3 text-sm">{u.wing || '—'}</td>
                    <td className="p-2.5 md:p-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-mgreen-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-mgreen-600" /> active
                      </span>
                    </td>
                    <td className="p-2.5 md:p-3 text-right">
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
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center bg-surface-50 p-3 rounded-xl border border-surface-100">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input 
                  type="text" 
                  placeholder="Search courses..." 
                  value={courseSearch}
                  onChange={e => setCourseSearch(e.target.value)}
                  className="ncc-input ncc-input-icon py-2 w-full text-sm h-10"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <select 
                  value={courseWingFilter} 
                  onChange={e => setCourseWingFilter(e.target.value)}
                  className="ncc-input py-2 text-sm cursor-pointer h-10 flex-1 sm:flex-none"
                >
                  <option value="All">All Wings</option>
                  <option value="Common">Common</option>
                  <option value="Army">Army</option>
                  <option value="Navy">Navy</option>
                  <option value="Air Force">Air Force</option>
                </select>
                <select 
                  value={courseCertFilter} 
                  onChange={e => setCourseCertFilter(e.target.value)}
                  className="ncc-input py-2 text-sm cursor-pointer h-10 flex-1 sm:flex-none"
                >
                  <option value="All">All Certs</option>
                  <option value="A">A Cert</option>
                  <option value="B">B Cert</option>
                  <option value="C">C Cert</option>
                </select>
              </div>
            </div>
            <button 
              onClick={() => { setEditingCourse(null); setIsCourseModalOpen(true); }}
              className="ncc-btn ncc-btn-primary py-2.5 px-5 whitespace-nowrap w-full lg:w-auto"
            >
              <Plus className="w-4 h-4" /> Create Course
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map(c => (
              <div key={c.id} className="ncc-glass-card p-5 relative group flex flex-col">
                <div className="absolute top-4 right-4 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingCourse(c); setIsCourseModalOpen(true); }} className="p-1.5 hover:bg-surface-200 rounded-lg text-navy-500 cursor-pointer" title="Edit Course Info">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`ncc-badge ${c.target_wing === 'Army' ? 'ncc-badge-army' : c.target_wing === 'Navy' ? 'ncc-badge-navy' : c.target_wing === 'Air Force' ? 'ncc-badge-airforce' : 'bg-surface-100 text-surface-700'}`}>{c.target_wing}</span>
                  <span className="ncc-badge bg-navy-900/10 text-navy-900">{c.certificate_level} Cert</span>
                </div>
                <h3 className="font-bold text-navy-900 mb-1 pr-6">{c.title}</h3>
                <p className="text-sm text-surface-700 mb-4 flex-1 line-clamp-2">{c.description || 'NCC training course'}</p>
                <button 
                  onClick={() => navigate(`/instructor/course/${c.id}`)}
                  className="w-full py-2 bg-surface-100 hover:bg-surface-200 text-navy-900 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" /> Manage Syllabus
                </button>
              </div>
            ))}
            {filteredCourses.length === 0 && (
              <div className="col-span-full p-8 text-center text-surface-500 ncc-glass-card">No courses found matching your criteria.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button 
              onClick={() => { setEditingAnnouncement(null); setIsAnnouncementModalOpen(true); }}
              className="ncc-btn ncc-btn-primary py-2.5 px-6 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Announcement
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {announcements.map(a => (
              <div key={a.id} className="ncc-glass-card p-5 relative group flex flex-col">
                <div className="absolute top-4 right-4 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingAnnouncement(a); setIsAnnouncementModalOpen(true); }} className="p-1.5 hover:bg-surface-200 rounded-lg text-navy-500 cursor-pointer" title="Edit Announcement">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteAnnouncement(a)} className="p-1.5 hover:bg-danger/10 rounded-lg text-danger cursor-pointer" title="Delete Announcement">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`ncc-badge ${a.priority === 'high' ? 'bg-danger/10 text-danger' : a.priority === 'low' ? 'bg-surface-200 text-surface-500' : 'bg-info-bg text-info'}`}>
                    {a.priority.toUpperCase()}
                  </span>
                  <span className={`ncc-badge ${a.target_wing === 'Army' ? 'ncc-badge-army' : a.target_wing === 'Navy' ? 'ncc-badge-navy' : a.target_wing === 'Air Force' ? 'ncc-badge-airforce' : 'bg-surface-100 text-surface-700'}`}>
                    {a.target_wing}
                  </span>
                  {!a.is_active && (
                    <span className="ncc-badge bg-surface-200 text-surface-500">Draft/Hidden</span>
                  )}
                </div>
                <h3 className="font-bold text-navy-900 mb-1 pr-14 line-clamp-2">{a.title}</h3>
                <p className="text-sm text-surface-700 flex-1 line-clamp-3 break-words">{a.content}</p>
                <div className="mt-4 text-xs text-surface-400 font-medium">
                  {new Date(a.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="col-span-full p-8 text-center text-surface-500 ncc-glass-card">No announcements created yet.</div>
            )}
          </div>
        </div>
      )}

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={editingUser} 
        onSave={load} 
        mode="admin"
      />

      <CourseEditorModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        courseToEdit={editingCourse}
        onSave={load}
      />

      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        announcement={editingAnnouncement}
        onSave={load}
      />
    </div>
  );
}
