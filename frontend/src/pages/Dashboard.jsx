import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { BookOpen, ClipboardCheck, TrendingUp, Award, ArrowRight, Megaphone, Clock, Target, Flame } from 'lucide-react';
import heroImg from '../assets/hero.png';

export default function Dashboard() {
  const { user, profile, role, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, avgScore: 0, tests: 0 });
  const [loading, setLoading] = useState(true);
  const streakUpdatedRef = useRef(false);

  // Redirect admin and instructor to their panels
  useEffect(() => {
    if (role === 'admin') navigate('/admin', { replace: true });
    else if (role === 'instructor') navigate('/instructor', { replace: true });
  }, [role, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const wing = profile?.wing || 'Common';

      // Update Streak
      if (!streakUpdatedRef.current && (profile?.role === 'cadet' || !profile?.role)) {
        streakUpdatedRef.current = true;
        const { data: streakRes } = await supabase.rpc('fn_update_daily_streak');
        if (streakRes?.updated) {
          await refreshProfile();
        }
      }

      // Enrolled courses with progress
      const { data: enrollments } = await supabase
        .from('course_enrollments').select('course_id, courses(id, title, description, target_wing, certificate_level)')
        .eq('user_id', user.id);

      const enrolled = (enrollments || []).map(e => e.courses).filter(Boolean);

      // Efficient Progress Calculation: Fetch all modules and chapters in bulk if needed, 
      // but for now, we'll keep it per-course but optimized with single query approach
      const coursesWithProgress = await Promise.all(enrolled.map(async (c) => {
        // Get all chapter IDs for this course
        const { data: chapterData } = await supabase.rpc('fn_get_course_chapter_ids', { p_course_id: c.id });
        const chapterIds = chapterData || [];
        const totalChapters = chapterIds.length;
        
        if (totalChapters === 0) return { ...c, progress: 0 };

        const { count: completedChapters } = await supabase.from('user_progress')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true)
          .in('chapter_id', chapterIds);

        return { ...c, progress: Math.round((completedChapters / totalChapters) * 100) };
      }));

      setCourses(coursesWithProgress);

      // Announcements
      const { data: anns } = await supabase.from('announcements')
        .select('*').eq('is_active', true)
        .or(`target_wing.eq.Common,target_wing.eq."${wing}"`)
        .order('created_at', { ascending: false }).limit(5);
      setAnnouncements(anns || []);

      // Test stats
      const { data: attempts } = await supabase.from('csv_exam_attempts')
        .select('percentage, status').eq('user_id', user.id).in('status', ['submitted', 'flagged']);
      const avgScore = attempts?.length ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length) : 0;

      setStats({
        enrolled: enrolled.length,
        completed: coursesWithProgress.filter(c => c.progress === 100).length,
        avgScore,
        tests: attempts?.length || 0
      });
      setLoading(false);
    };
    load();
  }, [user, profile]);

  const timeAgo = (d) => {
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-5 md:p-8 bg-navy-900 text-white relative overflow-hidden min-h-[140px] md:min-h-[180px] flex flex-col justify-center border border-white/5 shadow-xl">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})`, mixBlendMode: 'overlay' }}
        />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-black mb-1 md:mb-2">Welcome back, {profile?.full_name || 'Cadet'} 🎖️</h1>
            <p className="text-white/80 text-[11px] md:text-base max-w-2xl leading-relaxed font-medium">
              {profile?.wing || 'NCC'} Wing • {profile?.certificate_level || 'A'} Cert • {profile?.ncc_number || 'Cadet'}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="bg-gold-500 text-navy-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Level {profile?.level || 1}</span>
              <div className="flex-1 max-w-[200px] h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gold-500 shadow-[0_0_8px_rgba(200,169,81,0.5)]" style={{ width: `${(profile?.exp % 1000) / 10}%` }} />
              </div>
              <span className="text-xs text-white/60 font-bold">{profile?.exp || 0} EXP</span>
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full text-xs font-bold border border-white/5 ml-2">
                <Flame className="w-3.5 h-3.5 text-warning" />
                <span className="text-white">{profile?.current_streak || 0} Day Streak</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Rank Progress</p>
            <p className="text-white font-black text-lg">{Math.round((profile?.exp % 1000) / 10)}% to Level { (profile?.level || 1) + 1 }</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Enrolled Courses', value: stats.enrolled, icon: BookOpen, color: 'text-navy-500', bg: 'bg-navy-500/10' },
          { label: 'Courses Completed', value: stats.completed, icon: Award, color: 'text-mgreen-600', bg: 'bg-mgreen-600/10' },
          { label: 'Average Score', value: stats.avgScore + '%', icon: TrendingUp, color: 'text-gold-500', bg: 'bg-gold-500/10' },
          { label: 'Tests Taken', value: stats.tests, icon: ClipboardCheck, color: 'text-wing-airforce', bg: 'bg-wing-airforce-bg' },
        ].map((s, i) => (
          <div key={i} className="ncc-stat-card">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl ${s.bg} flex items-center justify-center mb-2 md:mb-3`}>
              <s.icon className={`w-4 h-4 md:w-5 md:h-5 ${s.color}`} />
            </div>
            <p className="text-xl md:text-2xl font-bold text-navy-900 leading-tight">{s.value}</p>
            <p className="text-[10px] md:text-xs text-surface-700 line-clamp-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-bold text-navy-900">My Courses</h2>
            <button onClick={() => navigate('/courses')} className="text-sm text-gold-600 hover:text-gold-500 cursor-pointer flex items-center gap-1">Browse All <ArrowRight className="w-4 h-4" /></button>
          </div>
          {courses.length === 0 ? (
            <div className="ncc-glass-card p-6 md:p-8 text-center">
              <BookOpen className="w-10 h-10 mx-auto text-surface-300 mb-3" />
              <p className="text-surface-700 mb-3">You haven't enrolled in any courses yet.</p>
              <button onClick={() => navigate('/courses')} className="ncc-btn ncc-btn-accent cursor-pointer">Browse Courses</button>
            </div>
          ) : courses.map(course => (
            <div key={course.id} className="ncc-glass-card p-4 cursor-pointer hover:shadow-lg transition" onClick={() => navigate(`/course/${course.id}`)}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-navy-900 text-sm md:text-base line-clamp-1">{course.title}</h3>
                <span className={`ncc-badge flex-shrink-0 ${course.target_wing === 'Army' ? 'ncc-badge-army' : course.target_wing === 'Navy' ? 'ncc-badge-navy' : course.target_wing === 'Air Force' ? 'ncc-badge-airforce' : 'bg-surface-100 text-surface-700'}`}>{course.target_wing}</span>
              </div>
              <p className="text-sm text-surface-700 mb-3 line-clamp-2 break-words">{course.description}</p>
              <div className="flex items-center gap-3">
                <div className="ncc-progress-track flex-1">
                  <div className="ncc-progress-fill" style={{ width: course.progress + '%' }} />
                </div>
                <span className="text-sm font-medium text-navy-900">{course.progress}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Announcements */}
        <div>
          <h2 className="text-base md:text-lg font-bold text-navy-900 mb-3 md:mb-4 flex items-center gap-2"><Megaphone className="w-5 h-5 text-gold-500" /> Announcements</h2>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="ncc-glass-card p-6 text-center text-surface-700 text-sm">No announcements</div>
            ) : announcements.map(a => (
              <div key={a.id} className="ncc-glass-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  {a.priority === 'high' && <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />}
                  <h4 className="font-bold text-sm text-navy-900">{a.title}</h4>
                </div>
                <p className="text-xs text-surface-700 mb-1">{a.content}</p>
                <span className="text-xs text-surface-300">{timeAgo(a.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
