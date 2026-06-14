import { useState, useEffect } from 'react';
import { useParams, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { supabase } from '../services/supabase';
import { ChevronLeft, BookOpen, CheckCircle, Circle, ChevronDown, ChevronRight, X, List } from 'lucide-react';

export default function CourseLayout() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [completedChapters, setCompletedChapters] = useState(new Set());
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile
  const [loading, setLoading] = useState(true);

  // Track window width for responsive behavior
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // On desktop, sidebar is open by default
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  const loadData = async () => {
    const { data: c } = await supabase.from('courses').select('*').eq('id', courseId).single();
    setCourse(c);

    const { data: mods } = await supabase.from('modules')
      .select('*, chapters(id, title, content_type, order_index)')
      .eq('course_id', courseId)
      .order('order_index');

    // Sort chapters within modules
    const sorted = (mods || []).map(m => ({
      ...m,
      chapters: (m.chapters || []).sort((a, b) => a.order_index - b.order_index)
    }));
    setModules(sorted);
    setExpandedModules(new Set(sorted.map(m => m.id)));

    // Fetch completed chapters
    if (user) {
      const allChapterIds = sorted.flatMap(m => m.chapters.map(ch => ch.id));
      if (allChapterIds.length) {
        const { data: progress } = await supabase.from('user_progress')
          .select('chapter_id')
          .eq('user_id', user.id)
          .eq('completed', true)
          .in('chapter_id', allChapterIds);
        setCompletedChapters(new Set((progress || []).map(p => p.chapter_id)));
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [courseId, user]);

  const totalChapters = modules.reduce((s, m) => s + m.chapters.length, 0);
  const progress = totalChapters ? Math.round((completedChapters.size / totalChapters) * 100) : 0;

  const toggleModule = (id) => {
    setExpandedModules(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // On mobile, close sidebar when navigating to a chapter
  const handleChapterClick = (chId) => {
    navigate(`/course/${courseId}/chapter/${chId}`);
    if (!isDesktop) setSidebarOpen(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-surface-50 relative">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isDesktop
          ? (sidebarOpen ? 'w-80' : 'w-0')
          : (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
        }
        ${isDesktop ? '' : 'fixed inset-y-0 left-0 w-[85vw] max-w-80 z-40'}
        bg-white border-r border-surface-200 flex flex-col transition-all duration-300 overflow-hidden flex-shrink-0
      `}>
        <div className="p-4 border-b border-surface-200">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/courses')} className="flex items-center gap-1 text-sm text-surface-700 hover:text-navy-900 cursor-pointer">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {/* Mobile close button */}
            {!isDesktop && (
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-100 cursor-pointer md:hidden">
                <X className="w-5 h-5 text-surface-700" />
              </button>
            )}
          </div>
          <h2 className="font-bold text-navy-900 text-sm leading-tight mt-2">{course?.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="ncc-progress-track flex-1">
              <div className="ncc-progress-fill" style={{ width: progress + '%' }} />
            </div>
            <span className="text-xs font-medium text-navy-900">{progress}%</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {modules.map((mod, mi) => (
            <div key={mod.id}>
              <button onClick={() => toggleModule(mod.id)} className="w-full flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-navy-900 hover:bg-surface-50 cursor-pointer">
                {expandedModules.has(mod.id) ? <ChevronDown className="w-4 h-4 text-surface-300" /> : <ChevronRight className="w-4 h-4 text-surface-300" />}
                <span className="flex-1 text-left">{mod.title}</span>
              </button>
              {expandedModules.has(mod.id) && (
                <div className="ml-6 space-y-0.5">
                  {mod.chapters.map(ch => {
                    const isActive = location.pathname.includes(ch.id);
                    const isDone = completedChapters.has(ch.id);
                    return (
                      <button key={ch.id} onClick={() => handleChapterClick(ch.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition ${isActive ? 'bg-gold-500/10 text-gold-600 font-medium' : 'text-surface-700 hover:bg-surface-50'}`}>
                        {isDone ? <CheckCircle className="w-3.5 h-3.5 text-mgreen-600 flex-shrink-0" /> : <Circle className="w-3.5 h-3.5 text-surface-300 flex-shrink-0" />}
                        <span className="text-left">{ch.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Desktop toggle button */}
      {isDesktop && (
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-1/2 -translate-y-1/2 z-10 bg-white border border-surface-200 rounded-r-lg p-1 cursor-pointer hover:bg-surface-50 transition-all"
          style={{ left: sidebarOpen ? '320px' : '0' }}>
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar for course layout */}
        <div className="md:hidden sticky top-0 z-20 bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/courses')} className="flex items-center gap-1 text-sm text-surface-700 cursor-pointer">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-sm font-bold text-navy-900 truncate max-w-[50%] text-center">{course?.title}</span>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-surface-100 cursor-pointer">
            <List className="w-5 h-5 text-surface-700" />
          </button>
        </div>
        <div className="p-4 md:p-8">
          <Outlet context={{ course, modules, completedChapters, refreshProgress: loadData }} />
        </div>
      </main>
    </div>
  );
}
