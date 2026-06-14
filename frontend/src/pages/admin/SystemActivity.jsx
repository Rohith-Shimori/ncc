import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Activity } from 'lucide-react';

export default function SystemActivity() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // In a real app we'd query an audit_logs table. 
      // For now we'll construct an activity feed from exam attempts and announcements.
      
      const { data: attempts } = await supabase.from('csv_exam_attempts')
        .select('id, status, submitted_at, percentage, cadet_id, csv_mock_exams(test_name)')
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false })
        .limit(30);

      const { data: announcements } = await supabase.from('announcements')
        .select('id, title, priority, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      const combined = [
        ...(attempts || []).map(a => ({
          type: 'exam',
          text: `Cadet completed exam: ${a.csv_mock_exams?.test_name}`,
          details: `Score: ${a.percentage}% | Status: ${a.status}`,
          time: new Date(a.submitted_at),
          severity: a.status === 'flagged' ? 'warning' : 'info'
        })),
        ...(announcements || []).map(a => ({
          type: 'announcement',
          text: `New Announcement Published: ${a.title}`,
          details: `Priority: ${a.priority}`,
          time: new Date(a.created_at),
          severity: a.priority === 'high' ? 'warning' : 'info'
        }))
      ].sort((a, b) => b.time - a.time);

      setActivity(combined);
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
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2">
          <Activity className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> System Activity Log
        </h1>
        <p className="text-surface-700 text-sm">Chronological log of platform events</p>
      </div>

      <div className="ncc-glass-card overflow-hidden">
        <div className="divide-y divide-surface-100">
          {activity.map((act, i) => (
            <div key={i} className="p-4 hover:bg-surface-50 transition flex gap-4 items-start">
              <div className="mt-1">
                <span className={`w-2.5 h-2.5 rounded-full block ${act.severity === 'warning' ? 'bg-danger' : 'bg-mgreen-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy-900 text-sm">{act.text}</p>
                <p className="text-xs text-surface-600 mt-1">{act.details}</p>
                <p className="text-[10px] font-bold text-surface-400 uppercase mt-2">{act.time.toLocaleString()}</p>
              </div>
            </div>
          ))}
          {activity.length === 0 && (
            <div className="p-8 text-center text-surface-400">No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}
