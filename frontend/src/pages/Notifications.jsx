import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/AuthContext';
import { 
  Bell, Check, Trash2, Search, BookOpen, 
  Award, ShieldAlert, CheckSquare, Trash, ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

export default function Notifications() {
  useSEO({
    title: 'Command Notifications Log',
    description: 'Manage and review system bulletins, course updates, exam alerts, and security logs.',
    keywords: 'NCC, Notifications, Cadet Log, Security Alerts',
    canonicalUrl: 'https://ncc-digital-training.vercel.app/notifications'
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = async () => {
      // Defer state update to resolve set-state-in-effect lint warning
      await Promise.resolve();
      if (active) {
        fetchNotifications();
      }
    };
    load();

    const channel = supabase
      .channel('full_notifications_page')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
        } else if (payload.eventType === 'DELETE') {
          // If payload.old.id is present, filter it out. Sometimes delete payload only has old.id
          const deletedId = payload.old ? payload.old.id : null;
          if (deletedId) {
            setNotifications(prev => prev.filter(n => n.id !== deletedId));
          }
        }
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  const markRead = async (id) => {
    try {
      await supabase.rpc('fn_mark_notification_read', { p_notification_id: id });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('[Notifications Log] Mark read failed:', err);
    }
  };

  const markAllRead = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase.rpc('fn_mark_all_notifications_read');
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('[Notifications Log] Mark all read failed:', err);
    }
    setActionLoading(false);
  };

  const deleteNotification = async (id) => {
    try {
      const { error } = await supabase.rpc('fn_delete_notification', { p_notification_id: id });
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('[Notifications Log] Delete failed:', err);
    }
  };

  const deleteAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications from your command logs?')) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.rpc('fn_clear_all_notifications');
      if (error) throw error;
      setNotifications([]);
    } catch (err) {
      console.error('[Notifications Log] Delete all failed:', err);
    }
    setActionLoading(false);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'exam': return <Award className="w-5 h-5 text-gold-500" />;
      case 'enrollment': return <BookOpen className="w-5 h-5 text-navy-400" />;
      case 'announcement': return <Bell className="w-5 h-5 text-red-500" />;
      case 'achievement': return <Award className="w-5 h-5 text-emerald-500" />;
      default: return <ShieldAlert className="w-5 h-5 text-slate-400" />;
    }
  };

  const filtered = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.content.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || n.type === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 dark:border-white/10 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-navy-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-gold-500" /> Command Bulletin & Logs
          </h1>
          <p className="text-xs md:text-sm text-surface-600 dark:text-slate-300 font-semibold mt-1">
            Review live system bulletins, course updates, exam logs, and security anomalies.
          </p>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              id="notifications-mark-all-read-btn"
              onClick={markAllRead}
              disabled={actionLoading || !notifications.some(n => !n.is_read)}
              className="px-3.5 py-2 text-xs font-black bg-gold-500/10 border border-gold-500/20 rounded-xl text-gold-600 dark:text-gold-400 flex items-center gap-1.5 hover:bg-gold-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              aria-label="Mark all notifications as read"
            >
              <CheckSquare className="w-4 h-4" /> Mark All Read
            </button>
            <button
              id="notifications-clear-logs-btn"
              onClick={deleteAllNotifications}
              disabled={actionLoading}
              className="px-3.5 py-2 text-xs font-black bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-1.5 hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              aria-label="Delete all notifications"
            >
              <Trash className="w-4 h-4" /> Clear Logs
            </button>
          </div>
        )}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search bar */}
        <div className="relative md:col-span-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            id="notifications-search-input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notifications log..."
            className="ncc-input ncc-input-icon pl-10"
            aria-label="Search notifications"
          />
        </div>

        {/* Filter categories */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 md:pb-0 md:col-span-7 ncc-ranks-scrollbar" role="tablist">
          {['All', 'Announcement', 'Exam', 'Enrollment', 'Achievement'].map((tab) => (
            <button
              key={tab}
              id={`notifications-tab-${tab.toLowerCase()}`}
              role="tab"
              aria-selected={typeFilter === tab}
              onClick={() => setTypeFilter(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border whitespace-nowrap cursor-pointer ${
                typeFilter === tab
                  ? 'border-gold-500 bg-gold-500/10 text-gold-600 dark:text-gold-400 font-black'
                  : 'border-surface-200 dark:border-white/5 bg-white dark:bg-navy-900 text-surface-600 dark:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Live Logs List */}
      <div className="space-y-2.5" role="log" aria-label="Bulletins and notifications log">
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center gap-2">
            <div className="ncc-loader" />
            <p className="text-surface-600 font-medium text-xs">Accessing bulletins...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-surface-200 dark:border-white/10 rounded-2xl bg-white/40 dark:bg-navy-900/10">
            <Bell className="w-10 h-10 text-surface-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-navy-900 dark:text-white uppercase mb-1">No bulletins found</h3>
            <p className="text-xs text-surface-500 dark:text-slate-400">There are no notifications matching your search or filters.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                n.is_read 
                  ? 'bg-white/60 dark:bg-navy-900/30 border-surface-200 dark:border-white/5 opacity-80 hover:opacity-100' 
                  : 'bg-white dark:bg-navy-900 border-gold-500/20 dark:border-gold-500/25 shadow-md shadow-gold-500/5'
              }`}
            >
              {/* Left accent bar for unread bulletins */}
              {!n.is_read && (
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-gold-500 to-transparent" />
              )}
              
              <div className="flex gap-4">
                {/* Icon wrapper */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  n.is_read ? 'bg-surface-100 dark:bg-navy-950/60' : 'bg-gold-500/10'
                }`}>
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                    <h3 className={`text-xs md:text-sm font-black uppercase tracking-wide leading-tight ${
                      n.is_read ? 'text-navy-900 dark:text-white' : 'text-gold-600 dark:text-gold-400'
                    }`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] text-surface-400 dark:text-slate-500 font-medium">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-xs text-surface-700 dark:text-slate-300 leading-relaxed font-semibold mt-1.5 max-w-2xl break-words">
                    {n.content}
                  </p>

                  <div className="flex items-center gap-3 mt-3.5 pt-3 border-t border-surface-100 dark:border-white/5">
                    {!n.is_read && (
                      <button 
                        id={`notifications-mark-read-btn-${n.id}`}
                        onClick={() => markRead(n.id)} 
                        className="px-2.5 py-1 bg-mgreen-500/10 hover:bg-mgreen-500/20 text-mgreen-600 dark:text-mgreen-400 border border-mgreen-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all duration-200"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark read
                      </button>
                    )}
                    
                    {n.link && (
                      <button 
                        id={`notifications-view-btn-${n.id}`}
                        onClick={() => { markRead(n.id); navigate(n.link); }} 
                        className="px-2.5 py-1 bg-gold-500/10 hover:bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all duration-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </button>
                    )}

                    <button 
                      id={`notifications-delete-btn-${n.id}`}
                      onClick={() => deleteNotification(n.id)}
                      className="ml-auto text-surface-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Delete log entry"
                      aria-label="Delete notification entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
