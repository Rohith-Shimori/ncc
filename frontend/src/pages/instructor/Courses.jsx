import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { BookOpen, Search, Plus, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CourseEditorModal from '../../components/CourseEditorModal';

export default function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [wingFilter, setWingFilter] = useState('All');
  const [certFilter, setCertFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const navigate = useNavigate();

  const loadCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('certificate_level');
    setCourses(data || []);
    setLoading(false);
  };

  useEffect(() => { loadCourses(); }, []);

  const filtered = courses.filter(c => {
    const matchesSearch = (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesWing = wingFilter === 'All' || c.target_wing === wingFilter;
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
          <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> Course Management
        </h1>
        <p className="text-surface-700 text-sm">Create, edit, and manage training courses and their syllabi</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center bg-surface-50 p-3 rounded-xl border border-surface-100">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ncc-input ncc-input-icon py-2 w-full text-sm h-10"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select value={wingFilter} onChange={e => setWingFilter(e.target.value)} className="ncc-input py-2 text-sm cursor-pointer h-10 flex-1 sm:flex-none">
              <option value="All">All Wings</option>
              <option value="Common">Common</option>
              <option value="Army">Army</option>
              <option value="Navy">Navy</option>
              <option value="Air Force">Air Force</option>
            </select>
            <select value={certFilter} onChange={e => setCertFilter(e.target.value)} className="ncc-input py-2 text-sm cursor-pointer h-10 flex-1 sm:flex-none">
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

      {/* Course Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
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
        {filtered.length === 0 && (
          <div className="col-span-full p-8 text-center text-surface-500 ncc-glass-card">No courses found matching your criteria.</div>
        )}
      </div>

      <CourseEditorModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        courseToEdit={editingCourse}
        onSave={loadCourses}
      />
    </div>
  );
}
