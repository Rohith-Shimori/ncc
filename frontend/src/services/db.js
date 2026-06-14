import Dexie from 'dexie';

// Initialize Dexie local database
export const db = new Dexie('NCC_Digital_Training_PWA_DB');

db.version(1).stores({
  // Cache tables
  profile: 'id, full_name, role',
  courses: 'id, title, level, category',
  chapters: 'id, course_id, title',
  notifications: 'id, user_id, type, created_at, is_read',
  exams: 'test_id, test_name, passing_percent',
  examAttempts: 'id, test_id, user_id, status, submitted_at',
  userProgress: 'id, user_id, chapter_id, completed',
  
  // Offline transaction queue
  offlineQueue: '++id, type, url, method, body, timestamp'
});

// Helper: queue write operations while offline
export const queueOfflineTransaction = async (type, url, method, body) => {
  console.log('[Offline Queue] Queueing transaction:', { type, url, method });
  await db.offlineQueue.add({
    type,
    url,
    method,
    body: body ? JSON.parse(JSON.stringify(body)) : null,
    timestamp: new Date().toISOString()
  });
  
  // Trigger native toast event to notify the UI
  window.dispatchEvent(new CustomEvent('offline-action-queued', {
    detail: { type, message: 'Your action was saved locally and will sync when you are back online.' }
  }));
};
