import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import nccLogo from '../assets/ncc-seeklogo.png';
import paradeImg from '../assets/pexels-pramodtiwari-13315966.jpg';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ cadets: '500+', courses: '50+' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const { count: cadetCount } = await supabase.from('cadet_profiles').select('*', { count: 'exact', head: true });
      const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
      
      setStats({
        cadets: cadetCount ? `${cadetCount}+` : '500+',
        courses: courseCount ? `${courseCount}+` : '50+'
      });
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
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-gold-400 font-bold text-2xl">{stats.cadets}</div>
              <div className="text-white/60">Cadets</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-gold-400 font-bold text-2xl">{stats.courses}</div>
              <div className="text-white/60">Courses</div>
            </div>
            <div className="w-px bg-white/20" />
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

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8">
            <img src={nccLogo} alt="NCC" className="w-9 md:w-11 h-auto" />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-navy-900">NCC Digital</h1>
              <p className="text-[10px] md:text-xs text-gold-600 font-medium uppercase tracking-wider leading-none">Training Platform</p>
            </div>
          </div>

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
              <label htmlFor="password" className="ncc-label">Password</label>
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
