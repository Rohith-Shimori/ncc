import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Megaphone, Plus, Edit2, Trash2 } from 'lucide-react';
import AnnouncementModal from '../../components/AnnouncementModal';

export default function InstructorAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const loadAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAnnouncements();
  }, []);

  const handleDelete = async (ann) => {
    if (!confirm(`Are you sure you want to delete "${ann.title}"?`)) return;
    const { error } = await supabase.from('announcements').delete().eq('id', ann.id);
    if (error) alert('Error deleting announcement: ' + error.message);
    else loadAnnouncements();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> Announcements
          </h1>
          <p className="text-surface-700 text-sm">Manage announcements for cadets</p>
        </div>
        <button onClick={() => { setEditingAnnouncement(null); setIsModalOpen(true); }} className="ncc-btn ncc-btn-primary py-2.5 px-6 cursor-pointer">
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {announcements.map(a => (
          <div key={a.id} className="ncc-glass-card p-5 relative group flex flex-col">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditingAnnouncement(a); setIsModalOpen(true); }} className="p-1.5 hover:bg-surface-200 rounded-lg text-navy-500 cursor-pointer" title="Edit">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(a)} className="p-1.5 hover:bg-danger/10 rounded-lg text-danger cursor-pointer" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`ncc-badge ${a.priority === 'high' ? 'bg-danger/10 text-danger' : a.priority === 'low' ? 'bg-surface-200 text-surface-500' : 'bg-info-bg text-info'}`}>
                {a.priority?.toUpperCase()}
              </span>
              <span className={`ncc-badge ${a.target_wing === 'Army' ? 'ncc-badge-army' : a.target_wing === 'Navy' ? 'ncc-badge-navy' : a.target_wing === 'Air Force' ? 'ncc-badge-airforce' : 'bg-surface-100 text-surface-700'}`}>
                {a.target_wing}
              </span>
              {!a.is_active && <span className="ncc-badge bg-surface-200 text-surface-500">Draft</span>}
            </div>
            <h3 className="font-bold text-navy-900 mb-1 pr-14 line-clamp-2">{a.title}</h3>
            <p className="text-sm text-surface-700 flex-1 line-clamp-3 break-words">{a.content}</p>
            <div className="mt-4 text-xs text-surface-400 font-medium">
              {new Date(a.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="col-span-full p-8 text-center text-surface-500 ncc-glass-card">No announcements created yet.</div>
        )}
      </div>

      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        announcement={editingAnnouncement}
        onSave={loadAnnouncements}
      />
    </div>
  );
}
