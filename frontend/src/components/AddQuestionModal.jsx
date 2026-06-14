import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../services/supabase';
import { X, Save, HelpCircle } from 'lucide-react';

export default function AddQuestionModal({ isOpen, onClose, onSave, questionToEdit = null }) {
  const [loading, setLoading] = useState(false);
  const [csv_subjects, setSubjects] = useState([]);
  
  const [formData, setFormData] = useState({
    question_id: '',
    subject_code: '',
    module_number: '',
    certificate: 'Common',
    wing: 'Common',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
    difficulty: 2,
    explanation: '',
    active: true
  });

  useEffect(() => {
    const loadSubjects = async () => {
      const { data } = await supabase.from('csv_subjects').select('*').order('subject_name');
      setSubjects(data || []);
    };
    loadSubjects();
  }, []);

  useEffect(() => {
    if (questionToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        question_id: questionToEdit.question_id || '',
        subject_code: questionToEdit.subject_code || '',
        module_number: questionToEdit.module_number || '',
        certificate: questionToEdit.certificate || 'Common',
        wing: questionToEdit.wing || 'Common',
        question_text: questionToEdit.question_text || '',
        option_a: questionToEdit.option_a || '',
        option_b: questionToEdit.option_b || '',
        option_c: questionToEdit.option_c || '',
        option_d: questionToEdit.option_d || '',
        correct_answer: questionToEdit.correct_answer || '',
        difficulty: questionToEdit.difficulty || 2,
        explanation: questionToEdit.explanation || '',
        active: questionToEdit.active !== false && String(questionToEdit.active).toUpperCase() !== 'FALSE'
      });
    } else {
      setFormData({
        question_id: '',
        subject_code: '',
        module_number: '',
        certificate: 'Common',
        wing: 'Common',
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: '',
        difficulty: 2,
        explanation: '',
        active: true
      });
    }
  }, [questionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        question_id: formData.question_id || 'q_' + Date.now(),
        subject_code: formData.subject_code,
        module_number: formData.module_number ? parseInt(formData.module_number, 10) : null,
        difficulty: parseInt(formData.difficulty, 10),
        question_text: formData.question_text,
        option_a: formData.option_a,
        option_b: formData.option_b,
        option_c: formData.option_c || null,
        option_d: formData.option_d || null,
        correct_answer: formData.correct_answer,
        explanation: formData.explanation || null,
        active: formData.active === 'TRUE' || formData.active === true,
        certificate: formData.certificate,
        wing: formData.wing
      };
      
      let error;
      if (questionToEdit?.question_id) {
        // Exclude question_id from UPDATE payload — it's the PK used in the WHERE clause
        const updatePayload = { ...dataToSave };
        delete updatePayload.question_id;
        const { error: err } = await supabase
          .from('csv_questions')
          .update(updatePayload)
          .eq('question_id', questionToEdit.question_id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('csv_questions')
          .insert(dataToSave);
        error = err;
      }

      if (error) throw error;
      onSave();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[2000] bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] my-auto overflow-hidden flex flex-col shadow-2xl animate-scaleIn">
        <div className="p-4 md:p-6 border-b border-surface-100 flex items-center justify-between bg-surface-50/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-gold-500" />
            {questionToEdit ? 'Edit Question' : 'Add New Question'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-200 rounded-xl transition cursor-pointer">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Subject</label>
              <select value={formData.subject_code} onChange={e => setFormData({ ...formData, subject_code: e.target.value })} className="ncc-input w-full" required>
                <option value="">Select Subject</option>
                {csv_subjects.map(s => <option key={s.subject_code} value={s.subject_code}>{s.subject_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Module Number</label>
              <input type="number" min="1" value={formData.module_number} onChange={e => setFormData({ ...formData, module_number: e.target.value })} className="ncc-input w-full" placeholder="e.g. 1" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Certificate Level</label>
              <select value={formData.certificate} onChange={e => setFormData({ ...formData, certificate: e.target.value })} className="ncc-input w-full">
                <option value="Common">Common</option>
                <option value="A">A Cert</option>
                <option value="B">B Cert</option>
                <option value="C">C Cert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Target Wing</label>
              <select value={formData.wing} onChange={e => setFormData({ ...formData, wing: e.target.value })} className="ncc-input w-full">
                <option value="Common">Common</option>
                <option value="Army">Army</option>
                <option value="Navy">Navy</option>
                <option value="Air Force">Air Force</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Difficulty</label>
              <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} className="ncc-input w-full">
                <option value="1">1 (Easy)</option>
                <option value="2">2 (Medium)</option>
                <option value="3">3 (Hard)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy-900 uppercase tracking-wider">Question Text</label>
            <textarea 
              value={formData.question_text} 
              onChange={e => setFormData({...formData, question_text: e.target.value})}
              className="ncc-input min-h-[100px] py-3"
              placeholder="Enter question text..."
              required
            />
          </div>

          <div className="space-y-4 bg-surface-50 p-4 rounded-2xl border border-surface-100">
            <label className="text-xs font-bold text-navy-900 uppercase tracking-wider block">Options & Answer</label>
            
            {['A', 'B', 'C', 'D'].map(opt => (
              <div key={opt} className="flex gap-2 items-center">
                <span className="font-bold text-surface-500 w-6">{opt}.</span>
                <input 
                  type="text" 
                  value={formData[`option_${opt.toLowerCase()}`]} 
                  onChange={e => setFormData({...formData, [`option_${opt.toLowerCase()}`]: e.target.value})}
                  className="ncc-input h-10 flex-1"
                  placeholder={`Option ${opt}`}
                  required={opt === 'A' || opt === 'B'} // require at least 2 options
                />
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, correct_answer: opt})}
                  className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                    formData.correct_answer === opt
                      ? 'bg-mgreen-600 text-white shadow-md' 
                      : 'bg-white border border-surface-200 text-surface-400 hover:border-mgreen-600'
                  }`}
                >
                  Correct
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy-900 uppercase tracking-wider">Explanation (Optional)</label>
            <textarea 
              value={formData.explanation} 
              onChange={e => setFormData({...formData, explanation: e.target.value})}
              className="ncc-input min-h-[80px] py-3"
              placeholder="Explain why this is the correct answer..."
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-50 rounded-2xl border border-surface-100">
            <div className="space-y-0.5">
              <label className="font-bold text-navy-900 text-sm block">Active Status</label>
              <span className="text-xs text-surface-500">Toggle whether this question is active in exams</span>
            </div>
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, active: p.active === 'TRUE' || p.active === true ? 'FALSE' : 'TRUE' }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.active === 'TRUE' || formData.active === true ? 'bg-mgreen-600' : 'bg-surface-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.active === 'TRUE' || formData.active === true ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </form>

        <div className="p-4 md:p-6 border-t border-surface-100 bg-surface-50/50 flex gap-3 flex-shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="ncc-btn ncc-btn-ghost flex-1 cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="ncc-btn ncc-btn-primary flex-1 cursor-pointer"
          >
            {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Question</>}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
