import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function AnnouncementModal({ isOpen, onClose, announcement, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    target_wing: 'Common',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        priority: announcement.priority || 'normal',
        target_wing: announcement.target_wing || 'Common',
        is_active: announcement.is_active !== false
      });
    } else {
      setFormData({
        title: '',
        content: '',
        priority: 'normal',
        target_wing: 'Common',
        is_active: true
      });
    }
  }, [announcement, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (announcement) {
        // Edit
        const { error: updateError } = await supabase
          .from('announcements')
          .update(formData)
          .eq('id', announcement.id);
        
        if (updateError) throw updateError;
      } else {
        // Create
        const { error: insertError } = await supabase
          .from('announcements')
          .insert([formData]);
          
        if (insertError) throw insertError;
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving the announcement.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl my-auto flex flex-col max-h-[90vh] animate-scaleIn">
        <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50 shrink-0">
          <h3 className="font-bold text-navy-900 text-lg">
            {announcement ? 'Edit Announcement' : 'Create Announcement'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto">
          {error && <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm font-medium">{error}</div>}

          <div>
            <label className="block text-sm font-bold text-navy-900 mb-1.5">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="ncc-input w-full"
              placeholder="E.g. Annual Camp 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-navy-900 mb-1.5">Content</label>
            <textarea
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="ncc-input w-full min-h-[100px]"
              placeholder="Announcement details..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="ncc-input w-full"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Target Wing</label>
              <select
                value={formData.target_wing}
                onChange={e => setFormData({ ...formData, target_wing: e.target.value })}
                className="ncc-input w-full"
              >
                <option value="Common">Common (All)</option>
                <option value="Army">Army</option>
                <option value="Navy">Navy</option>
                <option value="Air Force">Air Force</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-navy-600 rounded border-surface-300 focus:ring-navy-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-navy-900">
              Active (Visible on Dashboard)
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-surface-200 text-surface-700 font-bold rounded-xl hover:bg-surface-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-navy-600 text-white font-bold rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
