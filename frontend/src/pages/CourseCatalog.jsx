import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { BookOpen, Search, CheckCircle, Clock, Target, ArrowRight } from 'lucide-react';

export default function CourseCatalog() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [wingFilter, setWingFilter] = useState('All');
  const [certFilter, setCertFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWingFilter(profile.wing || 'All');
      setCertFilter(profile.certificate_level || 'All');
    }
  }, [profile]);

  useEffect(() => {
    const load = async () => {
      try {
        const wing = profile?.wing || 'Common';
        const { data: allCourses, error } = await supabase.from('courses')
          .select('*')
          .or(`target_wing.eq.Common,target_wing.eq."${wing}"`)
          .order('certificate_level');
        
        if (error) throw error;
        setCourses(allCourses || []);

        if (user) {
          const { data: enrolled } = await supabase.from('course_enrollments')
            .select('course_id').eq('user_id', user.id);
          setEnrolledIds(new Set((enrolled || []).map(e => e.course_id)));
        }
      } catch (err) {
        console.error('Error loading courses:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, profile, loading]);

  const enroll = async (courseId) => {
    setEnrolling(courseId);
    const { error } = await supabase.from('course_enrollments')
      .insert({ user_id: user.id, course_id: courseId });
    if (!error) setEnrolledIds(prev => new Set([...prev, courseId]));
    setEnrolling(null);
  };

  const filtered = courses.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (wingFilter !== 'All' && c.target_wing !== wingFilter && c.target_wing !== 'Common') return false;
    if (certFilter !== 'All' && c.certificate_level !== certFilter) return false;
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2"><BookOpen className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> Course Catalog</h1>
        <p className="text-surface-700 text-sm">NCC training courses for {profile?.wing || 'all'} wing cadets</p>
      </div>

      {/* Filters — stack vertically on mobile */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
          <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="ncc-input ncc-input-icon" />
        </div>
        <div className="flex gap-2">
          <select value={wingFilter} onChange={e => setWingFilter(e.target.value)} className="ncc-input w-auto flex-1 sm:flex-none">
            <option value="All">All Wings</option>
            <option value="Common">Common</option>
            <option value="Army">Army</option>
            <option value="Navy">Navy</option>
            <option value="Air Force">Air Force</option>
          </select>
          <select value={certFilter} onChange={e => setCertFilter(e.target.value)} className="ncc-input w-auto flex-1 sm:flex-none">
            <option value="All">All Certs</option>
            <option value="A">A Cert</option>
            <option value="B">B Cert</option>
            <option value="C">C Cert</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {filtered.length === 0 ? (
        <div className="ncc-glass-card p-8 md:p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-surface-300" />
          <p className="text-surface-700">No courses found matching your filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map(course => {
            const isEnrolled = enrolledIds.has(course.id);
            return (
              <div key={course.id} className="ncc-glass-card p-4 md:p-5 flex flex-col hover:shadow-lg transition">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <h3 className="font-bold text-navy-900 text-sm md:text-base line-clamp-1">{course.title}</h3>
                  <span className={`ncc-badge flex-shrink-0 ${course.target_wing === 'Army' ? 'ncc-badge-army' : course.target_wing === 'Navy' ? 'ncc-badge-navy' : course.target_wing === 'Air Force' ? 'ncc-badge-airforce' : 'bg-surface-100 text-surface-700'}`}>{course.target_wing}</span>
                </div>
                <p className="text-sm text-surface-700 mb-3 md:mb-4 line-clamp-2">{course.description || 'NCC training module'}</p>
                <div className="flex items-center gap-3 md:gap-4 text-xs text-surface-700 mb-3 md:mb-4 flex-wrap">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration_hours || 0}h</span>
                  <span className="flex items-center gap-1"><Target className="w-4 h-4" /> {course.certificate_level} Cert</span>
                </div>
                {isEnrolled ? (
                  <button onClick={() => navigate(`/course/${course.id}`)} className="ncc-btn ncc-btn-primary w-full cursor-pointer">
                    <CheckCircle className="w-4 h-4" /> Continue
                  </button>
                ) : (
                  <button onClick={() => enroll(course.id)} disabled={enrolling === course.id}
                    className="ncc-btn ncc-btn-accent w-full cursor-pointer group">
                    {enrolling === course.id ? 'Enrolling...' : <>Enroll Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" /></>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
