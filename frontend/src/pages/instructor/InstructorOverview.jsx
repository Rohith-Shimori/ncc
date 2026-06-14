import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { BookOpen, Users, ClipboardCheck, BarChart3, GraduationCap, TrendingUp, FileText, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InstructorOverview() {
  const [stats, setStats] = useState({ courses: 0, cadets: 0, csv_questions: 0, tests: 0, avgScore: 0 });
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: courseList } = await supabase.from('courses').select('id', { count: 'exact' });
      const { data: cadetList } = await supabase.from('cadet_profiles').select('id', { count: 'exact' });
      const { count: qCount } = await supabase.from('csv_questions').select('question_id', { count: 'exact', head: true });
      const { data: tList } = await supabase.from('csv_mock_exams').select('*').order('test_id', { ascending: false }).limit(5);
      const { data: attempts } = await supabase.from('csv_exam_attempts')
        .select('percentage').in('status', ['submitted', 'flagged']);
      const avg = attempts?.length ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length) : 0;

      setStats({
        courses: courseList?.length || 0,
        cadets: cadetList?.length || 0,
        csv_questions: qCount || 0,
        tests: tList?.length || 0,
        avgScore: avg,
      });
      setRecentExams(tList || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  const quickActions = [
    { label: 'Manage Cadets', icon: Users, path: '/instructor/cadets', color: 'text-mgreen-600', bg: 'bg-mgreen-600/10' },
    { label: 'Course Manager', icon: BookOpen, path: '/instructor/courses', color: 'text-navy-500', bg: 'bg-navy-500/10' },
    { label: 'Question Bank', icon: FileText, path: '/instructor/questions', color: 'text-gold-500', bg: 'bg-gold-500/10' },
    { label: 'Mock Exams', icon: ClipboardCheck, path: '/instructor/mock-exams', color: 'text-wing-airforce', bg: 'bg-wing-airforce-bg' },
    { label: 'Announcements', icon: Megaphone, path: '/instructor/announcements', color: 'text-danger', bg: 'bg-danger-bg' },
    { label: 'Exam Analytics', icon: BarChart3, path: '/instructor/analytics', color: 'text-info', bg: 'bg-info-bg' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> Instructor Dashboard
        </h1>
        <p className="text-surface-700 text-sm">Overview of your courses, cadets, and training performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Active Courses', value: stats.courses, icon: BookOpen, color: 'text-navy-500', bg: 'bg-navy-500/10' },
          { label: 'Total Cadets', value: stats.cadets, icon: Users, color: 'text-mgreen-600', bg: 'bg-mgreen-600/10' },
          { label: 'Total Questions', value: stats.csv_questions, icon: FileText, color: 'text-gold-500', bg: 'bg-gold-500/10' },
          { label: 'Avg. Score', value: stats.avgScore + '%', icon: TrendingUp, color: 'text-wing-airforce', bg: 'bg-wing-airforce-bg' },
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

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-surface-700 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              to={action.path}
              className="ncc-glass-card p-4 flex flex-col items-center gap-2 text-center group cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <span className="text-xs font-semibold text-navy-900">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Exams */}
      {recentExams.length > 0 && (
        <div className="ncc-glass-card overflow-hidden">
          <div className="p-4 border-b border-surface-100 flex items-center justify-between">
            <h2 className="font-bold text-navy-900 text-sm md:text-base flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-gold-500" /> Recent Mock Exams
            </h2>
            <Link to="/instructor/mock-exams" className="text-xs font-bold text-gold-600 hover:text-gold-500 transition">
              View All →
            </Link>
          </div>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 text-left text-xs font-bold text-surface-700 uppercase tracking-wider">
                  <th className="p-4">Exam Name</th>
                  <th className="p-4">Certificate</th>
                  <th className="p-4">Wing</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {recentExams.map(t => (
                  <tr key={t.test_id} className="hover:bg-surface-50 transition">
                    <td className="p-4 font-medium text-navy-900 text-sm">{t.test_name}</td>
                    <td className="p-4"><span className="ncc-badge bg-navy-900/10 text-navy-900">{t.certificate_level} Cert</span></td>
                    <td className="p-4 text-sm text-surface-700">{t.wing}</td>
                    <td className="p-4 text-sm text-surface-700">{t.time_limit_minutes}m</td>
                    <td className="p-4">
                      <span className={`ncc-badge ${t.is_active ? 'bg-mgreen-600/10 text-mgreen-600' : 'bg-surface-200 text-surface-500'}`}>
                        {t.is_active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-surface-100">
            {recentExams.map(t => (
              <div key={t.test_id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-navy-900 text-sm">{t.test_name}</h3>
                  <span className={`ncc-badge text-[10px] ${t.is_active ? 'bg-mgreen-600/10 text-mgreen-600' : 'bg-surface-200 text-surface-500'}`}>
                    {t.is_active ? 'Active' : 'Draft'}
                  </span>
                </div>
                <div className="flex gap-2 text-xs text-surface-700">
                  <span className="ncc-badge bg-navy-900/10 text-navy-900">{t.certificate_level} Cert</span>
                  <span>{t.wing}</span>
                  <span>{t.time_limit_minutes}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
