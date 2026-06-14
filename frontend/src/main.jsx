import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './hooks/ThemeContext';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('A new version of the NCC Digital Training Portal is available. Reload now to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('[PWA] App is cached and ready for offline use.');
  }
});

// Storage Versioning & Stale Cache Cleanup
const STORAGE_VERSION = 'v1.0';
const STORAGE_VERSION_KEY = `ncc_storage_version_${STORAGE_VERSION}`;

try {
  if (!localStorage.getItem(STORAGE_VERSION_KEY)) {
    // Clear out old mock database structures to prevent new schema format crashes
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ncc_mock_') || key.startsWith('ncc_dev_')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem(STORAGE_VERSION_KEY, 'true');
  }
} catch (e) {
  console.warn('Storage cleanup failed (localStorage might be disabled):', e);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <SpeedInsights />
      <Analytics />
    </ThemeProvider>
  </StrictMode>,
)
