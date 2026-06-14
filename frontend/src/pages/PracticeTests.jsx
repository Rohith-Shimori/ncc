import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ClipboardCheck, Clock, Target, Trophy, ArrowRight, Filter } from 'lucide-react';

export default function PracticeTests() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [bestScores, setBestScores] = useState({});
  const [typeFilter, setTypeFilter] = useState('All');
  const [certFilter, setCertFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const wing = profile?.wing || 'Common';
      const { data: allTests } = await supabase.from('csv_mock_exams')
        .select('*')
        .eq('is_active', true)
        .or(`wing.eq.Common,wing.eq.${wing}`)
        .order('created_at', { ascending: false });
      
      const formattedTests = (allTests || []).map(test => {
        // Calculate total questions from distribution string e.g. "NCC_GEN:20|NCC_ARMY:10"
        let totalQuestions = 0;
        if (test.question_distribution) {
          const parts = test.question_distribution.split('|');
          parts.forEach(part => {
            const [, countStr] = part.split(':');
            if (countStr) totalQuestions += parseInt(countStr, 10);
          });
        }

        return {
          id: test.test_id,
          test_type: 'mock',
          title: test.test_name,
          description: `Mock Exam for ${test.wing} Wing, Certificate ${test.certificate_level}`,
          duration_minutes: test.time_limit_minutes,
          question_count: totalQuestions,
          passing_score: test.passing_percent,
          target_wing: test.wing,
          certificate_level: test.certificate_level,
          created_at: test.created_at
        };
      });

      setTests(formattedTests);
      // Keep default filter as 'All' so newly created tests are immediately visible
      // if (profile?.certificate_level) {
      //   setCertFilter(profile.certificate_level);
      // }

      // Best scores per test from new csv_exam_attempts table
      if (user) {
        const { data: attempts } = await supabase.from('csv_exam_attempts')
          .select('test_id, percentage, status')
          .eq('user_id', user.id)
          .in('status', ['submitted', 'flagged']);
        const scores = {};
        (attempts || []).forEach(a => {
          if (!scores[a.test_id] || a.percentage > scores[a.test_id]) scores[a.test_id] = a.percentage;
        });
        setBestScores(scores);
      }
      setLoading(false);
    };
    load();
  }, [user, profile]);

  const filtered = tests.filter(t => {
    const matchesType = typeFilter === 'All' || t.test_type === typeFilter;
    const matchesCert = certFilter === 'All' || t.certificate_level === certFilter;
    return matchesType && matchesCert;
  });

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
            <ClipboardCheck className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> Tests
          </h1>
          <p className="text-surface-700 text-[11px] md:text-sm">Prepare for A, B & C certificate exams</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select value={certFilter} onChange={e => setCertFilter(e.target.value)} className="ncc-input w-full sm:w-36 font-bold text-xs">
            <option value="All">All Certificates</option>
            <option value="A">Certificate A</option>
            <option value="B">Certificate B</option>
            <option value="C">Certificate C</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="ncc-input w-full sm:w-32 font-bold text-xs">
            <option value="All">All Types</option>
            <option value="practice">Practice</option>
            <option value="mock">Mock Exam</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="ncc-glass-card p-8 md:p-12 text-center">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-surface-300" />
          <p className="text-surface-700">No tests available yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map(test => {
            const best = bestScores[test.id];
            return (
              <div key={test.id} className="ncc-glass-card p-4 md:p-5 flex flex-col hover:shadow-lg transition">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`ncc-badge ${test.test_type === 'mock' ? 'bg-danger/10 text-danger' : 'bg-info-bg text-info'}`}>
                    {test.test_type === 'mock' ? '🎯 Mock' : '📝 Practice'}
                  </span>
                  <span className={`ncc-badge ${test.target_wing === 'Army' ? 'ncc-badge-army' : test.target_wing === 'Navy' ? 'ncc-badge-navy' : test.target_wing === 'Air Force' ? 'ncc-badge-airforce' : 'bg-surface-100 text-surface-700'}`}>{test.target_wing}</span>
                </div>
                <h3 className="font-bold text-navy-900 mb-1 text-sm md:text-base line-clamp-1">{test.title}</h3>
                <p className="text-sm text-surface-700 flex-1 mb-3 md:mb-4 line-clamp-2 break-words">{test.description}</p>
                <div className="flex items-center gap-3 md:gap-4 text-xs text-surface-700 mb-3 md:mb-4 flex-wrap">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {test.duration_minutes}m</span>
                  <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {test.question_count}Q</span>
                  <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> {test.passing_score}%</span>
                </div>
                {best !== undefined && (
                  <div className="mb-3 p-2 rounded-lg bg-surface-50 text-sm">
                    Best: <span className={`font-bold ${best >= test.passing_score ? 'text-mgreen-600' : 'text-danger'}`}>{best}%</span>
                  </div>
                )}
                <button onClick={() => navigate(`/exam/${test.id}`)} className="ncc-btn ncc-btn-accent w-full cursor-pointer">
                  <ArrowRight className="w-4 h-4" /> {best !== undefined ? 'Retake' : 'Start Test'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
