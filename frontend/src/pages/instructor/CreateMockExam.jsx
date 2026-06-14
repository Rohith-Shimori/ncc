import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { parseFile } from '../../services/csvParser';
import { FileText, Settings, Upload, X, ArrowLeft, ArrowRight, Check, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 1, label: 'Exam Details' },
  { id: 2, label: 'Question Distribution' },
  { id: 3, label: 'Review' },
  { id: 4, label: 'Publish' },
];

export default function CreateMockExam() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('criteria');
  const [csv_subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [published, setPublished] = useState(false);

  const [formData, setFormData] = useState({
    test_id: Math.floor(Date.now() / 1000),
    test_name: '',
    certificate_level: 'B',
    wing: 'Common',
    time_limit_minutes: 30,
    passing_percent: 50,
    question_distribution: '',
    is_active: true,
  });

  const [criteria, setCriteria] = useState([{ subject_code: 'NCC_GEN', count: 10 }]);

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await supabase.from('csv_subjects').select('*');
      if (data) setSubjects(data);
    };
    fetchSubjects();
  }, []);

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

  const getDistributionString = () => {
    if (mode === 'criteria') {
      return criteria
        .filter(c => c.subject_code && c.count > 0)
        .map(c => `${c.subject_code}:${c.count}`)
        .join('|');
    }
    return formData.question_distribution;
  };

  const totalQuestions = mode === 'criteria'
    ? criteria.reduce((sum, c) => sum + (parseInt(c.count) || 0), 0)
    : (formData.question_distribution || '').split('|').filter(Boolean).reduce((sum, p) => {
      const [, count] = p.split(':');
      return sum + (parseInt(count) || 0);
    }, 0);

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.test_name;
      case 2: return totalQuestions > 0;
      case 3: return true;
      default: return false;
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setError('');
    try {
      const dataToSave = { ...formData, question_distribution: getDistributionString() };
      if (!dataToSave.question_distribution) throw new Error('Please specify question distribution.');
      // test_id is kept as-is — it's pre-generated as exam_{timestamp}, satisfying the VARCHAR NOT NULL constraint

      const { error: insertError } = await supabase.from('csv_mock_exams').insert([dataToSave]);
      if (insertError) throw insertError;
      setPublished(true);
      setStep(4);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/instructor/mock-exams')} className="p-2 hover:bg-surface-200 rounded-lg transition cursor-pointer">
          <ChevronLeft className="w-5 h-5 text-surface-700" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-gold-500" /> Create Mock Exam
          </h1>
          <p className="text-surface-700 text-sm">Step-by-step exam creation wizard</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all ${
                step > s.id ? 'bg-mgreen-600 text-white' :
                step === s.id ? 'bg-navy-900 text-white shadow-lg' :
                'bg-surface-200 text-surface-400'
              }`}>
                {step > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span className={`text-[10px] md:text-xs font-medium mt-1.5 text-center ${step >= s.id ? 'text-navy-900' : 'text-surface-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 -mt-5 ${step > s.id ? 'bg-mgreen-600' : 'bg-surface-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="ncc-glass-card p-5 md:p-8">
        {error && <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm font-medium mb-4">{error}</div>}

        {/* Step 1 — Exam Details */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-bold text-navy-900 text-lg">Exam Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Exam Name</label>
                <input type="text" required value={formData.test_name}
                  onChange={e => setFormData({ ...formData, test_name: e.target.value })}
                  className="ncc-input w-full" placeholder="e.g., B Certificate General Knowledge" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Cert Level</label>
                <select value={formData.certificate_level} onChange={e => setFormData({ ...formData, certificate_level: e.target.value })} className="ncc-input w-full p-2">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Wing</label>
                <select value={formData.wing} onChange={e => setFormData({ ...formData, wing: e.target.value })} className="ncc-input w-full p-2">
                  <option value="Common">Common</option>
                  <option value="Army">Army</option>
                  <option value="Navy">Navy</option>
                  <option value="Air Force">Air Force</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Duration (min)</label>
                <input type="number" min="1" required value={formData.time_limit_minutes}
                  onChange={e => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) })}
                  className="ncc-input w-full p-2" />
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Pass %</label>
                <input type="number" min="1" max="100" required value={formData.passing_percent}
                  onChange={e => setFormData({ ...formData, passing_percent: parseInt(e.target.value) })}
                  className="ncc-input w-full p-2" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Question Distribution */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-bold text-navy-900 text-lg">Question Distribution</h2>
            <div className="flex gap-3 mb-4">
              <button type="button" onClick={() => setMode('criteria')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${mode === 'criteria' ? 'bg-navy-900 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}>
                <Settings className="w-4 h-4" /> Criteria Based
              </button>
              <button type="button" onClick={() => setMode('blueprint')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${mode === 'blueprint' ? 'bg-navy-900 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}>
                <FileText className="w-4 h-4" /> Blueprint
              </button>
            </div>

            {mode === 'criteria' ? (
              <div className="space-y-3 bg-surface-50 p-4 rounded-xl border border-surface-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-navy-900">Subject Distribution</label>
                  <span className="text-xs text-surface-500 font-medium bg-white px-2 py-1 rounded-md border border-surface-200">
                    Total: {totalQuestions} Qs
                  </span>
                </div>
                {criteria.map((c, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-8 sm:col-span-9">
                      <select value={c.subject_code} onChange={e => handleCriteriaChange(i, 'subject_code', e.target.value)} className="ncc-input w-full">
                        <option value="">Select Subject</option>
                        {csv_subjects.map(s => <option key={s.subject_code} value={s.subject_code}>{s.subject_code} - {s.subject_name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                      <input type="number" min="1" value={c.count} onChange={e => handleCriteriaChange(i, 'count', parseInt(e.target.value))} className="ncc-input w-full text-center" placeholder="Qty" />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button type="button" onClick={() => handleRemoveCriteria(i)} className="p-2 text-danger hover:bg-danger/10 rounded-xl transition-colors cursor-pointer" title="Remove">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddCriteria} className="text-sm text-navy-600 font-bold hover:text-navy-800 transition-colors mt-2 cursor-pointer">
                  + Add Subject
                </button>
              </div>
            ) : (
              <div className="space-y-4 bg-surface-50 p-4 rounded-xl border border-surface-200">
                <label className="block text-sm font-bold text-navy-900">Blueprint String or File</label>
                <input type="text" value={formData.question_distribution}
                  onChange={e => setFormData({ ...formData, question_distribution: e.target.value })}
                  className="ncc-input w-full font-mono text-sm"
                  placeholder="e.g., NCC_GEN:10|DRILL:5|WEAPON:5" />
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
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-bold text-navy-900 text-lg">Review & Confirm</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Exam ID', value: 'Auto-generated' },
                { label: 'Exam Name', value: formData.test_name },
                { label: 'Certificate', value: formData.certificate_level },
                { label: 'Wing', value: formData.wing },
                { label: 'Duration', value: `${formData.time_limit_minutes} minutes` },
                { label: 'Pass %', value: `${formData.passing_percent}%` },
                { label: 'Total Questions', value: totalQuestions },
              ].map((item, i) => (
                <div key={i} className="bg-surface-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-bold text-navy-900 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-surface-50 p-4 rounded-xl">
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">Question Distribution</p>
              <p className="text-sm font-mono text-navy-900">{getDistributionString() || 'Not specified'}</p>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 accent-gold-500" />
              <span className="font-medium text-navy-900">Publish immediately (visible to cadets)</span>
            </label>
          </div>
        )}

        {/* Step 4 — Published */}
        {step === 4 && published && (
          <div className="text-center py-8 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 bg-mgreen-600/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-mgreen-600" />
            </div>
            <h2 className="text-xl font-bold text-navy-900">Exam Published!</h2>
            <p className="text-surface-700 text-sm">{formData.test_name} has been created successfully.</p>
            <div className="flex gap-3 justify-center pt-4">
              <button onClick={() => navigate('/instructor/mock-exams')} className="ncc-btn ncc-btn-primary px-6 cursor-pointer">
                Back to Exams
              </button>
              <button onClick={() => { setStep(1); setPublished(false); setFormData({ ...formData, test_id: Math.floor(Date.now() / 1000), test_name: '' }); }}
                className="ncc-btn ncc-btn-ghost px-6 cursor-pointer">
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {step < 4 && (
        <div className="flex justify-between gap-3">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/instructor/mock-exams')}
            className="ncc-btn ncc-btn-ghost px-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> {step > 1 ? 'Previous' : 'Cancel'}
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="ncc-btn ncc-btn-primary px-6 cursor-pointer"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={loading}
              className="ncc-btn ncc-btn-accent px-6 cursor-pointer"
            >
              {loading ? 'Publishing...' : <><Check className="w-4 h-4" /> Publish Exam</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
