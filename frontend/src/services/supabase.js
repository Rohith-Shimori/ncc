import { createClient } from '@supabase/supabase-js';
import { io } from 'socket.io-client';

const safeJsonParse = (text, fallback = null) => {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('[Safe JSON Parse] Failed to parse:', error.message);
    return fallback;
  }
};

// Fetch wrapper with abort timeout, offline detection and queuing
const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
  const method = options.method || 'GET';
  const isAuth = url.includes('/auth/') || url.includes('/login') || url.includes('/signup');
  
  // If the browser is offline and this is a write request (POST, PUT, DELETE), queue it!
  if (!navigator.onLine && method !== 'GET' && !isAuth) {
    try {
      const { queueOfflineTransaction } = await import('./db');
      await queueOfflineTransaction('api', url, method, options.body ? JSON.parse(options.body) : null);
      // Return a mock successful response to prevent frontend crash
      return new Response(JSON.stringify({ data: { status: 'queued', message: 'Action saved offline.' } }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error('[Offline Queue] Error queueing write request:', err);
    }
  }

  const controller = new AbortController();
  const id = setTimeout(() => {
    console.warn('[Fetch Timeout] Aborting request to:', url);
    controller.abort();
  }, timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Network request timed out after ${timeoutMs}ms`, { cause: error });
    }
    
    // If a network connection error happens during a write request, queue it too!
    if (method !== 'GET' && !isAuth) {
      try {
        const { queueOfflineTransaction } = await import('./db');
        await queueOfflineTransaction('api', url, method, options.body ? JSON.parse(options.body) : null);
        return new Response(JSON.stringify({ data: { status: 'queued', message: 'Action saved offline.' } }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.error('[Offline Queue] Error queueing write request after network error:', err);
      }
    }
    
    throw error;
  }
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase Environment Variables!");
}

const realSupabase = createClient(
  supabaseUrl || 'https://czyjaeszmnyiwjilkhls.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eWphZXN6bW55aXdqaWxraGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNTk1NjgsImV4cCI6MjA5NjczNTU2OH0.836ZD1zEuylPNR13sajLkhmccsVFMJXLUWPuy7b4IqQ'
);

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !supabaseUrl || !supabaseAnonKey;

// Mock database is now initialized asynchronously in MockSupabaseClient._initDatabase()

// Generate standard UUID
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================
// MOCK CLIENT DEFINITION
// ============================================
class MockQueryBuilder {
  constructor(table, client) {
    this.table = table;
    this.client = client;
    this.filters = [];
    this.orderBy = null;
    this.limitVal = null;
    this.rangeVal = null;
    this.action = 'select'; // select, insert, update, upsert, delete
    this.actionData = null;
    this.selectOptions = null;
  }

  select(fields, options = {}) {
    this.action = 'select';
    this.selectOptions = options;
    return this;
  }

  eq(field, value) {
    this.filters.push({ type: 'eq', field, value });
    return this;
  }

  in(field, array) {
    this.filters.push({ type: 'in', field, value: array });
    return this;
  }

  or(queryString) {
    this.filters.push({ type: 'or', value: queryString });
    return this;
  }

  order(field, options = {}) {
    this.orderBy = { field, ascending: options.ascending !== false };
    return this;
  }

  limit(number) {
    this.limitVal = number;
    return this;
  }

  range(from, to) {
    this.rangeVal = { from, to };
    return this;
  }

  insert(data) {
    this.action = 'insert';
    this.actionData = data;
    return this;
  }

  update(data) {
    this.action = 'update';
    this.actionData = data;
    return this;
  }

  upsert(data, options = {}) {
    this.action = 'upsert';
    this.actionData = data;
    this.upsertOptions = options;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  async execute() {
    return this.client._execute(this);
  }

  then(onfulfilled, onrejected) {
    return this.execute().then(onfulfilled, onrejected);
  }

  async single() {
    const { data, error } = await this.execute();
    if (error) return { data: null, error };
    if (!data || data.length === 0) return { data: null, error: { message: 'Row not found' } };
    return { data: data[0], error: null };
  }

  async maybeSingle() {
    const { data, error } = await this.execute();
    if (error) return { data: null, error };
    if (!data || data.length === 0) return { data: null, error: null };
    return { data: data[0], error: null };
  }
}

class MockChannel {
  constructor(name, client) {
    this.name = name;
    this.client = client;
    this.callbacks = [];
  }

  on(event, filter, callback) {
    this.callbacks.push({ event, filter, callback });
    return this;
  }

  subscribe() {
    this.client._subscribeChannel(this);
    return this;
  }
}

class MockSupabaseClient {
  constructor() {
    this.channels = [];
    this.initPromise = this._initDatabase();
    
    const mockStorageCache = {};
    this.storage = {
      from: (bucketName) => ({
        upload: async (path, file) => {
          let url;
          if (file instanceof Blob || file instanceof File) {
            url = URL.createObjectURL(file);
          } else {
            url = `https://mock-supabase-storage.com/${bucketName}/${path}`;
          }
          mockStorageCache[`${bucketName}/${path}`] = url;
          return { data: { path }, error: null };
        },
        getPublicUrl: (path) => {
          const cachedUrl = mockStorageCache[`${bucketName}/${path}`];
          const publicUrl = cachedUrl || (bucketName === 'avatars' 
            ? `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400`
            : `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`);
          return { data: { publicUrl } };
        }
      })
    };

    this.auth = {
      signUp: async ({ email, password, options = {} }) => {
        await this.initPromise;
        const users = safeJsonParse(localStorage.getItem('ncc_mock_auth_users') || '[]');
        if (users.find(u => u.email === email)) {
          return { data: null, error: { message: 'User already exists' } };
        }
        const newId = uuidv4();
        const metadata = options.data || {};
        const role = metadata.role || 'cadet';
        const newUser = { id: newId, email, password, role };
        users.push(newUser);
        localStorage.setItem('ncc_mock_auth_users', JSON.stringify(users));

        // Create profile dynamically based on role
        if (role === 'cadet') {
          const profiles = safeJsonParse(localStorage.getItem('ncc_mock_cadet_profiles') || '[]');
          const newProfile = {
            id: newId,
            full_name: metadata.full_name || 'Cadet',
            wing: metadata.wing || 'Common',
            certificate_level: metadata.certificate_level || 'A',
            ncc_number: metadata.ncc_number || '',
            level: 1,
            exp: 0,
            created_at: new Date().toISOString()
          };
          profiles.push(newProfile);
          localStorage.setItem('ncc_mock_cadet_profiles', JSON.stringify(profiles));
        } else if (role === 'instructor') {
          const profiles = safeJsonParse(localStorage.getItem('ncc_mock_instructor_profiles') || '[]');
          const newProfile = {
            id: newId,
            full_name: metadata.full_name || 'Instructor',
            rank: metadata.rank || '',
            unit: metadata.unit || '',
            created_at: new Date().toISOString()
          };
          profiles.push(newProfile);
          localStorage.setItem('ncc_mock_instructor_profiles', JSON.stringify(profiles));
        } else if (role === 'admin') {
          const profiles = safeJsonParse(localStorage.getItem('ncc_mock_admin_profiles') || '[]');
          const newProfile = {
            id: newId,
            full_name: metadata.full_name || 'Admin',
            created_at: new Date().toISOString()
          };
          profiles.push(newProfile);
          localStorage.setItem('ncc_mock_admin_profiles', JSON.stringify(profiles));
        }

        if (!options.mockNoSessionPersist) {
          // Set active user session
          localStorage.setItem('ncc_mock_session_user', JSON.stringify(newUser));
          this._triggerAuthChange('SIGNED_IN', newUser);
        }

        return { data: { user: newUser, session: options.mockNoSessionPersist ? null : { user: newUser } }, error: null };
      },

      admin: {
        createUser: async ({ email, password, user_metadata = {} }) => {
          await this.initPromise;
          const users = safeJsonParse(localStorage.getItem('ncc_mock_auth_users') || '[]');
          if (users.find(u => u.email === email)) {
            return { data: null, error: { message: 'User already exists' } };
          }
          const newId = uuidv4();
          const newUser = { id: newId, email, password, role: user_metadata.role || 'cadet' };
          users.push(newUser);
          localStorage.setItem('ncc_mock_auth_users', JSON.stringify(users));

          const role = user_metadata.role || 'cadet';
          if (role === 'cadet') {
            const profiles = safeJsonParse(localStorage.getItem('ncc_mock_cadet_profiles') || '[]');
            profiles.push({
              id: newId,
              full_name: user_metadata.full_name || 'Cadet',
              wing: user_metadata.wing || 'Common',
              certificate_level: user_metadata.certificate_level || 'A',
              ncc_number: user_metadata.ncc_number || '',
              level: 1,
              exp: 0,
              created_at: new Date().toISOString()
            });
            localStorage.setItem('ncc_mock_cadet_profiles', JSON.stringify(profiles));
          } else if (role === 'instructor') {
            const profiles = safeJsonParse(localStorage.getItem('ncc_mock_instructor_profiles') || '[]');
            profiles.push({
              id: newId,
              full_name: user_metadata.full_name || 'Instructor',
              created_at: new Date().toISOString()
            });
            localStorage.setItem('ncc_mock_instructor_profiles', JSON.stringify(profiles));
          } else if (role === 'admin') {
            const profiles = safeJsonParse(localStorage.getItem('ncc_mock_admin_profiles') || '[]');
            profiles.push({
              id: newId,
              full_name: user_metadata.full_name || 'Admin',
              created_at: new Date().toISOString()
            });
            localStorage.setItem('ncc_mock_admin_profiles', JSON.stringify(profiles));
          }

          return { data: { user: newUser }, error: null };
        }
      },

      signInWithPassword: async ({ email, password }) => {
        await this.initPromise;
        const users = safeJsonParse(localStorage.getItem('ncc_mock_auth_users') || '[]');
        const user = users.find(u => u.email === email);
        if (!user || user.password !== password) {
          return { data: null, error: { message: 'Invalid email or password' } };
        }

        localStorage.setItem('ncc_mock_session_user', JSON.stringify(user));
        this._triggerAuthChange('SIGNED_IN', user);

        return { data: { user, session: { user } }, error: null };
      },

      signOut: async () => {
        await this.initPromise;
        localStorage.removeItem('ncc_mock_session_user');
        this._triggerAuthChange('SIGNED_OUT', null);
        return { error: null };
      },

      getSession: async () => {
        await this.initPromise;
        const user = safeJsonParse(localStorage.getItem('ncc_mock_session_user') || 'null') ||
                     safeJsonParse(localStorage.getItem('ncc_mock_reset_temp_user') || 'null');
        return { data: { session: user ? { user } : null }, error: null };
      },

      getUser: async () => {
        await this.initPromise;
        const user = safeJsonParse(localStorage.getItem('ncc_mock_session_user') || 'null') ||
                     safeJsonParse(localStorage.getItem('ncc_mock_reset_temp_user') || 'null');
        return { data: { user }, error: user ? null : { message: 'Invalid token' } };
      },

      resetPasswordForEmail: async (email) => {
        await this.initPromise;
        const users = safeJsonParse(localStorage.getItem('ncc_mock_auth_users') || '[]');
        const user = users.find(u => u.email === email);
        if (!user) {
          return { data: null, error: { message: 'User not found' } };
        }
        localStorage.setItem('ncc_mock_reset_temp_user', JSON.stringify(user));
        return { data: {}, error: null };
      },

      updateUser: async (attributes) => {
        await this.initPromise;
        const currentUser = safeJsonParse(localStorage.getItem('ncc_mock_session_user') || 'null') ||
                            safeJsonParse(localStorage.getItem('ncc_mock_reset_temp_user') || 'null');
        if (!currentUser) {
          return { data: null, error: { message: 'Not authenticated' } };
        }
        if (attributes.password) {
          const users = safeJsonParse(localStorage.getItem('ncc_mock_auth_users') || '[]');
          const userIndex = users.findIndex(u => u.id === currentUser.id);
          if (userIndex !== -1) {
            users[userIndex].password = attributes.password;
            localStorage.setItem('ncc_mock_auth_users', JSON.stringify(users));
            currentUser.password = attributes.password;
            if (localStorage.getItem('ncc_mock_session_user')) {
              localStorage.setItem('ncc_mock_session_user', JSON.stringify(currentUser));
            }
          }
        }
        localStorage.removeItem('ncc_mock_reset_temp_user');
        return { data: { user: currentUser }, error: null };
      },

      onAuthStateChange: (callback) => {
        const id = uuidv4();
        this.listeners[id] = callback;
        // Trigger initial callback
        const user = safeJsonParse(localStorage.getItem('ncc_mock_session_user') || 'null');
        callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                delete this.listeners[id];
              }
            }
          }
        };
      }
    };
    this.listeners = {};
  }


  _triggerAuthChange(event, user) {
    Object.values(this.listeners).forEach(cb => cb(event, user ? { user } : null));
  }

  async _initDatabase() {
    const CURRENT_VERSION = 'ncc_mock_v26'; // Force reload version
    if (localStorage.getItem(CURRENT_VERSION) === 'true' && 
        localStorage.getItem('ncc_mock_courses') && 
        localStorage.getItem('ncc_mock_csv_mock_exams')) {
      return;
    }

    console.log('[Mock Database] Initializing mock database from local seeds...');

    // Helper function to generate stable course/chapter/enrollment IDs dynamically (UUID format)
    const generateStableId = (prefix, name) => {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = (hash << 5) - hash + name.charCodeAt(i);
        hash |= 0;
      }
      const hex = Math.abs(hash).toString(16).padStart(8, '0');
      return `${prefix}-0000-0000-0000-${hex.padStart(12, '0')}`;
    };

    const courseIdMap = {
      'NCC At a Glance': 'a1000000-0000-0000-0000-000000000001',
      'Drill & Commands': 'a1000000-0000-0000-0000-000000000002',
      'National Integration': 'a1000000-0000-0000-0000-000000000003',
      'Health, Hygiene & Sanitation': 'a1000000-0000-0000-0000-000000000004',
      'Map Reading': 'a1000000-0000-0000-0000-000000000005',
      'Weapon Training': 'a1000000-0000-0000-0000-000000000006'
    };

    const getCourseId = (title, wing, level) => {
      if (courseIdMap[title]) return courseIdMap[title];
      return generateStableId('a1000000', `${wing}-${level}-${title}`);
    };


    // Clear previous mock localStorage items to avoid state pollution
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ncc_mock_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // Define Default Auth Users
    const defaultAuthUsers = [
      { id: 'd0000000-0000-0000-0000-000000000001', email: 'admin@ncc.gov.in', password: 'Admin@123', full_name: 'Platform Administrator', role: 'admin' },
      { id: 'd0000000-0000-0000-0000-000000000002', email: 'instructor@ncc.gov.in', password: 'Instructor@123', full_name: 'Col. Rajveer Singh', role: 'instructor' },
      { id: 'c0000000-0000-0000-0000-000000000003', email: 'cadet@ncc.gov.in', password: 'Cadet@123', full_name: 'Cadet Rohan Sharma', role: 'cadet', wing: 'Army', certificate_level: 'B', ncc_number: 'DL/20/SD/A/100234', level: 2, exp: 1200 }
    ];

    localStorage.setItem('ncc_mock_auth_users', JSON.stringify(defaultAuthUsers));
    localStorage.setItem('ncc_mock_cadet_profiles', JSON.stringify([
      { id: 'c0000000-0000-0000-0000-000000000003', full_name: 'Cadet Rohan Sharma', wing: 'Army', certificate_level: 'B', ncc_number: 'DL/20/SD/A/100234', level: 2, exp: 1200, created_at: new Date().toISOString() }
    ]));
    localStorage.setItem('ncc_mock_instructor_profiles', JSON.stringify([
      { id: 'd0000000-0000-0000-0000-000000000002', full_name: 'Col. Rajveer Singh', rank: 'Colonel', unit: '1st Punjab Bn NCC' }
    ]));
    localStorage.setItem('ncc_mock_admin_profiles', JSON.stringify([
      { id: 'd0000000-0000-0000-0000-000000000001', full_name: 'Platform Administrator' }
    ]));

    // Seed system notifications
    localStorage.setItem('ncc_mock_notifications', JSON.stringify([
      { id: 'notif-1', user_id: 'c0000000-0000-0000-0000-000000000003', type: 'system', title: 'Welcome!', content: 'Welcome to NCC Digital Training portal.', link: '/dashboard', is_read: false, created_at: new Date().toISOString() }
    ]));

    // Seed mock exam attempts
    const defaultAttempts = [
      {
        id: 'att-00000000-0000-0000-0000-000000000001',
        user_id: 'c0000000-0000-0000-0000-000000000003',
        test_id: 'PT-A-COMMON',
        started_at: new Date(Date.now() - 24 * 3600 * 1000 * 2).toISOString(), // 2 days ago
        submitted_at: new Date(Date.now() - 24 * 3600 * 1000 * 2 + 3200 * 1000).toISOString(),
        status: 'submitted',
        score: 48,
        total_questions: 60,
        percentage: 80,
        time_spent_seconds: 3200,
        time_taken_seconds: 3200,
        tab_switch_count: 0
      },
      {
        id: 'att-00000000-0000-0000-0000-000000000002',
        user_id: 'c0000000-0000-0000-0000-000000000003',
        test_id: 'PT-B-ARMY',
        started_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
        submitted_at: new Date(Date.now() - 24 * 3600 * 1000 + 4500 * 1000).toISOString(),
        status: 'submitted',
        score: 72,
        total_questions: 100,
        percentage: 72,
        time_spent_seconds: 4500,
        time_taken_seconds: 4500,
        tab_switch_count: 1
      },
      {
        id: 'att-00000000-0000-0000-0000-000000000003',
        user_id: 'c0000000-0000-0000-0000-000000000003',
        test_id: 'PT-DRILL-ONLY',
        started_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4 hours ago
        submitted_at: new Date(Date.now() - 4 * 3600 * 1000 + 1800 * 1000).toISOString(),
        status: 'flagged',
        score: 12,
        total_questions: 30,
        percentage: 40,
        time_spent_seconds: 1800,
        time_taken_seconds: 1800,
        tab_switch_count: 4
      }
    ];

    // Seed default announcements so they are visible by default
    const defaultAnnouncements = [
      {
        id: 'ann-1',
        title: 'Annual Training Camp (ATC) 2026 Scheduled',
        content: 'The Annual Training Camp is scheduled from July 10th to July 20th at the NCC headquarters. Attendance is mandatory for all Certificate B and C cadets.',
        priority: 'high',
        target_wing: 'Common',
        created_by: 'd0000000-0000-0000-0000-000000000002',
        is_active: true,
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() // 1 day ago
      },
      {
        id: 'ann-2',
        title: 'Special Army Wing Drill Practice',
        content: 'There will be a special drill practice session for all Army Wing cadets this Friday at 0800 hours. Please wear full uniform.',
        priority: 'normal',
        target_wing: 'Army',
        created_by: 'd0000000-0000-0000-0000-000000000002',
        is_active: true,
        created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() // 2 days ago
      }
    ];
    localStorage.setItem('ncc_mock_announcements', JSON.stringify(defaultAnnouncements));

    // Seed default course enrollments for Rohan Sharma so he has courses on dashboard
    const defaultCoursesToEnroll = [
      'NCC At a Glance',
      'Drill & Commands',
      'Weapon Training & Infantry Weapons',
      'Map Reading',
      'Field Craft & Battle Craft',
      'Advanced Weapon Training',
      'Field Signals'
    ];

    const getSeededCourseId = (title) => {
      if (courseIdMap[title]) return courseIdMap[title];
      if (title === 'Weapon Training & Infantry Weapons') return getCourseId(title, 'Common', 'A');
      if (title === 'Field Craft & Battle Craft') return getCourseId(title, 'Common', 'B');
      if (title === 'Advanced Weapon Training') return getCourseId(title, 'Army', 'B');
      if (title === 'Field Signals') return getCourseId(title, 'Army', 'B');
      return getCourseId(title, 'Common', 'A');
    };

    const defaultEnrollments = defaultCoursesToEnroll.map(title => {
      const courseId = getSeededCourseId(title);
      return {
        id: `enroll-${courseId}`,
        user_id: 'c0000000-0000-0000-0000-000000000003',
        course_id: courseId,
        enrolled_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        status: 'enrolled'
      };
    });
    localStorage.setItem('ncc_mock_course_enrollments', JSON.stringify(defaultEnrollments));

    localStorage.setItem('ncc_mock_user_progress', JSON.stringify([]));
    localStorage.setItem('ncc_mock_exam_attempts', JSON.stringify([]));
    localStorage.setItem('ncc_mock_attempt_questions', JSON.stringify([]));
    localStorage.setItem('ncc_mock_csv_exam_attempts', JSON.stringify(defaultAttempts));
    localStorage.setItem('ncc_mock_csv_attempt_questions', JSON.stringify([]));
    localStorage.setItem('ncc_mock_import_logs', JSON.stringify([]));

    // Dynamic Syllabus Generation
    const syllabus = [
      { wing: 'Common', level: 'A', courses: [
        'NCC At a Glance', 'Drill & Commands', 'Weapon Training & Infantry Weapons', 'National Integration',
        'Leadership & Personality Development', 'Civil Defence & Disaster Management', 'Social Service & Awareness',
        'Health, Hygiene & Sanitation', 'Yoga & Asanas', 'Home Nursing', 'Posture Training',
        'Obstacles Training & Adventure Activities'
      ]},
      { wing: 'Common', level: 'B', courses: [
        'Career in Defence Services', 'Services Tests & Interviews', 'Self-Defence', 'Environment and Ecology',
        'Famous Leaders of India', 'History of India', 'Armed Forces & Military History', 'Map Reading',
        'Communication', 'Field Craft & Battle Craft', 'Personality Development & Officer Like Qualities (OLQs)',
        'Disaster Management & Social Awareness'
      ]},
      { wing: 'Common', level: 'C', courses: [
        'Advanced Leadership', 'Advanced Drill', 'National Security', 'Armed Forces Organisation',
        'Disaster Management', 'Social Service & Community Development', 'Personality Development & Communication Skills',
        'Map Reading & Navigation', 'Field Craft & Battle Craft', 'Military History & War Heroes',
        'General Awareness & Current Affairs', 'Officer Like Qualities (OLQs) & Interview Skills'
      ]},
      { wing: 'Army', level: 'A', courses: [
        'Field Craft Basics', 'Drill with Arms', 'Weapon Training', 'Section Formation', 'Guard Mounting', 'Battle Craft Basics'
      ]},
      { wing: 'Army', level: 'B', courses: [
        'Advanced Weapon Training', 'Field Signals', 'Patrolling', 'Camouflage & Concealment', 'Section Battle Drill', 'Ambush & Defence'
      ]},
      { wing: 'Army', level: 'C', courses: [
        'Tactical Exercises', 'Platoon Formation', 'Advanced Battle Craft', 'Internal Security Duties', 'Field Engineering', 'Communication Procedures', 'Map Reading Advanced'
      ]},
      { wing: 'Navy', level: 'A', courses: [
        'Naval Orientation', 'Parts of Ship', 'Seamanship', 'Boat Pulling', 'Rigging', 'Naval Communication Basics'
      ]},
      { wing: 'Navy', level: 'B', courses: [
        'Navigation', 'Anchoring', 'Ship Modelling', 'Naval Signals', 'Boat Sailing', 'Tides & Compass'
      ]},
      { wing: 'Navy', level: 'C', courses: [
        'Advanced Navigation', 'Naval Warfare Basics', 'Ship Organisation', 'Communication Systems', 'Sailing Expeditions', 'Naval Weapons Basics', 'Leadership at Sea'
      ]},
      { wing: 'Air Force', level: 'A', courses: [
        'Principles of Flight', 'Airframe & Aircraft Parts', 'Flying Basics', 'Aviation History', 'Aero Modelling', 'Air Navigation Basics'
      ]},
      { wing: 'Air Force', level: 'B', courses: [
        'Aircraft Instruments', 'Meteorology', 'Air Traffic Control Basics', 'Navigation Advanced', 'Aero Engines', 'Map Reading for Aviation'
      ]},
      { wing: 'Air Force', level: 'C', courses: [
        'Advanced Aviation Subjects', 'Flight Navigation', 'Aircraft Recognition', 'Air Power & Warfare', 'Aero Engine Systems', 'Aviation Safety', 'Air Force Leadership & Communication'
      ]}
    ];

    const courses = [];
    const modules = [];
    const chapters = [];
    const questionBanks = [];
    const questions = [];

    syllabus.forEach((def) => {
      def.courses.forEach((title, cIndex) => {
        const courseId = getCourseId(title, def.wing, def.level);
        const duration = 4 + (cIndex % 7);

        courses.push({
          id: courseId,
          title: title,
          description: `${title} official training course for Certificate ${def.level} cadets in the ${def.wing} wing.`,
          target_wing: def.wing,
          certificate_level: def.level,
          duration_hours: duration
        });

        const isSingleModule = (title === 'NCC At a Glance');
        const mod1Id = generateStableId('b1000000', courseId + '1');
        const mod2Id = generateStableId('b1000000', courseId + '2');

        let module1Title = `Core Concepts of ${title}`;
        let module2Title = `Practical Training & Operations`;

        if (title === 'NCC At a Glance') {
          module1Title = 'NCC History, Aims & Organisation';
        } else if (title === 'Drill & Commands') {
          module1Title = 'Basic Foot Drill';
          module2Title = 'Parade Formations';
        } else if (title === 'Health, Hygiene & Sanitation') {
          module1Title = 'First Aid Fundamentals';
          module2Title = 'Personal Hygiene';
        } else if (title === 'Map Reading') {
          module1Title = 'Introduction to Maps';
          module2Title = 'Compass & Navigation';
        }

        if (isSingleModule) {
          modules.push({ id: mod1Id, course_id: courseId, title: module1Title, order_index: 1 });
        } else {
          modules.push(
            { id: mod1Id, course_id: courseId, title: module1Title, order_index: 1 },
            { id: mod2Id, course_id: courseId, title: module2Title, order_index: 2 }
          );
        }

        const ch1Id = generateStableId('c1000000', courseId + '1-1');
        const ch2Id = generateStableId('c1000000', courseId + '1-2');
        const ch3Id = generateStableId('c1000000', courseId + '2-1');
        const ch4Id = generateStableId('c1000000', courseId + '2-2');

        let ch1 = {
          id: ch1Id,
          module_id: mod1Id,
          title: `Introduction to ${title}`,
          content_type: 'markdown',
          content_data: {},
          order_index: 1,
          content: `# Introduction to ${title}\n\n## Overview\nThis chapter covers the basic fundamentals of **${title}**, required for National Cadet Corps (NCC) Certificate **${def.level}** cadets of the **${def.wing}** wing.`
        };

        let ch2 = {
          id: ch2Id,
          module_id: mod1Id,
          title: `Theoretical Principles of ${title}`,
          content_type: 'markdown',
          content_data: {},
          order_index: 2,
          content: `# Theoretical Principles of ${title}\n\n## Study Material\nHere we explore the detailed guidelines and regulations surrounding **${title}**.`
        };

        let ch3 = {
          id: ch3Id,
          module_id: mod2Id,
          title: `Practical Training & Operations`,
          content_type: 'markdown',
          content_data: {},
          order_index: 1,
          content: `# Practical Training & Operations\n\n## Field Training\nThis section outlines the practical activities and camp drills associated with **${title}**.`
        };

        let ch4 = {
          id: ch4Id,
          module_id: mod2Id,
          title: `Mock Evaluation & Exercises`,
          content_type: 'markdown',
          content_data: {},
          order_index: 2,
          content: `# Mock Evaluation & Exercises\n\n## Self-Assessment\nTo prepare for your Certificate examination, answer the following questions.`
        };

        if (title === 'NCC At a Glance') {
          ch1 = {
            id: 'c1000000-0000-0000-0000-000000000001',
            module_id: mod1Id,
            title: 'NCC Training Slideshow',
            content_type: 'embed',
            order_index: 1,
            content_data: {
              embed_url: 'https://docs.google.com/presentation/d/1HaCvdxdSy4TXuh7HfnX7wWDA2Mkvgv2/embed?start=false&loop=false&delayms=3000'
            },
            content: 'Interactive Google Slides Presentation'
          };
        } else if (title === 'Drill & Commands') {
          ch1 = {
            id: 'c1000000-0000-0000-0000-000000000004',
            module_id: mod1Id,
            title: 'Attention and Stand at Ease',
            content_type: 'markdown',
            content_data: {},
            order_index: 1,
            content: `# Attention and Stand at Ease\n\n## Position of Attention (Savdhan)\nThe Position of Attention is the basic military position.`
          };
          ch2 = {
            id: 'c1000000-0000-0000-0000-000000000005',
            module_id: mod1Id,
            title: 'Turning and Saluting',
            content_type: 'markdown',
            content_data: {},
            order_index: 2,
            content: `# Turning and Saluting\n\n## Turnings at the Halt\nAll turnings are done in two movements.`
          };
        } else if (title === 'Health, Hygiene & Sanitation') {
          ch1 = {
            id: 'c1000000-0000-0000-0000-000000000006',
            module_id: mod1Id,
            title: 'Fractures and Bandaging',
            content_type: 'markdown',
            content_data: {},
            order_index: 1,
            content: `# Fractures and Bandaging\n\n## Types of Fractures\n1. Simple (Closed): Bone breaks but skin is intact.`
          };
        } else if (title === 'Map Reading') {
          ch1 = {
            id: 'c1000000-0000-0000-0000-000000000007',
            module_id: mod1Id,
            title: 'Topographic Maps and Conventional Signs',
            content_type: 'markdown',
            content_data: {},
            order_index: 1,
            content: `# Topographic Maps and Conventional Signs\n\n## What is a Topographic Map?`
          };
        }

        if (isSingleModule) {
          chapters.push(ch1);
        } else {
          chapters.push(ch1, ch2, ch3, ch4);
        }

        const bankId = generateStableId('d1000000', courseId);
        questionBanks.push({
          id: bankId,
          course_id: courseId,
          title: `${title} Bank`,
          description: `Questions on ${title}`
        });

        let questionsPool = [
          { id: generateStableId('f0000001', courseId), bank_id: bankId, question_text: `What is the primary objective of ${title}?`, question_type: 'mcq', options: ['Option A', 'Option B', 'Option C', 'Option D'], correct_answer: 'Option A', difficulty: 'easy', topic_tag: 'Introduction', explanation: 'Basic concept check.', points: 1 },
          { id: generateStableId('f0000002', courseId), bank_id: bankId, question_text: `Which wing is ${title} targeted for?`, question_type: 'mcq', options: ['Army', 'Navy', 'Air Force', 'All Wings'], correct_answer: def.wing === 'Common' ? 'All Wings' : def.wing, difficulty: 'medium', topic_tag: 'Targeting', explanation: 'Syllabus alignment check.', points: 1 }
        ];

        if (title === 'NCC At a Glance') {
          questionsPool = [
            { id: generateStableId('f0000001', courseId), bank_id: bankId, question_text: 'When was the NCC established in India?', question_type: 'mcq', options: ['1946', '1947', '1948', '1950'], correct_answer: '1948', difficulty: 'easy', topic_tag: 'History', explanation: 'NCC was established on 15 July 1948 under the NCC Act XXXI of 1948.', points: 1 },
            { id: generateStableId('f0000002', courseId), bank_id: bankId, question_text: 'What is the motto of the NCC?', question_type: 'mcq', options: ['Service Before Self', 'Unity and Discipline', 'Duty Honor Country', 'Jai Hind'], correct_answer: 'Unity and Discipline', difficulty: 'easy', topic_tag: 'Basics', explanation: 'The NCC motto is "Unity and Discipline".', points: 1 },
            { id: generateStableId('f0000003', courseId), bank_id: bankId, question_text: 'Who was the first Director General of NCC?', question_type: 'mcq', options: ['Lt Gen Grubb', 'Gen Cariappa', 'Maj Gen Sinha', 'Gen Thimayya'], correct_answer: 'Lt Gen Grubb', difficulty: 'medium', topic_tag: 'History', explanation: 'Lt Gen Grubb was the first DG of NCC appointed in 1948.', points: 1 },
            { id: generateStableId('f0000004', courseId), bank_id: bankId, question_text: 'The NCC was raised on the recommendation of which committee?', question_type: 'mcq', options: ['Kunzru Committee', 'Nehru Committee', 'Patel Committee', 'Kothari Committee'], correct_answer: 'Kunzru Committee', difficulty: 'medium', topic_tag: 'History', explanation: 'Raised on recommendation of Pandit H.N. Kunzru Committee in 1946.', points: 1 }
          ];
        } else if (title === 'Drill & Commands') {
          questionsPool = [
            { id: generateStableId('f0000001', courseId), bank_id: bankId, question_text: 'What is the angle formed between feet in Attention position?', question_type: 'mcq', options: ['15 degrees', '30 degrees', '45 degrees', '60 degrees'], correct_answer: '30 degrees', difficulty: 'easy', topic_tag: 'Foot Drill', explanation: 'In Savdhan, feet are turned out equally forming an angle of 30 degrees.', points: 1 },
            { id: generateStableId('f0000002', courseId), bank_id: bankId, question_text: 'What is the distance between feet in Stand at Ease position?', question_type: 'mcq', options: ['8 inches', '10 inches', '12 inches', '15 inches'], correct_answer: '12 inches', difficulty: 'easy', topic_tag: 'Foot Drill', explanation: 'In Vishram, the left foot moves 12 inches (or 30 cm) to the left.', points: 1 },
            { id: generateStableId('f0000003', courseId), bank_id: bankId, question_text: 'About Turn involves rotation of how many degrees?', question_type: 'mcq', options: ['90 degrees', '120 degrees', '180 degrees', '360 degrees'], correct_answer: '180 degrees', difficulty: 'easy', topic_tag: 'Turnings', explanation: 'About Turn (Peeche Mud) involves a 180-degree turn to the right.', points: 1 },
            { id: generateStableId('f0000004', courseId), bank_id: bankId, question_text: 'The word of command has how many parts?', question_type: 'mcq', options: ['1', '2', '3', '4'], correct_answer: '2', difficulty: 'easy', topic_tag: 'Commands', explanation: 'Word of command has Cautionary (alert) and Executive (action) parts.', points: 1 }
          ];
        } else if (title === 'Map Reading') {
          questionsPool = [
            { id: generateStableId('f0000001', courseId), bank_id: bankId, question_text: 'On a topographic map, blue color represents?', question_type: 'mcq', options: ['Roads', 'Vegetation', 'Water features', 'Contour lines'], correct_answer: 'Water features', difficulty: 'easy', topic_tag: 'Conventional Signs', explanation: 'Blue is used for water features like rivers, lakes, and wells.', points: 1 },
            { id: generateStableId('f0000002', courseId), bank_id: bankId, question_text: 'Contour lines that are close together indicate?', question_type: 'mcq', options: ['Flat ground', 'Gentle slope', 'Steep slope', 'Valley'], correct_answer: 'Steep slope', difficulty: 'easy', topic_tag: 'Contours', explanation: 'Close contour lines indicate steep slopes.', points: 1 }
          ];
        }

        questions.push(...questionsPool);
      });
    });

    localStorage.setItem('ncc_mock_courses', JSON.stringify(courses));
    localStorage.setItem('ncc_mock_chapters', JSON.stringify(chapters));
    localStorage.setItem('ncc_mock_question_banks', JSON.stringify(questionBanks));
    localStorage.setItem('ncc_mock_questions', JSON.stringify(questions));
    localStorage.setItem('ncc_mock_modules', JSON.stringify(modules));

    // CSV parsing logic helper
    const parseCSVHelper = (text) => {
      const lines = [];
      let row = [""];
      lines.push(row);
      let insideQuote = false;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
          if (insideQuote && nextChar === '"') {
            row[row.length - 1] += '"';
            i++;
          } else {
            insideQuote = !insideQuote;
          }
        } else if (char === ',') {
          if (insideQuote) {
            row[row.length - 1] += ',';
          } else {
            row.push('');
          }
        } else if (char === '\n' || char === '\r') {
          if (char === '\r' && nextChar === '\n') {
            i++;
          }
          if (insideQuote) {
            row[row.length - 1] += '\n';
          } else {
            row = [''];
            lines.push(row);
          }
        } else {
          row[row.length - 1] += char;
        }
      }

      const headers = lines[0].map(h => h.trim());
      const data = [];
      for (let idx = 1; idx < lines.length; idx++) {
        const r = lines[idx];
        if (r.length === 1 && r[0] === '') continue;
        const obj = {};
        headers.forEach((h, hIdx) => {
          obj[h] = r[hIdx] !== undefined ? r[hIdx] : '';
        });
        data.push(obj);
      }
      return data;
    };

    const fetchAndParse = async (url) => {
      try {
        const res = await fetchWithTimeout(url);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const text = await res.text();
        return parseCSVHelper(text);
      } catch (e) {
        console.warn(`[Mock Database] Failed to fetch/parse ${url}:`, e);
        return [];
      }
    };

    console.log('[Mock Database] Fetching CSV files from public directory...');
    const [
      subjectsCSV,
      modulesCSV,
      questionsCSV,
      examsCSV,
      gradingCSV,
      anticheatCSV,
      analyticsCSV
    ] = await Promise.all([
      fetchAndParse('/data/subject_codes.csv'),
      fetchAndParse('/data/modules.csv'),
      fetchAndParse('/data/question_bank_master.csv'),
      fetchAndParse('/data/practice_tests.csv'),
      fetchAndParse('/data/grading_policy.csv'),
      fetchAndParse('/data/anticheat_config.csv'),
      fetchAndParse('/data/analytics_config.csv')
    ]);

    // Save CSV-driven tables
    localStorage.setItem('ncc_mock_csv_subjects', JSON.stringify(subjectsCSV.map(row => ({
      subject_code: row.subject_code,
      subject_name: row.subject_name,
      description: row.description || `${row.subject_name} course`
    }))));

    localStorage.setItem('ncc_mock_csv_modules', JSON.stringify(modulesCSV.map(row => ({
      id: parseInt(row.module_id.replace('MOD-', ''), 10) || parseInt(row.module_id, 10),
      subject_code: row.subject_code,
      module_number: parseInt(row.order_in_course, 10),
      module_name: row.module_name
    }))));

    localStorage.setItem('ncc_mock_csv_questions', JSON.stringify(questionsCSV.map(row => ({
      question_id: row.question_id,
      subject_code: row.subject_code,
      module_number: parseInt(row.module_number, 10) || null,
      difficulty: parseInt(row.difficulty, 10) || 1,
      question_text: row.question_text,
      option_a: row.option_a,
      option_b: row.option_b,
      option_c: row.option_c || null,
      option_d: row.option_d || null,
      correct_answer: row.correct_answer,
      explanation: row.explanation || null,
      active: (row.active || 'TRUE').toUpperCase(),
      certificate: row.certificate || 'Common',
      wing: row.wing || 'Common'
    }))));

    localStorage.setItem('ncc_mock_csv_mock_exams', JSON.stringify(examsCSV.map(row => {
      let wing = row.wing;
      if (wing === 'ALL' || wing === 'Common') wing = 'Common';
      else if (wing === 'ARMY') wing = 'Army';
      else if (wing === 'NAVY') wing = 'Navy';
      else if (wing === 'AIR') wing = 'Air Force';

      return {
        test_id: row.test_id,
        test_name: row.test_name,
        wing: wing,
        certificate_level: row.certificate,
        time_limit_minutes: parseInt(row.time_limit_minutes, 10) || 60,
        passing_percent: parseInt(row.passing_percent, 10) || 60,
        question_distribution: row.question_distribution,
        is_active: (row.is_active || 'TRUE').toUpperCase() === 'TRUE'
      };
    })));

    localStorage.setItem('ncc_mock_csv_grading_policy', JSON.stringify(gradingCSV));
    localStorage.setItem('ncc_mock_csv_anticheat_config', JSON.stringify(anticheatCSV));
    localStorage.setItem('ncc_mock_csv_analytics_config', JSON.stringify(analyticsCSV));

    console.log('[Mock Database] Database successfully populated from local seeds!');
    localStorage.setItem(CURRENT_VERSION, 'true');
  }

  _runMockTriggers(table, insertedItems) {
    if (table === 'announcements') {
      const notifs = this._getTableData('notifications') || [];
      const cadets = this._getTableData('cadet_profiles') || [];
      let updated = false;
      for (const item of insertedItems) {
        if (item.is_active) {
          cadets.forEach(cadet => {
            const wingMatch = item.target_wing === 'Common' || (cadet.wing && cadet.wing.toLowerCase() === item.target_wing.toLowerCase());
            if (wingMatch) {
              const notif = {
                id: uuidv4(),
                user_id: cadet.id,
                type: 'announcement',
                title: item.title,
                content: item.content.length > 100 ? item.content.substring(0, 97) + '...' : item.content,
                link: '/dashboard',
                is_read: false,
                created_at: new Date().toISOString()
              };
              notifs.push(notif);
              this._notifyChanges('notifications', 'INSERT', null, notif);
              updated = true;
            }
          });
        }
      }
      if (updated) this._saveTableData('notifications', notifs);
    } else if (table === 'csv_mock_exams') {
      const notifs = this._getTableData('notifications') || [];
      const cadets = this._getTableData('cadet_profiles') || [];
      let updated = false;
      for (const item of insertedItems) {
        if (item.is_active) {
          cadets.forEach(cadet => {
            const wingMatch = item.wing === 'Common' || (cadet.wing && cadet.wing.toLowerCase() === item.wing.toLowerCase());
            if (wingMatch) {
              const notif = {
                id: uuidv4(),
                user_id: cadet.id,
                type: 'exam',
                title: 'New Test Released: ' + item.test_name,
                content: `A new mock exam is now available for ${item.wing} wing, Certificate ${item.certificate_level}.`,
                link: '/practice-tests',
                is_read: false,
                created_at: new Date().toISOString()
              };
              notifs.push(notif);
              this._notifyChanges('notifications', 'INSERT', null, notif);
              updated = true;
            }
          });
        }
      }
      if (updated) this._saveTableData('notifications', notifs);
    } else if (table === 'courses') {
      const notifs = this._getTableData('notifications') || [];
      const cadets = this._getTableData('cadet_profiles') || [];
      let updated = false;
      for (const item of insertedItems) {
        cadets.forEach(cadet => {
          const wingMatch = item.target_wing === 'Common' || (cadet.wing && cadet.wing.toLowerCase() === item.target_wing.toLowerCase());
          if (wingMatch) {
            const notif = {
              id: uuidv4(),
              user_id: cadet.id,
              type: 'enrollment',
              title: 'New Course Available: ' + item.title,
              content: `A new training module has been published for ${item.target_wing} wing.`,
              link: '/courses',
              is_read: false,
              created_at: new Date().toISOString()
            };
            notifs.push(notif);
            this._notifyChanges('notifications', 'INSERT', null, notif);
            updated = true;
          }
        });
      }
      if (updated) this._saveTableData('notifications', notifs);
    }
  }

  from(table) {
    return new MockQueryBuilder(table, this);
  }

  channel(name) {
    return new MockChannel(name, this);
  }

  removeChannel(chan) {
    this.channels = this.channels.filter(c => c !== chan);
  }

  _subscribeChannel(chan) {
    this.channels.push(chan);
  }

  _notifyChanges(table, eventType, oldRow, newRow) {
    for (const chan of this.channels) {
      for (const cb of chan.callbacks) {
        if (cb.event === 'postgres_changes') {
          const filterOpts = cb.filter || {};
          if (filterOpts.table === table) {
            let match = true;
            if (filterOpts.filter) {
              const parts = filterOpts.filter.split('=eq.');
              if (parts.length === 2) {
                const field = parts[0];
                const val = parts[1];
                const targetRow = newRow || oldRow;
                if (targetRow && String(targetRow[field]) !== String(val)) {
                  match = false;
                }
              }
            }
            if (match) {
              cb.callback({
                eventType,
                new: newRow,
                old: oldRow
              });
            }
          }
        }
      }
    }
  }

  _getPkField(table) {
    if (table === 'csv_questions') return 'question_id';
    if (table === 'csv_mock_exams') return 'test_id';
    if (table === 'csv_subjects') return 'subject_code';
    return 'id';
  }

  _getTableData(table) {
    return safeJsonParse(localStorage.getItem(`ncc_mock_${table}`) || '[]');
  }

  _saveTableData(table, data) {
    localStorage.setItem(`ncc_mock_${table}`, JSON.stringify(data));
  }

  async _execute(builder) {
    await this.initPromise;
    let list = this._getTableData(builder.table);

    // Filter evaluations
    for (const filter of builder.filters) {
      if (filter.type === 'eq') {
        list = list.filter(r => String(r[filter.field]) === String(filter.value));
      } else if (filter.type === 'in') {
        const arr = Array.isArray(filter.value) ? filter.value : [];
        list = list.filter(r => arr.map(String).includes(String(r[filter.field])));
      } else if (filter.type === 'or') {
        const conditions = filter.value.split(',');
        list = list.filter(r => {
          return conditions.some(cond => {
            const parts = cond.split('.');
            if (parts.length >= 3 && parts[1] === 'eq') {
              const field = parts[0];
              const value = parts[2].replace(/^["']|["']$/g, '');
              return String(r[field]) === String(value);
            }
            return false;
          });
        });
      }
    }

    // Sorting
    if (builder.orderBy) {
      const field = builder.orderBy.field;
      const asc = builder.orderBy.ascending;
      list.sort((a, b) => {
        if (a[field] < b[field]) return asc ? -1 : 1;
        if (a[field] > b[field]) return asc ? 1 : -1;
        return 0;
      });
    }

    // Limit
    if (builder.limitVal !== null) {
      list = list.slice(0, builder.limitVal);
    }

    // Range
    if (builder.rangeVal !== null) {
      list = list.slice(builder.rangeVal.from, builder.rangeVal.to + 1);
    }

    // Actions
    if (builder.action === 'select') {
      // Resolve relationship joins for mock queries
      if (builder.table === 'csv_mock_exams') {
        const courses = this._getTableData('courses');
        list = list.map(t => {
          const course = courses.find(c => c.id === t.course_id);
          return {
            ...t,
            courses: course ? {
              id: course.id,
              title: course.title,
              description: course.description,
              target_wing: course.target_wing,
              certificate_level: course.certificate_level
            } : null
          };
        });
      } else if (builder.table === 'course_enrollments') {
        const courses = this._getTableData('courses');
        list = list.map(e => {
          const course = courses.find(c => c.id === e.course_id);
          return {
            ...e,
            courses: course ? {
              id: course.id,
              title: course.title,
              description: course.description,
              target_wing: course.target_wing,
              certificate_level: course.certificate_level
            } : null
          };
        });
      } else if (builder.table === 'csv_questions') {
        const csv_subjects = this._getTableData('csv_subjects');
        list = list.map(q => {
          const subject = csv_subjects.find(s => s.subject_code === q.subject_code);
          return {
            ...q,
            csv_subjects: subject ? {
              subject_name: subject.subject_name
            } : null
          };
        });
      } else if (builder.table === 'csv_modules') {
        const chapters = this._getTableData('chapters');
        list = list.map(m => {
          const modChapters = chapters.filter(c => c.module_id === m.id);
          return {
            ...m,
            chapters: modChapters
          };
        });
      } else if (builder.table === 'csv_exam_attempts') {
        const tests = this._getTableData('csv_mock_exams');
        list = list.map(ta => {
          const test = tests.find(t => String(t.test_id) === String(ta.test_id));
          return {
            ...ta,
            time_taken_seconds: ta.time_taken_seconds || ta.time_spent_seconds || 0,
            tab_switches: ta.tab_switches !== undefined ? ta.tab_switches : ta.tab_switch_count || 0,
            tests: test ? {
              id: test.test_id,
              title: test.test_name,
              course_id: test.course_id,
              passing_score: test.passing_percent
            } : null,
            csv_mock_exams: test ? {
              test_id: test.test_id,
              test_name: test.test_name,
              course_id: test.course_id,
              passing_percent: test.passing_percent,
              certificate_level: test.certificate_level,
              wing: test.wing
            } : null
          };
        });
      }

      let count = null;
      if (builder.selectOptions?.count === 'exact') {
        count = list.length;
      }
      if (builder.selectOptions?.head === true) {
        return { data: [], error: null, count };
      }
      return { data: list, error: null, count };
    }

    if (builder.action === 'insert') {
      const fullList = this._getTableData(builder.table);
      const itemsToInsert = Array.isArray(builder.actionData) ? builder.actionData : [builder.actionData];
      const inserted = [];
      const pkField = this._getPkField(builder.table);

      for (const item of itemsToInsert) {
        const newItem = { ...item };
        if (!newItem[pkField]) {
          if (pkField === 'id') {
            newItem.id = uuidv4();
          } else if (pkField === 'test_id') {
            newItem.test_id = 'exam_' + Date.now();
          } else if (pkField === 'question_id') {
            newItem.question_id = 'q_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
          }
        }
        if (!newItem.created_at) newItem.created_at = new Date().toISOString();
        fullList.push(newItem);
        inserted.push(newItem);
        this._notifyChanges(builder.table, 'INSERT', null, newItem);
      }

      this._saveTableData(builder.table, fullList);
      this._runMockTriggers(builder.table, inserted);
      return { data: inserted, error: null };
    }

    if (builder.action === 'update') {
      const fullList = this._getTableData(builder.table);
      const updated = [];
      const pkField = this._getPkField(builder.table);

      const filteredIds = list.map(r => r[pkField]);
      const updatedList = fullList.map(r => {
        if (filteredIds.includes(r[pkField])) {
          const oldRow = { ...r };
          const merged = { ...r, ...builder.actionData };
          updated.push(merged);
          this._notifyChanges(builder.table, 'UPDATE', oldRow, merged);
          return merged;
        }
        return r;
      });

      this._saveTableData(builder.table, updatedList);
      return { data: updated, error: null };
    }

    if (builder.action === 'upsert') {
      const fullList = this._getTableData(builder.table);
      const itemsToUpsert = Array.isArray(builder.actionData) ? builder.actionData : [builder.actionData];
      const pkField = this._getPkField(builder.table);
      const onConflict = builder.upsertOptions?.onConflict || pkField;
      const conflictKeys = onConflict.split(',');

      const upserted = [];

      for (const item of itemsToUpsert) {
        // Find match based on conflict keys
        const index = fullList.findIndex(existing => {
          return conflictKeys.every(k => {
            const key = k.trim();
            return String(existing[key]) === String(item[key]);
          });
        });

        if (index !== -1) {
          // Update
          const oldRow = { ...fullList[index] };
          fullList[index] = { ...fullList[index], ...item };
          upserted.push(fullList[index]);
          this._notifyChanges(builder.table, 'UPDATE', oldRow, fullList[index]);
        } else {
          // Insert
          const newItem = { ...item };
          if (!newItem[pkField]) {
            if (pkField === 'id') {
              newItem.id = uuidv4();
            } else if (pkField === 'test_id') {
              newItem.test_id = 'exam_' + Date.now();
            } else if (pkField === 'question_id') {
              newItem.question_id = 'q_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            }
          }
          if (!newItem.created_at) newItem.created_at = new Date().toISOString();
          fullList.push(newItem);
          upserted.push(newItem);
          this._notifyChanges(builder.table, 'INSERT', null, newItem);
        }
      }

      this._saveTableData(builder.table, fullList);
      this._runMockTriggers(builder.table, upserted);
      return { data: upserted, error: null };
    }

    if (builder.action === 'delete') {
      const fullList = this._getTableData(builder.table);
      const pkField = this._getPkField(builder.table);
      const filteredIds = list.map(r => r[pkField]);
      const remaining = fullList.filter(r => !filteredIds.includes(r[pkField]));
      const deleted = fullList.filter(r => filteredIds.includes(r[pkField]));

      for (const deletedItem of deleted) {
        this._notifyChanges(builder.table, 'DELETE', deletedItem, null);
      }

      this._saveTableData(builder.table, remaining);
      return { data: deleted, error: null };
    }

    return { data: [], error: null };
  }

  // ============================================
  // DATABASE PROCEDURES (RPCs)
  // ============================================
  async rpc(fn, params = {}) {
    await this.initPromise;
    // 1. fn_get_course_chapter_ids
    if (fn === 'fn_get_course_chapter_ids') {
      const courseId = params.p_course_id;
      const csv_modules = this._getTableData('csv_modules').filter(m => m.course_id === courseId);
      const moduleIds = csv_modules.map(m => m.id);
      const chapters = this._getTableData('chapters').filter(c => moduleIds.includes(c.module_id));
      return { data: chapters.map(c => c.id), error: null };
    }

    // 2. fn_start_exam
    if (fn === 'fn_start_exam' || fn === 'fn_start_csv_exam') {
      const testId = params.p_test_id;
      const tests = this._getTableData('csv_mock_exams');
      const test = tests.find(t => String(t.test_id) === String(testId));
      if (!test) return { data: null, error: { message: 'Test not found' } };

      const allQuestions = this._getTableData('csv_questions');
      
      const distribution = (test.question_distribution || '').split('|');
      let selected = [];
      
      distribution.forEach(item => {
        if(!item) return;
        const [subjectCode, countStr] = item.split(':');
        const count = parseInt(countStr, 10) || 0;
        let candidates = allQuestions.filter(q => q.subject_code === subjectCode && String(q.active).toUpperCase() === 'TRUE');
        candidates = candidates.sort(() => 0.5 - Math.random());
        selected = selected.concat(candidates.slice(0, count));
      });

      selected = selected.sort(() => 0.5 - Math.random());

      const currentUser = safeJsonParse(localStorage.getItem('ncc_mock_session_user') || '{}');
      const attemptId = uuidv4();
      const attempt = {
        id: attemptId,
        test_id: testId,
        user_id: currentUser.id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        total_questions: selected.length,
        time_spent_seconds: 0,
        tab_switch_count: 0
      };

      const attempts = this._getTableData('csv_exam_attempts');
      attempts.push(attempt);
      this._saveTableData('csv_exam_attempts', attempts);
      
      const attemptQuestionsAll = this._getTableData('csv_attempt_questions');
      selected.forEach(q => {
        attemptQuestionsAll.push({
          id: uuidv4(),
          attempt_id: attemptId,
          question_id: q.question_id,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          subject_code: q.subject_code,
          user_answer: null,
          is_correct: null
        });
      });
      this._saveTableData('csv_attempt_questions', attemptQuestionsAll);

      return {
        data: {
          attempt_id: attemptId,
          duration_minutes: parseInt(test.time_limit_minutes) || 20,
          test_title: test.test_name,
          csv_questions: selected.map(q => ({
            id: q.question_id,
            question_text: q.question_text,
            options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean)
          }))
        },
        error: null
      };
    }

    // 3. fn_submit_exam
    if (fn === 'fn_submit_exam' || fn === 'fn_submit_csv_exam') {
      const attemptId = params.p_attempt_id;
      const answers = params.p_answers || {};
      const tabSwitches = params.p_tab_switches || 0;
      const timeSpent = params.p_time_spent || 0;

      const attempts = this._getTableData('csv_exam_attempts');
      const attemptIndex = attempts.findIndex(a => a.id === attemptId);
      if (attemptIndex === -1) return { data: null, error: { message: 'Attempt not found' } };
      const attempt = attempts[attemptIndex];

      const test = this._getTableData('csv_mock_exams').find(t => String(t.test_id) === String(attempt.test_id));
      
      const attemptQuestionsAll = this._getTableData('csv_attempt_questions');
      const attemptQuestions = attemptQuestionsAll.filter(q => q.attempt_id === attemptId);

      let correct = 0;
      let total = attemptQuestions.length;

      for (const q of attemptQuestions) {
        const uAns = answers[q.question_id];
        let correctText = '';
        if (q.correct_answer === 'A') correctText = q.option_a;
        if (q.correct_answer === 'B') correctText = q.option_b;
        if (q.correct_answer === 'C') correctText = q.option_c;
        if (q.correct_answer === 'D') correctText = q.option_d;
        
        const isCorrect = uAns && ((String(uAns).trim() === String(correctText).trim()) || (String(uAns).trim() === String(q.correct_answer).trim()));
        
        if (isCorrect) correct++;

        q.user_answer = uAns;
        q.is_correct = !!isCorrect;
      }
      
      this._saveTableData('csv_attempt_questions', attemptQuestionsAll);

      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      
      const gradingPolicies = this._getTableData('csv_grading_policy');
      let gradeInfo = { grade: 'FAIL', badge: 'none', label: 'Fail', message: 'Below pass mark.', colour_code: '#c62828' };
      for (const gp of gradingPolicies) {
        if (pct >= parseInt(gp.min_percent) && pct <= parseInt(gp.max_percent)) {
          gradeInfo = gp;
          break;
        }
      }

      const expGain = pct * 10; 

      attempt.submitted_at = new Date().toISOString();
      attempt.score = correct; 
      attempt.percentage = pct;
      attempt.total_questions = total;
      attempt.tab_switch_count = tabSwitches;
      attempt.tab_switches = tabSwitches;
      attempt.time_spent_seconds = timeSpent;
      attempt.time_taken_seconds = timeSpent;
      const anticheat = this._getTableData('csv_anticheat_config');
      const maxSwitchesSetting = anticheat.find(c => c.setting_key === 'max_tab_switches_before_flag');
      const maxSwitches = maxSwitchesSetting ? parseInt(maxSwitchesSetting.value) : 2;
      attempt.status = tabSwitches >= maxSwitches ? 'flagged' : 'submitted';

      attempts[attemptIndex] = attempt;
      this._saveTableData('csv_exam_attempts', attempts);

      const currentUser = safeJsonParse(localStorage.getItem('ncc_mock_session_user') || '{}');
      const profiles = this._getTableData('cadet_profiles');
      const pIndex = profiles.findIndex(p => p.id === currentUser.id);
      if (pIndex !== -1) {
        const profile = profiles[pIndex];
        profile.exp = (profile.exp || 0) + expGain;
        const newLevel = Math.floor(profile.exp / 1000) + 1;
        if (newLevel > (profile.level || 1)) {
          profile.level = newLevel;
          const notifs = this._getTableData('notifications');
          const levelNotif = {
            id: uuidv4(),
            user_id: currentUser.id,
            type: 'achievement',
            title: 'Level Up! 🎖️',
            content: `Congratulations! You have reached Level ${newLevel}. Keep up the dedication!`,
            link: '/profile',
            is_read: false,
            created_at: new Date().toISOString()
          };
          notifs.push(levelNotif);
          this._saveTableData('notifications', notifs);
          this._notifyChanges('notifications', 'INSERT', null, levelNotif);
        }
        profiles[pIndex] = profile;
        this._saveTableData('cadet_profiles', profiles);
      }

      const notifs = this._getTableData('notifications');
      const notif = {
        id: uuidv4(),
        user_id: currentUser.id,
        type: 'exam',
        title: `Exam Results: ${test ? test.test_name : 'Mock Exam'}`,
        content: `You scored ${pct}% (${correct}/${total}) and earned ${expGain} EXP.`,
        link: `/exam-results/${attemptId}`,
        is_read: false,
        created_at: new Date().toISOString()
      };
      notifs.push(notif);
      this._saveTableData('notifications', notifs);
      this._notifyChanges('notifications', 'INSERT', null, notif);

      return {
        data: {
          score: correct,
          total: total,
          exp_gain: expGain,
          percentage: pct,
          status: attempt.status,
          passed: pct >= (test ? test.passing_percent : 60),
          grade_info: gradeInfo
        },
        error: null
      };
    }

    // 4. fn_get_exam_results
    if (fn === 'fn_get_exam_results') {
      const attemptId = params.p_attempt_id;
      const attempt = this._getTableData('csv_exam_attempts').find(a => a.id === attemptId);
      if (!attempt) return { data: null, error: { message: 'Results not found' } };

      const test = this._getTableData('csv_mock_exams').find(t => String(t.test_id) === String(attempt.test_id));
      const attemptQuestions = this._getTableData('csv_attempt_questions').filter(q => q.attempt_id === attemptId);
      
      let correct = attemptQuestions.filter(q => q.is_correct).length;
      let total = attempt.total_questions || 1;
      let pct = Math.round((correct / total) * 100);

      const gradingPolicies = this._getTableData('csv_grading_policy');
      let gradeInfo = { grade: 'FAIL', badge: 'none', label: 'Fail', message: 'Below pass mark.', colour_code: '#c62828' };
      for (const gp of gradingPolicies) {
        if (pct >= parseInt(gp.min_percent) && pct <= parseInt(gp.max_percent)) {
          gradeInfo = gp;
          break;
        }
      }

      return {
        data: {
          attempt_id: attempt.id,
          test_title: test ? test.test_name : 'Mock Exam',
          score: correct,
          total_questions: attempt.total_questions || 0,
          passed: pct >= (test ? test.passing_percent : 60),
          time_spent: attempt.time_spent_seconds,
          tab_switches: attempt.tab_switch_count,
          status: attempt.status,
          grading_data: attemptQuestions.map(q => {
             let correctText = '';
             if (q.correct_answer === 'A') correctText = q.option_a;
             if (q.correct_answer === 'B') correctText = q.option_b;
             if (q.correct_answer === 'C') correctText = q.option_c;
             if (q.correct_answer === 'D') correctText = q.option_d;
             return {
                 question_id: q.question_id,
                 question_text: q.question_text,
                 topic_tag: q.subject_code,
                 user_answer: q.user_answer,
                 correct_answer: correctText || q.correct_answer,
                 is_correct: q.is_correct
             }
          }),
          grade_info: gradeInfo
        },
        error: null
      };
    }

    if (fn === 'fn_import_csv_data') {
      const { table, data } = params;
      let existing = this._getTableData(table) || [];
      
      let pk = 'id';
      if (table === 'csv_questions') pk = 'question_id';
      else if (table === 'csv_subjects') pk = 'subject_code';
      else if (table === 'csv_modules') pk = 'module_id';
      else if (table === 'csv_mock_exams') pk = 'test_id';
      else if (table === 'csv_grading_policy') pk = 'grade';
      else if (table === 'csv_analytics_config') pk = 'metric_id';
      else if (table === 'csv_anticheat_config') pk = 'setting_key';

      let imported = 0;
      let updated = 0;
      let skipped = 0;

      data.forEach(row => {
        if (!row[pk]) {
          skipped++;
          return;
        }
        const index = existing.findIndex(r => r[pk] === row[pk]);
        if (index !== -1) {
          existing[index] = { ...existing[index], ...row };
          updated++;
        } else {
          existing.push(row);
          imported++;
        }
      });

      this._saveTableData(table, existing);

      const logs = this._getTableData('csv_import_logs') || [];
      logs.push({
        id: uuidv4(),
        table_name: table,
        imported_count: imported,
        updated_count: updated,
        skipped_count: skipped,
        created_at: new Date().toISOString()
      });
      this._saveTableData('csv_import_logs', logs);

      return { data: { imported, updated, skipped }, error: null };
    }

    // 5. fn_mark_notification_read
    if (fn === 'fn_mark_notification_read') {
      const notifId = params.p_notification_id;
      const notifs = this._getTableData('notifications');
      const idx = notifs.findIndex(n => n.id === notifId);
      if (idx !== -1) {
        const oldNotif = { ...notifs[idx] };
        notifs[idx].is_read = true;
        this._saveTableData('notifications', notifs);
        this._notifyChanges('notifications', 'UPDATE', oldNotif, notifs[idx]);
      }
      return { data: null, error: null };
    }

    // fn_mark_all_notifications_read
    if (fn === 'fn_mark_all_notifications_read') {
      const sessionUser = safeJsonParse(localStorage.getItem('ncc_mock_session_user') || '{}');
      const notifs = this._getTableData('notifications');
      let changed = false;
      const updatedNotifs = notifs.map(n => {
        if (n.user_id === sessionUser.id && !n.is_read) {
          const old = { ...n };
          n.is_read = true;
          this._notifyChanges('notifications', 'UPDATE', old, n);
          changed = true;
        }
        return n;
      });
      if (changed) {
        this._saveTableData('notifications', updatedNotifs);
      }
      return { data: null, error: null };
    }

    // fn_delete_notification
    if (fn === 'fn_delete_notification') {
      const notifId = params.p_notification_id;
      const notifs = this._getTableData('notifications');
      const remaining = notifs.filter(n => n.id !== notifId);
      const deleted = notifs.find(n => n.id === notifId);
      if (deleted) {
        this._notifyChanges('notifications', 'DELETE', deleted, null);
        this._saveTableData('notifications', remaining);
      }
      return { data: null, error: null };
    }

    // fn_clear_all_notifications
    if (fn === 'fn_clear_all_notifications') {
      const sessionUser = safeJsonParse(localStorage.getItem('ncc_mock_session_user') || '{}');
      const notifs = this._getTableData('notifications');
      const remaining = notifs.filter(n => n.user_id !== sessionUser.id);
      const deleted = notifs.filter(n => n.user_id === sessionUser.id);
      for (const d of deleted) {
        this._notifyChanges('notifications', 'DELETE', d, null);
      }
      this._saveTableData('notifications', remaining);
      return { data: null, error: null };
    }

    // fn_update_daily_streak
    if (fn === 'fn_update_daily_streak') {
      const currentUser = safeJsonParse(localStorage.getItem('ncc_mock_session_user') || '{}');
      const profiles = this._getTableData('cadet_profiles');
      const pIndex = profiles.findIndex(p => p.id === currentUser.id);
      if (pIndex === -1) {
        return { data: { success: false, message: 'Not a cadet' }, error: null };
      }

      const profile = profiles[pIndex];
      const todayStr = new Date().toISOString().split('T')[0];
      const lastLogin = profile.last_login_date;
      let currentStreak = profile.current_streak || 0;
      let longestStreak = profile.longest_streak || 0;

      // If already logged in today, do nothing
      if (lastLogin === todayStr) {
        return { data: { success: true, streak: currentStreak, updated: false }, error: null };
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastLogin === yesterdayStr) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      profile.current_streak = currentStreak;
      profile.longest_streak = longestStreak;
      profile.last_login_date = todayStr;

      profiles[pIndex] = profile;
      this._saveTableData('cadet_profiles', profiles);

      // Also update session user to match
      const sessionUser = safeJsonParse(localStorage.getItem('ncc_mock_session_user') || '{}');
      sessionUser.current_streak = currentStreak;
      sessionUser.longest_streak = longestStreak;
      sessionUser.last_login_date = todayStr;
      localStorage.setItem('ncc_mock_session_user', JSON.stringify(sessionUser));

      return { data: { success: true, streak: currentStreak, updated: true }, error: null };
    }

    // fn_complete_chapter
    if (fn === 'fn_complete_chapter') {
      const chapterId = params.p_chapter_id;
      const currentUser = safeJsonParse(localStorage.getItem('ncc_mock_session_user') || '{}');
      
      let progressList = this._getTableData('user_progress') || [];
      const pIdx = progressList.findIndex(p => p.user_id === currentUser.id && p.chapter_id === chapterId);
      if (pIdx !== -1) {
        progressList[pIdx].completed = true;
        progressList[pIdx].completed_at = new Date().toISOString();
      } else {
        progressList.push({
          id: uuidv4(),
          user_id: currentUser.id,
          chapter_id: chapterId,
          completed: true,
          completed_at: new Date().toISOString()
        });
      }
      this._saveTableData('user_progress', progressList);

      // Award 100 EXP to cadet
      const profiles = this._getTableData('cadet_profiles');
      const profileIndex = profiles.findIndex(p => p.id === currentUser.id);
      if (profileIndex !== -1) {
        const profile = profiles[profileIndex];
        profile.exp = (profile.exp || 0) + 100;
        const newLevel = Math.floor(profile.exp / 1000) + 1;
        if (newLevel > (profile.level || 1)) {
          profile.level = newLevel;
          const notifs = this._getTableData('notifications') || [];
          notifs.push({
            id: uuidv4(),
            user_id: currentUser.id,
            type: 'achievement',
            title: 'Level Up! 🎖️',
            content: `Congratulations! You have reached Level ${newLevel}. Keep up the dedication!`,
            link: '/profile',
            is_read: false,
            created_at: new Date().toISOString()
          });
          this._saveTableData('notifications', notifs);
        }
        profiles[profileIndex] = profile;
        this._saveTableData('cadet_profiles', profiles);
      }

      return { data: null, error: null };
    }

    // fn_get_my_csv_attempts
    if (fn === 'fn_get_my_csv_attempts') {
      const userId = params.p_user_id || safeJsonParse(localStorage.getItem('ncc_mock_session_user') || '{}').id;
      const attempts = this._getTableData('csv_exam_attempts').filter(a => a.user_id === userId && (a.status === 'submitted' || a.status === 'flagged'));
      const tests = this._getTableData('csv_mock_exams');

      const attemptsMapped = attempts.map(a => {
        const test = tests.find(t => String(t.test_id) === String(a.test_id));
        return {
          id: a.id,
          user_id: a.user_id,
          test_id: a.test_id,
          status: a.status,
          score: a.score,
          total_questions: a.total_questions,
          percentage: a.percentage,
          time_taken_seconds: a.time_spent_seconds,
          tab_switches: a.tab_switch_count,
          started_at: a.started_at,
          submitted_at: a.submitted_at,
          test_name: test ? test.test_name : 'Mock Exam',
          passing_percent: test ? test.passing_percent : 60
        };
      });

      attemptsMapped.sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
      return { data: attemptsMapped, error: null };
    }

    // fn_get_leaderboard
    if (fn === 'fn_get_leaderboard') {
      const limit = params.p_limit || 10;
      const wing = params.p_wing || 'All';
      const currentUser = safeJsonParse(localStorage.getItem('ncc_mock_session_user') || '{}');

      let cadets = this._getTableData('cadet_profiles');
      if (wing !== 'All') {
        cadets = cadets.filter(c => c.wing === wing);
      }

      cadets.sort((a, b) => (b.exp || 0) - (a.exp || 0));

      const mapped = cadets.slice(0, limit).map((c, idx) => ({
        rank: idx + 1,
        full_name: c.full_name,
        wing: c.wing,
        exp: c.exp || 0,
        level: c.level || 1,
        current_streak: c.current_streak || 0,
        is_current_user: c.id === currentUser.id
      }));

      return { data: mapped, error: null };
    }

    return { data: null, error: { message: 'RPC function not supported in mock client' } };
  }
}

class RealCustomAuth {
  constructor(client) {
    this.client = client;
  }

  async signUp({ email, password, options = {} }) {
    // Delegate to real Supabase auth - the DB trigger handle_new_user_signup
    // will automatically create the cadet_profiles row.
    return await this.client.auth.signUp({ email, password, options });
  }

  async signInWithPassword({ email, password }) {
    // Delegate to real Supabase auth
    return await this.client.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return await this.client.auth.signOut();
  }

  async getSession() {
    return await this.client.auth.getSession();
  }
  
  async getUser() {
    return await this.client.auth.getUser();
  }

  onAuthStateChange(callback) {
    return this.client.auth.onAuthStateChange(callback);
  }

  channel(name) {
    return this.client.channel(name);
  }

  // Admin override for UserModal - creates real auth users + profiles via admin API
  get admin() {
    return this.client.auth.admin;
  }

  async resetPasswordForEmail(email, options = {}) {
    return await this.client.auth.resetPasswordForEmail(email, options);
  }

  async updateUser(attributes, options = {}) {
    return await this.client.auth.updateUser(attributes, options);
  }
}

const customRealAuth = new RealCustomAuth(realSupabase);

class APITransaction {
  constructor(table, action, data = null) {
    this.table = table;
    this.action = action;
    this.data = data;
    this.filters = {};
  }

  eq(field, value) {
    this.filters[field] = value;
    return this;
  }

  async execute() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    let token = '';
    try {
      const { data: { session } } = await customRealAuth.getSession();
      token = session?.access_token || '';
    } catch (e) {
      console.warn('[APITransaction] Auth session lookup failed:', e);
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    let url = `${apiUrl}/${this.table}`;
    let method = 'POST';
    let body = null;

    const singleData = Array.isArray(this.data) ? this.data[0] : this.data;

    if (this.action === 'insert') {
      method = 'POST';
      if (this.table === 'course_enrollments') {
        url = `${apiUrl}/enrollments/enroll`;
        body = JSON.stringify({ course_id: singleData.course_id });
      } else {
        body = JSON.stringify(singleData);
      }
    } else if (this.action === 'update') {
      method = 'POST';
      if (this.table === 'notifications') {
        url = `${apiUrl}/notifications/read`;
        body = JSON.stringify({ id: this.filters.id });
      } else if (this.table === 'csv_exam_attempts') {
        url = `${apiUrl}/exams/release`;
        body = JSON.stringify({ attempt_id: this.filters.id });
      } else {
        body = JSON.stringify({ data: singleData, filters: this.filters });
      }
    } else if (this.action === 'delete') {
      method = 'DELETE';
      url = `${apiUrl}/${this.table}/${this.filters.id || ''}`;
    }

    try {
      const response = await fetchWithTimeout(url, {
        method,
        headers,
        body
      });
      const result = await response.json();
      return { data: result.data, error: result.error };
    } catch (err) {
      console.error(`[APITransaction] Request failed to ${url}:`, err);
      return { data: null, error: { message: err.message } };
    }
  }

  then(onfulfilled, onrejected) {
    return this.execute().then(onfulfilled, onrejected);
  }

  async single() {
    const { data, error } = await this.execute();
    if (error) return { data: null, error };
    if (!data) return { data: null, error: { message: 'Row not found' } };
    return { data: Array.isArray(data) ? data[0] : data, error: null };
  }

  async maybeSingle() {
    const { data, error } = await this.execute();
    if (error) return { data: null, error };
    if (!data) return { data: null, error: null };
    return { data: Array.isArray(data) ? data[0] : data, error: null };
  }
}

class RealtimeChannelMock {
  constructor(name) {
    this.name = name;
    this.user = null;
    this.callbacks = [];
    this.socket = null;
  }

  on(event, filter, callback) {
    this.callbacks.push({ event, filter, callback });
    return this;
  }

  subscribe(statusCallback) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(socketUrl);

    const emitJoin = (usr) => {
      this.socket.emit('join_user', usr.id);
      const role = usr.user_metadata?.role || 'cadet';
      this.socket.emit('join_role', role);
      if (role === 'instructor') {
        this.socket.emit('join_role', 'instructors');
      }
    };

    if (this.user) {
      emitJoin(this.user);
    }

    this.socket.on('connect', () => {
      if (this.user) {
        emitJoin(this.user);
      }
      if (typeof statusCallback === 'function') {
        statusCallback('SUBSCRIBED');
      }
    });

    this.socket.on('new_notification', (data) => {
      // Trigger a native system notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const title = data.title || 'New Notification';
        const options = {
          body: data.content || '',
          icon: '/ncc-logo.png',
          badge: '/ncc-logo.png',
          tag: 'ncc-notification-' + (data.id || Date.now()),
          data: { url: data.link || '/dashboard' }
        };

        // Try service worker first for background tab support, fallback to standard Notification
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, options);
          });
        } else {
          try {
            const notif = new Notification(title, options);
            notif.onclick = (e) => {
              e.preventDefault();
              window.focus();
              if (data.link) {
                window.location.href = data.link;
              }
            };
          } catch (err) {
            console.warn('[Notification API] Direct display failed:', err);
          }
        }
      }

      // Update App badge count using native Badge API
      if ('setAppBadge' in navigator) {
        try {
          const stored = localStorage.getItem('ncc_mock_notifications');
          let count = 1;
          if (stored) {
            const parsed = JSON.parse(stored);
            count = parsed.filter(n => !n.is_read).length + 1;
          }
          navigator.setAppBadge(count).catch(err => console.warn('[Badge API] Error setting badge:', err));
        } catch (err) {
          console.warn('[Badge API] Error updating badge count:', err);
        }
      }

      this.callbacks.forEach(({ callback }) => {
        if (typeof callback === 'function') {
          callback({
            eventType: 'INSERT',
            new: data
          });
        }
      });
    });

    return this;
  }

  unsubscribe() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

