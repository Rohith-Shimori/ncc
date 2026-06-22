import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { supabase } from '../services/supabase';
import { BarChart3, TrendingUp, Target, Award, BookOpen, Crown, History, Trophy, Search, ChevronRight, Shield, Flame } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';


export default function Performance() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [historyError, setHistoryError] = useState(null);
  const [topicData, setTopicData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardWing, setLeaderboardWing] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  const loadData = useCallback(async () => {
    // We are now using a secure RPC function to fetch history to bypass any potential RLS misconfigurations in PostgREST
    // Passing p_user_id explicitly to bypass the auth.uid() nullification edge case in SECURITY DEFINER
    const { data: atts, error: err1 } = await supabase.rpc('fn_get_my_csv_attempts', { p_user_id: user.id });
    
    if (err1) {
      console.error("Error fetching attempts via RPC:", err1);
      setHistoryError(err1.message || 'Database error occurred loading history via RPC.');
    } else {
      setHistoryError(null);
    }
    
    // We transform the flat RPC response back into the nested shape the UI expects
    const formattedAtts = (atts || []).map(a => ({
      ...a,
      csv_mock_exams: {
        test_name: a.test_name,
        passing_percent: a.passing_percent
      }
    }));
    
    setAttempts(formattedAtts);

    // Fetch all answers for topic breakdown
    const attemptIds = (atts || []).map(a => a.id);
    if (attemptIds.length) {
      const { data: answers } = await supabase.from('csv_attempt_questions')
        .select('is_correct, csv_questions(subject_code)')
        .in('attempt_id', attemptIds);
      const topics = {};
      (answers || []).forEach(a => {
        const t = a.csv_questions?.subject_code || 'General';
        if (!topics[t]) topics[t] = { topic: t, correct: 0, total: 0 };
        topics[t].total++;
        if (a.is_correct) topics[t].correct++;
      });
      setTopicData(Object.values(topics).map(t => ({ ...t, score: Math.round((t.correct / t.total) * 100) })));
    }
    setLoading(false);
  }, [user]);

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase.rpc('fn_get_leaderboard', { 
      p_limit: 10, 
      p_wing: leaderboardWing 
    });
    setLeaderboard(data || []);
  }, [leaderboardWing]);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [user, loadData]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLeaderboard();
  }, [leaderboardWing, fetchLeaderboard]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="ncc-loader" />
    </div>
  );

  const avgScore = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length) : 0;
  const passedCount = attempts.filter(a => a.percentage >= (a.csv_mock_exams?.passing_percent || 60)).length;
  const trendData = attempts.map((a, i) => ({ name: `Test ${i + 1}`, score: a.percentage || 0 }));
  const weakTopics = topicData.filter(t => t.score < 60).sort((a, b) => a.score - b.score);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-10">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> Performance Center
        </h1>
        <p className="text-surface-700 text-[11px] md:text-sm">Monitor your growth and compete with fellow cadets</p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-2xl md:rounded-3xl border-0 overflow-hidden relative shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Award className="w-32 h-32" />
        </div>
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gold-500 border-4 border-white/10 flex items-center justify-center text-3xl md:text-4xl font-bold text-navy-900 shadow-2xl">
            {profile?.full_name?.charAt(0) || 'C'}
          </div>
          <div className="text-center md:text-left space-y-1">
            <p className="text-gold-400 font-bold tracking-widest uppercase text-xs">Cadet Profile</p>
            <h2 className="text-2xl md:text-3xl font-black">{profile?.full_name || 'Cadet'}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/10">
                <Shield className="w-3 h-3 text-gold-500" /> {profile?.wing || 'General'} Wing
              </span>
              <span className="px-3 py-1 bg-gold-500 text-navy-900 rounded-full text-xs font-black flex items-center gap-1.5">
                <Trophy className="w-3 h-3" /> Level {profile?.level || 1}
              </span>
            </div>
          </div>
          <div className="flex-1 md:text-right">
            <p className="text-white/70 text-sm font-bold mb-1">Current EXP</p>
            <p className="text-4xl font-black text-white">{profile?.exp || 0}<span className="text-white/40 text-lg ml-1">/ {((profile?.level || 1) * 1000)}</span></p>
            <div className="w-full md:w-64 ml-auto h-2.5 bg-navy-950/40 rounded-full mt-3 overflow-hidden border border-white/10 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-gold-600 to-gold-400 shadow-[0_0_15px_rgba(200,169,81,0.6)] transition-all duration-1000" 
                style={{ width: `${(profile?.exp % 1000) / 10}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-100 p-1 rounded-2xl md:w-fit">
        {[
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
          { id: 'history', label: 'Results History', icon: History }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-navy-900 shadow-sm' 
                : 'text-surface-600 hover:text-navy-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: 'Tests Taken', value: attempts.length, icon: Target, color: 'text-navy-500', bg: 'bg-navy-500/10' },
              { label: 'Avg. Score', value: avgScore + '%', icon: TrendingUp, color: 'text-gold-500', bg: 'bg-gold-500/10' },
              { label: 'Tests Passed', value: passedCount, icon: Award, color: 'text-mgreen-600', bg: 'bg-mgreen-600/10' },
              { label: 'Topics Mastered', value: topicData.filter(t => t.score >= 80).length, icon: BookOpen, color: 'text-info', bg: 'bg-info-bg' },
            ].map((s, i) => (
              <div key={i} className="ncc-glass-card p-3 md:p-4 flex flex-col items-center text-center">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl ${s.bg} flex items-center justify-center mb-2 md:mb-3`}>
                  <s.icon className={`w-4 h-4 md:w-5 md:h-5 ${s.color}`} />
                </div>
                <p className="text-lg md:text-2xl font-bold text-navy-900 leading-tight">{s.value}</p>
                <p className="text-[10px] md:text-xs text-surface-700 line-clamp-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {attempts.length === 0 ? (
            <div className="ncc-glass-card p-12 text-center border-dashed border-2">
              <BarChart3 className="w-12 h-12 mx-auto text-surface-300 mb-4" />
              <p className="text-surface-700">No data yet. Complete your first test to see analytics!</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="ncc-glass-card p-5">
                <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gold-500" /> Score Trend
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} fontSize={11} width={30} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="score" stroke="#c8a951" strokeWidth={3} dot={{ fill: '#c8a951', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="ncc-glass-card p-5">
                <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-mgreen-600" /> Topic Performance
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topicData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis dataKey="topic" type="category" width={70} fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={16}>
                      {topicData.map((t, i) => (
                        <Cell key={i} fill={t.score >= 70 ? '#22c55e' : t.score >= 50 ? '#eab308' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {weakTopics.length > 0 && (
            <div className="ncc-glass-card p-5">
              <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-info" /> Focus Areas
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {weakTopics.map(t => (
                  <div key={t.topic} className="bg-surface-50 border border-surface-200 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-navy-900 text-sm">{t.topic}</p>
                      <span className="text-[10px] font-black text-danger uppercase">{t.score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-200 rounded-full overflow-hidden">
                      <div className="h-full bg-danger" style={{ width: t.score + '%' }} />
                    </div>
                    <p className="text-[10px] text-surface-500 mt-2 font-medium">Needs improvement</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-navy-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold-500" /> Global Leaderboard
            </h3>
            <div className="flex bg-surface-100 p-1 rounded-xl">
              {['All', 'Army', 'Navy', 'Air Force'].map(w => (
                <button
                  key={w}
                  onClick={() => setLeaderboardWing(w)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    leaderboardWing === w ? 'bg-white text-navy-900 shadow-sm' : 'text-surface-600'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="ncc-glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-surface-100">
                    <th className="px-6 py-4 text-[10px] font-black text-surface-500 uppercase tracking-widest">Rank</th>
                    <th className="px-6 py-4 text-[10px] font-black text-surface-500 uppercase tracking-widest">Cadet</th>
                    <th className="px-6 py-4 text-[10px] font-black text-surface-500 uppercase tracking-widest">Wing</th>
                    <th className="px-6 py-4 text-[10px] font-black text-surface-500 uppercase tracking-widest text-right">Level</th>
                    <th className="px-6 py-4 text-[10px] font-black text-surface-500 uppercase tracking-widest text-right">Streak</th>
                    <th className="px-6 py-4 text-[10px] font-black text-surface-500 uppercase tracking-widest text-right">Total EXP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {leaderboard.map((entry, i) => (
                    <tr key={i} className={`${entry.is_current_user ? 'bg-gold-500/5' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {entry.rank <= 3 ? (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              entry.rank === 1 ? 'bg-gold-500 text-navy-900' :
                              entry.rank === 2 ? 'bg-surface-300 text-navy-900' :
                              'bg-orange-400 text-white'
                            }`}>
                              {entry.rank}
                            </div>
                          ) : (
                            <span className="text-surface-500 font-bold ml-2">#{entry.rank}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            entry.is_current_user ? 'bg-gold-500 text-navy-900' : 'bg-surface-200 text-surface-600'
                          }`}>
                            {entry.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${entry.is_current_user ? 'text-navy-900' : 'text-surface-900'}`}>
                              {entry.full_name}
                              {entry.is_current_user && <span className="ml-2 text-[10px] bg-gold-500/20 text-gold-600 px-1.5 py-0.5 rounded-full uppercase">You</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-surface-600">{entry.wing}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-black text-navy-900">Lv.{entry.level}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 font-black text-warning">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{entry.current_streak || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-gold-600">{entry.exp.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <h3 className="font-bold text-navy-900 flex items-center gap-2">
            <History className="w-5 h-5 text-info" /> Recent Test Results
          </h3>
          <div className="space-y-3">
            {historyError && (
              <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-sm font-bold flex flex-col gap-1">
                <span>⚠️ Database Error: Failed to load history.</span>
                <span className="text-xs font-normal opacity-80">{historyError}</span>
                <span className="text-xs font-normal mt-1">Please ensure you have executed all SQL patches in your Supabase Editor.</span>
              </div>
            )}
            
            {!historyError && attempts.length === 0 && (
              <div className="text-center p-8 bg-surface-100 rounded-2xl text-surface-500 font-medium border border-dashed border-surface-300">
                You haven't taken any mock exams yet. Let's get started!
              </div>
            )}

            {!historyError && attempts.length > 0 && [...attempts].reverse().map(attempt => (
              <div 
                key={attempt.id} 
                onClick={() => navigate(`/exam-results/${attempt.id}`)}
                className="ncc-glass-card p-4 flex items-center justify-between group cursor-pointer hover:border-gold-500/30 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    attempt.percentage >= (attempt.csv_mock_exams?.passing_percent || 60) ? 'bg-mgreen-600/10 text-mgreen-600' : 'bg-danger/10 text-danger'
                  }`}>
                    <span className="text-lg font-black">{attempt.percentage}%</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-navy-900 group-hover:text-gold-600 transition-colors">{attempt.csv_mock_exams?.test_name || 'Practice Test'}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[11px] text-surface-500 font-medium">
                        {new Date(attempt.submitted_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        attempt.percentage >= (attempt.csv_mock_exams?.passing_percent || 60) ? 'bg-mgreen-600/10 text-mgreen-600' : 'bg-danger/10 text-danger'
                      }`}>
                        {attempt.percentage >= (attempt.csv_mock_exams?.passing_percent || 60) ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-navy-900">{attempt.score}/{attempt.total_questions}</p>
                    <p className="text-[10px] text-surface-500 font-medium uppercase">Correct</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-surface-300 group-hover:text-gold-500 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
