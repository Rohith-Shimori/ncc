import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/AuthContext';
import { Bell, Check, ExternalLink, X, BookOpen, Award, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationPanel({ onClose, onRefresh }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel('personal_notifications')
      .on('postgres_changes', { 
        event: '*', // Listen to INSERT and UPDATE (for marking read)
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
        }
        if (onRefresh) onRefresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications, onRefresh]);

  const markRead = async (id) => {
    try {
      await supabase.rpc('fn_mark_notification_read', { p_notification_id: id });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      const { error } = await supabase.from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'exam': return <Award className="w-4 h-4 text-gold-500" />;
      case 'enrollment': return <BookOpen className="w-4 h-4 text-info" />;
      case 'announcement': return <Bell className="w-4 h-4 text-danger" />;
      case 'achievement': return <Award className="w-4 h-4 text-mgreen-600" />;
      default: return <ShieldAlert className="w-4 h-4 text-navy-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full animate-slideInRight bg-white">
      <div className="p-4 border-b border-surface-200 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="font-bold text-navy-900 flex items-center gap-2">
          <Bell className="w-4 h-4" /> Notifications
        </h2>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={markAllRead} 
              className="text-[10px] md:text-xs font-bold text-gold-600 hover:text-gold-700 px-2 py-1 rounded-lg hover:bg-gold-50 transition cursor-pointer"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded-lg cursor-pointer">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-surface-400">
            <p className="text-sm">No notifications yet.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} 
              className={`p-3 rounded-xl transition border-2 ${n.is_read ? 'bg-transparent border-transparent opacity-75' : 'bg-gold-500/5 border-gold-500/10 shadow-sm'}`}>
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.is_read ? 'bg-surface-100' : 'bg-gold-500/10'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold text-navy-900 leading-tight mb-0.5 ${n.is_read ? '' : 'text-gold-600'}`}>{n.title}</p>
                  <p className="text-[11px] text-surface-600 leading-snug line-clamp-2">{n.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-surface-400 font-medium">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      {!n.is_read && (
                        <button onClick={() => markRead(n.id)} className="text-[10px] text-mgreen-600 font-bold flex items-center gap-0.5 hover:underline cursor-pointer">
                          <Check className="w-3 h-3" /> Mark read
                        </button>
                      )}
                      {n.link && (
                        <button onClick={() => { markRead(n.id); navigate(n.link); onClose(); }} className="text-[10px] text-info font-bold flex items-center gap-0.5 hover:underline cursor-pointer">
                          <ExternalLink className="w-3 h-3" /> View
                        </button>
                      )}
                    </div>
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