class HybridChannel {
  constructor(name, realClient) {
    this.name = name;
    this.realClient = realClient;
    this.onCalls = [];
    this.delegatedChannel = null;
  }

  on(event, filter, callback) {
    this.onCalls.push({ event, filter, callback });
    if (this.delegatedChannel) {
      this.delegatedChannel.on(event, filter, callback);
    }
    return this;
  }

  subscribe(statusCallback) {
    const isNotifications = this.onCalls.some(call => 
      call.event === 'postgres_changes' && 
      call.filter && 
      call.filter.table === 'notifications'
    );

    if (isNotifications) {
      const mockChan = new RealtimeChannelMock(this.name);
      this.delegatedChannel = mockChan;
      
      this.onCalls.forEach(call => {
        mockChan.on(call.event, call.filter, call.callback);
      });

      customRealAuth.getUser().then(({ data }) => {
        if (data?.user) {
          mockChan.user = data.user;
          if (mockChan.socket) {
            mockChan.socket.emit('join_user', data.user.id);
            const role = data.user.user_metadata?.role || 'cadet';
            mockChan.socket.emit('join_role', role);
            if (role === 'instructor') {
              mockChan.socket.emit('join_role', 'instructors');
            }
          }
        }
      }).catch(err => {
        console.warn('[Realtime Interceptor] getUser failed:', err);
      });

      return mockChan.subscribe(statusCallback);
    } else {
      const realChan = this.realClient.channel(this.name);
      this.delegatedChannel = realChan;

      this.onCalls.forEach(call => {
        realChan.on(call.event, call.filter, call.callback);
      });

      return realChan.subscribe(statusCallback);
    }
  }

