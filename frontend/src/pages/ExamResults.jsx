import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { CheckCircle, XCircle, ArrowLeft, Trophy, Clock, AlertTriangle, Flag } from 'lucide-react';

export default function ExamResults() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const { data: res, error } = await supabase.rpc('fn_get_exam_results', { p_attempt_id: attemptId });
      if (error) { console.error(error); setLoading(false); return; }
      setData(res);
      setLoading(false);
    };
    fetchResults();
  }, [attemptId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );
  if (!data) return <div className="text-center py-20 text-surface-700">Results not found.</div>;

  const topicBreakdown = {};
  (data.grading_data || []).forEach(q => {
    const t = q.topic_tag || 'General';
    if (!topicBreakdown[t]) topicBreakdown[t] = { correct: 0, total: 0 };
    topicBreakdown[t].total++;
    if (q.is_correct) topicBreakdown[t].correct++;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-fadeIn">
      <button onClick={() => navigate('/practice-tests')} className="ncc-btn ncc-btn-ghost mb-1 md:mb-2 cursor-pointer"><ArrowLeft className="w-4 h-4" /> Back to Tests</button>

      {/* Score card */}
      <div className="ncc-glass-card p-5 md:p-8 text-center">
        <div className={`w-20 h-20 md:w-28 md:h-28 mx-auto mb-3 md:mb-4 rounded-full flex items-center justify-center text-2xl md:text-4xl font-black text-white ${data.passed ? 'bg-gradient-to-br from-mgreen-600 to-emerald-700' : 'bg-gradient-to-br from-danger to-rose-600'}`}>
          {data.total_questions > 0 ? Math.round((data.score / data.total_questions) * 100) : 0}%
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-navy-900">{data.test_title}</h1>
        <p className={`text-base md:text-lg font-medium mt-1 ${data.passed ? 'text-mgreen-600' : 'text-danger'}`}>
          {data.passed ? '✅ PASSED' : '❌ NOT PASSED'}
        </p>
        <div className="flex items-center justify-center gap-3 md:gap-6 mt-3 md:mt-4 text-xs md:text-sm text-surface-700 flex-wrap">
          <span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-gold-500" /> {data.score}/{data.total_questions}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {Math.floor((data.time_spent || 0)/60)}m {(data.time_spent || 0)%60}s</span>
          {data.tab_switches > 0 && <span className="flex items-center gap-1 text-warning"><AlertTriangle className="w-4 h-4" /> {data.tab_switches} switches</span>}
          {data.status === 'flagged' && <span className="flex items-center gap-1 text-danger"><Flag className="w-4 h-4" /> Flagged</span>}
        </div>
      </div>

      {/* Topic breakdown */}
      {Object.keys(topicBreakdown).length > 0 && (
        <div className="ncc-glass-card p-4 md:p-6">
          <h2 className="font-bold text-navy-900 mb-3 md:mb-4 text-sm md:text-base">Topic Performance</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(topicBreakdown).map(([topic, val]) => {
              const pct = Math.round((val.correct / val.total) * 100);
              return (
                <div key={topic} className="bg-surface-50 p-3 md:p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-navy-900">{topic}</span>
                    <span className={`text-sm font-bold ${pct >= 70 ? 'text-mgreen-600' : pct >= 50 ? 'text-warning' : 'text-danger'}`}>{val.correct}/{val.total}</span>
                  </div>
                  <div className="ncc-progress-track">
                    <div className={`ncc-progress-fill ${pct >= 70 ? 'bg-mgreen-600' : pct >= 50 ? 'bg-warning' : 'bg-danger'}`} style={{ width: pct + '%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Question review */}
      <div className="ncc-glass-card p-4 md:p-6">
        <h2 className="font-bold text-navy-900 mb-3 md:mb-4 text-sm md:text-base">Answer Review</h2>
        <div className="space-y-3 md:space-y-4">
          {(data.grading_data || []).map((q, i) => (
            <div key={i} className={`p-3 md:p-4 rounded-xl border-2 ${q.is_correct ? 'border-mgreen-600/20 bg-mgreen-600/5' : 'border-danger/20 bg-danger/5'}`}>
              <div className="flex items-start gap-2 md:gap-3">
                {q.is_correct ? <CheckCircle className="w-5 h-5 text-mgreen-600 mt-0.5 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-900 mb-2 text-sm md:text-base break-words">{i + 1}. {q.question_text || 'Question'}</p>
                  <div className="text-xs md:text-sm space-y-1">
                    <p className={`${q.is_correct ? 'text-mgreen-600' : 'text-danger'} font-bold`}>
                      Your Answer: {q.user_answer || 'None'}
                    </p>
                    {!q.is_correct && (
                      <p className="text-mgreen-600 font-bold">
                        Correct Answer: {q.correct_answer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
