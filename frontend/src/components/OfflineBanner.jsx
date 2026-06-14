import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustCameOnline(true);
      setShowBanner(true);
      
      // Auto-hide online confirmation after 3 seconds
      const timer = setTimeout(() => {
        setShowBanner(false);
        setJustCameOnline(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustCameOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md transition-all duration-500 ease-out transform ${
      showBanner ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
    }`}>
      {justCameOnline ? (
        /* Online success banner */
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-200 rounded-2xl shadow-[0_8px_32px_0_rgba(16,185,129,0.15)] animate-slideDown">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400">
            <Wifi className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-emerald-100">Connection Restored</h4>
            <p className="text-xs text-emerald-300">Synchronizing offline queue with server...</p>
          </div>
        </div>
      ) : (
        /* Offline warning banner */
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-950/85 backdrop-blur-md border border-amber-500/30 text-amber-200 rounded-2xl shadow-[0_8px_32px_0_rgba(245,158,11,0.15)] animate-pulse border-t-amber-400">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 text-amber-400">
            <WifiOff className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold text-amber-100">Working Offline</h4>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xs text-amber-300">Using cached course data. Actions will sync upon reconnect.</p>
          </div>
        </div>
      )}
    </div>
  );
}
