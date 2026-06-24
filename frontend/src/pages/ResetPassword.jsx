import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import nccLogo from '../assets/ncc-seeklogo.png';
import paradeImg from '../assets/pexels-pramodtiwari-13315966.jpg';
import ThemeToggle from '../components/ThemeToggle';
import { useSEO } from '../hooks/useSEO';

export default function ResetPassword() {
  useSEO({
    title: 'Reset Password',
    description: 'Set a new password for your National Cadet Corps (NCC) Digital Training Portal account.',
    keywords: 'NCC, Reset Password, Digital Training Portal',
    canonicalUrl: 'https://ncc-digital-training.vercel.app/reset-password'
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase Auth automatically parses the hash fragment tokens from the reset link 
    // and sets a temporary session for the user. We verify if a session is active.
    const checkSession = async () => {
      try {
        // Exchange authorization code for a session (required for PKCE flow)
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setError(`Authentication failed: ${error.message}`);
            setVerifyingSession(false);
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('No active password reset session found. The reset link may have expired or is invalid.');
        }
      } catch (err) {
        setError(err.message || 'An unexpected error occurred during session verification.');
      } finally {
        setVerifyingSession(false);
      }
    };
    checkSession();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center items-center p-12">
        <img src={paradeImg} alt="NCC Parade" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/90 via-navy-900/85 to-navy-800/80" />
        
        <div className="relative z-10 text-center max-w-md">
          <img src={nccLogo} alt="NCC Crest" className="w-28 h-auto mx-auto mb-6 drop-shadow-2xl animate-float" />
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">NCC Digital</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Securely update your authentication credentials for the training portal.
          </p>
        </div>
        <div className="absolute bottom-8 text-center text-white/40 text-xs">
          Unity and Discipline • National Cadet Corps
        </div>
      </div>

      {/* Right Panel - Password Update Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50 dark:bg-navy-950 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md animate-fadeIn relative z-10 ncc-glass-card p-8 md:p-10 border border-surface-200 dark:border-white/10 shadow-2xl">
          {/* Logo on mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src={nccLogo} alt="NCC Logo" className="w-10 h-auto" />
            <div>
              <h1 className="text-xl font-bold text-navy-900">NCC Digital</h1>
              <p className="text-xs text-gold-600 font-semibold uppercase tracking-wider leading-none">Security Center</p>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-navy-900 mb-1">Set New Password</h2>
          <p className="text-sm md:text-base text-surface-700 mb-6 md:mb-8">Establish a secure, strong password for your cadet account</p>

          {verifyingSession ? (
            <div className="py-10 text-center flex flex-col items-center gap-3">
              <div className="ncc-loader" />
              <p className="text-surface-600 font-medium text-xs animate-pulse">Verifying reset token...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-danger-bg border border-danger/20 text-danger p-3 rounded-xl mb-6 text-sm font-medium animate-slideInUp">
                  {error}
                </div>
              )}

              {success ? (
                <div className="bg-success-bg border border-success/20 text-success p-5 rounded-xl mb-6 text-sm font-medium animate-slideInUp text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-success-bg flex items-center justify-center mx-auto border border-success/30">
                    <ShieldCheck className="w-6 h-6 text-success" />
                  </div>
                  <h3 className="font-bold text-base text-navy-900">Password Updated Successfully</h3>
                  <p className="text-xs">Your credentials have been updated. Redirecting to your command dashboard...</p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label htmlFor="password" className="ncc-label">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="ncc-input ncc-input-icon pr-10"
                        placeholder="Min 6 characters"
                        required
                        autoComplete="new-password"
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

                  <div>
                    <label htmlFor="confirmPassword" className="ncc-label">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="ncc-input ncc-input-icon pr-10"
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="ncc-btn ncc-btn-primary w-full py-3 text-[15px]">
                    {loading ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</span>
                    ) : (
                      <span className="flex items-center gap-2">Update Password <ArrowRight className="w-4 h-4" /></span>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {!success && (
            <div className="mt-8 text-center">
              <Link to="/login" className="text-xs font-bold text-surface-600 hover:text-navy-950 flex items-center gap-1 justify-center">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
