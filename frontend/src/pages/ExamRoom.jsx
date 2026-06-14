import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Flag, Send, Shield, Maximize, Grid3X3, XCircle, ShieldAlert, Trophy } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';
import { safeJsonParse } from '../utils/safeJson';

export default function ExamRoom() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  // Exam state
  const [phase, setPhase] = useState('loading'); // loading, rules, exam, submitting, results
  const [testInfo, setTestInfo] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [csv_questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(null); // null, 'tab', 'fullscreen'
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [showExitOverlay, setShowExitOverlay] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const startTimeRef = useRef(null);
  const warningTimerRef = useRef(null);

  const showWarningBanner = useCallback((type) => {
    setShowWarning(type);
    clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => setShowWarning(null), 4000);
  }, []);

  // Submit exam via RPC
  const submitExam = useCallback(async (timedOut = false) => {
    if (phase === 'submitting' || phase === 'results') return;
    setPhase('submitting');

    // Exit fullscreen
    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch { /* empty */ }

    const elapsed = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0;
    // Prepare answers as a flat object { question_id: answer } to match RPC expectation
    const answerObject = {};
    csv_questions.forEach(q => {
      if (q && q.id) {
        answerObject[q.id] = answers[q.id] || '';
      }
    });

    try {
      const { data, error } = await supabase.rpc('fn_submit_csv_exam', {
        p_attempt_id: attemptId,
        p_answers: answerObject,
        p_tab_switches: tabSwitches,
        p_time_spent: elapsed
      });
      if (error) throw error;
      if (!data) throw new Error('No result data returned from server');
      setResult({ ...data, timed_out: timedOut });
      setPhase('results');
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      setError('Submission failed: ' + err.message);
      setPhase('results');
    }
  }, [phase, csv_questions, answers, attemptId, tabSwitches, refreshProfile]);

  // Fetch test info
  useEffect(() => {
    const fetchTest = async () => {
      // First try to fetch from csv_mock_exams
      const { data, error } = await supabase.from('csv_mock_exams').select('*').eq('test_id', testId).single();
      
      if (!error && data) {
        // Calculate total questions from distribution string e.g. "NCC_GEN:20|NCC_ARMY:10"
        let totalQuestions = 0;
        if (data.question_distribution) {
          const parts = data.question_distribution.split('|');
          parts.forEach(part => {
            const [, countStr] = part.split(':');
            if (countStr) totalQuestions += parseInt(countStr, 10);
          });
        }
        
        setTestInfo({
          title: data.test_name,
          description: `Mock Exam for ${data.wing} Wing, Certificate ${data.certificate_level}`,
          duration_minutes: data.time_limit_minutes,
          question_count: totalQuestions,
          passing_score: data.passing_percent
        });
        setPhase('rules');
        return;
      }

      setError('Test not found');
      setPhase('rules');
    };
    fetchTest();
  }, [testId]);

  const requestFullscreen = async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      
      setFullscreenActive(true);
      setShowExitOverlay(false);
      return true;
    } catch (e) {
      console.warn("Fullscreen request failed:", e);
      return false;
    }
  };

  const startExam = async () => {
    // 1. Request fullscreen FIRST to capture user gesture
    await requestFullscreen();

    setPhase('loading');
    try {
      // Use the newly renamed CSV RPC with explicit user ID to prevent phantom data bug
      const { data, error } = await supabase.rpc('fn_start_csv_exam', { 
        p_test_id: testId,
        p_user_id: user?.id
      });
      if (error) throw error;
      setAttemptId(data.attempt_id);
      setQuestions(data.csv_questions || []);
      setTimeLeft((data.duration_minutes || 20) * 60);
      startTimeRef.current = Date.now();
      setPhase('exam');
    } catch (err) {
      setError(err.message || 'Failed to start exam');
      setPhase('rules');
    }
  };

  // Timer
  useEffect(() => {
    if (phase !== 'exam') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { submitExam(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, submitExam]);

  // ANTI-CHEATING: Tab/visibility detection
  // Only visibilitychange is used - window 'blur' was removed as it fires
  // on any browser interaction and caused false tab-switch detections.
  useEffect(() => {
    if (phase !== 'exam') return;
    const onVisChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const next = prev + 1;
          if (next >= 5) { submitExam(false); }
          return next;
        });
        showWarningBanner('tab');
      }
    };
    document.addEventListener('visibilitychange', onVisChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [phase, submitExam, showWarningBanner]);

  // ANTI-CHEATING: Fullscreen exit detection
  useEffect(() => {
    if (phase !== 'exam') return;
    const onFsChange = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      setFullscreenActive(isFs);
      if (!isFs) {
        setShowExitOverlay(true);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    document.addEventListener('MSFullscreenChange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
      document.removeEventListener('MSFullscreenChange', onFsChange);
    };
  }, [phase]);

  // ANTI-CHEATING: Block right-click, copy, paste, keyboard shortcuts
  useEffect(() => {
    if (phase !== 'exam') return;
    const prevent = (e) => e.preventDefault();
    const blockKeys = (e) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+P, F12
      if ((e.ctrlKey && ['c','v','a','p','u','s'].includes(e.key.toLowerCase())) || e.key === 'F12') {
        e.preventDefault();
        showWarningBanner('tab');
      }
    };
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('paste', prevent);
    document.addEventListener('keydown', blockKeys);
    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('paste', prevent);
      document.removeEventListener('keydown', blockKeys);
    };
  }, [phase, showWarningBanner]);

  // showWarningBanner moved above useEffects

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const answered = Object.keys(answers).filter(k => answers[k]).length;

  // ==================== LOADING ====================
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center"><div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" /><p className="text-surface-700">Loading exam...</p></div>
      </div>
    );
  }

  // ==================== RULES SCREEN ====================
  if (phase === 'rules') {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-xl w-full text-center animate-scaleIn">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center shadow-xl">
            <Shield className="w-8 h-8 md:w-10 md:h-10 text-gold-400" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900 mb-2">{testInfo?.title || 'NCC Exam'}</h1>
          <p className="text-surface-700 text-sm md:text-base mb-4 md:mb-6">{testInfo?.description || 'Read the instructions carefully'}</p>

          {error && <div className="bg-danger-bg text-danger p-3 rounded-xl mb-4 text-sm font-bold border border-danger/20">{error}</div>}

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            <div className="ncc-glass-card p-4 text-left border-l-4 border-l-warning">
              <h4 className="font-bold text-navy-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Exam Details</h4>
              <ul className="space-y-1.5 text-xs text-surface-700 font-medium">
                <li>Duration: {testInfo?.duration_minutes || 20} min</li>
                <li>Questions: {testInfo?.question_count || 10} Q</li>
                <li>Passing: {testInfo?.passing_score || 60}%</li>
              </ul>
            </div>
            <div className="ncc-glass-card p-4 text-left border-l-4 border-l-danger">
              <h4 className="font-bold text-navy-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Security</h4>
              <ul className="space-y-1.5 text-xs text-danger/80 font-medium">
                <li>Fullscreen Enforced</li>
                <li>Tab Switching Forbidden</li>
                <li>Shortcuts Disabled</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 mb-6">
             <div className="p-4 rounded-xl bg-gold-500/5 border-2 border-dashed border-gold-500/20 text-sm text-surface-700">
               <p className="mb-2">Clicking <strong>Start Exam</strong> will automatically request Fullscreen mode. If it fails, please use the button below or ensure you have not blocked popups.</p>
               {!document.fullscreenElement && (
                <button 
                  onClick={async () => {
                    try {
                      const elem = document.documentElement;
                      if (elem.requestFullscreen) await elem.requestFullscreen();
                      else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
                      else if (elem.msRequestFullscreen) await elem.msRequestFullscreen();
                    } catch { setError("Fullscreen request blocked by browser. Please click Start Exam directly."); }
                  }}
                  className="w-full py-2 px-4 rounded-lg bg-white border border-gold-500/30 text-gold-600 font-bold text-xs hover:bg-gold-50 transition cursor-pointer"
                >
                  Authorize Fullscreen Now
                </button>
               )}
             </div>
          </div>

          <button 
            onClick={startExam} 
            disabled={phase === 'loading'}
            className="ncc-btn ncc-btn-accent px-8 md:px-10 py-4 text-lg font-black tracking-wide cursor-pointer w-full shadow-[0_10px_20px_-10px_rgba(200,169,81,0.5)] active:translate-y-0.5 transition-all"
          >
            {phase === 'loading' ? 'Entering Room...' : 'I UNDERSTAND, START EXAM'}
          </button>
          
          <button onClick={() => navigate(-1)} className="block mx-auto mt-6 text-sm text-surface-500 hover:text-navy-900 cursor-pointer font-medium">Exit and Go Back</button>
        </div>
      </div>
    );
  }

  // ==================== RESULTS SCREEN ====================
  if (phase === 'results' || phase === 'submitting') {
    const score = result?.score ?? 0;
    const total = result?.total ?? 0;
    const percentage = result?.percentage ?? (total > 0 ? Math.round((score / total) * 100) : 0);
    const passed = percentage >= (testInfo?.passing_score || 60);
    
    // If we have an error and no result data, show the error
    if (error && !result) {
      return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-danger/10">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-navy-900 mb-2">Submission Failed</h2>
            <p className="text-surface-600 mb-6 text-sm">{error}</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => submitExam(false)} className="ncc-btn ncc-btn-accent w-full">Try Submitting Again</button>
              <button onClick={() => navigate('/practice-tests')} className="ncc-btn ncc-btn-ghost w-full">Back to Tests</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4 md:p-6">
        <div className="text-center animate-fadeIn max-w-md w-full">
          {phase === 'submitting' ? (
            <><div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" /><p className="text-surface-700">Grading your exam...</p></>
          ) : (
            <>
              <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-black ${passed ? 'bg-mgreen-600' : 'bg-danger'}`}>
                {percentage}%
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-navy-900 mb-2">{passed ? '🎉 You Passed!' : 'Keep Practicing!'}</h2>
              <p className="text-surface-700 mb-2 text-sm md:text-base">You scored {result?.total_correct || score} out of {result?.total_questions || total}</p>
              {tabSwitches > 0 && <p className="text-warning text-sm mb-2">⚠️ {tabSwitches} tab switch(es) detected</p>}
              {result?.status === 'flagged' && <p className="text-danger text-sm font-medium mb-2">🚩 Attempt flagged for review</p>}
              {result?.timed_out && <p className="text-warning text-sm mb-2">⏱ Auto-submitted (time expired)</p>}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <button onClick={async () => {
                  if (!attemptId) {
                    setError('Error: Attempt ID lost. Please contact support.');
                    return;
                  }
                  if (refreshProfile) await refreshProfile();
                  navigate(`/exam-results/${attemptId}`);
                }} className="ncc-btn ncc-btn-primary w-full sm:w-auto">View Detailed Results</button>
                <button onClick={() => navigate('/practice-tests')} className="ncc-btn ncc-btn-ghost w-full sm:w-auto">Back to Tests</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ==================== EXAM INTERFACE ====================
  const q = csv_questions[currentQ];
  if (!q) return null;

  const getSafeOptions = (opts) => {
    if (Array.isArray(opts)) return opts;
    if (typeof opts === 'string') {
      const parsed = safeJsonParse(opts, []);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  };
  const safeOptions = getSafeOptions(q.options);

  return (
    <div className="exam-mode flex flex-col select-none" style={{userSelect:'none'}}>
      {/* Warning banners */}
      {showWarning && (
        <div className="fixed top-2 left-2 right-2 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-auto z-[10000] bg-danger text-white px-4 md:px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slideInUp text-sm">
          <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span>{showWarning === 'tab' ? `Tab switch! (${tabSwitches}/5)` : 'Return to fullscreen!'}</span>
        </div>
      )}

      {/* Fullscreen re-enter overlay */}
      {showWarning === 'fullscreen' && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
          <div className="text-center text-white">
            <Maximize className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-gold-400" />
            <h2 className="text-lg md:text-xl font-bold mb-2">Fullscreen Required</h2>
            <p className="text-white/70 mb-4 text-sm">Please return to fullscreen to continue</p>
            <button onClick={() => { document.documentElement.requestFullscreen().catch(()=>{}); setShowWarning(null); }}
              className="ncc-btn ncc-btn-accent">Re-enter Fullscreen</button>
          </div>
        </div>
      )}

      {/* Mobile question navigator drawer */}
      {showMobileNav && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[9998] lg:hidden" onClick={() => setShowMobileNav(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white rounded-t-2xl p-4 pb-6 shadow-2xl animate-slideInUp lg:hidden" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
            <div className="w-10 h-1 bg-surface-200 rounded-full mx-auto mb-4" />
            <h3 className="text-sm font-bold text-navy-900 mb-3">Question Navigator</h3>
            <div className="grid grid-cols-8 gap-2 mb-4">
              {csv_questions.map((qq, i) => (
                <button key={i} onClick={() => { setCurrentQ(i); setShowMobileNav(false); }}
                  className={`w-full aspect-square rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center ${
                    i === currentQ ? 'bg-navy-900 text-white' :
                    answers[qq?.id] ? 'bg-mgreen-600/20 text-mgreen-600' :
                    flagged.has(qq?.id) ? 'bg-warning-bg text-warning border border-warning/30' :
                    'bg-surface-100 text-surface-700'
                  }`}>{i + 1}</button>
              ))}
            </div>
            <div className="flex gap-3 text-xs text-surface-700">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-mgreen-600/20" /> Answered ({answered})</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-warning-bg border border-warning/30" /> Flagged ({flagged.size})</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-surface-100" /> Left ({csv_questions.length - answered})</div>
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div className="h-12 md:h-14 bg-white border-b border-surface-200 flex items-center justify-between px-3 md:px-6 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <Shield className="w-4 h-4 md:w-5 md:h-5 text-navy-900" />
          <span className="font-bold text-navy-900 text-xs md:text-sm hidden sm:inline">NCC Exam</span>
          {tabSwitches > 0 && <span className="ncc-badge bg-danger-bg text-danger text-[10px]">⚠ {tabSwitches}</span>}
        </div>
        <div className={`flex items-center gap-1.5 md:gap-2 font-mono font-bold text-base md:text-lg ${timeLeft < 120 ? 'text-danger animate-pulse' : timeLeft < 300 ? 'text-warning' : 'text-navy-900'}`}>
          <Clock className="w-4 h-4 md:w-5 md:h-5" /> {formatTime(timeLeft)}
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-xs md:text-sm text-surface-700 hidden sm:inline">{answered}/{csv_questions.length}</span>
          {/* Mobile navigator toggle */}
          <button onClick={() => setShowMobileNav(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-surface-100 cursor-pointer">
            <Grid3X3 className="w-5 h-5 text-surface-700" />
          </button>
          <button onClick={() => setShowConfirmSubmit(true)} className="ncc-btn ncc-btn-accent py-1.5 px-3 md:px-4 text-xs md:text-sm cursor-pointer min-h-[36px]">
            <Send className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Warning Bar */}
      {!fullscreenActive && phase === 'exam' && (
        <div className="bg-danger/10 border-b border-danger/20 px-6 py-2 flex items-center justify-between flex-shrink-0">
          <p className="text-danger text-[10px] md:text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> SECURITY ALERT: Fullscreen is disabled. Please re-enable it to continue.
          </p>
          <button onClick={requestFullscreen} className="text-[10px] bg-danger text-white px-3 py-1 rounded-lg font-black uppercase tracking-wider">
            Enable Fullscreen
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Question area */}
        <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full flex-1">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 flex-wrap">
              <span className="ncc-badge bg-navy-900/10 text-navy-900">Q{currentQ + 1}/{csv_questions.length}</span>
              {q.topic_tag && <span className="ncc-badge bg-info-bg text-info">{q.topic_tag}</span>}
              {q.difficulty && <span className={`ncc-badge ${q.difficulty === 'hard' ? 'bg-danger-bg text-danger' : q.difficulty === 'medium' ? 'bg-gold-500/10 text-gold-600' : 'bg-mgreen-600/10 text-mgreen-600'}`}>{q.difficulty}</span>}
              {flagged.has(q.id) && <span className="ncc-badge bg-warning-bg text-warning">Flagged</span>}
            </div>

            <h2 className="text-lg md:text-xl font-bold text-navy-900 mb-5 md:mb-8">{q.question_text}</h2>

            <div className="space-y-2.5 md:space-y-3">
              {safeOptions.map((opt, i) => (
                <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                  className={`w-full text-left p-3 md:p-4 rounded-xl border-2 transition font-medium cursor-pointer text-sm md:text-base ${
                    answers[q.id] === opt ? 'border-gold-500 bg-gold-500/10 text-navy-900' : 'border-surface-200 hover:border-surface-300 text-surface-700 hover:bg-surface-50'
                  }`}>
                  <span className={`inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm mr-2 md:mr-3 ${answers[q.id] === opt ? 'bg-gold-500 text-navy-950 font-bold' : 'bg-surface-100 text-surface-700'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>{opt}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto w-full flex items-center justify-between mt-6 md:mt-8 pt-4 md:pt-6 border-t border-surface-200">
            <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0} className="ncc-btn ncc-btn-ghost cursor-pointer text-sm min-h-[40px]"><ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Previous</span></button>
            <button onClick={() => { const s = new Set(flagged); s.has(q.id) ? s.delete(q.id) : s.add(q.id); setFlagged(s); }}
              className={`ncc-btn ncc-btn-ghost cursor-pointer text-sm min-h-[40px] ${flagged.has(q.id) ? 'text-warning border-warning/30' : ''}`}>
              <Flag className="w-4 h-4" /> <span className="hidden sm:inline">{flagged.has(q.id) ? 'Unflag' : 'Flag'}</span>
            </button>
            <button onClick={() => setCurrentQ(p => Math.min(csv_questions.length - 1, p + 1))} disabled={currentQ === csv_questions.length - 1} className="ncc-btn ncc-btn-primary cursor-pointer text-sm min-h-[40px]"><span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Desktop question navigator */}
        <div className="w-64 bg-white border-l border-surface-200 p-4 overflow-y-auto hidden lg:block">
          <h3 className="text-sm font-bold text-navy-900 mb-3">Navigator</h3>
          <div className="grid grid-cols-5 gap-2">
            {csv_questions.map((qq, i) => (
              <button key={i} onClick={() => setCurrentQ(i)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer ${
                  i === currentQ ? 'bg-navy-900 text-white' :
                  answers[qq?.id] ? 'bg-mgreen-600/20 text-mgreen-600' :
                  flagged.has(qq?.id) ? 'bg-warning-bg text-warning border border-warning/30' :
                  'bg-surface-100 text-surface-700 hover:bg-surface-200'
                }`}>{i + 1}</button>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-xs text-surface-700">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-mgreen-600/20" /> Answered ({answered})</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-warning-bg border border-warning/30" /> Flagged ({flagged.size})</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-surface-100" /> Unanswered ({csv_questions.length - answered})</div>
          </div>
        </div>
      </div>
      {/* Security Interruption Overlay */}
      {showExitOverlay && (
        <div className="fixed inset-0 z-[1000] bg-navy-900/95 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl animate-scaleIn">
            <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-danger" />
            </div>
            <h2 className="text-2xl font-black text-navy-900 mb-4">Security Interruption</h2>
            <p className="text-surface-700 mb-8 leading-relaxed">
              The exam has been paused because you exited fullscreen mode. To maintain integrity, you must be in fullscreen to continue.
            </p>
            <button 
              onClick={requestFullscreen}
              className="ncc-btn ncc-btn-primary w-full py-4 text-lg cursor-pointer"
            >
              Re-enter Fullscreen & Continue
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-[1000] bg-navy-900/60 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 md:p-8 text-center shadow-2xl animate-scaleIn">
            <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-gold-500" />
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-2">Submit Exam?</h3>
            <p className="text-surface-700 text-sm mb-6">
              Are you sure you want to finish and submit your answers? You cannot change them after this.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmSubmit(false)}
                className="ncc-btn ncc-btn-ghost flex-1 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => submitExam(false)}
                className="ncc-btn ncc-btn-accent flex-1 cursor-pointer"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
