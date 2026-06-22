import { useState } from 'react';
import { supabase } from '../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Hash, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import nccLogo from '../assets/ncc-seeklogo.png';
import paradeImg2 from '../assets/pexels-pramodtiwari-13316131.jpg';
import ThemeToggle from '../components/ThemeToggle';
import { useSEO } from '../hooks/useSEO';

export default function Register() {
  useSEO({
    title: 'Cadet Enrollment',
    description: 'Enroll in the National Cadet Corps (NCC) Digital Training Portal to start your training curriculum.',
    keywords: 'NCC, Enroll, Register, Cadet Enrollment, Digital Training Portal',
    canonicalUrl: 'https://ncc-digital-training.vercel.app/register'
  });

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [nccNumber, setNccNumber] = useState('');
  const [wing, setWing] = useState('Army');
  const [certificateLevel, setCertificateLevel] = useState('A');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          role: 'cadet',
          full_name: fullName,
          ncc_number: nccNumber,
          wing,
          certificate_level: certificateLevel
        }
      }
    });

    if (signUpError) { 
      setError(signUpError.message); 
    } else if (data.session) {
      navigate('/dashboard');
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 md:p-6">
        <div className="w-full max-w-md text-center animate-fadeIn">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-success-bg flex items-center justify-center">
            <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-success" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-navy-900 mb-2">Registration Successful!</h2>
          <p className="text-surface-700 mb-4 md:mb-6 text-sm md:text-base">Check your email to verify your account, then log in to begin your training.</p>
          <Link to="/login" className="ncc-btn ncc-btn-primary px-8 py-3 w-full sm:w-auto">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 md:p-6">
      {/* Background image */}
      <img src={paradeImg2} alt="NCC Cadets" className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-40 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-surface-50/40 dark:bg-navy-950/70 backdrop-blur-[2px] transition-colors duration-300" />
      
      {/* Home / Back button floating on top-left of the screen */}
      <Link to="/" className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-surface-200 dark:border-white/10 bg-white/60 dark:bg-navy-900/40 backdrop-blur-md text-xs font-bold text-surface-700 dark:text-slate-300 hover:text-navy-950 dark:hover:text-white transition-all shadow-md">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      {/* Theme Toggle at top right */}
      <div className="absolute top-4 right-4 z-20 bg-white/20 dark:bg-navy-900/40 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg animate-fadeIn relative z-10">
        <div className="flex items-center justify-center gap-3 mb-5 md:mb-8">
          <img src={nccLogo} alt="NCC" className="w-9 md:w-11 h-auto" />
          <div>
            <h1 className="text-lg md:text-xl font-bold text-navy-900 dark:text-white transition-colors">NCC Digital</h1>
            <p className="text-[10px] md:text-xs text-gold-600 font-medium uppercase tracking-wider">Cadet Registration</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-5 md:mb-8">
          <div className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${step >= 1 ? 'bg-navy-900 text-white' : 'bg-surface-200 text-surface-700'}`}>
            <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] md:text-xs">{step > 1 ? '✓' : '1'}</span> Account
          </div>
          <div className="w-5 md:w-8 h-0.5 bg-surface-200 transition-colors" />
          <div className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${step >= 2 ? 'bg-navy-900 text-white' : 'bg-surface-200 text-surface-700'}`}>
            <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] md:text-xs">2</span> Details
          </div>
        </div>

        {error && (
          <div className="bg-danger-bg border border-danger/20 text-danger p-3 rounded-xl mb-6 text-sm font-medium">{error}</div>
        )}

        <div className="ncc-glass-card p-8">
          {step === 1 ? (
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              if (password !== confirmPassword) {
                setError('Passwords do not match. Please re-enter them.');
                return;
              }
              setError(null);
              setStep(2); 
            }} className="space-y-5">
              <h2 className="text-xl font-bold text-navy-900 dark:text-white transition-colors mb-1">Create your account</h2>
              <p className="text-surface-700 text-sm mb-4">Enter your credentials to get started</p>
              <div>
                <label htmlFor="fullName" className="ncc-label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="ncc-input ncc-input-icon"
                    placeholder="Enter your full name"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
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
                    placeholder="your.email@gmail.com"
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
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="ncc-input ncc-input-icon"
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="ncc-label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="ncc-input ncc-input-icon"
                    placeholder="Re-enter password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <button type="submit" className="ncc-btn ncc-btn-primary w-full py-3">
                <span className="flex items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <h2 className="text-xl font-bold text-navy-900 dark:text-white transition-colors mb-1">NCC Details</h2>
              <p className="text-surface-700 text-sm mb-4">Provide your NCC registration information</p>
              <div>
                <label htmlFor="nccNumber" className="ncc-label">NCC Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                  <input
                    id="nccNumber"
                    name="nccNumber"
                    type="text"
                    value={nccNumber}
                    onChange={e => setNccNumber(e.target.value)}
                    className="ncc-input ncc-input-icon"
                    placeholder="e.g. AP/SW/01/12345"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="wing" className="ncc-label">Wing</label>
                  <select
                    id="wing"
                    name="wing"
                    value={wing}
                    onChange={e => setWing(e.target.value)}
                    className="ncc-input ncc-select"
                  >
                    <option value="Army">🟤 Army</option>
                    <option value="Navy">🔵 Navy</option>
                    <option value="Air Force">✈️ Air Force</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="cert" className="ncc-label">Certificate Level</label>
                  <select
                    id="cert"
                    name="cert"
                    value={certificateLevel}
                    onChange={e => setCertificateLevel(e.target.value)}
                    className="ncc-input ncc-select"
                  >
                    <option value="A">A Certificate</option>
                    <option value="B">B Certificate</option>
                    <option value="C">C Certificate</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="ncc-btn ncc-btn-ghost flex-1 py-3">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" disabled={loading} className="ncc-btn ncc-btn-accent flex-1 py-3">
                  {loading ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-surface-700">
          Already have an account? <Link to="/login" className="text-gold-600 hover:text-gold-500 font-semibold">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
