import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { supabase } from '../services/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, BookOpen, Presentation, FileText } from 'lucide-react';

export default function ChapterViewer() {
  const { courseId, chapterId } = useParams();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { modules, completedChapters, refreshProgress } = useOutletContext();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [presentationMode, setPresentationMode] = useState(true);

  // Flat list of all chapters for prev/next navigation
  const allChapters = modules.flatMap(m => m.chapters);
  const currentIndex = allChapters.findIndex(ch => ch.id === chapterId);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
  const isCompleted = completedChapters.has(chapterId);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from('chapters')
        .select('*').eq('id', chapterId).single();
      setChapter(data);
      setLoading(false);
    };
    load();
  }, [chapterId]);

  const markComplete = async () => {
    if (!user || marking) return;
    setMarking(true);
    try {
      // Call the RPC to mark complete and get EXP!
      await supabase.rpc('fn_complete_chapter', { p_chapter_id: chapterId });

      // Check if this was the last chapter
      const updatedCount = completedChapters.has(chapterId) ? completedChapters.size : completedChapters.size + 1;
      if (updatedCount === allChapters.length) {
        // Send Course Completion Notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'course',
          title: 'Course Completed! 🎓',
          content: `Congratulations! You've successfully finished all chapters.`,
          link: `/course/${courseId}`
        });
      }

      await refreshProgress();
      if (refreshProfile) await refreshProfile();
      setMarking(false);
      
      // Auto-navigate to next chapter
      if (nextChapter) {
        navigate(`/course/${courseId}/chapter/${nextChapter.id}`);
      }
    } catch (error) {
      console.error('Error marking complete:', error);
      setMarking(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
    </div>
  );

  if (!chapter) return (
    <div className="text-center py-20">
      <BookOpen className="w-12 h-12 mx-auto text-surface-300 mb-4" />
      <p className="text-surface-700">Chapter not found.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      {/* Chapter header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <div>
          <p className="text-sm text-surface-300 mb-1">Chapter {currentIndex + 1} of {allChapters.length}</p>
          <h1 className="text-xl md:text-2xl font-bold text-navy-900">{chapter.title}</h1>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-sm text-mgreen-600 mt-1">
              <CheckCircle className="w-4 h-4" /> Completed
            </span>
          )}
        </div>
        {chapter.content_type === 'markdown' && chapter.content && (
          <button 
            onClick={() => setPresentationMode(p => !p)} 
            className="ncc-btn ncc-btn-ghost text-xs cursor-pointer flex items-center gap-1.5 border border-surface-200 bg-white hover:bg-surface-50 px-3 py-1.5 rounded-xl shadow-sm font-bold text-navy-900"
          >
            {presentationMode ? (
              <><FileText className="w-4.5 h-4.5 text-gold-500" /> Read Document</>
            ) : (
              <><Presentation className="w-4.5 h-4.5 text-gold-500" /> PPT Slideshow</>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {chapter.content_type === 'markdown' && chapter.content ? (
        presentationMode ? (
          <SlideDeck content={chapter.content} />
        ) : (
          <article className="ncc-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{chapter.content}</ReactMarkdown>
          </article>
        )
      ) : chapter.content_type === 'embed' && chapter.content_data?.embed_url ? (
        <div className="space-y-4">
          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg border border-surface-200 bg-black">
            <iframe 
              src={chapter.content_data.embed_url} 
              className="w-full h-full border-0" 
              allowFullScreen 
              title={chapter.title}
            />
          </div>
          <div className="flex justify-center">
            <a 
              href={chapter.content_data.embed_url.replace('/embed', '/edit')} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ncc-btn ncc-btn-ghost text-xs cursor-pointer flex items-center gap-1.5 border border-surface-200 bg-white hover:bg-surface-50 px-4 py-2 rounded-xl shadow-sm font-bold text-navy-900"
            >
              <Presentation className="w-4 h-4 text-gold-500" /> Open Presentation in New Tab
            </a>
          </div>
        </div>
      ) : chapter.image_urls && chapter.image_urls.length > 0 ? (
        <ImageCarousel images={chapter.image_urls} />
      ) : (
        <div className="ncc-glass-card p-8 md:p-12 text-center text-surface-700">
          <p>No content available for this chapter yet.</p>
        </div>
      )}

      {/* Navigation footer — stacks on mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-8 md:mt-10 pt-5 md:pt-6 border-t border-surface-200">
        {/* Top row: prev and next ghost buttons */}
        <div className="flex items-center justify-between sm:contents gap-2">
          <button onClick={() => prevChapter && navigate(`/course/${courseId}/chapter/${prevChapter.id}`)}
            disabled={!prevChapter}
            className="ncc-btn ncc-btn-ghost cursor-pointer disabled:opacity-30 flex-1 sm:flex-none">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          {/* Desktop: Show next ghost on the right */}
          <button onClick={() => nextChapter && navigate(`/course/${courseId}/chapter/${nextChapter.id}`)}
            disabled={!nextChapter}
            className="ncc-btn ncc-btn-ghost cursor-pointer disabled:opacity-30 sm:order-3 flex-1 sm:flex-none">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center action button */}
        <div className="sm:order-2">
          {!isCompleted ? (
            <button onClick={markComplete} disabled={marking}
              className="ncc-btn ncc-btn-accent cursor-pointer w-full sm:w-auto">
              {marking ? 'Saving...' : <><CheckCircle className="w-4 h-4" /> Mark Complete</>}
            </button>
          ) : nextChapter ? (
            <button onClick={() => navigate(`/course/${courseId}/chapter/${nextChapter.id}`)}
              className="ncc-btn ncc-btn-primary cursor-pointer w-full sm:w-auto">
              Next Chapter <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => navigate(`/course/${courseId}`)}
              className="ncc-btn ncc-btn-primary cursor-pointer w-full sm:w-auto">
              Back to Overview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Image carousel component for slide-based chapters
function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0);

  // Swipe gesture support
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0 && current < images.length - 1) {
        setCurrent(current + 1);
      } else if (distance < 0 && current > 0) {
        setCurrent(current - 1);
      }
    }
  };

  return (
    <div className="ncc-glass-card overflow-hidden">
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img src={images[current]} alt={`Slide ${current + 1}`} className="w-full max-h-[400px] md:max-h-[500px] object-contain bg-surface-50" />
      </div>
      {images.length > 1 && (
        <div className="flex items-center justify-between p-3 md:p-4 border-t border-surface-200">
          <button onClick={() => setCurrent(p => Math.max(0, p - 1))} disabled={current === 0}
            className="ncc-btn ncc-btn-ghost text-sm cursor-pointer disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          {/* Dot indicators on mobile */}
          <div className="flex items-center gap-1.5 md:hidden">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition cursor-pointer ${i === current ? 'bg-gold-500 w-4' : 'bg-surface-300'}`} />
            ))}
          </div>
          <span className="text-sm text-surface-700 hidden md:block">{current + 1} / {images.length}</span>
          <button onClick={() => setCurrent(p => Math.min(images.length - 1, p + 1))} disabled={current === images.length - 1}
            className="ncc-btn ncc-btn-ghost text-sm cursor-pointer disabled:opacity-30">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Parse markdown to slides by splitting on headings or horizontal rules
function parseMarkdownToSlides(markdown) {
  if (!markdown) return [];
  // Split by horizontal rules
  let slides = markdown.split(/(?:\r?\n)---(?:\r?\n)/);
  if (slides.length <= 1) {
    // Split by headings (## ) keeping the heading on the next slide
    const parts = markdown.split(/(?:\r?\n)(?=## )/);
    if (parts.length > 1) {
      slides = parts;
    }
  }
  return slides.map(s => s.trim()).filter(Boolean);
}

// Slide-deck viewer simulating PowerPoint presentation
function SlideDeck({ content }) {
  const slides = parseMarkdownToSlides(content);
  const [activeSlide, setActiveSlide] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const scrollLeft = containerRef.current.scrollLeft;
    const newSlide = Math.round(scrollLeft / width);
    if (newSlide !== activeSlide && newSlide >= 0 && newSlide < slides.length) {
      setActiveSlide(newSlide);
    }
  };

  const scrollToSlide = (index) => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    containerRef.current.scrollTo({
      left: index * width,
      behavior: 'smooth'
    });
    setActiveSlide(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        if (activeSlide < slides.length - 1) scrollToSlide(activeSlide + 1);
      } else if (e.key === 'ArrowLeft') {
        if (activeSlide > 0) scrollToSlide(activeSlide - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlide, slides.length]);

  return (
    <div className="space-y-4">
      {/* Slide counter and hints */}
      <div className="flex items-center justify-between text-xs text-surface-400 font-bold uppercase tracking-wider px-1">
        <span>Slide {activeSlide + 1} of {slides.length}</span>
        <span className="hidden md:inline">Use Left/Right arrow keys ⌨️</span>
      </div>

      {/* Slide Deck Snap Scroll Container */}
      <div className="relative group">
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar border border-surface-200/50 bg-white rounded-2xl md:rounded-3xl shadow-lg min-h-[380px] md:min-h-[440px] select-none"
          style={{ scrollBehavior: 'smooth', scrollSnapType: 'x mandatory' }}
        >
          {slides.map((slideMarkdown, index) => (
            <div 
              key={index}
              className="w-full flex-shrink-0 snap-start snap-always p-6 md:p-10 flex flex-col justify-center slide-card overflow-y-auto"
              style={{ width: '100%' }}
            >
              <article className="ncc-prose w-full max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{slideMarkdown}</ReactMarkdown>
              </article>
            </div>
          ))}
        </div>

        {/* Action Arrows Overlay */}
        {activeSlide > 0 && (
          <button 
            onClick={() => scrollToSlide(activeSlide - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-navy-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow hover:bg-navy-900 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {activeSlide < slides.length - 1 && (
          <button 
            onClick={() => scrollToSlide(activeSlide + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-navy-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow hover:bg-navy-900 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center items-center gap-1.5 flex-wrap pt-2">
        {slides.map((_, i) => (
          <button 
            key={i} 
            onClick={() => scrollToSlide(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === activeSlide ? 'bg-gold-500 w-6 shadow-[0_0_8px_rgba(200,169,81,0.4)]' : 'bg-surface-300 hover:bg-surface-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
