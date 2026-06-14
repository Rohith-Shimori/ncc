import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { GraduationCap, BookOpen, Users, ClipboardCheck, Plus, Upload, BarChart3, Eye, Search, Edit2, Trash2, Filter, UserPlus, Megaphone } from 'lucide-react';
import AddQuestionModal from '../components/AddQuestionModal';
import UserModal from '../components/UserModal';
import AddTestModal from '../components/AddTestModal';
import CourseEditorModal from '../components/CourseEditorModal';
import AnnouncementModal from '../components/AnnouncementModal';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'cadets', label: 'Cadets', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'tests', label: 'Exams', icon: ClipboardCheck },
  { id: 'questions', label: 'Question Bank', icon: ClipboardCheck },
  { id: 'announcements', label: 'Announcements', icon: Megaphone }
];

export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [cadets, setCadets] = useState([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseWingFilter, setCourseWingFilter] = useState('All');
  const [courseCertFilter, setCourseCertFilter] = useState('All');
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ courses: 0, cadets: 0, questions: 0, avgScore: 0 });
  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);
  const [banks, setBanks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qSearch, setQSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState('all');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingCadet, setEditingCadet] = useState(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  const [announcements, setAnnouncements] = useState([]);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  
  const navigate = useNavigate();

  const loadData = async () => {
      // Cadets
      const { data: cadetList } = await supabase.from('cadet_profiles').select('*');
      setCadets(cadetList || []);

      // Courses
      const { data: courseList } = await supabase.from('courses').select('*').order('certificate_level');
      setCourses(courseList || []);

      // Questions & Banks
      const { data: bList } = await supabase.from('csv_subjects').select('*');
      setBanks(bList || []);
      
      const { data: qList } = await supabase.from('csv_questions').select('*, csv_subjects(subject_name)').order('created_at', { ascending: false });
      setQuestions((qList || []).map(q => ({
        ...q,
        id: q.question_id,
        question_banks: { title: q.csv_subjects?.subject_name || q.subject_code }
      })));

      // Tests
      const { data: tList } = await supabase.from('csv_mock_exams').select('*').order('created_at', { ascending: false });
      setTests((tList || []).map(t => {
        let totalQuestions = 0;
        if (t.question_distribution) {
          const parts = t.question_distribution.split('|');
          parts.forEach(part => {
            const [, countStr] = part.split(':');
            if (countStr) totalQuestions += parseInt(countStr, 10);
          });
        }
        return {
          ...t,
          id: t.test_id,
          title: t.test_name,
          test_type: 'mock',
          passing_score: t.passing_percent,
          question_count: totalQuestions,
          courses: { title: `${t.wing} Wing — Cert ${t.certificate_level}` }
        };
      }));

      // Average score
      const { data: attempts } = await supabase.from('csv_exam_attempts')
        .select('percentage').in('status', ['submitted', 'flagged']);
      const avg = attempts?.length ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length) : 0;

      // Announcements
      const { data: anns } = await supabase.from('announcements')
        .select('*').order('created_at', { ascending: false });
      setAnnouncements(anns || []);

      setStats({
        courses: courseList?.length || 0,
        cadets: cadetList?.length || 0,
        tests: tList?.length || 0,
        questions: qList?.length || 0,
        avgScore: avg
      });
      setLoading(false);
    };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteCadet = async (id) => {
    if (!confirm('Are you sure you want to remove this cadet from the platform?')) return;
    const { error } = await supabase.from('cadet_profiles').delete().eq('id', id);
    if (error) alert(error.message);
    else loadData();
  };

  const refreshQuestions = async () => {
    const { data } = await supabase.from('questions').select('*, question_banks(title)').order('created_at', { ascending: false });
    setQuestions(data || []);
    setStats(prev => ({ ...prev, questions: data?.length || 0 }));
  };

  const deleteQuestion = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) alert(error.message);
    else refreshQuestions();
  };

  const handleDeleteAnnouncement = async (ann) => {
    if (!confirm(`Are you sure you want to delete the announcement "${ann.title}"?`)) return;
    const { error } = await supabase.from('announcements').delete().eq('id', ann.id);
    if (error) alert('Error deleting announcement: ' + error.message);
    else loadData();
  };

  const filteredCadets = cadets.filter(c =>
    (c.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredCourses = courses.filter(c => {
    const matchesSearch = (c.title || '').toLowerCase().includes(courseSearch.toLowerCase()) || 
                          (c.description || '').toLowerCase().includes(courseSearch.toLowerCase());
    const matchesWing = courseWingFilter === 'All' || c.target_wing === courseWingFilter;
    const matchesCert = courseCertFilter === 'All' || c.certificate_level === courseCertFilter;
    return matchesSearch && matchesWing && matchesCert;
  });

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(qSearch.toLowerCase());
    const matchesBank = selectedBank === 'all' || q.bank_id === selectedBank;
    return matchesSearch && matchesBank;
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
          <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> Instructor Panel
        </h1>
        <p className="text-surface-700 text-sm">Manage courses, questions, and track cadets</p>
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

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: 'Active Courses', value: stats.courses, icon: BookOpen, color: 'text-navy-500', bg: 'bg-navy-500/10' },
            { label: 'Total Cadets', value: stats.cadets, icon: Users, color: 'text-mgreen-600', bg: 'bg-mgreen-600/10' },
            { label: 'Exams/Tests', value: stats.tests, icon: ClipboardCheck, color: 'text-gold-500', bg: 'bg-gold-500/10' },
            { label: 'Avg. Score', value: stats.avgScore + '%', icon: BarChart3, color: 'text-wing-airforce', bg: 'bg-wing-airforce-bg' },
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
      )}

      {/* Cadets Tab */}
      {activeTab === 'cadets' && (
        <div className="ncc-glass-card overflow-hidden">
          <div className="p-3 md:p-4 border-b border-surface-100 flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="relative flex-1 sm:max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
              <input type="text" placeholder="Search cadets..." value={search} onChange={e => setSearch(e.target.value)} className="ncc-input ncc-input-icon w-full" />
            </div>
            <button 
              onClick={() => { setEditingCadet(null); setIsUserModalOpen(true); }}
              className="ncc-btn ncc-btn-primary py-2 px-4 w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4" /> Add Cadet
            </button>
          </div>
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
                {filteredCadets.map((cadet, i) => (
                  <tr key={cadet.id || i} className="hover:bg-surface-50 transition">
                    <td className="p-3 md:p-4 font-medium text-navy-900 text-sm">{cadet.full_name || 'N/A'}</td>
                    <td className="p-3 md:p-4"><span className={`ncc-badge ${cadet.wing === 'Army' ? 'ncc-badge-army' : cadet.wing === 'Navy' ? 'ncc-badge-navy' : cadet.wing === 'Air Force' ? 'ncc-badge-airforce' : 'bg-surface-100 text-surface-700'}`}>{cadet.wing}</span></td>
                    <td className="p-3 md:p-4 text-sm">{cadet.certificate_level} Cert</td>
                    <td className="p-3 md:p-4 text-sm text-surface-700">{cadet.ncc_number || '—'}</td>
                    <td className="p-3 md:p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => { setEditingCadet(cadet); setIsUserModalOpen(true); }}
                          className="p-1.5 hover:bg-surface-200 rounded-lg text-navy-500 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCadet(cadet.id)}
                          className="p-1.5 hover:bg-danger/10 rounded-lg text-danger transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCadets.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-surface-700">No cadets found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Courses Tab */}
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
            {courses.length === 0 && (
              <div className="col-span-full p-8 text-center text-surface-500 ncc-glass-card">No courses created yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Tests/Exams Tab */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button 
              onClick={() => { setEditingTest(null); setIsTestModalOpen(true); }}
              className="ncc-btn ncc-btn-primary py-2.5 px-6 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Exam
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map(t => (
              <div key={t.id} className="ncc-glass-card p-5 relative group">
                <div className="absolute top-4 right-4 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingTest(t); setIsTestModalOpen(true); }} className="p-1.5 hover:bg-surface-200 rounded-lg text-navy-500 cursor-pointer">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`ncc-badge ${t.test_type === 'mock' ? 'bg-danger/10 text-danger' : t.test_type === 'final' ? 'bg-navy-900/10 text-navy-900' : 'bg-info-bg text-info'}`}>
                    {t.test_type.toUpperCase()}
                  </span>
                  <span className={`ncc-badge ${t.is_active ? 'bg-mgreen-600/10 text-mgreen-600' : 'bg-surface-200 text-surface-500'}`}>
                    {t.is_active ? 'Active' : 'Draft'}
                  </span>
                </div>
                <h3 className="font-bold text-navy-900 mb-1 line-clamp-1">{t.title}</h3>
                <p className="text-[10px] font-bold text-gold-600 mb-2 truncate">{t.courses?.title}</p>
                <div className="flex gap-3 text-xs text-surface-700 font-medium">
                  <span>{t.duration_minutes}m</span>
                  <span>{t.question_count}Q</span>
                  <span>Pass: {t.passing_score}%</span>
                </div>
              </div>
            ))}
            {tests.length === 0 && (
              <div className="col-span-full p-8 text-center text-surface-500 ncc-glass-card">No exams created yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between ncc-glass-card p-4">
            <div className="flex flex-1 gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                <input 
                  type="text" 
                  placeholder="Search questions..." 
                  value={qSearch} 
                  onChange={e => setQSearch(e.target.value)} 
                  className="ncc-input ncc-input-icon" 
                />
              </div>
              <select 
                value={selectedBank} 
                onChange={e => setSelectedBank(e.target.value)}
                className="ncc-input w-full sm:w-48 text-xs font-bold"
              >
                <option value="all">All Banks</option>
                {banks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>
            <button 
              onClick={() => { setEditingQuestion(null); setIsModalOpen(true); }}
              className="ncc-btn ncc-btn-primary w-full sm:w-auto py-2.5 px-6 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          <div className="ncc-glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-50 text-left text-xs font-bold text-surface-700 uppercase tracking-wider">
                    <th className="p-4">Question Details</th>
                    <th className="p-4">Bank</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-surface-50 transition group">
                      <td className="p-4 max-w-md">
                        <p className="text-sm font-bold text-navy-900 line-clamp-2 mb-1">{q.question_text}</p>
                        <p className="text-[10px] text-surface-400 font-medium">Answer: {q.correct_answer}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-gold-600">{q.question_banks?.title || 'General'}</span>
                      </td>
                      <td className="p-4">
                        <span className="ncc-badge bg-surface-100 text-surface-700 uppercase text-[10px]">{q.question_type}</span>
                      </td>
                      <td className="p-4">
                        <span className={`ncc-badge text-[10px] uppercase ${
                          q.difficulty === 'easy' ? 'bg-mgreen-600/10 text-mgreen-600' :
                          q.difficulty === 'hard' ? 'bg-danger/10 text-danger' :
                          'bg-gold-500/10 text-gold-600'
                        }`}>{q.difficulty}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setEditingQuestion(q); setIsModalOpen(true); }}
                            className="p-2 hover:bg-surface-200 rounded-lg text-navy-500 transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteQuestion(q.id)}
                            className="p-2 hover:bg-danger/10 rounded-lg text-danger transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredQuestions.length === 0 && (
                    <tr><td colSpan={5} className="p-12 text-center text-surface-400">No questions found matching your criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Announcements Tab */}
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

      {/* Add/Edit Modal */}
      <AddQuestionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={refreshQuestions} 
        questionToEdit={editingQuestion}
        banks={banks}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={editingCadet}
        onSave={loadData}
        mode="instructor"
      />

      <AddTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        testToEdit={editingTest}
        onSave={loadData}
        courses={courses}
      />

      <CourseEditorModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        courseToEdit={editingCourse}
        onSave={loadData}
      />

      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        announcement={editingAnnouncement}
        onSave={loadData}
      />
    </div>
  );
}
