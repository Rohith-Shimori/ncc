import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Cleanup old caches from previous versions
cleanupOutdatedCaches();

// Precache all assets compiled by Vite (HTML, JS, CSS, assets)
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache Google Fonts stylesheet and webfonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }), // 1 year
    ],
  })
);

// Cache static CSV database files (StaleWhileRevalidate so updates are fetched in background, but offline availability is instant)
registerRoute(
  ({ url }) => url.pathname.startsWith('/data/') && url.pathname.endsWith('.csv'),
  new StaleWhileRevalidate({
    cacheName: 'csv-database-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 }), // 7 days
    ],
  })
);

// Cache images (NCC Logo, Favicons, SVGs)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }), // 30 days
    ],
  })
);

// Network-first cache strategy for API endpoints (excluding real-time web socket or supabase auth requests)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/') && !url.pathname.includes('/auth/'),
  new NetworkFirst({
    cacheName: 'api-endpoints-cache',
    networkTimeoutSeconds: 5, // fallback to cache quickly if connection is poor
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }), // 1 day
    ],
  })
);

// Fallback to index.html for navigation routes (Single Page App routing support offline)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async (options) => {
    try {
      const response = await new NetworkFirst({
        cacheName: 'navigations-cache',
        networkTimeoutSeconds: 3,
      }).handle(options);
      
      if (response) return response;
    } catch (e) {
      console.warn('[SW] Navigation cache fallback matching index.html');
    }
    
    // Serve precached index.html if offline
    return caches.match('/index.html');
  }
);

// Service Worker Activates Immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// BACKGROUND WEB PUSH NOTIFICATION HANDLER
self.addEventListener('push', (event) => {
  let data = { title: 'NCC Digital Training', content: 'New update received!', link: '/dashboard' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      // Handle plain text payload if json parsing fails
      data = { title: 'NCC Digital Training', content: event.data.text(), link: '/dashboard' };
    }
  }

  const options = {
    body: data.content,
    icon: '/ncc-logo.png',
    badge: '/ncc-logo.png',
    vibrate: [100, 50, 100],
    data: { url: data.link || '/dashboard' },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// NOTIFICATION CLICK ACTION HANDLER
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') return;

  const urlToOpen = new URL(event.notification.data?.url || '/dashboard', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Focus any app window and redirect
      if (windowClients.length > 0) {
        const client = windowClients[0];
        if ('focus' in client && 'navigate' in client) {
          client.focus();
          return client.navigate(urlToOpen);
        }
      }
      
      // If no tab is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
