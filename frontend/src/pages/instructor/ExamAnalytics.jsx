import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { BarChart3, Users, ClipboardCheck, TrendingUp, TrendingDown, Download } from 'lucide-react';

export default function ExamAnalytics() {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, passed: 0, flagged: 0 });

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleExportExcel = async () => {
    try {
      // 1. Fetch all attempts (no limit for export)
      const { data: allAttempts, error: attemptsError } = await supabase.from('csv_exam_attempts')
        .select('user_id, percentage, score, total_questions, status, submitted_at, time_taken_seconds, tab_switches, csv_mock_exams(test_name, certificate_level, wing)')
        .in('status', ['submitted', 'flagged'])
        .order('submitted_at', { ascending: false });

      if (attemptsError) throw attemptsError;

      // 2. Fetch all profiles from cadets, instructors, and admins in parallel
      const [cadetsRes, instructorsRes, adminsRes] = await Promise.all([
        supabase.from('cadet_profiles').select('id, full_name, ncc_number, wing, certificate_level'),
        supabase.from('instructor_profiles').select('id, full_name, unit, rank'),
        supabase.from('admin_profiles').select('id, full_name')
      ]);

      const profileMap = {};
      (cadetsRes.data || []).forEach(p => { profileMap[p.id] = { ...p, role: 'cadet' }; });
      (instructorsRes.data || []).forEach(p => { profileMap[p.id] = { ...p, role: 'instructor' }; });
      (adminsRes.data || []).forEach(p => { profileMap[p.id] = { ...p, role: 'admin' }; });

      // 3. Format data for SheetJS
      const excelData = (allAttempts || []).map(a => {
        const uProfile = profileMap[a.user_id];
        let roleLabel = 'Cadet';
        let wingOrUnit = 'N/A';
        let certLevel = 'N/A';
        let nccNum = 'N/A';

        if (uProfile) {
          if (uProfile.role === 'instructor') {
            roleLabel = `Instructor (${uProfile.rank || 'N/A'})`;
            wingOrUnit = uProfile.unit || 'N/A';
          } else if (uProfile.role === 'admin') {
            roleLabel = 'Admin';
          } else {
            wingOrUnit = uProfile.wing || 'N/A';
            certLevel = uProfile.certificate_level || 'N/A';
            nccNum = uProfile.ncc_number || 'N/A';
          }
        }

        return {
          'Name': uProfile?.full_name || 'Unknown User',
          'Role': roleLabel,
          'NCC Number': nccNum,
          'Wing / Unit': wingOrUnit,
          'Certificate': certLevel,
          'Exam Name': a.csv_mock_exams?.test_name || 'N/A',
          'Score': a.score !== undefined && a.total_questions ? `${a.score}/${a.total_questions}` : '—',
          'Percentage': a.percentage !== undefined ? `${a.percentage}%` : '—',
          'Status': a.status === 'flagged' ? 'Flagged' : 'Submitted',
          'Tab Switches': a.tab_switches !== undefined ? a.tab_switches : (a.tab_switch_count || 0),
          'Time Spent': formatDuration(a.time_taken_seconds || a.time_spent_seconds || 0),
          'Submitted At': a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '—'
        };
      });

      // 4. Generate worksheet and workbook
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Exam Results');
      
      // Auto-size columns to a standard width with empty array safety check
      if (excelData.length > 0) {
        worksheet['!cols'] = Object.keys(excelData[0] || {}).map(() => ({ wch: 20 }));
      }

      // 5. Trigger download
      XLSX.writeFile(workbook, `NCC_Exam_Results_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      alert('Failed to export: ' + (err.message || 'Unknown error'));
    }
  };

  useEffect(() => {
    const load = async () => {
      const { data: attempts } = await supabase.from('csv_exam_attempts')
        .select('percentage, status, submitted_at, csv_mock_exams(test_name, certificate_level, wing)')
        .in('status', ['submitted', 'flagged'])
        .order('submitted_at', { ascending: false })
        .limit(50);

      const all = attempts || [];
      const avg = all.length ? Math.round(all.reduce((s, a) => s + (a.percentage || 0), 0) / all.length) : 0;
      const passed = all.filter(a => (a.percentage || 0) >= 50).length;
      const flagged = all.filter(a => a.status === 'flagged').length;

      setStats({ total: all.length, avgScore: avg, passed, flagged });
      setExams(all);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> Exam Analytics
          </h1>
          <p className="text-surface-700 text-sm">Performance overview across all mock examinations</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="ncc-btn ncc-btn-accent py-2.5 px-6 self-start sm:self-auto flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export Results to Excel
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Attempts', value: stats.total, icon: ClipboardCheck, color: 'text-navy-500', bg: 'bg-navy-500/10' },
          { label: 'Average Score', value: stats.avgScore + '%', icon: BarChart3, color: 'text-gold-500', bg: 'bg-gold-500/10' },
          { label: 'Passed', value: stats.passed, icon: TrendingUp, color: 'text-mgreen-600', bg: 'bg-mgreen-600/10' },
          { label: 'Flagged', value: stats.flagged, icon: TrendingDown, color: 'text-danger', bg: 'bg-danger-bg' },
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

      {/* Recent Attempts Table */}
      <div className="ncc-glass-card overflow-hidden">
        <div className="p-4 border-b border-surface-100">
          <h2 className="font-bold text-navy-900 text-sm md:text-base">Recent Exam Attempts</h2>
        </div>
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 text-left text-xs font-bold text-surface-700 uppercase tracking-wider">
                <th className="p-4">Exam</th>
                <th className="p-4">Certificate</th>
                <th className="p-4">Score</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {exams.map((a, i) => (
                <tr key={i} className="hover:bg-surface-50 transition">
                  <td className="p-4 font-medium text-navy-900 text-sm">{a.csv_mock_exams?.test_name || 'Unknown'}</td>
                  <td className="p-4"><span className="ncc-badge bg-navy-900/10 text-navy-900">{a.csv_mock_exams?.certificate_level}</span></td>
                  <td className="p-4">
                    <span className={`font-bold text-sm ${(a.percentage || 0) >= 50 ? 'text-mgreen-600' : 'text-danger'}`}>{a.percentage || 0}%</span>
                  </td>
                  <td className="p-4">
                    <span className={`ncc-badge text-[10px] ${a.status === 'flagged' ? 'bg-danger/10 text-danger' : 'bg-mgreen-600/10 text-mgreen-600'}`}>
                      {a.status === 'flagged' ? '🚩 Flagged' : '✅ Submitted'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-surface-400">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-surface-400">No exam attempts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Mobile */}
        <div className="md:hidden divide-y divide-surface-100">
          {exams.map((a, i) => (
            <div key={i} className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-navy-900 text-sm">{a.csv_mock_exams?.test_name || 'Unknown'}</h3>
                <span className={`font-bold text-sm ${(a.percentage || 0) >= 50 ? 'text-mgreen-600' : 'text-danger'}`}>{a.percentage || 0}%</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className={`ncc-badge text-[10px] ${a.status === 'flagged' ? 'bg-danger/10 text-danger' : 'bg-mgreen-600/10 text-mgreen-600'}`}>
                  {a.status === 'flagged' ? 'Flagged' : 'Submitted'}
                </span>
                <span className="text-surface-400">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : ''}</span>
              </div>
            </div>
          ))}
          {exams.length === 0 && (
            <div className="p-8 text-center text-surface-400">No exam attempts found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
