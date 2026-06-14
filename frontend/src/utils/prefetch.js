// Intent-based Route Prefetcher for Lazy Loaded Chunks
const routePrefetchers = {
  '/instructor': () => import('../pages/instructor/InstructorOverview'),
  '/instructor/cadets': () => import('../pages/instructor/Cadets'),
  '/instructor/courses': () => import('../pages/instructor/Courses'),
  '/instructor/questions': () => import('../pages/instructor/QuestionRepository'),
  '/instructor/mock-exams': () => import('../pages/instructor/MockExams'),
  '/instructor/mock-exams/create': () => import('../pages/instructor/CreateMockExam'),
  '/instructor/analytics': () => import('../pages/instructor/ExamAnalytics'),
  '/instructor/imports': () => import('../pages/instructor/CsvImports'),
  '/instructor/announcements': () => import('../pages/instructor/Announcements'),
  '/admin': () => import('../pages/admin/AdminOverview'),
  '/admin/users': () => import('../pages/admin/UserManagement'),
  '/admin/cadets': () => import('../pages/admin/UserManagement'),
  '/admin/anos': () => import('../pages/admin/UserManagement'),
  '/admin/administrators': () => import('../pages/admin/UserManagement'),
  '/admin/activity': () => import('../pages/admin/SystemActivity'),
  '/admin/courses': () => import('../pages/instructor/Courses'),
  '/admin/questions': () => import('../pages/instructor/QuestionRepository'),
  '/admin/mock-exams': () => import('../pages/instructor/MockExams'),
  '/admin/analytics': () => import('../pages/instructor/ExamAnalytics'),
  '/admin/imports': () => import('../pages/instructor/CsvImports'),
  '/admin/announcements': () => import('../pages/instructor/Announcements'),
};

export const prefetchRoute = (path) => {
  const prefetcher = routePrefetchers[path];
  if (prefetcher) {
    console.log(`[Prefetch] Preloading chunk for route: ${path}`);
    prefetcher().catch((err) => {
      console.warn(`[Prefetch] Failed to preload route ${path}:`, err);
    });
  }
};
