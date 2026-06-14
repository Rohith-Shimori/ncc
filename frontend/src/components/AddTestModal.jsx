import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function AddTestModal({ isOpen, onClose, testToEdit, onSave, courses }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    test_type: 'practice',
    duration_minutes: 30,
    question_count: 10,
    passing_score: 60,
    randomize_questions: true,
    target_wing: 'Common',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (testToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: testToEdit.title || '',
        description: testToEdit.description || '',
        course_id: testToEdit.course_id || '',
        test_type: testToEdit.test_type || 'practice',
        duration_minutes: testToEdit.duration_minutes || 30,
        question_count: testToEdit.question_count || 10,
        passing_score: testToEdit.passing_score || 60,
        randomize_questions: testToEdit.randomize_questions ?? true,
        target_wing: testToEdit.target_wing || 'Common',
        is_active: testToEdit.is_active ?? true
      });
    } else {
      setFormData({
        title: '',
        description: '',
        course_id: courses?.[0]?.id || '',
        test_type: 'practice',
        duration_minutes: 30,
        question_count: 10,
        passing_score: 60,
        randomize_questions: true,
        target_wing: 'Common',
        is_active: true
      });
    }
  }, [testToEdit, isOpen, courses]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (testToEdit) {
        const { error: updateError } = await supabase
          .from('tests')
          .update(formData)
          .eq('id', testToEdit.id);
        if (updateError) throw updateError;
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        const { error: insertError } = await supabase
          .from('tests')
          .insert([{ ...formData, created_by: session?.user?.id }]);
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
            {testToEdit ? 'Edit Exam' : 'Create New Exam'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 md:p-6">
          <form id="test-form" onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm font-medium">{error}</div>}

            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Exam Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="ncc-input w-full"
                placeholder="e.g., Final Mock Exam 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="ncc-input w-full min-h-[80px]"
                placeholder="Details about this exam..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Course Mapping</label>
                <select
                  value={formData.course_id}
                  onChange={e => setFormData({ ...formData, course_id: e.target.value })}
                  className="ncc-input w-full"
                  required
                >
                  <option value="" disabled>Select Course</option>
                  {courses?.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                <p className="text-[10px] text-surface-500 mt-1">Questions will be pulled from this course's bank.</p>
              </div>
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
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Type</label>
                <select
                  value={formData.test_type}
                  onChange={e => setFormData({ ...formData, test_type: e.target.value })}
                  className="ncc-input w-full p-2 text-sm"
                >
                  <option value="practice">Practice</option>
                  <option value="mock">Mock</option>
                  <option value="final">Final</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Mins</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.duration_minutes}
                  onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  className="ncc-input w-full p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Questions</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.question_count}
                  onChange={e => setFormData({ ...formData, question_count: parseInt(e.target.value) })}
                  className="ncc-input w-full p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Pass %</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={formData.passing_score}
                  onChange={e => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                  className="ncc-input w-full p-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.randomize_questions}
                  onChange={e => setFormData({ ...formData, randomize_questions: e.target.checked })}
                  className="w-4 h-4 text-gold-500 rounded border-surface-300 focus:ring-gold-500"
                />
                <span className="font-medium text-navy-900">Randomize Questions</span>
              </label>
              
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-gold-500 rounded border-surface-300 focus:ring-gold-500"
                />
                <span className="font-medium text-navy-900">Active (Visible)</span>
              </label>
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
            form="test-form"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-navy-600 text-white font-bold rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Exam'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