  unsubscribe() {
    if (this.delegatedChannel) {
      if (typeof this.delegatedChannel.unsubscribe === 'function') {
        this.delegatedChannel.unsubscribe();
      }
    }
  }
}

// Build a proxy that intercepts only target table modifications, RPCs and subscriptions
const customRealSupabase = new Proxy(realSupabase, {
  get(target, prop) {
    if (prop === 'auth') {
      return customRealAuth;
    }
    if (prop === 'from') {
      return (table) => {
        const targetTables = ['announcements', 'course_enrollments', 'csv_exam_attempts', 'notifications'];
        const queryBuilder = target.from(table);

        if (!targetTables.includes(table)) {
          return queryBuilder;
        }

        return new Proxy(queryBuilder, {
          get(qTarget, qProp) {
            if (qProp === 'insert') {
              return (data) => {
                return new APITransaction(table, 'insert', data);
              };
            }
            if (qProp === 'update') {
              return (data) => {
                return new APITransaction(table, 'update', data);
              };
            }
            if (qProp === 'delete') {
              return () => {
                return new APITransaction(table, 'delete');
              };
            }

            const val = qTarget[qProp];
            if (typeof val === 'function') {
              return val.bind(qTarget);
            }
            return val;
          }
        });
      };
    }
    if (prop === 'rpc') {
      return async (fn, params) => {
        const targetRpcs = [
          'fn_submit_csv_exam', 
          'fn_submit_exam', 
          'fn_mark_notification_read',
          'fn_mark_all_notifications_read',
          'fn_delete_notification',
          'fn_clear_all_notifications'
        ];
        if (targetRpcs.includes(fn)) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          
          let token = '';
          try {
            const { data: { session } } = await customRealAuth.getSession();
            token = session?.access_token || '';
          } catch (e) {
            console.warn('[RPC Interceptor] Auth session lookup failed:', e);
          }

          const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          };

          if (fn === 'fn_submit_csv_exam' || fn === 'fn_submit_exam') {
            try {
              const response = await fetchWithTimeout(`${apiUrl}/exams/submit`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  attempt_id: params.p_attempt_id,
                  answers: params.p_answers,
                  tab_switches: params.p_tab_switches,
                  time_spent: params.p_time_spent
                })
              });
              const result = await response.json();
              return { data: result.data, error: result.error };
            } catch (err) {
              return { data: null, error: { message: err.message } };
            }
          }

          if (fn === 'fn_mark_notification_read') {
            try {
              const response = await fetchWithTimeout(`${apiUrl}/notifications/read`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  id: params.p_notification_id
                })
              });
              const result = await response.json();
              return { data: result.data, error: result.error };
            } catch (err) {
              return { data: null, error: { message: err.message } };
            }
          }

          if (fn === 'fn_mark_all_notifications_read') {
            try {
              const response = await fetchWithTimeout(`${apiUrl}/notifications/read-all`, {
                method: 'POST',
                headers
              });
              const result = await response.json();
              return { data: result.data, error: result.error };
            } catch (err) {
              return { data: null, error: { message: err.message } };
            }
          }

          if (fn === 'fn_delete_notification') {
            try {
              const response = await fetchWithTimeout(`${apiUrl}/notifications/${params.p_notification_id}`, {
                method: 'DELETE',
                headers
              });
              const result = await response.json();
              return { data: result.data, error: result.error };
            } catch (err) {
              return { data: null, error: { message: err.message } };
            }
          }

          if (fn === 'fn_clear_all_notifications') {
            try {
              const response = await fetchWithTimeout(`${apiUrl}/notifications`, {
                method: 'DELETE',
                headers
              });
              const result = await response.json();
              return { data: result.data, error: result.error };
            } catch (err) {
              return { data: null, error: { message: err.message } };
            }
          }
        }
        return target.rpc(fn, params);
      };
    }
    if (prop === 'channel') {
      return (name) => {
        return new HybridChannel(name, target);
      };
    }
    if (prop === 'removeChannel') {
      return (channel) => {
        if (!channel) return;
        if (channel instanceof HybridChannel) {
          if (channel.delegatedChannel) {
            if (channel.delegatedChannel instanceof RealtimeChannelMock) {
              channel.delegatedChannel.unsubscribe();
            } else {
              target.removeChannel(channel.delegatedChannel);
            }
          }
        } else if (typeof channel.unsubscribe === 'function') {
          channel.unsubscribe();
        }
      };
    }
    const value = target[prop];
    if (typeof value === 'function') {
      return value.bind(target);
    }
    return value;
  }
});


