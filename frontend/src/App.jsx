import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import CourseLayout from './layouts/CourseLayout';

// Lazy load all page components to split the main JS bundle into on-demand chunks
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import ChapterViewer from './pages/ChapterViewer';
import PracticeTests from './pages/PracticeTests';
import ExamRoom from './pages/ExamRoom';
import ExamResults from './pages/ExamResults';
import Performance from './pages/Performance';
import Profile from './pages/Profile';

// Instructor Route Pages
const InstructorOverview = lazy(() => import('./pages/instructor/InstructorOverview'));
const InstructorCadets = lazy(() => import('./pages/instructor/Cadets'));
const InstructorCourses = lazy(() => import('./pages/instructor/Courses'));
const InstructorQuestionRepository = lazy(() => import('./pages/instructor/QuestionRepository'));
const InstructorMockExams = lazy(() => import('./pages/instructor/MockExams'));
const CreateMockExam = lazy(() => import('./pages/instructor/CreateMockExam'));
const ExamAnalytics = lazy(() => import('./pages/instructor/ExamAnalytics'));
const InstructorAnnouncements = lazy(() => import('./pages/instructor/Announcements'));
const InstructorImports = lazy(() => import('./pages/instructor/CsvImports'));
const InstructorCourseManager = lazy(() => import('./pages/InstructorCourseManager'));

// Admin Route Pages
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SystemActivity = lazy(() => import('./pages/admin/SystemActivity'));

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="ncc-skeleton w-12 h-12 rounded-full"></div></div>;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-surface-50 p-4">
              <div className="flex flex-col items-center gap-4 animate-fadeIn">
                <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
                <p className="text-surface-600 font-medium text-sm animate-pulse">Loading NCC Portal...</p>
              </div>
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes with Main Sidebar Layout */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/courses" element={<CourseCatalog />} />
                <Route path="/practice-tests" element={<PracticeTests />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/exam-results/:attemptId" element={<ExamResults />} />
                
                {/* Instructor Routes */}
                <Route path="/instructor" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorOverview /></ProtectedRoute>} />
                <Route path="/instructor/cadets" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorCadets /></ProtectedRoute>} />
                <Route path="/instructor/courses" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorCourses /></ProtectedRoute>} />
                <Route path="/instructor/questions" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorQuestionRepository /></ProtectedRoute>} />
                <Route path="/instructor/mock-exams" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorMockExams /></ProtectedRoute>} />
                <Route path="/instructor/mock-exams/create" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><CreateMockExam /></ProtectedRoute>} />
                <Route path="/instructor/analytics" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><ExamAnalytics /></ProtectedRoute>} />
                <Route path="/instructor/announcements" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorAnnouncements /></ProtectedRoute>} />
                <Route path="/instructor/imports" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorImports /></ProtectedRoute>} />
                <Route path="/instructor/course/:courseId" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorCourseManager /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminOverview /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement defaultRole="all" /></ProtectedRoute>} />
                <Route path="/admin/cadets" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement defaultRole="cadet" /></ProtectedRoute>} />
                <Route path="/admin/anos" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement defaultRole="instructor" /></ProtectedRoute>} />
                <Route path="/admin/administrators" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement defaultRole="admin" /></ProtectedRoute>} />
                
                <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><InstructorCourses /></ProtectedRoute>} />
                <Route path="/admin/questions" element={<ProtectedRoute allowedRoles={['admin']}><InstructorQuestionRepository /></ProtectedRoute>} />
                <Route path="/admin/mock-exams" element={<ProtectedRoute allowedRoles={['admin']}><InstructorMockExams /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><ExamAnalytics /></ProtectedRoute>} />
                <Route path="/admin/imports" element={<ProtectedRoute allowedRoles={['admin']}><InstructorImports /></ProtectedRoute>} />
                <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['admin']}><InstructorAnnouncements /></ProtectedRoute>} />
                
                <Route path="/admin/activity" element={<ProtectedRoute allowedRoles={['admin']}><SystemActivity /></ProtectedRoute>} />
              </Route>

              {/* Immersive Course Layout */}
              <Route path="/course/:courseId" element={<ProtectedRoute><CourseLayout /></ProtectedRoute>}>
                <Route index element={<CourseDetail />} />
                <Route path="chapter/:chapterId" element={<ChapterViewer />} />
              </Route>

              {/* Fullscreen Exam */}
              <Route path="/exam/:testId" element={<ProtectedRoute><ExamRoom /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
