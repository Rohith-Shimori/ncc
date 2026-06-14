import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { FileText, Search, Plus, Edit2, Trash2, Upload, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import AddQuestionModal from '../../components/AddQuestionModal';
import CsvUploadModal from '../../components/CsvUploadModal';

export default function QuestionRepository() {
  const [csv_questions, setQuestions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [csv_subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState('all');
  const [selectedWing, setSelectedWing] = useState('all');
  const [activeOnly, setActiveOnly] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Drawer
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  const searchTimer = useRef(null);

  // Debounced search — 300ms
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // Load csv_subjects once
  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await supabase.from('csv_subjects').select('*');
      setSubjects(data || []);
    };
    fetchSubjects();
  }, []);

  // Load csv_questions with server-side pagination and filters
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from('csv_questions')
      .select('*, csv_subjects(subject_name)', { count: 'exact' })
      .order('question_id', { ascending: false })
      .range(from, to);

    if (debouncedSearch) {
      query = query.ilike('question_text', `%${debouncedSearch}%`);
    }
    if (selectedSubject !== 'all') {
      query = query.eq('subject_code', selectedSubject);
    }
    if (selectedDifficulty !== 'all') {
      query = query.eq('difficulty', parseInt(selectedDifficulty));
    }
    if (activeOnly) {
      query = query.eq('active', 'TRUE');
    }
    // selectedStatus gives explicit active/inactive filtering (separate from the activeOnly checkbox)
    if (!activeOnly && selectedStatus !== 'all') {
      query = query.eq('active', selectedStatus === 'active' ? 'TRUE' : 'FALSE');
    }
    if (selectedCertificate !== 'all') {
      query = query.eq('certificate', selectedCertificate);
    }
    if (selectedWing !== 'all') {
      query = query.eq('wing', selectedWing);
    }

    const { data, count, error } = await query;
    if (!error) {
      setQuestions(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [page, perPage, debouncedSearch, selectedSubject, selectedDifficulty, activeOnly, selectedStatus, selectedCertificate, selectedWing]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadQuestions();
  }, [loadQuestions]);

  const deleteQuestion = async (id) => {
    if (!confirm('Are you sure you want to deactivate this question?')) return;
    const { error } = await supabase.from('csv_questions').update({ active: 'FALSE' }).eq('question_id', id);
    if (error) alert(error.message);
    else loadQuestions();
  };

  const totalPages = Math.ceil(totalCount / perPage);

  const getDifficultyLabel = (d) => d == 1 ? 'Easy' : d == 3 ? 'Hard' : 'Medium';
  const getDifficultyColor = (d) => d == 1 ? 'bg-mgreen-600/10 text-mgreen-600' : d == 3 ? 'bg-danger/10 text-danger' : 'bg-gold-500/10 text-gold-600';
  return (
    <div className="max-w-7xl mx-auto space-y-5 md:space-y-6 animate-fadeIn pb-10">
      {/* Premium Gradient Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white p-6 md:p-8 rounded-3xl shadow-lg border border-gold-500/10">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20 text-gold-400">
              <FileText className="w-5 h-5" />
            </span>
            Question Repository
          </h1>
          <p className="text-gold-200/70 text-xs md:text-sm mt-1">{totalCount} high-quality questions managed in database</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button onClick={() => setCsvModalOpen(true)} className="ncc-btn ncc-btn-ghost h-11 px-5 text-sm flex items-center gap-2 border-surface-700/30 text-surface-200 hover:bg-surface-800">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button onClick={() => { setEditingQuestion(null); setIsModalOpen(true); }} className="ncc-btn ncc-btn-accent h-11 px-5 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Control Center (Filters & Search) */}
      <div className="ncc-glass-card p-4 md:p-6 space-y-4 shadow-md rounded-2xl border border-surface-200/40">
        {/* Row 1: Search and Active Only */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex items-center flex-1 max-w-lg">
            <Search className="absolute left-3.5 w-4 h-4 text-surface-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ncc-input ncc-input-icon w-full text-sm h-11"
              placeholder="Search questions by text..."
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2.5 text-xs font-bold text-navy-900 dark:text-white cursor-pointer bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors h-11 px-4 rounded-xl border border-surface-200/50 shadow-sm select-none">
              <input 
                type="checkbox" 
                checked={activeOnly} 
                onChange={e => { setActiveOnly(e.target.checked); setPage(1); }} 
                className="w-4 h-4 accent-gold-500 rounded border-surface-300 focus:ring-gold-500 cursor-pointer" 
              />
              Active Only
            </label>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-surface-200/40" />

        {/* Row 2: Filter Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-1.5">Subject</label>
            <select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setPage(1); }} className="ncc-input text-xs font-bold h-10 py-0 pr-8">
              <option value="all">All Subjects</option>
              {csv_subjects.map(b => <option key={b.subject_code} value={b.subject_code}>{b.subject_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-1.5">Difficulty</label>
            <select value={selectedDifficulty} onChange={e => { setSelectedDifficulty(e.target.value); setPage(1); }} className="ncc-input text-xs font-bold h-10 py-0 pr-8">
              <option value="all">All Difficulty</option>
              <option value="1">Easy</option>
              <option value="2">Medium</option>
              <option value="3">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-1.5">Status</label>
            <select value={selectedStatus} onChange={e => { setSelectedStatus(e.target.value); setPage(1); }} className="ncc-input text-xs font-bold h-10 py-0 pr-8">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-1.5">Certificate</label>
            <select value={selectedCertificate} onChange={e => { setSelectedCertificate(e.target.value); setPage(1); }} className="ncc-input text-xs font-bold h-10 py-0 pr-8">
              <option value="all">All Certs</option>
              <option value="Common">Common</option>
              <option value="A">A Cert</option>
              <option value="B">B Cert</option>
              <option value="C">C Cert</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-1.5">Wing</label>
            <select value={selectedWing} onChange={e => { setSelectedWing(e.target.value); setPage(1); }} className="ncc-input text-xs font-bold h-10 py-0 pr-8">
              <option value="all">All Wings</option>
              <option value="Common">Common</option>
              <option value="Army">Army</option>
              <option value="Navy">Navy</option>
              <option value="Air Force">Air Force</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex gap-4">
        {/* Table / Cards */}
        <div className={`flex-1 min-w-0 transition-all duration-300 ${selectedQuestion ? 'lg:mr-0' : ''}`}>
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="w-8 h-8 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="ncc-glass-card overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-surface-50 text-left text-xs font-bold text-surface-700 uppercase tracking-wider">
                        <th className="p-4">Question</th>
                        <th className="p-4">Subject</th>
                        <th className="p-4">Module</th>
                        <th className="p-4">Difficulty</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {csv_questions.map(q => (
                        <tr
                          key={q.question_id}
                          className={`hover:bg-surface-50 transition group cursor-pointer ${selectedQuestion?.question_id === q.question_id ? 'bg-gold-500/5 border-l-2 border-gold-500' : ''}`}
                          onClick={() => setSelectedQuestion(q)}
                        >
                          <td className="p-4 max-w-md">
                            <p className="text-sm font-bold text-navy-900 line-clamp-2">{q.question_text}</p>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-gold-600">{q.subject_code}</span>
                          </td>
                          <td className="p-4">
                            <span className="ncc-badge bg-surface-100 text-surface-700 uppercase text-[10px]">{q.module_number}</span>
                          </td>
                          <td className="p-4">
                            <span className={`ncc-badge text-[10px] uppercase ${getDifficultyColor(q.difficulty)}`}>{getDifficultyLabel(q.difficulty)}</span>
                          </td>
                          <td className="p-4">
                            <span className={`ncc-badge text-[10px] uppercase ${q.active === 'TRUE' || q.active === true ? 'bg-mgreen-600/10 text-mgreen-600' : 'bg-surface-200 text-surface-400'}`}>
                              {q.active === 'TRUE' || q.active === true ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setSelectedQuestion(q)} className="p-2 hover:bg-surface-200 rounded-lg text-navy-500 transition cursor-pointer" title="View Details">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setEditingQuestion(q); setIsModalOpen(true); }} className="p-2 hover:bg-surface-200 rounded-lg text-navy-500 transition cursor-pointer">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteQuestion(q.question_id)} className="p-2 hover:bg-danger/10 rounded-lg text-danger transition cursor-pointer" title="Deactivate">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {csv_questions.length === 0 && (
                        <tr><td colSpan={6} className="p-12 text-center text-surface-400">No questions found matching your criteria.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {csv_questions.map(q => (
                  <div
                    key={q.question_id}
                    className={`ncc-glass-card p-4 cursor-pointer ${selectedQuestion?.question_id === q.question_id ? 'ring-2 ring-gold-500/30' : ''}`}
                    onClick={() => setSelectedQuestion(q)}
                  >
                    <p className="text-sm font-bold text-navy-900 line-clamp-2 mb-2">{q.question_text}</p>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-gold-600">{q.subject_code}</span>
                      <span className="ncc-badge bg-surface-100 text-surface-700 uppercase text-[10px]">M{q.module_number}</span>
                      <span className={`ncc-badge text-[10px] uppercase ${getDifficultyColor(q.difficulty)}`}>{getDifficultyLabel(q.difficulty)}</span>
                      <span className={`ncc-badge text-[10px] uppercase ${q.active === 'TRUE' || q.active === true ? 'bg-mgreen-600/10 text-mgreen-600' : 'bg-surface-200 text-surface-400'}`}>
                        {q.active === 'TRUE' || q.active === true ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1 border-t border-surface-100 pt-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setEditingQuestion(q); setIsModalOpen(true); }} className="p-2 hover:bg-surface-200 rounded-lg text-navy-500 transition cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteQuestion(q.question_id)} className="p-2 hover:bg-danger/10 rounded-lg text-danger transition cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {csv_questions.length === 0 && (
                  <div className="ncc-glass-card p-8 text-center text-surface-400">No questions found.</div>
                )}
              </div>

              {/* Pagination */}
              {totalCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm text-surface-700">
                    <span className="font-medium">Per page:</span>
                    {[25, 50, 100, 250].map(n => (
                      <button
                        key={n}
                        onClick={() => { setPerPage(n); setPage(1); }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${perPage === n ? 'bg-navy-900 text-white' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-surface-400 font-medium">
                      Page {page} of {totalPages} ({totalCount} results)
                    </span>
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-lg hover:bg-surface-200 disabled:opacity-30 cursor-pointer transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="p-2 rounded-lg hover:bg-surface-200 disabled:opacity-30 cursor-pointer transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Question Details Drawer (Desktop) */}
        {selectedQuestion && (
          <div className="hidden lg:block w-[380px] flex-shrink-0">
            <div className="ncc-glass-card sticky top-4 overflow-hidden animate-slideInRight">
              <div className="p-4 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
                <h3 className="font-bold text-navy-900 text-sm">Question Details</h3>
                <button onClick={() => setSelectedQuestion(null)} className="p-1.5 hover:bg-surface-200 rounded-lg cursor-pointer transition">
                  <X className="w-4 h-4 text-surface-500" />
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div>
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Question</label>
                  <p className="text-sm text-navy-900 font-medium mt-1">{selectedQuestion.question_text}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Options</label>
                  {['A', 'B', 'C', 'D'].map(opt => {
                    const val = selectedQuestion[`option_${opt.toLowerCase()}`];
                    if (!val) return null;
                    const isCorrect = selectedQuestion.correct_answer === opt;
                    return (
                      <div key={opt} className={`flex gap-2 items-start p-2.5 rounded-xl text-sm ${isCorrect ? 'bg-mgreen-600/10 border border-mgreen-600/20' : 'bg-surface-50'}`}>
                        <span className={`font-bold text-xs mt-0.5 ${isCorrect ? 'text-mgreen-600' : 'text-surface-400'}`}>{opt}.</span>
                        <span className={isCorrect ? 'text-mgreen-700 font-medium' : 'text-surface-700'}>{val}</span>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Correct Answer</label>
                  <p className="text-sm text-mgreen-600 font-bold mt-1">Option {selectedQuestion.correct_answer}</p>
                </div>
                {selectedQuestion.explanation && (
                  <div>
                    <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Explanation</label>
                    <p className="text-sm text-surface-700 mt-1 bg-surface-50 p-3 rounded-xl">{selectedQuestion.explanation}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-100">
                  <div>
                    <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Subject</label>
                    <p className="text-sm font-bold text-gold-600 mt-1">{selectedQuestion.subject_code}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Module</label>
                    <p className="text-sm font-medium text-navy-900 mt-1">{selectedQuestion.module_number}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Difficulty</label>
                    <span className={`ncc-badge text-[10px] uppercase mt-1 ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                      {getDifficultyLabel(selectedQuestion.difficulty)}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Status</label>
                    <span className={`ncc-badge text-[10px] uppercase mt-1 ${selectedQuestion.active === 'TRUE' || selectedQuestion.active === true ? 'bg-mgreen-600/10 text-mgreen-600' : 'bg-surface-200 text-surface-400'}`}>
                      {selectedQuestion.active === 'TRUE' || selectedQuestion.active === true ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {selectedQuestion.certificate && (
                    <div>
                      <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Certificate</label>
                      <p className="text-sm font-medium text-navy-900 mt-1">{selectedQuestion.certificate}</p>
                    </div>
                  )}
                  {selectedQuestion.wing && (
                    <div>
                      <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Wing</label>
                      <p className="text-sm font-medium text-navy-900 mt-1">{selectedQuestion.wing}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => { setEditingQuestion(selectedQuestion); setIsModalOpen(true); }}
                    className="ncc-btn ncc-btn-primary flex-1 py-2 text-sm cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => deleteQuestion(selectedQuestion.question_id)}
                    className="ncc-btn ncc-btn-ghost flex-1 py-2 text-sm text-danger cursor-pointer border-danger/20 hover:bg-danger/5"
                  >
                    <Trash2 className="w-4 h-4" /> Deactivate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer (bottom sheet) */}
      {selectedQuestion && (
        <div className="lg:hidden fixed inset-0 z-[100]" onClick={() => setSelectedQuestion(null)}>
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slideInUp shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-4 border-b border-surface-100 flex items-center justify-between z-10">
              <h3 className="font-bold text-navy-900">Question Details</h3>
              <button onClick={() => setSelectedQuestion(null)} className="p-2 hover:bg-surface-200 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Question</label>
                <p className="text-sm text-navy-900 font-medium mt-1">{selectedQuestion.question_text}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Options</label>
                {['A', 'B', 'C', 'D'].map(opt => {
                  const val = selectedQuestion[`option_${opt.toLowerCase()}`];
                  if (!val) return null;
                  const isCorrect = selectedQuestion.correct_answer === opt;
                  return (
                    <div key={opt} className={`flex gap-2 items-start p-2.5 rounded-xl text-sm ${isCorrect ? 'bg-mgreen-600/10 border border-mgreen-600/20' : 'bg-surface-50'}`}>
                      <span className={`font-bold text-xs mt-0.5 ${isCorrect ? 'text-mgreen-600' : 'text-surface-400'}`}>{opt}.</span>
                      <span className={isCorrect ? 'text-mgreen-700 font-medium' : 'text-surface-700'}>{val}</span>
                    </div>
                  );
                })}
              </div>
              {selectedQuestion.explanation && (
                <div>
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Explanation</label>
                  <p className="text-sm text-surface-700 mt-1 bg-surface-50 p-3 rounded-xl">{selectedQuestion.explanation}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-100">
                <div>
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Subject</label>
                  <p className="text-sm font-bold text-gold-600 mt-1">{selectedQuestion.subject_code}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Module</label>
                  <p className="text-sm font-medium text-navy-900 mt-1">{selectedQuestion.module_number}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Difficulty</label>
                  <span className={`ncc-badge text-[10px] uppercase mt-1 ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                    {getDifficultyLabel(selectedQuestion.difficulty)}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Status</label>
                  <span className={`ncc-badge text-[10px] uppercase mt-1 ${selectedQuestion.active === 'TRUE' || selectedQuestion.active === true ? 'bg-mgreen-600/10 text-mgreen-600' : 'bg-surface-200 text-surface-400'}`}>
                    {selectedQuestion.active === 'TRUE' || selectedQuestion.active === true ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-2 pb-4">
                <button
                  onClick={() => { setEditingQuestion(selectedQuestion); setIsModalOpen(true); setSelectedQuestion(null); }}
                  className="ncc-btn ncc-btn-primary flex-1 py-2 text-sm cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={loadQuestions}
        questionToEdit={editingQuestion}
      />

      <CsvUploadModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        tableType="csv_questions"
        onSuccess={() => { setCsvModalOpen(false); loadQuestions(); }}
      />
    </div>
  );
}
