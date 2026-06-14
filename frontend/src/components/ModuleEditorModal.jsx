import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function ModuleEditorModal({ isOpen, onClose, moduleToEdit, courseId, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sequence_order: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (moduleToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: moduleToEdit.title || '',
        description: moduleToEdit.description || '',
        sequence_order: moduleToEdit.order_index || 1
      });
    } else {
      setFormData({
        title: '',
        description: '',
        sequence_order: 1
      });
    }
  }, [moduleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = { 
      title: formData.title,
      description: formData.description,
      order_index: formData.sequence_order,
      course_id: courseId 
    };

    try {
      if (moduleToEdit) {
        const { error: updateError } = await supabase
          .from('modules')
          .update(payload)
          .eq('id', moduleToEdit.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('modules')
          .insert([payload]);
        if (insertError) throw insertError;
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scaleIn">
        <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50">
          <h3 className="font-bold text-navy-900 text-lg">
            {moduleToEdit ? 'Edit Module' : 'Add Module'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          <form id="module-form" onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm font-medium">{error}</div>}

            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Module Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="ncc-input w-full"
                placeholder="e.g., Basics of Map Reading"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="ncc-input w-full min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Order Sequence</label>
              <input
                type="number"
                required
                min="1"
                value={formData.sequence_order}
                onChange={e => setFormData({ ...formData, sequence_order: parseInt(e.target.value) })}
                className="ncc-input w-full"
              />
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-surface-100 flex gap-3 bg-surface-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-surface-200 text-surface-700 font-bold rounded-xl hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="module-form"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-navy-600 text-white font-bold rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Module'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