export const supabase = USE_MOCK ? new MockSupabaseClient() : customRealSupabase;

export const adminAuthClient = supabase;

// Sync queued offline transactions
export const syncOfflineQueue = async () => {
  if (!navigator.onLine) return;
  try {
    const { db } = await import('./db');
    const queue = await db.offlineQueue.toArray();
    if (queue.length === 0) return;

    console.log('[Offline Sync] Syncing queued transactions...', queue);
    for (const item of queue) {
      try {
        let headers = { 'Content-Type': 'application/json' };
        
        // Fetch fresh session token if available
        try {
          const sessionText = localStorage.getItem('sb-czyjaeszmnyiwjilkhls-auth-token');
          if (sessionText) {
            const sessionObj = JSON.parse(sessionText);
            if (sessionObj?.access_token) {
              headers['Authorization'] = `Bearer ${sessionObj.access_token}`;
            }
          }
        } catch {
          // ignore parse errors
        }

        const res = await fetch(item.url, {
          method: item.method,
          headers,
          body: item.body ? JSON.stringify(item.body) : null
        });

        if (res.ok) {
          console.log(`[Offline Sync] Synchronized successfully: ${item.url}`);
          await db.offlineQueue.delete(item.id);
        } else {
          console.warn(`[Offline Sync] Synchronization failed for item ${item.id} with status ${res.status}`);
        }
      } catch (err) {
        console.error(`[Offline Sync] Network error syncing item ${item.id}:`, err);
      }
    }
  } catch (err) {
    console.error('[Offline Sync] Error accessing IndexedDB for sync:', err);
  }
};

