import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function CourseEditorModal({ isOpen, onClose, courseToEdit, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_wing: 'Common',
    certificate_level: 'A',
    duration_hours: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        title: courseToEdit.title || '',
        description: courseToEdit.description || '',
        target_wing: courseToEdit.target_wing || 'Common',
        certificate_level: courseToEdit.certificate_level || 'A',
        duration_hours: courseToEdit.duration_hours || 10
      });
    } else {
      setFormData({
        title: '',
        description: '',
        target_wing: 'Common',
        certificate_level: 'A',
        duration_hours: 10
      });
    }
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (courseToEdit) {
        const { error: updateError } = await supabase
          .from('courses')
          .update(formData)
          .eq('id', courseToEdit.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('courses')
          .insert([formData]);
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
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scaleIn max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50 flex-shrink-0">
          <h3 className="font-bold text-navy-900 text-lg">
            {courseToEdit ? 'Edit Course' : 'Create New Course'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 md:p-6">
          <form id="course-form" onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm font-medium">{error}</div>}

            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Course Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="ncc-input w-full"
                placeholder="e.g., Advanced Map Reading"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="ncc-input w-full min-h-[100px]"
                placeholder="Overview of the course..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Target Wing</label>
                <select
                  value={formData.target_wing}
                  onChange={e => setFormData({ ...formData, target_wing: e.target.value })}
                  className="ncc-input w-full"
                >
                  <option value="Common">Common</option>
                  <option value="Army">Army</option>
                  <option value="Navy">Navy</option>
                  <option value="Air Force">Air Force</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Certificate Level</label>
                <select
                  value={formData.certificate_level}
                  onChange={e => setFormData({ ...formData, certificate_level: e.target.value })}
                  className="ncc-input w-full"
                >
                  <option value="A">A Certificate</option>
                  <option value="B">B Certificate</option>
                  <option value="C">C Certificate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Duration (Hours)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.duration_hours}
                onChange={e => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
                className="ncc-input w-full"
              />
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-surface-100 flex gap-3 bg-surface-50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-surface-200 text-surface-700 font-bold rounded-xl hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="course-form"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-navy-600 text-white font-bold rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
