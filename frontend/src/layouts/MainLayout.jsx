import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import {
  LayoutDashboard, BookOpen, ClipboardCheck, BarChart3, User,
  GraduationCap, Shield, LogOut, Menu, X, Bell, ChevronDown,
  Users, FileText, Megaphone, Upload, ShieldAlert, Activity
} from 'lucide-react';
import nccLogo from '../assets/ncc-seeklogo.png';
import NotificationPanel from '../components/NotificationPanel';
import ThemeToggle from '../components/ThemeToggle';
import { supabase } from '../services/supabase';
import ErrorBoundary from '../components/ErrorBoundary';
import OfflineBanner from '../components/OfflineBanner';
import { prefetchRoute } from '../utils/prefetch';

const CADET_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/courses', icon: BookOpen, label: 'My Courses' },
  { path: '/practice-tests', icon: ClipboardCheck, label: 'Practice Tests' },
  { path: '/performance', icon: BarChart3, label: 'Performance' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const INSTRUCTOR_ITEMS = [
  { path: '/instructor', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/instructor/cadets', icon: Users, label: 'Cadets' },
  { path: '/instructor/courses', icon: BookOpen, label: 'Courses' },
  { path: '/instructor/questions', icon: FileText, label: 'Question Repository' },
  { path: '/instructor/mock-exams', icon: ClipboardCheck, label: 'Mock Exams' },
  { path: '/instructor/analytics', icon: BarChart3, label: 'Exam Analytics' },
  { path: '/instructor/imports', icon: Upload, label: 'CSV Imports' },
  { path: '/instructor/announcements', icon: Megaphone, label: 'Announcements' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const ADMIN_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/users', icon: Users, label: 'User Management' },
  { path: '/admin/cadets', icon: GraduationCap, label: 'Cadets' },
  { path: '/admin/anos', icon: Shield, label: 'ANOs' },
  { path: '/admin/administrators', icon: ShieldAlert, label: 'Administrators' },
  { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { path: '/admin/questions', icon: FileText, label: 'Question Repository' },
  { path: '/admin/mock-exams', icon: ClipboardCheck, label: 'Mock Exams' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/admin/imports', icon: Upload, label: 'CSV Imports' },
  { path: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { path: '/admin/activity', icon: Activity, label: 'System Activity' },
  { path: '/profile', icon: User, label: 'Profile' },
];

// Bottom nav shows max 5 items (the core 5)
const BOTTOM_NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/courses', icon: BookOpen, label: 'Courses' },
  { path: '/mock-exams', icon: ClipboardCheck, label: 'Exams' },
  { path: '/performance', icon: BarChart3, label: 'Stats' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const wingColors = {
  'Army': { bg: 'bg-wing-army-bg', text: 'text-wing-army', border: 'border-wing-army' },
  'Navy': { bg: 'bg-wing-navy-bg', text: 'text-wing-navy', border: 'border-wing-navy' },
  'Air Force': { bg: 'bg-wing-airforce-bg', text: 'text-wing-airforce', border: 'border-wing-airforce' },
};

const MainLayout = () => {
  const { user, profile, role, signOut, fetchProfile } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallBanner(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const triggerInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log('[PWA Install] Choice outcome:', outcome);
    setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Request notification permission and subscribe to background Web Push
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              import('../services/supabase').then(({ subscribeUserToPush }) => {
                subscribeUserToPush();
              });
            }
          });
        } else if (Notification.permission === 'granted') {
          import('../services/supabase').then(({ subscribeUserToPush }) => {
            subscribeUserToPush();
          });
        }
      }
      
      // Realtime subscription for Notifications
      const notifChannel = supabase
        .channel('unread_notifications')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications', 
          filter: `user_id=eq.${user.id}` 
        }, () => {
          fetchUnreadCount();
        })
        .subscribe();

      // Realtime subscription for Profile (EXP/Level updates)
      const profileChannel = supabase
        .channel('profile_updates')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'cadet_profiles',
          filter: `id=eq.${user.id}`
        }, () => {
          fetchProfile(user.id);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(notifChannel);
        supabase.removeChannel(profileChannel);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    const unread = count || 0;
    setUnreadCount(unread);
    
    // Update native app badge
    if ('setAppBadge' in navigator) {
      try {
        if (unread > 0) {
          navigator.setAppBadge(unread);
        } else {
          navigator.clearAppBadge();
        }
      } catch (err) {
        console.warn('[Badge API] Error setting badge:', err);
      }
    }
  };

  let items = CADET_ITEMS;
  if (role === 'instructor') items = INSTRUCTOR_ITEMS;
  if (role === 'admin') items = ADMIN_ITEMS;

  const wing = profile?.wing || 'Common';

  const getMobileNavItems = () => {
    // Only show 4 items + profile on mobile
    if (items.length <= 5) return items;
    return [
      items[0],
      items[1],
      items[2],
      items[3],
      items.find(i => i.path === '/profile') || items[4]
    ];
  };

  const checkActive = (itemPath) => {
    if (location.pathname === itemPath) return true;
    if (
      itemPath === '/' ||
      itemPath === '/dashboard' ||
      itemPath === '/instructor' ||
      itemPath === '/admin' ||
      itemPath === '/profile'
    ) {
      return false;
    }
    return location.pathname.startsWith(itemPath);
  };

  const getPageTitle = () => {
    const exactMatch = items.find(i => location.pathname === i.path);
    if (exactMatch) return exactMatch.label;

    const matchingItems = items.filter(i => 
      i.path !== '/' && 
      i.path !== '/dashboard' && 
      i.path !== '/instructor' && 
      i.path !== '/admin' && 
      i.path !== '/profile' && 
      location.pathname.startsWith(i.path)
    );
    if (matchingItems.length > 0) {
      matchingItems.sort((a, b) => b.path.length - a.path.length);
      return matchingItems[0].label;
    }

    return 'NCC Platform';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <OfflineBanner />
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="ncc-sidebar-overlay md:hidden" onClick={() => setSidebarOpen(false)} />
      )}


      {/* Sidebar — hidden on mobile, shown on desktop */}
      <aside className={`ncc-sidebar w-[270px] flex flex-col h-full flex-shrink-0 z-[70] ${sidebarOpen ? 'open' : ''}`}>
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src={nccLogo} alt="NCC" className="w-8 h-8 object-contain drop-shadow-md" />
            <div>
              <h1 className="text-white font-bold text-[15px] tracking-tight leading-tight">NCC Digital</h1>
              <p className="text-[11px] text-gold-400 font-medium tracking-wider uppercase">Training Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-[10px] font-bold text-navy-400 uppercase tracking-[0.15em] px-3 mb-2 mt-2">Main Menu</p>
          {items.map((item) => {
            const isActive = checkActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`ncc-sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                onMouseEnter={() => prefetchRoute(item.path)}
                onTouchStart={() => prefetchRoute(item.path)}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {showInstallBanner && (
          <div className="mx-4 my-2 p-3 bg-gold-500/10 border border-gold-500/20 rounded-xl flex flex-col gap-1.5 animate-fadeIn">
            <p className="text-xs text-gold-400 font-bold leading-tight">Install NCC Digital App</p>
            <p className="text-[10px] text-surface-400">Access training materials offline instantly from your home screen!</p>
            <button 
              onClick={triggerInstall}
              className="w-full text-center py-1.5 px-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs cursor-pointer active:scale-95 transition-all mt-1"
            >
              Install App
            </button>
          </div>
        )}

        <div className="p-4 border-t border-white/5 mt-auto">
          <Link 
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all group mb-3"
          >
            <div className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-500 font-bold text-lg">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile?.full_name || 'Cadet'}</p>
              <p className="text-[11px] text-surface-400 truncate">{profile?.wing || 'Common Wing'}</p>
            </div>
          </Link>
          
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-semibold text-sm cursor-pointer border border-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 md:h-16 bg-surface-50 border-b border-surface-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-surface-100 transition cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {/* Mobile logo in top bar */}
            <div className="md:hidden flex items-center gap-2">
              <img src={nccLogo} alt="NCC" className="w-6 h-6 object-contain" />
              <span className="font-bold text-navy-900 text-sm">NCC Digital</span>
            </div>
            
            {/* Desktop page title */}
            <div className="hidden md:block">
              <h2 className="text-lg font-bold text-navy-900">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {wing !== 'Common' && (
              <span className={`ncc-badge ncc-badge-${wing.toLowerCase().replace(' ', '')} hidden sm:inline-flex`}>
                {wing}
              </span>
            )}
            
            {/* Profile Avatar (Mobile + Desktop) with Live Online Status Indicator */}
            <div className="relative">
              <Link 
                to="/profile" 
                className="flex items-center justify-center w-9 h-9 rounded-full bg-navy-50 dark:bg-navy-900 border border-surface-200 dark:border-surface-700 text-navy-600 dark:text-gold-500 font-bold hover:border-gold-500 transition-all active:scale-95"
              >
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'C'}
              </Link>
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface-50 dark:border-navy-950 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} title={isOnline ? 'Online' : 'Offline Mode'} />
            </div>

            <ThemeToggle />

            {/* Unified Notification Bell */}
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-lg hover:bg-surface-100 transition-all cursor-pointer active:scale-95"
            >
              <Bell className="w-5 h-5 text-surface-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 md:pb-6">
          <ErrorBoundary variant="inline">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="ncc-mobile-nav">
        {getMobileNavItems().map((item) => {
          const isActive = checkActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`ncc-mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Notifications Overlay — Placed at the end for guaranteed top-most rendering */}
      {isNotificationsOpen && (
        <div 
          className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-[9999]"
          onClick={() => setIsNotificationsOpen(false)}
        >
          <div 
            className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-white shadow-2xl animate-slideInRight"
            onClick={e => e.stopPropagation()}
          >
            <NotificationPanel onClose={() => setIsNotificationsOpen(false)} onRefresh={fetchUnreadCount} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
