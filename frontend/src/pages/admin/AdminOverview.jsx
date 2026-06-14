import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Activity, Users, BookOpen, AlertTriangle } from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, courses: 0, tests: 0, flagged: 0 });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Users
      const { count: cadetCount } = await supabase.from('cadet_profiles').select('id', { count: 'exact', head: true });
      const { count: instCount } = await supabase.from('instructor_profiles').select('id', { count: 'exact', head: true });
      const { count: adminCount } = await supabase.from('admin_profiles').select('id', { count: 'exact', head: true });
      
      const totalUsers = (cadetCount || 0) + (instCount || 0) + (adminCount || 0);

      // Courses
      const { count: courseCount } = await supabase.from('courses').select('id', { count: 'exact', head: true });
      
      // Tests
      const { count: testCount } = await supabase.from('csv_exam_attempts').select('id', { count: 'exact', head: true });
      
      // Flagged
      const { count: flaggedCount } = await supabase.from('csv_exam_attempts')
        .select('id', { count: 'exact', head: true }).eq('status', 'flagged');

      setStats({
        users: totalUsers,
        courses: courseCount || 0,
        tests: testCount || 0,
        flagged: flaggedCount || 0
      });

      // Recent activity
      const { data: recentAttempts } = await supabase.from('csv_exam_attempts')
        .select('percentage, status, submitted_at, csv_mock_exams(test_name)')
        .order('submitted_at', { ascending: false }).limit(8);

      setActivity((recentAttempts || []).map(a => ({
        text: `${a.status === 'flagged' ? '🚩 Flagged' : '✅ Submitted'} ${a.csv_mock_exams?.test_name || 'Test'} — Score: ${a.percentage || 0}%`,
        time: a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '',
        type: a.status === 'flagged' ? 'warning' : 'success'
      })));

      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2">
          <Activity className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> Admin Dashboard
        </h1>
        <p className="text-surface-700 text-sm">System-wide overview and monitoring</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Users', value: stats.users, icon: Users, color: 'text-navy-500', bg: 'bg-navy-500/10' },
          { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'text-mgreen-600', bg: 'bg-mgreen-600/10' },
          { label: 'Exam Attempts', value: stats.tests, icon: Activity, color: 'text-gold-500', bg: 'bg-gold-500/10' },
          { label: 'Flagged Exams', value: stats.flagged, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger-bg' },
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
      
      <div className="ncc-glass-card p-4 md:p-5 mt-6">
        <h2 className="font-bold text-navy-900 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base"><Activity className="w-5 h-5 text-gold-500" /> Recent System Activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-surface-700">No recent activity.</p>
        ) : (
          <div className="space-y-4">
            {activity.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${act.type === 'warning' ? 'bg-warning' : 'bg-mgreen-600'}`} />
                <div>
                  <p className="text-sm text-navy-900">{act.text}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
