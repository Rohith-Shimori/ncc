import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import nccLogo from '../assets/ncc-seeklogo.png';
import paradeImg from '../assets/pexels-pramodtiwari-13315966.jpg';
import ThemeToggle from '../components/ThemeToggle';
import { useSEO } from '../hooks/useSEO';

// Animated CountUp component for rolling number stats
function CountUp({ end }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const endVal = parseInt(end, 10);
    if (isNaN(endVal)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(end);
      return;
    }
    
    let start = 0;
    const duration = 1000; // 1 second rollup
    const increment = endVal / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= endVal) {
        setCount(endVal);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [end]);

  return <span>{count}+</span>;
}

export default function Login() {
  useSEO({
    title: 'Cadet Login',
    description: 'Login to the National Cadet Corps (NCC) Digital Training Portal to access study resources and mock tests.',
    keywords: 'NCC, Login, Cadet Login, Digital Training Portal',
    canonicalUrl: 'https://ncc-digital-training.vercel.app/login'
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Stale-while-revalidate caching to eliminate metric lag
  const [stats, setStats] = useState(() => {
    try {
      const cached = localStorage.getItem('ncc_public_stats');
      if (cached) return JSON.parse(cached);
    } catch { /* empty */ }
    return { cadets: null, courses: null };
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/public/stats`);
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            const formatted = {
              cadets: 15420 + (data.cadets || 0),
              courses: data.courses || 12
            };
            setStats(formatted);
            localStorage.setItem('ncc_public_stats', JSON.stringify({
              ...formatted,
              wings: data.wings || 3
            }));
          }
        }
      } catch (err) {
        console.warn('[Login Stats] Failed to fetch live metrics:', err);
      }
    };
    fetchStats();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); }
    else { navigate('/dashboard'); }
    setLoading(false);
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetSuccess(false);
    
    try {
      // 1. Verify if email exists in database
      const { data: emailExists, error: checkError } = await supabase.rpc('fn_check_email_exists', {
        p_email: email
      });

      if (checkError) {
        throw new Error(checkError.message);
      }

      if (!emailExists) {
        setError('No account registered with this email address.');
        setLoading(false);
        return;
      }

      // 2. Redirect back to this website's /reset-password route
      const redirectToUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectToUrl
      });
      
      if (error) {
        setError(error.message);
      } else {
        setResetSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Theme Toggle at top right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center items-center p-12">
        {/* Background image */}
        <img src={paradeImg} alt="NCC Cadets" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/90 via-navy-900/85 to-navy-800/80" />
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold-400/30 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-gold-400/20 rounded-full animate-float" style={{animationDelay:'1s'}} />
        <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-gold-400/25 rounded-full animate-float" style={{animationDelay:'2s'}} />

        <div className="relative z-10 text-center max-w-md">
          <img src={nccLogo} alt="NCC Crest" className="w-28 h-auto mx-auto mb-6 drop-shadow-2xl animate-float" />
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">NCC Digital Training</h1>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            The premier digital learning and assessment platform for National Cadet Corps cadets.
          </p>
          <div className="flex justify-center gap-6 text-sm min-h-[56px] items-center">
            {stats.cadets === null ? (
              <div className="text-center flex flex-col items-center gap-1.5 w-16">
                <div className="w-10 h-6 ncc-skeleton bg-white/10" />
                <div className="text-white/40 text-xs">Cadets</div>
              </div>
            ) : (
              <div className="text-center animate-fadeIn">
                <div className="text-gold-400 font-bold text-2xl">
                  <CountUp end={stats.cadets} />
                </div>
                <div className="text-white/60">Cadets</div>
              </div>
            )}
            
            <div className="w-px h-8 bg-white/20" />
            
            {stats.courses === null ? (
              <div className="text-center flex flex-col items-center gap-1.5 w-16">
                <div className="w-10 h-6 ncc-skeleton bg-white/10" />
                <div className="text-white/40 text-xs">Courses</div>
              </div>
            ) : (
              <div className="text-center animate-fadeIn">
                <div className="text-gold-400 font-bold text-2xl">
                  <CountUp end={stats.courses} />
                </div>
                <div className="text-white/60">Courses</div>
              </div>
            )}
            
            <div className="w-px h-8 bg-white/20" />
            
            <div className="text-center">
              <div className="text-gold-400 font-bold text-2xl">3</div>
              <div className="text-white/60">Wings</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 text-center text-white/40 text-xs">
          Unity and Discipline • National Cadet Corps
        </div>
      </div>

      {/* Home / Back button floating on top-left of the screen */}
      <Link to="/" className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-surface-200 dark:border-white/10 bg-white/60 dark:bg-navy-900/40 backdrop-blur-md text-xs font-bold text-surface-700 dark:text-slate-300 hover:text-navy-950 dark:hover:text-white transition-all shadow-md">
        <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Home</span>
      </Link>

      {/* Right Panel - Login Form inside an elegant Glassmorphic Card */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50 dark:bg-navy-950 relative overflow-hidden">
        {/* Ambient mesh background glow in the login form panel */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md animate-fadeIn relative z-10 ncc-glass-card p-8 md:p-10 border border-surface-200 dark:border-white/10 shadow-2xl">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8">
            <img src={nccLogo} alt="NCC" className="w-9 md:w-11 h-auto" />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-navy-900">NCC Digital</h1>
              <p className="text-[10px] md:text-xs text-gold-600 font-medium uppercase tracking-wider leading-none">Training Platform</p>
            </div>
          </div>

          {isForgotMode ? (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-navy-900 mb-1">Reset Password</h2>
              <p className="text-sm md:text-base text-surface-700 mb-6 md:mb-8">Enter your email to receive a secure password reset link</p>

              {error && (
                <div className="bg-danger-bg border border-danger/20 text-danger p-3 rounded-xl mb-6 text-sm font-medium animate-slideInUp">
                  {error}
                </div>
              )}

              {resetSuccess ? (
                <div className="bg-success-bg border border-success/20 text-success p-4 rounded-xl mb-6 text-sm font-medium animate-slideInUp text-center space-y-4">
                  <p>A secure reset link has been dispatched to your email address.</p>
                  <button 
                    type="button" 
                    onClick={() => { setIsForgotMode(false); setResetSuccess(false); setError(null); }}
                    className="ncc-btn ncc-btn-primary w-full py-2.5 text-xs uppercase"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetRequest} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="ncc-label">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="ncc-input ncc-input-icon"
                        placeholder="cadet@example.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => { setIsForgotMode(false); setError(null); }}
                      className="ncc-btn ncc-btn-ghost flex-1 py-3 text-xs uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={loading}
                      className="ncc-btn ncc-btn-accent flex-1 py-3 text-xs uppercase cursor-pointer">
                      {loading ? (
                        <span className="flex items-center justify-center gap-1.5"><span className="w-3.5 h-3.5 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" /> Dispatched...</span>
                      ) : (
                        <span>Send Reset Link</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-navy-900 mb-1">Welcome back</h2>
              <p className="text-sm md:text-base text-surface-700 mb-6 md:mb-8">Sign in to continue your training</p>

              {error && (
                <div className="bg-danger-bg border border-danger/20 text-danger p-3 rounded-xl mb-6 text-sm font-medium animate-slideInUp">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="email" className="ncc-label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="ncc-input ncc-input-icon"
                      placeholder="cadet@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="ncc-label mb-0">Password</label>
                    <button 
                      type="button" 
                      onClick={() => { setIsForgotMode(true); setError(null); }}
                      className="text-xs font-semibold text-gold-600 hover:text-gold-500 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="ncc-input ncc-input-icon pr-10"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-300 hover:text-navy-900 transition cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="ncc-btn ncc-btn-primary w-full py-3 text-[15px]">
                  {loading ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</span>
                  ) : (
                    <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-8 text-center text-sm text-surface-700">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-600 hover:text-gold-500 font-semibold">
              Register as Cadet
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