// Register Web Push subscription
export const subscribeUserToPush = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Push messaging is not supported in this browser.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if subscription already exists
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Fetch VAPID public key from backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const keyRes = await fetch(`${apiUrl}/notifications/vapid-public-key`);
      if (!keyRes.ok) throw new Error('Failed to fetch VAPID public key');
      const { publicKey } = await keyRes.json();
      
      // Convert base64 VAPID public key to UInt8Array
      const padding = '='.repeat((4 - (publicKey.length % 4)) % 4);
      const base64 = (publicKey + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: outputArray
      });
    }

    // Send subscription payload to the backend push subscription endpoint
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    let token = '';
    try {
      const sessionText = localStorage.getItem('sb-czyjaeszmnyiwjilkhls-auth-token');
      if (sessionText) {
        const sessionObj = JSON.parse(sessionText);
        token = sessionObj?.access_token || '';
      }
    } catch {
      // ignore storage errors
    }

    await fetch(`${apiUrl}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ subscription })
    });
    
    console.log('[Push] User successfully subscribed to background Web Push notifications!');
  } catch (err) {
    console.warn('[Push] Subscription failed:', err);
  }
};

// Monitor online event to sync the offline queue
window.addEventListener('online', syncOfflineQueue);
// Also sync on initial import/app boot if online
if (navigator.onLine) {
  syncOfflineQueue();
}

