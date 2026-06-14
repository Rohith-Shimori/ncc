import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Clock, Award, PlayCircle, CheckCircle } from 'lucide-react';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { course, modules, completedChapters } = useOutletContext();

  const totalChapters = modules.reduce((s, m) => s + m.chapters.length, 0);
  const progress = totalChapters ? Math.round((completedChapters.size / totalChapters) * 100) : 0;

  // Find first incomplete chapter for "Continue Learning"
  const nextChapter = modules.flatMap(m => m.chapters).find(ch => !completedChapters.has(ch.id));

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`ncc-badge ${course?.target_wing === 'Army' ? 'ncc-badge-army' : course?.target_wing === 'Navy' ? 'ncc-badge-navy' : course?.target_wing === 'Air Force' ? 'ncc-badge-airforce' : 'bg-surface-100 text-surface-700'}`}>{course?.target_wing}</span>
          <span className="ncc-badge bg-navy-900/10 text-navy-900">{course?.certificate_level} Certificate</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mb-2">{course?.title}</h1>
        <p className="text-surface-700 text-sm md:text-base">{course?.description}</p>

        <div className="flex items-center gap-4 md:gap-6 mt-4 text-xs md:text-sm text-surface-700 flex-wrap">
          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {modules.length} modules</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course?.duration_hours || 0}h</span>
          <span className="flex items-center gap-1"><Award className="w-4 h-4" /> {progress}% complete</span>
        </div>

        {nextChapter && (
          <button onClick={() => navigate(`/course/${courseId}/chapter/${nextChapter.id}`)}
            className="ncc-btn ncc-btn-accent mt-4 cursor-pointer w-full sm:w-auto">
            <PlayCircle className="w-4 h-4" /> {completedChapters.size > 0 ? 'Continue Learning' : 'Start Course'}
          </button>
        )}
        {progress === 100 && (
          <div className="mt-4 p-3 bg-mgreen-600/10 rounded-xl text-mgreen-600 font-medium text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Course completed! Well done, Cadet.
          </div>
        )}
      </div>

      {/* Module list */}
      <div className="space-y-3 md:space-y-4">
        {modules.map((mod, mi) => {
          const modCompleted = mod.chapters.filter(ch => completedChapters.has(ch.id)).length;
          return (
            <div key={mod.id} className="ncc-glass-card p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-navy-900 text-sm md:text-base">Module {mi + 1}: {mod.title}</h3>
                <span className="text-sm text-surface-700">{modCompleted}/{mod.chapters.length}</span>
              </div>
              <div className="space-y-1 md:space-y-2">
                {mod.chapters.map((ch) => {
                  const isDone = completedChapters.has(ch.id);
                  return (
                    <button key={ch.id} onClick={() => navigate(`/course/${courseId}/chapter/${ch.id}`)}
                      className="w-full flex items-center gap-3 p-2.5 md:p-3 rounded-lg hover:bg-surface-50 transition text-left cursor-pointer">
                      {isDone
                        ? <CheckCircle className="w-5 h-5 text-mgreen-600 flex-shrink-0" />
                        : <span className="w-5 h-5 rounded-full border-2 border-surface-200 flex-shrink-0" />
                      }
                      <span className={`text-sm ${isDone ? 'text-surface-700' : 'text-navy-900 font-medium'}`}>{ch.title}</span>
                      <span className="ml-auto text-xs text-surface-300">{ch.content_type === 'markdown' ? '📄' : '🖼️'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
