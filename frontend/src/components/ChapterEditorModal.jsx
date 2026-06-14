import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Link as LinkIcon, FileText, Loader2, Video } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function ChapterEditorModal({ isOpen, onClose, chapterToEdit, moduleId, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    video_url: '',
    sequence_order: 1
  });
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (chapterToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: chapterToEdit.title || '',
        content: chapterToEdit.content || '',
        video_url: chapterToEdit.video_url || '',
        sequence_order: chapterToEdit.order_index || 1
      });
      setAttachments(chapterToEdit.image_urls || []);
    } else {
      setFormData({
        title: '',
        content: '',
        video_url: '',
        sequence_order: 1
      });
      setAttachments([]);
    }
  }, [chapterToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `chapter_notes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('study-materials')
        .getPublicUrl(filePath);

      setAttachments(prev => [...prev, { name: file.name, url: data.publicUrl }]);
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title: formData.title,
      content: formData.content,
      video_url: formData.video_url,
      order_index: formData.sequence_order,
      module_id: moduleId,
      image_urls: attachments,
      content_type: 'markdown',
      content_data: {}
    };

    try {
      if (chapterToEdit) {
        const { error: updateError } = await supabase
          .from('chapters')
          .update(payload)
          .eq('id', chapterToEdit.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('chapters')
          .insert([payload]);
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
          <h3 className="font-bold text-navy-900 text-lg">
            {chapterToEdit ? 'Edit Chapter & Notes' : 'Add Chapter & Notes'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-surface-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 md:p-6 flex-1">
          <form id="chapter-form" onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm font-medium">{error}</div>}

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Chapter Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="ncc-input w-full"
                  placeholder="e.g., Introduction to Compasses"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-navy-900 mb-1.5">Order</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.sequence_order}
                  onChange={e => setFormData({ ...formData, sequence_order: parseInt(e.target.value) })}
                  className="ncc-input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5">Study Notes / Content (Markdown supported)</label>
              <textarea
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                className="ncc-input w-full min-h-[150px] font-mono text-sm"
                placeholder="Write your study material here..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-surface-500" /> Video URL (Optional)
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                className="ncc-input w-full"
                placeholder="e.g., YouTube link"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-navy-900 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-surface-500" /> File Attachments (PDFs, PPTs, Images)
              </label>
              <div className="space-y-3">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface-50 border border-surface-200 rounded-lg">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <LinkIcon className="w-4 h-4 text-gold-600 flex-shrink-0" />
                      <a href={att.url || att} target="_blank" rel="noreferrer" className="text-sm font-medium text-navy-600 truncate hover:underline">
                        {att.name || att}
                      </a>
                    </div>
                    <button type="button" onClick={() => removeAttachment(i)} className="text-danger hover:bg-danger/10 p-1.5 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="ncc-btn ncc-btn-ghost py-2 border border-surface-300 border-dashed w-full"
                  >
                    {uploading ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Upload Study Material</span>
                    )}
                  </button>
                </div>
              </div>
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
            form="chapter-form"
            disabled={loading || uploading}
            className="flex-1 px-4 py-2 bg-navy-600 text-white font-bold rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Chapter'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
