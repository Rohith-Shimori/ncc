import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { ClipboardCheck, Plus, Edit2, Upload, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CreateMockExamModal from '../../components/CreateMockExamModal';
import CsvUploadModal from '../../components/CsvUploadModal';

export default function InstructorMockExams() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTest, setEditingTest] = useState(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadTests = async () => {
    const { data } = await supabase.from('csv_mock_exams').select('*').order('test_id', { ascending: false });
    setTests(data || []);
    setLoading(false);
  };

  useEffect(() => { loadTests(); }, []);

  const deleteTest = async (testId) => {
    if (!confirm('Are you sure you want to delete this mock exam? This cannot be undone.')) return;
    const { error } = await supabase.from('csv_mock_exams').delete().eq('test_id', testId);
    if (error) alert(error.message);
    else loadTests();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-navy-900 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 md:w-7 md:h-7 text-gold-500" /> Mock Exams
        </h1>
        <p className="text-surface-700 text-sm">Create and manage mock examinations for cadets</p>
      </div>

      <div className="flex gap-2 justify-end flex-wrap">
        <button onClick={() => setCsvModalOpen(true)} className="ncc-btn ncc-btn-ghost py-2.5 px-6 cursor-pointer">
          <Upload className="w-4 h-4" /> Import CSV
        </button>
        <button
          onClick={() => navigate('/instructor/mock-exams/create')}
          className="ncc-btn ncc-btn-primary py-2.5 px-6 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Exam
        </button>
      </div>

      {/* Exam Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map(t => (
          <div key={t.test_id} className="ncc-glass-card p-5 relative group">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditingTest(t); setIsTestModalOpen(true); }} className="p-1.5 hover:bg-surface-200 rounded-lg text-navy-500 cursor-pointer">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => deleteTest(t.test_id)} className="p-1.5 hover:bg-danger/10 rounded-lg text-danger cursor-pointer" title="Delete Exam">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="ncc-badge bg-danger/10 text-danger">MOCK EXAM</span>
              <span className={`ncc-badge ${t.is_active ? 'bg-mgreen-600/10 text-mgreen-600' : 'bg-surface-200 text-surface-500'}`}>
                {t.is_active ? 'Active' : 'Draft'}
              </span>
            </div>
            <h3 className="font-bold text-navy-900 mb-1 line-clamp-1">{t.test_name}</h3>
            <p className="text-[10px] font-bold text-gold-600 mb-2 truncate">Cert {t.certificate_level} - {t.wing}</p>
            <div className="flex gap-3 text-xs text-surface-700 font-medium">
              <span>{t.time_limit_minutes}m</span>
              <span>Pass: {t.passing_percent}%</span>
            </div>
          </div>
        ))}
        {tests.length === 0 && (
          <div className="col-span-full p-8 text-center text-surface-500 ncc-glass-card">No exams created yet.</div>
        )}
      </div>

      {/* Edit modal — used only for editing existing exams */}
      <CreateMockExamModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        testToEdit={editingTest}
        onSave={loadTests}
      />

      <CsvUploadModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        tableType="csv_mock_exams"
        onSuccess={() => { setCsvModalOpen(false); loadTests(); }}
      />
    </div>
  );
}
