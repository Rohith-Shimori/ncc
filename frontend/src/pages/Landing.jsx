import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { useSEO } from '../hooks/useSEO';
import nccLogo from '../assets/ncc-seeklogo.png';
import paradeImg from '../assets/pexels-pramodtiwari-13315966.jpg';
import ThemeToggle from '../components/ThemeToggle';
import {
  Shield,
  Award,
  Users,
  ArrowRight,
  Calendar,
  ChevronDown,
  Check,
  ChevronRight,
  Star,
  Compass,
  Plane,
  Target,
  Quote,
  GraduationCap,
  Clock,
  RotateCcw,
  HelpCircle,
  Trophy,
  Menu,
  X
} from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Inject SEO metadata dynamically
  useSEO({
    title: 'National Cadet Corps (NCC) Digital Training Portal',
    description: 'An interactive digital learning portal for school and college cadets under the National Cadet Corps (NCC) of India. Access study material, mock tests, and performance tracking.',
    keywords: 'NCC, National Cadet Corps, India, Army Wing, Navy Wing, Air Wing, Mock Exams, Unity and Discipline, Cadets',
    canonicalUrl: 'https://ncc-digital-training.vercel.app/'
  });

  // Schema.org Structured Data
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    'name': 'National Cadet Corps (NCC) Digital Training Portal',
    'alternateName': 'NCC Digital Training',
    'description': 'Official Digital Training Portal for National Cadet Corps cadets across India, specializing in Tri-Services training, curriculum syllabus, and online mock certificates testing.',
    'url': 'https://ncc-digital-training.vercel.app/',
    'logo': 'https://ncc-digital-training.vercel.app/ncc-logo.png',
    'motto': 'Unity and Discipline (Ekta aur Anushasan)',
    'foundingDate': '1948-07-15',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'New Delhi',
      'addressCountry': 'IN'
    }
  };

  // State for dynamic stats
  const [stats, setStats] = useState(() => {
    try {
      const cached = localStorage.getItem('ncc_public_stats');
      if (cached) return JSON.parse(cached);
    } catch { /* empty */ }
    return { cadets: 0, courses: 12, wings: 3 };
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/public/stats`);
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            const formatted = {
              cadets: data.cadets !== undefined && data.cadets !== null ? data.cadets : 0,
              courses: data.courses || 12,
              wings: data.wings || 3
            };
            setStats(formatted);
            localStorage.setItem('ncc_public_stats', JSON.stringify(formatted));
          }
        }
      } catch (err) {
        console.warn('[Landing Stats] Failed to fetch live metrics:', err);
      }
    };
    fetchStats();
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'hero', name: 'Home' },
    { id: 'aims', name: 'Aims & Values' },
    { id: 'ranks', name: 'Ranks' },
    { id: 'wings', name: 'Wings' },
    { id: 'camps', name: 'Camps' },
    { id: 'certs', name: 'Certs' },
    { id: 'faq', name: 'FAQ' }
  ];

  // Scrollspy active section tracker
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const sections = ['hero', 'pledge', 'aims', 'values', 'ranks', 'wings', 'camps', 'certs', 'alumni', 'faq'];
    
    const handleScroll = () => {
      const scrollPos = window.scrollY + 250; // offset for detection
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial trigger
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProceed = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  // Interactive Pledge Reciter State
  const pledgeSentences = [
    "We the cadets of the National Cadet Corps, do solemnly pledge that we shall always uphold the unity of India.",
    "We resolve to be disciplined and responsible citizens of our nation.",
    "We shall undertake positive community service in the spirit of selflessness and concern for our fellow beings."
  ];
  const [pledgeStep, setPledgeStep] = useState(-1);
  const [pledgeCompleted, setPledgeCompleted] = useState(false);

  // Interactive Mock Exam Simulator State
  const mockQuestions = [
    {
      q: "What is the effective range of the .22 Deluxe Rifle?",
      options: ["25 Yards", "50 Yards", "100 Yards", "300 Yards"],
      ans: 0,
      hint: "Widely used for cadet target training on short ranges."
    },
    {
      q: "In which year was the National Cadet Corps (NCC) formed in India?",
      options: ["1947", "1948", "1950", "1952"],
      ans: 1,
      hint: "Formed under the National Cadet Corps Act passed in the early years of independence."
    },
    {
      q: "What is the angle formed between the feet in the attention (Savdhan) position?",
      options: ["30 Degrees", "45 Degrees", "60 Degrees", "90 Degrees"],
      ans: 0,
      hint: "Heels are kept together, with toes pointing outwards uniformly."
    }
  ];

  const [simIdx, setSimIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [simExp, setSimExp] = useState(0);
  const [simLevel, setSimLevel] = useState(1);
  const [simStreak, setSimStreak] = useState(0);

  const handleOptionClick = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    
    if (idx === mockQuestions[simIdx].ans) {
      setSimStreak(prev => prev + 1);
      const newExp = simExp + 250;
      setSimExp(newExp);
      if (newExp >= 500 && simLevel === 1) {
        setSimLevel(2);
      }
    } else {
      setSimStreak(0);
    }
  };

  const nextSimQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setSimIdx((prev) => (prev + 1) % mockQuestions.length);
  };

  // Interactive Cadet Ranks State
  const [activeRank, setActiveRank] = useState(0);
  const cadetRanks = [
    {
      title: "Cadet (Cdt)",
      badge: "Cdt",
      insignia: "Basic Shoulder Slide",
      desc: "The entry-level rank for all newly enrolled school and college cadets. Focuses on learning basic military drill, dress discipline, and foundational service subjects.",
      color: "border-slate-500/20 bg-slate-500/5 text-slate-700 dark:text-slate-300",
      accent: "bg-slate-500",
      requirements: "Enrolled in school (JD/JW) or college (SD/SW)",
      perks: "Access to training camps and basic weapons drill"
    },
    {
      title: "Lance Corporal (L/Cpl)",
      badge: "L/Cpl",
      insignia: "One Chevron on Arm",
      desc: "The first promotional rank awarded to cadets. Appointed after completing one year of active training, showing command over drills, and demonstrating basic leadership skills.",
      color: "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
      accent: "bg-amber-500",
      requirements: "6 months training + 75% attendance + drill clearance",
      perks: "Can command a section (10 cadets) during unit-level parades"
    },
    {
      title: "Corporal (Cpl)",
      badge: "Cpl",
      insignia: "Two Chevrons on Arm",
      desc: "Given to experienced senior cadets who pass specialized mock assessments. Corporals assist Section Commanders and manage section discipline.",
      color: "border-teal-500/20 bg-teal-500/5 text-teal-700 dark:text-teal-400",
      accent: "bg-teal-500",
      requirements: "1 Year Training + completed at least 1 CATC camp",
      perks: "Appointed Section Commander; leads section files during camp events"
    },
    {
      title: "Sergeant (Sgt)",
      badge: "Sgt",
      insignia: "Three Chevrons on Arm",
      desc: "A key senior rank. Sergeants manage platoon discipline, coordinate camp details, and hold significant authority in weapon training drills.",
      color: "border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-400",
      accent: "bg-blue-500",
      requirements: "2 Years Training + holds Certificate 'A' or passes 'B' mock exams",
      perks: "Commands a Platoon (30 cadets); acts as Assistant Camp Adjutant"
    },
    {
      title: "Senior Under Officer (SUO)",
      badge: "SUO",
      insignia: "Single Shoulder Star Badge",
      desc: "The ultimate cadet leadership rank. Under Officers coordinate directly with the Battalion Commanding Officer to execute parade schedules, camps, and daily training.",
      color: "border-gold-500/30 bg-gold-500/10 text-gold-700 dark:text-gold-400",
      accent: "bg-gold-500",
      requirements: "3 Years Training + holds Certificate B + attended RDC or TSC camp",
      perks: "Highest authority Cadet Commander; directs Battalion parade march-pasts"
    }
  ];

  const [promotingState, setPromotingState] = useState('idle'); // 'idle' | 'testing' | 'success'

  const handleSimulatePromotion = () => {
    if (promotingState !== 'idle') return;
    setPromotingState('testing');
    
    setTimeout(() => {
      setActiveRank((prev) => (prev + 1) % cadetRanks.length);
      setPromotingState('success');
      
      setTimeout(() => {
        setPromotingState('idle');
      }, 3000);
    }, 1800);
  };

  // Tri-Services Wing Tab State
  const [activeWing, setActiveWing] = useState('army');
  const wingDetails = {
    army: {
      name: 'Army Wing',
      motto: 'Unity and Discipline',
      color: 'from-amber-950/10 dark:from-amber-950/70 via-white dark:via-navy-900/90 to-surface-50 dark:to-navy-950 border-amber-500/20 dark:border-amber-500/30',
      badgeClass: 'ncc-badge-army',
      badgeLabel: 'Indian Army',
      description: 'The largest wing of the NCC, focused on building physical endurance, ground combat understanding, and leadership through fieldcraft, navigation, and weapon training.',
      subjects: [
        'Drill and Weapon Training (.22 Rifle & INSAS)',
        'Map Reading & judging distance',
        'Fieldcraft & Battlecraft (FC & BC)',
        'Military History & National Integration'
      ],
      camps: ['Thal Sainik Camp (TSC)', 'Combined Annual Training Camp (CATC)', 'Army Attachment Camp']
    },
    navy: {
      name: 'Naval Wing',
      motto: 'Sham No Varunah (May the Ocean Lord be Auspicious)',
      color: 'from-blue-950/10 dark:from-blue-950/70 via-white dark:via-navy-900/90 to-surface-50 dark:to-navy-950 border-blue-500/20 dark:border-blue-500/30',
      badgeClass: 'ncc-badge-navy',
      badgeLabel: 'Indian Navy',
      description: 'Fosters a love for maritime adventure and navy protocols. Cadets receive hands-on training in seamanship, boat pulling, sailing, and naval communications.',
      subjects: [
        'Seamanship & Boat Pulling basics',
        'Navigation & Chart Work',
        'Ship Modeling & marine safety',
        'Naval Communication & Semaphore signals'
      ],
      camps: ['Nau Sainik Camp (NSC)', 'Yachting Association Camps', 'Sea Attachment Camp']
    },
    airforce: {
      name: 'Air Wing',
      motto: 'Nabhah Sprsam Diptam (Touch the Sky with Glory)',
      color: 'from-sky-950/10 dark:from-sky-950/70 via-white dark:via-navy-900/90 to-surface-50 dark:to-navy-950 border-sky-400/20 dark:border-sky-400/30',
      badgeClass: 'ncc-badge-airforce',
      badgeLabel: 'Indian Air Force',
      description: 'Nurtures passion for aviation. Cadets are trained in aircraft engineering fundamentals, gliding, and flight simulators, preparing them for careers in the skies.',
      subjects: [
        'Principles of Flight & Aerodynamics',
        'Aero-Modeling (Static & Control Line)',
        'Meteorology & Air Navigation',
        'Airframe and Aero-Engine basics'
      ],
      camps: ['Vayu Sainik Camp (VSC)', 'Skeet Shooting & Gliding Camps', 'Air Force Academy Attachment']
    }
  };

  // Camp Selection Stepper State
  const [activeCampTab, setActiveCampTab] = useState('rdc');
  const campTimeline = {
    rdc: {
      title: 'Republic Day Camp (RDC) Selection',
      desc: 'The most prestigious ceremonial camp held in Delhi. Cadets march at the Rajpath (Kartavya Path) and present in front of the Prime Minister.',
      steps: [
        { title: 'Unit Selection (CATC)', detail: 'Initial screening at the battalion level assessing drill, physical fitness, and general discipline.' },
        { title: 'Inter-Group Competition (IGC)', detail: 'The toughest regional filter where the best cadets from 17 directorates compete head-to-head.' },
        { title: 'Pre-RDC Camps (I, II, III)', detail: 'Intense grooming camps focusing on Kartavya Path alignment, guard of honor, and cultural events.' },
        { title: 'National RDC Delhi', detail: 'Representing your state in New Delhi throughout January, culminating in the PM Rally and President Guard.' }
      ]
    },
    tsc: {
      title: 'Thal Sainik Camp (TSC) Selection',
      desc: 'A highly technical field training competition testing military subjects, obstacle courses, map reading, and firing grouping.',
      steps: [
        { title: 'Firing Screening', detail: 'Selection based on .22 rifle firing groupings and shooting accuracy at the unit range.' },
        { title: 'Obstacle Course mastery', detail: 'Training and timing on 10 standard military obstacles (high wall, gate vault, zig-zag).' },
        { title: 'Fieldcraft & Map Reading', detail: 'Advanced tests in day/night land navigation, compass setting, and judging distance.' },
        { title: 'National TSC Delhi', detail: 'A 12-day camp in New Delhi where elite Army wing cadets compete for the PM Banner.' }
      ]
    },
    yep: {
      title: 'Youth Exchange Programme (YEP)',
      desc: 'An international exchange delegation where selected cadet delegates represent India in friendly foreign countries to build cultural bonds.',
      steps: [
        { title: 'RDC Performance Merit', detail: 'Cadets must participate in RDC and score exceptional marks in the Best Cadet category.' },
        { title: 'Written Aptitude Test', detail: 'Testing knowledge on national history, international relations, and defense systems.' },
        { title: 'DGNCC Selection Interview', detail: 'Personality, communication, posture, and public speaking round with Senior Military Officers.' },
        { title: 'Bilateral Exchange Visit', detail: 'Traveling to partner countries (Singapore, UK, Russia, Vietnam) as youth ambassadors.' }
      ]
    }
  };

  // Alumni Quote State
  const [activeAlumni, setActiveAlumni] = useState(0);
  const alumniQuotes = [
    {
      name: 'Narendra Modi',
      role: 'Prime Minister of India (NCC Alumni #1)',
      quote: 'My training in NCC has played a very big role in instilling a sense of discipline and responsibility in my life. It gave me a perspective beyond my immediate environment.',
      bg: 'from-orange-500/5 dark:from-orange-500/10 to-orange-500/10 dark:to-orange-950/20 text-orange-950 dark:text-orange-100 border-orange-500/20'
    },
    {
      name: 'Dr. Kiran Bedi',
      role: 'First Female IPS Officer & Former Lt. Governor',
      quote: 'The NCC taught me how to lead from the front, take ownership of tasks, and serve the nation selflessly. It forms the base of disciplined police leadership.',
      bg: 'from-teal-500/5 dark:from-teal-500/10 to-teal-500/10 dark:to-teal-950/20 text-teal-950 dark:text-teal-100 border-teal-500/20'
    },
    {
      name: 'Marshal of the Air Force Arjan Singh',
      role: 'Distinguished Five-Star Air Force Commander',
      quote: 'Discipline, leadership, and comradeship are the virtues that define a cadet and lay the foundation for a lifetime of service in the armed forces.',
      bg: 'from-blue-500/5 dark:from-blue-500/10 to-blue-500/10 dark:to-blue-950/20 text-blue-950 dark:text-blue-100 border-blue-500/20'
    }
  ];

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    {
      q: "Who is eligible to join the National Cadet Corps (NCC)?",
      a: "NCC is open to school students (Junior Division/Wing, ages 12-18.5) and college/university students (Senior Division/Wing, up to age 26) who are citizens of India and meet the basic physical fitness standards."
    },
    {
      q: "What career benefits do Certificate 'C' holders receive?",
      a: "NCC 'C' certificate holders get direct entry to the SSB interview (bypassing written exams) for Indian Army (IMA, OTA), Indian Navy, and Indian Air Force officer ranks. They also receive bonus marks in CAPF, state police forces, and preferences in public sector jobs."
    },
    {
      q: "Are the mock examinations on this digital portal official?",
      a: "These simulated examinations are built on the official DGNCC syllabus, covering common subjects (Drill, Weapon Training, National Integration, Disaster Management) and special subjects for Army, Navy, and Air wings to help cadets prepare for Certificate A, B, and C written exams."
    },
    {
      q: "How does the training ranking and EXP system work?",
      a: "As you complete courses, review syllabus materials, and score high in mock tests, you earn Experience Points (EXP) which raise your Cadet Rank—from Cadet, Lance Corporal, Sergeant, up to Senior Under Officer (SUO)."
    }
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-navy-950 text-surface-900 dark:text-slate-100 flex flex-col font-sans select-none overflow-x-hidden bg-grid-pattern animate-fadeIn transition-colors duration-300">
      {/* JSON-LD Schema Script Injection */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLdData)}
      </script>



      {/* Floating Glassmorphic Header */}
      <div className="sticky top-0 z-50 w-full px-2 pt-2 sm:px-4 sm:pt-4 transition-all duration-300">
        <nav className="max-w-7xl mx-auto rounded-xl sm:rounded-2xl border border-surface-200/60 dark:border-white/10 bg-white/70 dark:bg-navy-950/70 backdrop-blur-lg shadow-lg dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] px-3 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between transition-all duration-300 hover:border-gold-500/20 dark:hover:border-gold-500/30">
          <div className="flex items-center gap-3">
            <div className="relative group flex items-center justify-center">
              <div className="absolute inset-0 bg-gold-500/10 dark:bg-gold-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src={nccLogo} alt="NCC Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain relative z-10 transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div>
              <span className="font-black text-navy-900 dark:text-white text-xs min-[400px]:text-sm md:text-base tracking-wider block uppercase leading-tight bg-gradient-to-r from-navy-900 to-navy-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">National Cadet Corps</span>
              <span className="text-[8px] min-[400px]:text-[9px] md:text-[10px] text-gold-600 dark:text-gold-400 font-bold uppercase tracking-widest block mt-1 animate-pulse">Digital Training Portal</span>
            </div>
          </div>
          
          {/* Center Navigation Links - Desktop Only */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7 mx-4">
            {navItems.map((item) => {
              const isActive = activeSection === item.id || 
                (item.id === 'aims' && (activeSection === 'pledge' || activeSection === 'aims' || activeSection === 'values'));
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[10px] xl:text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative py-1.5 ${
                    isActive
                      ? 'text-gold-600 dark:text-gold-400 drop-shadow-[0_0_6px_rgba(200,169,81,0.25)] font-black'
                      : 'text-surface-600 dark:text-slate-300 hover:text-navy-950 dark:hover:text-white font-bold'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent rounded-full animate-fadeIn" />
                  )}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            {user ? (
              <div className="hidden lg:block">
                <button onClick={handleProceed} className="ncc-btn ncc-btn-accent text-sm font-black shadow-lg shadow-gold-500/20 px-6 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden lg:inline-block text-surface-700 dark:text-slate-300 hover:text-navy-950 dark:hover:text-white font-black text-sm transition-colors px-3 py-2">
                  Login
                </Link>
                <div className="hidden lg:block">
                  <Link to="/register" className="ncc-btn ncc-btn-primary text-sm font-black px-6 py-2.5 rounded-xl cursor-pointer shadow-md">
                    Enroll Now
                  </Link>
                </div>
              </>
            )}
            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-surface-600 dark:text-slate-300 hover:text-navy-950 dark:hover:text-white cursor-pointer rounded-xl bg-surface-100/50 dark:bg-white/5 border border-surface-200/50 dark:border-white/5 transition-all"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 animate-fadeIn" /> : <Menu className="w-5 h-5 animate-fadeIn" />}
            </button>
          </div>
        </nav>

        {/* Mobile Slide-down Menu Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-20 left-4 right-4 lg:hidden rounded-2xl border border-surface-200/60 dark:border-white/10 bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl shadow-2xl p-6 flex flex-col gap-4 z-45 animate-slideInUp">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = activeSection === item.id || 
                  (item.id === 'aims' && (activeSection === 'pledge' || activeSection === 'aims' || activeSection === 'values'));
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/25'
                        : 'text-surface-700 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-white/5 border border-transparent font-bold'
                    }`}
                  >
                    {item.name}
                  </a>
                );
              })}
            </div>
            
            {user ? (
              <div className="flex flex-col gap-2 pt-4 border-t border-surface-200/50 dark:border-white/5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleProceed();
                  }}
                  className="w-full text-center py-3 text-xs font-black bg-gold-500 text-navy-950 rounded-xl hover:bg-gold-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-4 border-t border-surface-200/50 dark:border-white/5">
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 text-xs font-black text-surface-700 dark:text-slate-300 hover:bg-surface-50 dark:hover:bg-white/5 rounded-xl transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 text-xs font-black bg-gold-500 text-navy-950 rounded-xl hover:bg-gold-400 transition-all"
                >
                  Enroll Now
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hero Section */}
      <header id="hero" className="relative pt-24 pb-12 md:pt-36 md:pb-24 -mt-20 md:-mt-24 flex flex-col items-center px-4 overflow-hidden transition-all duration-300">
        {/* Local High-Quality Marching Image Background Overlay - High Visibility */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <img 
            src={paradeImg} 
            alt="NCC Cadets Marching Parade" 
            className="w-full h-full object-cover opacity-20 dark:opacity-30 mix-blend-overlay transition-transform duration-[20000ms] hover:scale-105 ease-out scale-100" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-50/70 to-surface-50 dark:via-navy-950/70 dark:to-navy-950" />
        </div>

        {/* Floating Glowing Mesh Orbs */}
        <div className="absolute -left-1/4 top-1/4 w-[400px] h-[400px] bg-rose-600/5 rounded-full blur-[120px] pointer-events-none z-10 animate-pulse" />
        <div className="absolute -right-1/4 top-1/3 w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none z-10 animate-pulse" />
        
        {/* Large Transparent Logo Background Watermarks */}
        <div className="absolute -left-16 top-28 w-[320px] h-[320px] opacity-[0.015] dark:opacity-[0.02] pointer-events-none select-none animate-float hidden lg:block">
          <img src={nccLogo} alt="NCC Logo Background Left" className="w-full h-full object-contain" />
        </div>
        <div className="absolute -right-16 bottom-20 w-[340px] h-[340px] opacity-[0.015] dark:opacity-[0.02] pointer-events-none select-none animate-float hidden lg:block" style={{ animationDelay: '1.5s' }}>
          <img src={nccLogo} alt="NCC Logo Background Right" className="w-full h-full object-contain" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-20 pt-4 md:pt-8 text-left">
          {/* Hero Left Content Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold-500/10 border border-gold-500/35 rounded-full text-gold-600 dark:text-gold-400 text-xs font-black uppercase tracking-widest">
              <Shield className="w-3.5 h-3.5 text-gold-500" /> Unity and Discipline • Ekta aur Anushasan
            </div>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-navy-900 dark:text-white leading-tight lg:leading-none uppercase">
              Nurturing Leaders for <br />
              <span className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 dark:from-gold-500 dark:via-gold-400 dark:to-gold-600 bg-clip-text text-transparent drop-shadow-sm">A Stronger Nation</span>
            </h1>

            <p className="text-surface-700 dark:text-slate-200 text-sm sm:text-base md:text-lg max-w-xl font-semibold leading-relaxed">
              Welcome to the official Digital Training Portal. Access the standardized syllabus, participate in simulation mock examinations, and monitor your progress across the Army, Navy, and Air wings.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button onClick={handleProceed} className="ncc-btn ncc-btn-accent text-xs md:text-sm font-black px-6 py-3.5 md:px-8 md:py-4 rounded-xl shadow-2xl shadow-gold-500/20 w-full sm:w-auto flex items-center justify-center gap-2.5 cursor-pointer">
                {user ? 'Proceed to Dashboard' : 'Get Started Now'} <ArrowRight className="w-4 h-4" />
              </button>
              <a href="#aims" className="ncc-btn ncc-btn-ghost text-xs md:text-sm font-bold border border-surface-300 dark:border-white/10 text-surface-800 dark:text-slate-200 hover:bg-surface-100 dark:hover:bg-white/5 hover:text-navy-950 dark:hover:text-white px-6 py-3.5 md:px-8 md:py-4 rounded-xl w-full sm:w-auto flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                Learn More <ChevronDown className="w-4 h-4 animate-bounce" />
              </a>
            </div>

            {/* Stats Ticker */}
            <div className="pt-8 grid grid-cols-3 gap-2.5 max-w-lg border-t border-surface-200 dark:border-white/10">
              <div className="bg-white/50 dark:bg-navy-900/40 backdrop-blur-md border border-surface-200 dark:border-white/5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md hover:border-gold-500/25">
                <span className="text-xs min-[360px]:text-sm sm:text-xl md:text-2xl font-black text-gold-600 dark:text-gold-400 block tracking-tight leading-none">
                  {stats.cadets !== undefined && stats.cadets !== null ? stats.cadets.toLocaleString() : '0'}
                </span>
                <span className="text-[8px] sm:text-xs text-surface-500 dark:text-slate-400 uppercase font-black tracking-wider block mt-1">Cadets</span>
              </div>
              <div className="bg-white/50 dark:bg-navy-900/40 backdrop-blur-md border border-surface-200 dark:border-white/5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md hover:border-gold-500/25">
                <span className="text-xs min-[360px]:text-sm sm:text-xl md:text-2xl font-black text-gold-600 dark:text-gold-400 block tracking-tight leading-none">
                  {stats.courses || '12'}
                </span>
                <span className="text-[8px] sm:text-xs text-surface-500 dark:text-slate-400 uppercase font-black tracking-wider block mt-1">Subjects</span>
              </div>
              <div className="bg-white/50 dark:bg-navy-900/40 backdrop-blur-md border border-surface-200 dark:border-white/5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-md hover:border-gold-500/25">
                <span className="text-xs min-[360px]:text-sm sm:text-xl md:text-2xl font-black text-gold-600 dark:text-gold-400 block tracking-tight leading-none">
                  {stats.wings || '3'}
                </span>
                <span className="text-[8px] sm:text-xs text-surface-500 dark:text-slate-400 uppercase font-black tracking-wider block mt-1">Wings</span>
              </div>
            </div>
          </div>

          {/* Hero Right Content Column - Interactive Mock Exam Simulator Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-white/70 dark:bg-navy-900/80 backdrop-blur-xl border border-surface-200 dark:border-white/10 shadow-2xl p-6 rounded-3xl relative overflow-hidden transition-all duration-500 hover:shadow-gold-500/5 hover:border-gold-500/20">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl" />
              
              {/* Simulator Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-black text-gold-600 dark:text-gold-400 uppercase tracking-widest">Training Simulator</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-surface-400 dark:text-slate-400 font-bold block">STREAK</span>
                  <span className="text-xs font-black text-navy-900 dark:text-white flex items-center gap-0.5 justify-end">🎖️ {simStreak}</span>
                </div>
              </div>

              {/* Simulated EXP Metrics */}
              <div className="mb-4 space-y-1.5">
                <div className="flex justify-between text-[10px] font-black text-surface-600 dark:text-slate-300">
                  <span>CADET EXP PROGRESS (Level {simLevel})</span>
                  <span>{simExp % 500} / 500 EXP</span>
                </div>
                <div className="w-full bg-surface-100 dark:bg-navy-950 h-2.5 rounded-full overflow-hidden border border-surface-200 dark:border-white/5">
                  <div 
                    className="bg-gold-500 h-full transition-all duration-500 shadow-[0_0_8px_rgba(200,169,81,0.5)]" 
                    style={{ width: `${((simExp % 500) / 500) * 100}%` }}
                  />
                </div>
                {simLevel > 1 && (
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block text-center animate-pulse">
                    Promoted to Lance Corporal Rank! 🎉
                  </span>
                )}
              </div>

              {/* Question Area */}
              <div className="bg-surface-100/50 dark:bg-navy-950/60 border border-surface-200/50 dark:border-white/5 p-4 rounded-2xl mb-4 min-h-[90px] flex items-center">
                <p className="text-xs md:text-sm font-bold text-navy-900 dark:text-slate-100 leading-relaxed text-left">
                  <span className="text-gold-500 font-black mr-1">Q{simIdx + 1}:</span>
                  {mockQuestions[simIdx].q}
                </p>
              </div>

              {/* Options list */}
              <div className="space-y-2">
                {mockQuestions[simIdx].options.map((option, idx) => {
                  const isCorrect = idx === mockQuestions[simIdx].ans;
                  const isSelected = selectedOption === idx;
                  let btnStyle = "border-surface-200 dark:border-white/5 hover:bg-surface-50 dark:hover:bg-white/5 text-surface-700 dark:text-slate-200";
                  
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.15)]";
                    } else if (isSelected) {
                      btnStyle = "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold";
                    } else {
                      btnStyle = "border-surface-100 dark:border-white/5 opacity-55";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-3.5 border rounded-2xl text-xs font-semibold flex items-center justify-between transition-all duration-300 ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Simulated Answer Feedback */}
              {isAnswered && (
                <div className="mt-4 pt-3 border-t border-surface-100 dark:border-white/5 space-y-3 animate-slideInUp">
                  <p className="text-[11px] text-surface-500 dark:text-slate-300 leading-normal italic font-medium">
                    <span className="font-bold text-gold-500 uppercase not-italic block mb-0.5">Lesson Note</span>
                    {selectedOption === mockQuestions[simIdx].ans 
                      ? `Correct! +250 EXP earned. ${mockQuestions[simIdx].hint}` 
                      : `Incorrect. ${mockQuestions[simIdx].hint}`
                    }
                  </p>
                  <button 
                    onClick={nextSimQuestion}
                    className="w-full bg-gold-500 text-navy-950 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gold-400 transition-colors cursor-pointer"
                  >
                    Next Mock Question
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 z-20 pointer-events-none opacity-60">
          <span className="text-[9px] text-gold-600 dark:text-gold-400 font-black uppercase tracking-widest">Scroll to Explore</span>
          <div className="w-5 h-8 border border-gold-500/40 dark:border-gold-500/30 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-gold-500 dark:bg-gold-400 rounded-full animate-bounce" />
          </div>
        </div>
      </header>

      {/* Interactive Pledge Recital Section */}
      <section id="pledge" className="py-16 md:py-24 bg-surface-100/50 dark:bg-navy-900/40 border-t border-b border-surface-200 dark:border-white/10 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] opacity-[0.015] pointer-events-none select-none animate-float">
          <img src={nccLogo} alt="NCC Logo Watermark Pledge" className="w-full h-full object-contain" />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="text-gold-600 dark:text-gold-400 font-black text-xs uppercase tracking-widest block mb-2">Honoring the Oath</span>
          <h2 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white uppercase tracking-tight mb-4">Official NCC Pledge</h2>
          <div className="w-12 h-1 bg-gold-500 mx-auto rounded-full mb-8" />

          {/* Reciter Card - Rebuilt as a Premium Citation Scroll */}
          <div className="p-8 md:p-12 border-double border-4 border-gold-500/25 max-w-2xl mx-auto relative overflow-hidden shadow-2xl bg-white dark:bg-navy-950/90 rounded-3xl ncc-corner-brackets">
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-gold-500/30" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-gold-500/30" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-gold-500/30" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-gold-500/30" />

            {pledgeStep === -1 ? (
              <div className="space-y-6 relative z-10 animate-fadeIn">
                <p className="text-surface-700 dark:text-slate-200 text-sm md:text-base font-bold leading-relaxed max-w-lg mx-auto">
                  Every cadet pledges allegiance to the values of India and the National Cadet Corps. Recite the pledge to renew your commitment.
                </p>
                <button
                  onClick={() => { setPledgeStep(0); setPledgeCompleted(false); }}
                  className="ncc-btn ncc-btn-accent text-xs font-bold px-6 py-3 cursor-pointer inline-flex items-center gap-2"
                >
                  Recite Official Pledge <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-8 relative z-10 animate-fadeIn">
                <div className="w-full bg-surface-200 dark:bg-navy-900 rounded-full h-1.5 overflow-hidden border border-surface-300 dark:border-white/5">
                  <div
                    className="bg-gold-500 h-full transition-all duration-300"
                    style={{ width: `${((pledgeStep + (pledgeCompleted ? 1 : 0)) / pledgeSentences.length) * 100}%` }}
                  />
                </div>

                <div className="min-h-[140px] flex flex-col justify-center items-center gap-4">
                  {pledgeSentences.map((sentence, idx) => {
                    const isActive = pledgeStep === idx;
                    const isPassed = pledgeStep > idx;
                    return (
                      <p 
                        key={idx}
                        className={`text-center transition-all duration-500 leading-relaxed font-bold tracking-wide ${
                          isActive 
                            ? 'text-navy-900 dark:text-white text-sm md:text-base lg:text-lg font-black scale-[1.02] opacity-100 drop-shadow-md' 
                            : isPassed 
                              ? 'text-gold-600 dark:text-gold-400 opacity-85 text-xs md:text-sm font-bold line-through' 
                              : 'text-surface-600 dark:text-slate-300 opacity-60 text-xs md:text-sm font-semibold'
                        }`}
                      >
                        {sentence}
                      </p>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-3">
                  {pledgeStep > 0 && !pledgeCompleted && (
                    <button
                      onClick={() => setPledgeStep(p => p - 1)}
                      className="ncc-btn ncc-btn-ghost text-xs py-2 px-4 cursor-pointer text-surface-700 dark:text-slate-200 hover:text-navy-950 dark:hover:text-white border-surface-300 dark:border-white/10 hover:bg-surface-100 dark:hover:bg-white/5"
                    >
                      Back
                    </button>
                  )}
                  
                  {pledgeCompleted ? (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="text-gold-600 dark:text-gold-400 font-black text-sm tracking-widest uppercase flex items-center gap-1.5 justify-center">
                        <Check className="w-5 h-5 text-emerald-500 bg-emerald-500/10 p-0.5 rounded-full" /> Jai Hind! Pledge Recited.
                      </div>
                      <button
                        onClick={() => { setPledgeStep(-1); setPledgeCompleted(false); }}
                        className="ncc-btn ncc-btn-ghost text-xs py-2 px-4 flex items-center gap-1.5 mx-auto cursor-pointer text-surface-700 dark:text-slate-200 border-surface-300 dark:border-white/10 hover:bg-surface-100 dark:hover:bg-white/5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Start Over
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (pledgeStep === pledgeSentences.length - 1) {
                           setPledgeCompleted(true);
                        } else {
                           setPledgeStep(p => p + 1);
                        }
                      }}
                      className="ncc-btn ncc-btn-accent text-xs font-black py-2.5 px-6 cursor-pointer"
                    >
                      {pledgeStep === pledgeSentences.length - 1 ? 'I Pledge • Jai Hind' : 'Next Sentence'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* The Aims of NCC Section */}
      <section id="aims" className="py-16 md:py-24 bg-surface-50 dark:bg-navy-950 relative transition-colors duration-300">
        <div className="absolute right-[-100px] top-10 w-[350px] h-[350px] opacity-[0.015] pointer-events-none select-none animate-float hidden lg:block">
          <img src={nccLogo} alt="NCC Logo Watermark Aims" className="w-full h-full object-contain" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white uppercase tracking-tight">The Aims of NCC</h2>
            <div className="w-16 h-1 bg-gold-500 mx-auto rounded-full" />
            <p className="text-surface-700 dark:text-slate-300 text-sm md:text-base font-semibold leading-relaxed">
              Established under the National Cadet Corps Act of 1948, the NCC strives to achieve these primary aims to motivate and guide young minds across India.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: 'Character & secular outlook',
                desc: 'To develop qualities of character, comradeship, discipline, secular outlook, spirit of adventure, sportsmanship, and ideals of selfless service among youth.',
                icon: Award,
                color: 'text-gold-600 dark:text-gold-400',
                bg: 'bg-white dark:bg-gold-500/5 border-surface-200 dark:border-gold-500/15 hover:border-gold-500/35 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(200,169,81,0.12)]'
              },
              {
                title: 'Organized & Motivated Youth',
                desc: 'To create a human resource of organized, trained, and motivated youth to provide leadership in all walks of life and always be available for the service of the nation.',
                icon: Users,
                color: 'text-sky-600 dark:text-sky-400',
                bg: 'bg-white dark:bg-sky-500/5 border-surface-200 dark:border-sky-400/15 hover:border-sky-400/35 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(56,189,248,0.12)]'
              },
              {
                title: 'Military motivation',
                desc: 'To provide a suitable environment to motivate the youth to take up a career in the Indian Armed Forces (Army, Navy, and Air Force).',
                icon: Shield,
                color: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-white dark:bg-emerald-500/5 border-surface-200 dark:border-emerald-500/15 hover:border-emerald-500/35 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(52,211,153,0.12)]'
              }
            ].map((aim, idx) => (
              <div key={idx} className={`group relative p-6 md:p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden ncc-corner-brackets ${aim.bg}`}>
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-gold-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-3xl" />
                <div className={`w-12 h-12 rounded-xl bg-surface-100 dark:bg-white/5 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 ${aim.color}`}>
                  <aim.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base md:text-lg font-black text-navy-900 dark:text-white uppercase mb-3 transition-colors group-hover:text-gold-500">{aim.title}</h3>
                <p className="text-xs md:text-sm text-surface-600 dark:text-slate-200 leading-relaxed flex-1 font-semibold">{aim.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section id="values" className="py-16 md:py-24 bg-gradient-to-b from-surface-50 to-surface-100 dark:from-navy-950 dark:to-navy-900 relative border-t border-surface-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-gold-600 dark:text-gold-400 font-black text-xs uppercase tracking-widest block">Building Integrity</span>
            <h2 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white uppercase tracking-tight">Official Core Values</h2>
            <div className="w-16 h-1 bg-gold-500 mx-auto rounded-full" />
            <p className="text-surface-700 dark:text-slate-300 text-sm md:text-base font-semibold leading-relaxed">
              NCC cadets are expected to grow into responsible citizens guided by a set of ten core ethical values.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
            {[
              { title: 'Patriotic Commitment', desc: 'Encouraging cadets to contribute actively to national development.' },
              { title: 'Respect for Diversity', desc: 'Valuing differences in religion, language, and culture.' },
              { title: 'Constitutional Values', desc: 'Abiding by democratic norms, secularism, and rule of law.' },
              { title: 'Impartiality & Justice', desc: 'Understanding a just and impartial exercise of authority.' },
              { title: 'Community Service', desc: 'Willingness to participate in community assistance projects.' },
              { title: 'Healthy Lifestyle', desc: 'Physical fitness and keeping free of substance abuse.' },
              { title: 'Social Sensitivity', desc: 'Caring for poor and socially disadvantaged fellow citizens.' },
              { title: 'Self-Discipline', desc: 'Inculcating habits of restraint, restraint, and responsibility.' },
              { title: 'Integrity & Effort', desc: 'Upholding honesty, self-sacrifice, and perseverance.' },
              { title: 'Respect for Knowledge', desc: 'Valuing wisdom, skill acquisition, and power of ideas.' }
            ].map((val, idx) => (
              <div key={idx} className="ncc-glass-card p-3 sm:p-4 flex flex-col justify-between border border-surface-200 dark:border-white/10 bg-white/70 dark:bg-navy-950/60 hover:border-gold-500/40 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(200,169,81,0.12)] active:scale-[0.98] active:translate-y-0 transition-all group duration-300 hover:-translate-y-1 relative overflow-hidden rounded-xl sm:rounded-2xl">
                <div className="absolute top-0 left-0 bottom-0 w-0.5 bg-gradient-to-b from-gold-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-surface-100/80 dark:bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center font-black text-[10px] sm:text-xs mb-2.5 sm:mb-3 transition-transform duration-300 group-hover:scale-105">
                    {idx + 1}
                  </div>
                  <h4 className="font-black text-xs sm:text-sm lg:text-base text-navy-900 dark:text-white uppercase tracking-wide group-hover:text-gold-500 transition-colors leading-tight">
                    {val.title}
                  </h4>
                </div>
                <p className="text-[11px] sm:text-xs text-surface-600 dark:text-slate-300 leading-normal mt-2 group-hover:text-navy-900 dark:group-hover:text-slate-100 transition-colors font-semibold">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cadet Rank Progression & Honors Section (Deep Interactivity) */}
      <section id="ranks" className="py-16 md:py-24 bg-surface-50 dark:bg-navy-950 relative border-t border-b border-surface-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <span className="text-gold-600 dark:text-gold-400 font-black text-xs uppercase tracking-widest block">Cadet Ranks & Honors</span>
            <h2 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white uppercase tracking-tight">Interactive Cadet Rank Hierarchy</h2>
            <div className="w-16 h-1 bg-gold-500 mx-auto rounded-full" />
            <p className="text-surface-700 dark:text-slate-300 text-sm md:text-base font-semibold leading-relaxed">
              Ascending the hierarchy of NCC ranks requires active service, camp attendance, and test certifications. Select a rank below to explore leadership details.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Left column: Scrollable tabs list */}
            <div className="lg:col-span-4 relative">
              <div className="relative flex items-center w-full">
                {/* Horizontal scroll on mobile/tablet, vertical stacking on desktop */}
                <div className="w-full flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3.5 lg:pb-0 scroll-smooth ncc-ranks-scrollbar">
                  {cadetRanks.map((rank, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveRank(idx)}
                      className={`flex-shrink-0 lg:flex-shrink w-auto flex items-center gap-2 lg:gap-3 px-4 py-2 lg:p-4 border rounded-full lg:rounded-2xl text-left cursor-pointer transition-all duration-300 ${
                        activeRank === idx 
                          ? 'border-gold-500 bg-gold-500/10 text-gold-700 dark:text-gold-400 font-black shadow-md lg:shadow-lg lg:shadow-gold-500/5' 
                          : 'border-surface-200 dark:border-white/5 bg-white dark:bg-navy-900 hover:border-gold-500/20 text-surface-600 dark:text-slate-300 font-bold'
                      }`}
                    >
                      <span className={`w-2 h-2 lg:w-3.5 lg:h-3.5 rounded-full ${activeRank === idx ? rank.accent + ' animate-pulse' : 'bg-surface-300 dark:bg-navy-800'}`} />
                      <span className="text-[11px] lg:text-xs uppercase tracking-wider block">{rank.title}</span>
                    </button>
                  ))}
                </div>
                {/* Scroll Indicator Gradient Fade (Mobile/Tablet Only) */}
                <div className="absolute right-0 top-0 bottom-3.5 w-12 bg-gradient-to-l from-surface-50 dark:from-navy-950 to-transparent pointer-events-none lg:hidden" />
              </div>
            </div>

            {/* Right column: Active Rank Details Card */}
            <div className="lg:col-span-8 flex">
              <div className="w-full bg-white dark:bg-navy-900 border border-surface-200 dark:border-white/10 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-500 hover:border-gold-500/20 ncc-corner-brackets">
                <div className={`absolute top-4 right-4 opacity-5 dark:opacity-10 pointer-events-none w-36 h-36 border-4 border-dashed rounded-full flex items-center justify-center`}>
                   <Trophy className="w-20 h-20 text-gold-500" />
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex items-start justify-between border-b border-surface-100 dark:border-white/5 pb-4">
                    <div>
                      <span className="text-[10px] text-gold-600 dark:text-gold-400 font-black uppercase tracking-widest block mb-0.5">Insignia / Badge</span>
                      <span className="text-xs font-black text-navy-900 dark:text-white uppercase block">{cadetRanks[activeRank].insignia}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-surface-400 dark:text-slate-400 font-bold block uppercase">Rank Class</span>
                      <span className="ncc-badge uppercase text-[10px] font-black">{cadetRanks[activeRank].badge}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-black text-navy-900 dark:text-white uppercase leading-none">
                      {cadetRanks[activeRank].title}
                    </h3>
                    <p className="text-xs md:text-sm text-surface-600 dark:text-slate-300 leading-relaxed font-semibold">
                      {cadetRanks[activeRank].desc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-surface-100 dark:border-white/5">
                    <div>
                      <span className="text-[10px] text-gold-600 dark:text-gold-400 font-bold uppercase tracking-wider block mb-1">Prerequisites & Criteria</span>
                      <p className="text-xs text-navy-900 dark:text-white font-bold">{cadetRanks[activeRank].requirements}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gold-600 dark:text-gold-400 font-bold uppercase tracking-wider block mb-1">Role & Authority</span>
                      <p className="text-xs text-navy-900 dark:text-white font-bold">{cadetRanks[activeRank].perks}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-surface-100 dark:border-white/5 flex items-center justify-between min-h-[52px]">
                  <span className="text-[10px] text-surface-500 dark:text-slate-400 font-black uppercase tracking-widest">NCC Hierarchy System</span>
                  {promotingState === 'idle' && (
                    <button 
                      onClick={handleSimulatePromotion}
                      className="ncc-btn ncc-btn-accent text-[10px] font-black py-2 px-4 flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    >
                      Simulate Rank Promotion <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {promotingState === 'testing' && (
                    <div className="flex items-center gap-2 text-[10px] font-black text-gold-600 dark:text-gold-400 animate-pulse">
                      <span className="w-3 h-3 rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
                      <span>Assessing Drill & Exam Merit...</span>
                    </div>
                  )}
                  {promotingState === 'success' && (
                    <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fadeIn">
                      <Check className="w-4 h-4 text-emerald-500 bg-emerald-500/10 p-0.5 rounded-full" />
                      <span>Promoted! Rank Badge Updated.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tri-Services Wing Details with Interactive Tabs */}
      <section id="wings" className="py-16 md:py-24 bg-surface-50 dark:bg-navy-950 relative border-b border-surface-200 dark:border-white/10 transition-colors duration-300">
        <div className="absolute left-[-120px] top-1/4 w-[380px] h-[380px] opacity-[0.015] pointer-events-none select-none animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
          <img src={nccLogo} alt="NCC Logo Watermark Wings" className="w-full h-full object-contain" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <span className="text-gold-600 dark:text-gold-400 font-black text-xs uppercase tracking-widest block">Tri-Services wings</span>
            <h2 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white uppercase tracking-tight">Interactive Wing Guides</h2>
            <div className="w-16 h-1 bg-gold-500 mx-auto rounded-full" />
            <p className="text-surface-700 dark:text-slate-300 text-sm md:text-base font-semibold leading-relaxed">
              NCC operates across three main service wings. Select a wing below to browse details, syllabus focus, and major camps.
            </p>
          </div>

          {/* Tabs header */}
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto mb-8 bg-surface-100 dark:bg-navy-900 border border-surface-200 dark:border-white/10 p-1.5 rounded-xl">
            {Object.keys(wingDetails).map((key) => (
              <button
                key={key}
                onClick={() => setActiveWing(key)}
                className={`flex-1 text-center py-2.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                  activeWing === key 
                    ? 'bg-gold-500 text-navy-950 shadow-md font-black' 
                    : 'text-surface-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
                }`}
              >
                {key === 'army' ? 'Army' : key === 'navy' ? 'Navy' : 'Air Force'}
              </button>
            ))}
          </div>

          {/* Active Tab Content Card */}
          <div className={`ncc-glass-card p-6 md:p-10 border max-w-4xl mx-auto transition-all duration-500 relative overflow-hidden bg-gradient-to-br rounded-3xl ncc-corner-brackets ${wingDetails[activeWing].color}`}>
            <div className="absolute top-4 right-4 md:top-8 md:right-8 opacity-[0.05] dark:opacity-10 pointer-events-none animate-float">
              {activeWing === 'army' && <Shield className="w-32 h-32 text-navy-950 dark:text-white" />}
              {activeWing === 'navy' && <Compass className="w-32 h-32 text-navy-950 dark:text-white" />}
              {activeWing === 'airforce' && <Plane className="w-32 h-32 text-navy-950 dark:text-white" />}
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className={`ncc-badge uppercase text-[10px] font-black px-3 py-1 inline-block ${wingDetails[activeWing].badgeClass}`}>
                    {wingDetails[activeWing].badgeLabel}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white uppercase mt-2 tracking-tight">
                    {wingDetails[activeWing].name}
                  </h3>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-surface-500 dark:text-slate-400 uppercase font-black tracking-widest block">Wing Motto</span>
                  <span className="text-sm font-black text-gold-600 dark:text-gold-400 uppercase italic">
                    "{wingDetails[activeWing].motto}"
                  </span>
                </div>
              </div>

              <p className="text-sm md:text-base text-surface-800 dark:text-slate-100 leading-relaxed font-semibold">
                {wingDetails[activeWing].description}
              </p>

              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-surface-200 dark:border-white/10">
                <div>
                  <h4 className="font-bold text-xs uppercase text-gold-600 dark:text-gold-400 tracking-wider flex items-center gap-1.5 mb-3">
                    <Target className="w-4 h-4 text-gold-500" /> Syllabus Highlights
                  </h4>
                  <ul className="space-y-2">
                    {wingDetails[activeWing].subjects.map((sub, sIdx) => (
                      <li key={sIdx} className="text-xs text-surface-800 dark:text-slate-200 flex items-start gap-2 leading-relaxed font-semibold">
                        <Check className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-xs uppercase text-gold-600 dark:text-gold-400 tracking-wider flex items-center gap-1.5 mb-3">
                    <Calendar className="w-4 h-4 text-gold-500" /> Wing Camps
                  </h4>
                  <ul className="space-y-2">
                    {wingDetails[activeWing].camps.map((camp, cIdx) => (
                      <li key={cIdx} className="text-xs text-surface-800 dark:text-slate-200 flex items-start gap-2 leading-relaxed font-semibold">
                        <Star className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5 fill-gold-500/20" />
                        <span>{camp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Camp Selection Stepper Timeline */}
      <section id="camps" className="py-16 md:py-24 bg-gradient-to-b from-surface-50 to-surface-100 dark:from-navy-950 dark:to-navy-900 relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <span className="text-gold-600 dark:text-gold-400 font-black text-xs uppercase tracking-widest block">The Journey to Delhi</span>
            <h2 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white uppercase tracking-tight">National Camp Selection Path</h2>
            <div className="w-16 h-1 bg-gold-500 mx-auto rounded-full" />
            <p className="text-surface-700 dark:text-slate-300 text-sm md:text-base font-semibold leading-relaxed">
              Attending prestigious national camps is highly competitive. Explore the selection steps for RDC, TSC, and YEP below.
            </p>
          </div>

          {/* Stepper Selection */}
          <div className="flex items-center justify-center gap-3 max-w-md mx-auto mb-10 bg-surface-100 dark:bg-navy-900 border border-surface-200 dark:border-white/10 p-1.5 rounded-xl">
            {Object.keys(campTimeline).map((key) => (
              <button
                key={key}
                onClick={() => setActiveCampTab(key)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                  activeCampTab === key 
                    ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 dark:border-gold-500/30' 
                    : 'text-surface-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white border border-transparent'
                }`}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Stepper Steps grid */}
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-center max-w-xl mx-auto">
              <h3 className="text-lg font-black text-navy-900 dark:text-white uppercase mb-1">
                {campTimeline[activeCampTab].title}
              </h3>
              <p className="text-xs text-surface-600 dark:text-slate-200 leading-relaxed font-semibold">
                {campTimeline[activeCampTab].desc}
              </p>
            </div>

            {/* Desktop Layout (Horizontal Timeline) */}
            <div className="hidden md:grid md:grid-cols-4 gap-4 relative">
              {/* Connector Line with gold gradient animation */}
              <div className="absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-gold-500/10 via-gold-500 to-gold-500/10 -z-10" />

              {campTimeline[activeCampTab].steps.map((step, idx) => (
                <div key={idx} className="bg-white dark:bg-navy-900/60 border border-surface-200 dark:border-white/10 rounded-2xl p-5 relative flex flex-col items-center text-center shadow-lg group hover:border-gold-500/30 transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-navy-950 border border-surface-200 dark:border-white/15 text-gold-600 dark:text-gold-400 font-black text-sm flex items-center justify-center mb-4 group-hover:bg-gold-500 group-hover:text-navy-950 group-hover:border-gold-500 transition-all duration-300 shadow-md">
                    {idx + 1}
                  </div>
                  <h4 className="font-black text-xs uppercase text-navy-900 dark:text-white tracking-wider mb-2 group-hover:text-gold-500 transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-surface-600 dark:text-slate-300 leading-relaxed font-semibold">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile Layout (Vertical Timeline) */}
            <div className="md:hidden relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-200 dark:before:bg-white/10 space-y-6">
              {campTimeline[activeCampTab].steps.map((step, idx) => (
                <div key={idx} className="relative pl-10 text-left group">
                  {/* Dot */}
                  <div className="absolute left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-surface-50 dark:border-navy-950 bg-surface-300 dark:bg-navy-800 group-hover:bg-gold-500 group-hover:border-gold-500 transition-colors duration-200 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-navy-950" />
                  </div>
                  <div className="bg-white dark:bg-navy-900/60 border border-surface-200 dark:border-white/10 rounded-2xl p-5 shadow-lg hover:border-gold-500/20 transition-all">
                    <span className="text-[9px] text-gold-600 dark:text-gold-400 font-bold uppercase tracking-wider block mb-1">Step {idx + 1}</span>
                    <h4 className="font-black text-sm uppercase text-navy-900 dark:text-white tracking-wider mb-1.5 group-hover:text-gold-500 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-xs text-surface-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certificate Level & SSB commission exemptions */}
      <section id="certs" className="py-16 md:py-24 bg-surface-50 dark:bg-navy-950 border-t border-b border-surface-200 dark:border-white/10 relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-gold-600 dark:text-gold-400 font-black text-xs uppercase tracking-widest block">Cadet Syllabus Milestones</span>
            <h2 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white uppercase tracking-tight">Certificate A, B & C Standards</h2>
            <div className="w-16 h-1 bg-gold-500 mx-auto rounded-full" />
            <p className="text-surface-700 dark:text-slate-300 text-sm md:text-base font-semibold leading-relaxed">
              NCC certification validates your training. The 'C' Certificate is the ultimate goal with significant career preferences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                level: "Certificate 'A'",
                sub: "School Level (Junior Division/Wing)",
                dur: "2 Years Training",
                req: ["Minimum 75% training attendance", "Attended at least 1 CATC camp"],
                ben: ["5% bonus marks in Soldier/Sailor recruitment", "Foundation for Senior Division entry"]
              },
              {
                level: "Certificate 'B'",
                sub: "College Level (Senior Division/Wing)",
                dur: "2 Years Training (Completed in 2nd Year)",
                req: ["Minimum 75% training attendance", "Attended at least 1 CATC camp"],
                ben: ["Prerequisite for Certificate C", "Bonus marks in Central Armed Police Forces (CAPF)", "Bonus marks in state police and military recruitment"]
              },
              {
                level: "Certificate 'C'",
                sub: "Ultimate Goal (Senior Division/Wing)",
                dur: "3 Years Training (Completed in 3rd Year)",
                req: ["Holds Certificate B", "Minimum 75% training attendance", "Attended at least 2 camps (or 1 national camp like RDC/TSC)"],
                ben: ["Direct entry to SSB interviews (no written UPSC CDS exam)", "Reserved vacancies in IMA, OTA, and Navy/Air force academies", "Highly preferred in multinational corporations (Reliance, Godrej)"]
              }
            ].map((cert, idx) => (
              <div 
                key={idx} 
                className={`p-6 md:p-8 rounded-2xl border flex flex-col justify-between transition-all group duration-300 ${
                  idx === 2 
                    ? 'bg-gradient-to-br from-gold-500/5 via-white dark:via-navy-900/80 to-surface-100 dark:to-navy-950 border-2 border-gold-500/40 shadow-[0_10px_35px_rgba(200,169,81,0.15)] relative md:scale-[1.03] overflow-hidden' 
                    : 'bg-white dark:bg-navy-900/60 border-surface-200 dark:border-white/10 hover:border-gold-500/20'
                }`}
              >
                {idx === 2 && (
                  <div className="absolute top-3 right-[-35px] bg-gold-500 text-navy-950 text-[8px] font-black uppercase tracking-widest py-1 w-[120px] text-center rotate-45 shadow-sm animate-pulse">
                    SSB ENTRY
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gold-600 dark:text-gold-400 font-bold uppercase tracking-wider">{cert.dur}</span>
                    {idx === 2 && (
                      <span className="text-[9px] font-black text-gold-600 dark:text-gold-400 px-2 py-0.5 rounded uppercase tracking-widest border border-gold-500/30 bg-gold-500/5">
                        Prestige Standard
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-navy-900 dark:text-white uppercase mb-1">{cert.level}</h3>
                  <span className="text-xs text-surface-600 dark:text-slate-300 block font-bold mb-6">{cert.sub}</span>

                  <div className="space-y-4 mb-6">
                    <div>
                      <span className="text-[10px] text-surface-500 dark:text-slate-400 uppercase font-black tracking-wider block mb-1.5">Requirements</span>
                      <ul className="space-y-1.5">
                        {cert.req.map((req, rIdx) => (
                          <li key={rIdx} className="text-xs text-surface-700 dark:text-slate-200 flex items-start gap-2 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] text-surface-500 dark:text-slate-400 uppercase font-black tracking-wider block mb-1.5">Exemptions & Benefits</span>
                      <ul className="space-y-1.5">
                        {cert.ben.map((ben, bIdx) => (
                          <li key={bIdx} className="text-xs text-navy-900 dark:text-white flex items-start gap-2 font-bold">
                            <GraduationCap className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                            <span>{ben}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-200 dark:border-white/10">
                  <button 
                    onClick={handleProceed}
                    className={`w-full text-center py-2.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                      idx === 2 
                        ? 'bg-gold-500 text-navy-950 hover:bg-gold-400 hover:scale-[1.02] shadow-lg shadow-gold-500/10' 
                        : 'bg-navy-900 text-white dark:bg-white/5 dark:text-white hover:bg-navy-800 dark:hover:bg-white/10'
                    }`}
                  >
                    Prepare for Cert {idx === 0 ? 'A' : idx === 1 ? 'B' : 'C'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Famous Alumni Spotlight Section */}
      <section id="alumni" className="py-16 md:py-24 bg-surface-100/30 dark:bg-navy-900/20 relative transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-gold-600 dark:text-gold-400 font-black text-xs uppercase tracking-widest block mb-2">Inspirational Legacy</span>
          <h2 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white uppercase tracking-tight mb-4">Famous NCC Alumni Spotlight</h2>
          <div className="w-12 h-1 bg-gold-500 mx-auto rounded-full mb-10" />

          {/* Slider Quote Container */}
          <div className={`p-6 md:p-10 rounded-3xl border border-surface-200 dark:border-white/10 bg-white dark:bg-navy-900/40 shadow-2xl relative transition-all duration-500 ${alumniQuotes[activeAlumni].bg}`}>
            <Quote className="w-12 h-12 text-gold-500/20 absolute -top-4 -left-2" />
            
            <div className="space-y-6">
              <p className="text-navy-900 dark:text-white text-base md:text-lg italic font-semibold leading-relaxed max-w-2xl mx-auto">
                "{alumniQuotes[activeAlumni].quote}"
              </p>
              
              <div className="flex flex-col items-center gap-1.5 mt-2">
                <span className="text-xs md:text-sm font-black text-navy-900 dark:text-white uppercase block tracking-wide">
                  {alumniQuotes[activeAlumni].name}
                </span>
                <span className="text-[10px] text-gold-600 dark:text-gold-400 font-black uppercase tracking-widest block">
                  {alumniQuotes[activeAlumni].role}
                </span>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {alumniQuotes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveAlumni(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  activeAlumni === idx ? 'bg-gold-500 w-6' : 'bg-surface-300 dark:bg-white/20'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-16 md:py-24 bg-surface-50 dark:bg-navy-950 border-t border-surface-200 dark:border-white/10 relative transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-gold-600 dark:text-gold-400 font-black text-xs uppercase tracking-widest block mb-2">Got Questions?</span>
            <h2 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white uppercase tracking-tight">Cadet Support & FAQs</h2>
            <div className="w-12 h-1 bg-gold-500 mx-auto rounded-full mt-3" />
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white/60 dark:bg-navy-900/50 border border-surface-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-navy-900 dark:text-white font-bold text-sm md:text-base cursor-pointer hover:bg-surface-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-3 pr-4">
                    <HelpCircle className="w-5 h-5 text-gold-500 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 text-gold-500 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {/* Panel wrapper */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openFaq === idx ? 'max-h-[300px] border-t border-surface-200 dark:border-white/10' : 'max-h-0'
                  }`}
                >
                  <p className="p-5 text-xs md:text-sm text-surface-700 dark:text-slate-200 leading-relaxed font-semibold">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-surface-200 dark:border-white/10 bg-white dark:bg-navy-950 py-10 text-center text-xs text-surface-500 dark:text-slate-400 font-medium transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Footer Logo */}
          <div className="flex justify-center">
            <img 
              src={nccLogo} 
              alt="National Cadet Corps Logo Footer" 
              className="w-12 h-12 object-contain opacity-55 hover:opacity-100 transition-opacity" 
            />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-gold-600 dark:text-gold-400 font-bold">National Cadet Corps Digital Training Portal</p>
            <p className="max-w-md mx-auto leading-relaxed text-surface-700 dark:text-slate-300 font-semibold">
              This is an educational training platform referencing official National Cadet Corps information and guidelines.
            </p>
          </div>
          <p className="pt-4 border-t border-surface-100 dark:border-white/5 text-[10px] text-surface-400 dark:text-slate-400">
            &copy; {new Date().getFullYear()} NCC Digital Training. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Floating Scrollspy Dot Navigation */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-5 bg-white/40 dark:bg-navy-900/50 backdrop-blur-md px-3 py-6 rounded-full border border-surface-200 dark:border-white/10 shadow-2xl">
        {[
          { id: 'hero', label: '01 • Hero' },
          { id: 'pledge', label: '02 • Pledge' },
          { id: 'aims', label: '03 • Aims' },
          { id: 'values', label: '04 • Values' },
          { id: 'ranks', label: '05 • Ranks' },
          { id: 'wings', label: '06 • Wings' },
          { id: 'camps', label: '07 • Camps' },
          { id: 'certs', label: '08 • Certs' },
          { id: 'alumni', label: '09 • Alumni' },
          { id: 'faq', label: '10 • FAQs' }
        ].map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="relative flex items-center justify-center group"
          >
            {/* Tooltip */}
            <span className="absolute right-8 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-gold-500 text-navy-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap">
              {label}
            </span>
            {/* Dot */}
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeSection === id
                  ? 'bg-gold-500 scale-125 shadow-[0_0_12px_rgba(200,169,81,0.8)]'
                  : 'bg-slate-400 dark:bg-slate-500 hover:bg-slate-600 dark:hover:bg-slate-300 scale-100'
              }`}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
