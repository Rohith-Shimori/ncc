import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Settings, Upload } from 'lucide-react';
import { supabase } from '../services/supabase';
import { parseFile } from '../services/csvParser';

export default function CreateMockExamModal({ isOpen, onClose, testToEdit, onSave }) {
  const [mode, setMode] = useState('criteria'); // 'criteria' or 'blueprint'
  const [formData, setFormData] = useState({
    test_id: '',
    test_name: '',
    certificate_level: 'B',
    wing: 'Common',
    time_limit_minutes: 30,
    passing_percent: 50,
    question_distribution: '',
    is_active: true
  });
  
  const [criteria, setCriteria] = useState([
    { subject_code: 'NCC_GEN', count: 10 }
  ]);
  
  const [csv_subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await supabase.from('csv_subjects').select('*');
      if (data) setSubjects(data);
    };
    if (isOpen) {
      fetchSubjects();
      
      if (testToEdit) {
        setFormData({
          test_id: testToEdit.test_id || testToEdit.id || '',
          test_name: testToEdit.test_name || testToEdit.title || '',
          certificate_level: testToEdit.certificate_level || 'B',
          wing: testToEdit.wing || 'Common',
          time_limit_minutes: testToEdit.time_limit_minutes || testToEdit.duration_minutes || 30,
          passing_percent: testToEdit.passing_percent || testToEdit.passing_score || 50,
          question_distribution: testToEdit.question_distribution || '',
          is_active: testToEdit.is_active !== false
        });
        
        if (testToEdit.question_distribution) {
          const parts = testToEdit.question_distribution.split('|').filter(Boolean);
          const parsed = parts.map(p => {
            const [code, count] = p.split(':');
            return { subject_code: code, count: parseInt(count, 10) || 0 };
          });
          if (parsed.length > 0) setCriteria(parsed);
        }
      } else {
        setFormData({
          test_id: Math.floor(Date.now() / 1000),
          test_name: '',
          certificate_level: 'B',
          wing: 'Common',
          time_limit_minutes: 30,
          passing_percent: 50,
          question_distribution: '',
          is_active: true
        });
        setCriteria([{ subject_code: 'NCC_GEN', count: 10 }]);
      }
    }
  }, [testToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddCriteria = () => {
    setCriteria([...criteria, { subject_code: csv_subjects[0]?.subject_code || '', count: 5 }]);
  };

  const handleRemoveCriteria = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleCriteriaChange = (index, field, value) => {
    const newCriteria = [...criteria];
    newCriteria[index][field] = value;
    setCriteria(newCriteria);
  };

  const handleBlueprintUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await parseFile(file);
      // Assuming blueprint has columns: subject_code, count
      if (data && data.length > 0) {
        const dist = data
          .filter(r => r.subject_code && r.count)
          .map(r => `${r.subject_code}:${r.count}`)
          .join('|');
        setFormData({ ...formData, question_distribution: dist });
      }
    } catch (err) {
      setError(err.message || 'Failed to parse blueprint file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSave = { ...formData };
      
      if (mode === 'criteria') {
        dataToSave.question_distribution = criteria
          .filter(c => c.subject_code && c.count > 0)
          .map(c => `${c.subject_code}:${c.count}`)
          .join('|');
      }

      if (!dataToSave.question_distribution) {
        throw new Error('Please specify question distribution.');
      }

      if (testToEdit) {
        const { error: updateError } = await supabase
          .from('csv_mock_exams')
          .update(dataToSave)
          .eq('test_id', testToEdit.test_id || testToEdit.id);
        if (updateError) throw updateError;
      } else {
        // test_id is already set to exam_{timestamp} \u2014 keep it, it's the VARCHAR PK (NOT NULL, no default)
        const { error: insertError } = await supabase
          .from('csv_mock_exams')
          .insert([dataToSave]);
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
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-scaleIn max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50 flex-shrink-0">
          <h3 className="font-bold text-navy-900 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-500" />
            {testToEdit ? 'Edit Mock Exam' : 'Create Mock Exam'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 md:p-6">
          <form id="mock-test-form" onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm font-medium">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Exam ID</label>
                <input
                  type="text"
                  required
                  value={testToEdit ? formData.test_id : 'Auto-generated'}
                  className="ncc-input w-full bg-surface-100 cursor-not-allowed"
                  disabled={true}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Exam Name</label>
                <input
                  type="text"
                  required
                  value={formData.test_name}
                  onChange={e => setFormData({ ...formData, test_name: e.target.value })}
                  className="ncc-input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Cert Level</label>
                <select
                  value={formData.certificate_level}
                  onChange={e => setFormData({ ...formData, certificate_level: e.target.value })}
                  className="ncc-input w-full p-2"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Wing</label>
                <select
                  value={formData.wing}
                  onChange={e => setFormData({ ...formData, wing: e.target.value })}
                  className="ncc-input w-full p-2"
                >
                  <option value="Common">Common</option>
                  <option value="Army">Army</option>
                  <option value="Navy">Navy</option>
                  <option value="Air Force">Air Force</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Mins</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.time_limit_minutes}
                  onChange={e => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) })}
                  className="ncc-input w-full p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Pass %</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={formData.passing_percent}
                  onChange={e => setFormData({ ...formData, passing_percent: parseInt(e.target.value) })}
                  className="ncc-input w-full p-2"
                />
              </div>
            </div>

            <div className="border-t border-surface-200 pt-4">
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setMode('criteria')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${mode === 'criteria' ? 'bg-navy-900 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
                >
                  <Settings className="w-4 h-4" /> Criteria Based
                </button>
                <button
                  type="button"
                  onClick={() => setMode('blueprint')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${mode === 'blueprint' ? 'bg-navy-900 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
                >
                  <FileText className="w-4 h-4" /> Blueprint Upload
                </button>
              </div>

              {mode === 'criteria' ? (
                <div className="space-y-3 bg-surface-50 p-4 rounded-xl border border-surface-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-navy-900">Question Distribution</label>
                    <span className="text-xs text-surface-500 font-medium bg-white px-2 py-1 rounded-md border border-surface-200">
                      Total: {criteria.reduce((sum, c) => sum + (parseInt(c.count) || 0), 0)} Qs
                    </span>
                  </div>
                  
                  {criteria.map((c, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-8 sm:col-span-9">
                        <select
                          value={c.subject_code}
                          onChange={e => handleCriteriaChange(i, 'subject_code', e.target.value)}
                          className="ncc-input w-full"
                        >
                          <option value="">Select Subject</option>
                          {csv_subjects.map(s => (
                            <option key={s.subject_code} value={s.subject_code}>{s.subject_code} - {s.subject_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={c.count}
                          onChange={e => handleCriteriaChange(i, 'count', parseInt(e.target.value))}
                          className="ncc-input w-full text-center"
                          placeholder="Qty"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveCriteria(i)}
                          className="p-2 text-danger hover:bg-danger/10 rounded-xl transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddCriteria}
                    className="text-sm text-navy-600 font-bold hover:text-navy-800 transition-colors mt-2"
                  >
                    + Add Subject
                  </button>
                </div>
              ) : (
                <div className="space-y-4 bg-surface-50 p-4 rounded-xl border border-surface-200">
                  <label className="block text-sm font-bold text-navy-900">Blueprint String or File</label>
                  <input
                    type="text"
                    value={formData.question_distribution}
                    onChange={e => setFormData({ ...formData, question_distribution: e.target.value })}
                    className="ncc-input w-full font-mono text-sm"
                    placeholder="e.g., NCC_GEN:10|DRILL:5|WEAPON:5"
                  />
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-surface-500 font-bold uppercase">OR</span>
                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-300 rounded-xl text-sm font-bold text-navy-700 cursor-pointer hover:bg-surface-50 transition-colors">
                      <Upload className="w-4 h-4" /> Upload CSV
                      <input type="file" accept=".csv" className="hidden" onChange={handleBlueprintUpload} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-gold-500 rounded border-surface-300 focus:ring-gold-500"
              />
              <span className="font-medium text-navy-900">Active (Visible to Cadets)</span>
            </label>
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
            form="mock-test-form"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-navy-600 text-white font-bold rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Mock Exam'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
