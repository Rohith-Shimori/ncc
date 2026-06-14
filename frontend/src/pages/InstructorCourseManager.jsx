import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ArrowLeft, Plus, Edit2, Trash2, Folder, FileText, Video, Layout } from 'lucide-react';
import ModuleEditorModal from '../components/ModuleEditorModal';
import ChapterEditorModal from '../components/ChapterEditorModal';

export default function InstructorCourseManager() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);

  const loadCourseData = async () => {
    setLoading(true);
    // Fetch Course
    const { data: cData } = await supabase.from('courses').select('*').eq('id', courseId).single();
    setCourse(cData);

    // Fetch Modules and nested Chapters
    const { data: mData } = await supabase
      .from('modules')
      .select('*, chapters(*)')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
    
    // Sort chapters inside modules
    const sortedModules = (mData || []).map(m => ({
      ...m,
      chapters: (m.chapters || []).sort((a, b) => a.order_index - b.order_index)
    }));
    
    setModules(sortedModules);
    setLoading(false);
  };

  useEffect(() => {
    if (courseId) loadCourseData();
  }, [courseId]);

  const handleDeleteModule = async (id) => {
    if (!confirm('Are you sure you want to delete this module and ALL its chapters?')) return;
    const { error } = await supabase.from('modules').delete().eq('id', id);
    if (error) alert(error.message);
    else loadCourseData();
  };

  const handleDeleteChapter = async (id) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;
    const { error } = await supabase.from('chapters').delete().eq('id', id);
    if (error) alert(error.message);
    else loadCourseData();
  };

  const openAddChapter = (moduleId) => {
    setActiveModuleId(moduleId);
    setEditingChapter(null);
    setIsChapterModalOpen(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  if (!course) return <div className="p-8 text-center text-surface-500">Course not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-200 rounded-lg text-surface-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">{course.title}</h1>
          <p className="text-surface-600 text-sm">Syllabus Management</p>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-gold-500" /> Curriculum
          </h2>
          <button 
            onClick={() => { setEditingModule(null); setIsModuleModalOpen(true); }}
            className="ncc-btn ncc-btn-primary py-2 px-4 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Module
          </button>
        </div>

        {modules.length === 0 ? (
          <div className="ncc-glass-card p-12 text-center border-dashed border-2">
            <Folder className="w-12 h-12 mx-auto text-surface-300 mb-4" />
            <p className="text-surface-700 font-medium">No modules created yet.</p>
            <p className="text-sm text-surface-500 mt-1">Start by adding a module to organize your chapters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="ncc-glass-card overflow-hidden">
                {/* Module Header */}
                <div className="bg-surface-50 p-4 border-b border-surface-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-navy-900">Module {module.order_index}: {module.title}</h3>
                    {module.description && <p className="text-xs text-surface-500 mt-1">{module.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setEditingModule(module); setIsModuleModalOpen(true); }}
                      className="p-1.5 hover:bg-surface-200 rounded-lg text-navy-500 transition"
                      title="Edit Module"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteModule(module.id)}
                      className="p-1.5 hover:bg-danger/10 rounded-lg text-danger transition"
                      title="Delete Module"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Chapters List */}
                <div className="p-4">
                  {module.chapters.length === 0 ? (
                    <p className="text-sm text-surface-500 italic mb-3">No chapters in this module.</p>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {module.chapters.map((chapter) => (
                        <div key={chapter.id} className="flex items-center justify-between p-3 border border-surface-100 rounded-xl hover:bg-surface-50 transition group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center">
                              {chapter.video_url ? <Video className="w-4 h-4 text-gold-600" /> : <FileText className="w-4 h-4 text-gold-600" />}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-navy-900">{chapter.order_index}. {chapter.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {(chapter.image_urls && chapter.image_urls.length > 0) && (
                                  <span className="text-[10px] font-bold text-mgreen-600 uppercase bg-mgreen-600/10 px-1.5 py-0.5 rounded">Has Attachments</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { 
                                setEditingChapter(chapter); 
                                setActiveModuleId(module.id);
                                setIsChapterModalOpen(true); 
                              }}
                              className="p-1.5 hover:bg-surface-200 rounded text-navy-500"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteChapter(chapter.id)}
                              className="p-1.5 hover:bg-danger/10 rounded text-danger"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    onClick={() => openAddChapter(module.id)}
                    className="flex items-center gap-2 text-sm font-bold text-gold-600 hover:text-gold-700 transition"
                  >
                    <Plus className="w-4 h-4" /> Add Chapter / Upload Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModuleEditorModal 
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        courseId={courseId}
        moduleToEdit={editingModule}
        onSave={loadCourseData}
      />

      <ChapterEditorModal 
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        moduleId={activeModuleId}
        chapterToEdit={editingChapter}
        onSave={loadCourseData}
      />
    </div>
  );
}
