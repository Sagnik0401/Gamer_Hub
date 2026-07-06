import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import ConfirmModal from '../common/ConfirmModal';

const COMMON_TAGS = ['FPS', 'RPG', 'MOBA', 'Battle Royale', 'Strategy', 'Sports', 'Horror', 'Co-op'];

const PostForm = ({ onSuccess, initialData = null, onCancel }) => {
  const editing = !!initialData;
  const [form, setForm] = useState({
    title:   initialData?.title   || '',
    content: initialData?.content || '',
    tags:    initialData?.tags?.join(', ') || ''
  });
  const [file, setFile]               = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Compare current fields with initial values
  const isDirty = () => {
    const titleChanged = form.title.trim() !== (initialData?.title || '');
    const contentChanged = form.content.trim() !== (initialData?.content || '');
    const tagsChanged = form.tags.split(',').map(t => t.trim()).filter(Boolean).join(',') !== 
                        (initialData?.tags || []).join(',');
    const fileSelected = !!file;
    return titleChanged || contentChanged || tagsChanged || fileSelected;
  };

  const handleCancelClick = () => {
    if (isDirty()) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleFileChange = e => {
    setError('');
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const isVideo = selectedFile.type.startsWith('video/');
    const isImage = selectedFile.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setError('Invalid file type. Please select an image or a video clip.');
      return;
    }

    const maxSize = isVideo ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB video, 5MB image
    if (selectedFile.size > maxSize) {
      setError(
        isVideo
          ? 'Video clips must be 10MB or less.'
          : 'Images must be 5MB or less.'
      );
      return;
    }

    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
  };

  const clearFile = () => {
    setFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview('');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);

      if (editing) {
        // Edit mode (text fields only for now)
        const payload = {
          title: form.title.trim(),
          content: form.content.trim(),
          tags: tagsArray
        };
        const { data } = await axiosInstance.put(`/posts/${initialData._id}`, payload);
        onSuccess(data);
      } else {
        // Create mode (supports multipart file uploads)
        const formData = new FormData();
        formData.append('title', form.title.trim());
        formData.append('content', form.content.trim());
        formData.append('tags', JSON.stringify(tagsArray));
        if (file) {
          formData.append('media', file);
        }

        const { data } = await axiosInstance.post('/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        onSuccess(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong while saving the post.');
    } finally {
      setLoading(false);
    }
  };

  const addTag = tag => {
    const existing = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (!existing.includes(tag.toLowerCase())) {
      setForm({ ...form, tags: [...existing, tag].join(', ') });
    }
  };

  return (
    <div className="post-form-card">
      <h3 className="post-form-title">{editing ? '✏️ Edit Post' : '✍️ Share a Moment'}</h3>
      {error && <div className="form-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="post-title">Title</label>
          <input
            id="post-title"
            className="form-input"
            name="title"
            placeholder="What's on your mind? Or title your clip..."
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="post-content">Description (Optional)</label>
          <textarea
            id="post-content"
            className="form-textarea"
            name="content"
            placeholder="Describe your clip, play, or discussion topic..."
            value={form.content}
            onChange={handleChange}
          />
        </div>

        {/* Media Upload (Only show when creating a new post) */}
        {!editing && (
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Upload Clip / Image</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', cursor: 'pointer' }}>
                📁 Select File
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                Max size: 10MB Video, 5MB Image.
              </span>
            </div>

            {/* Preview Section */}
            {filePreview && (
              <div style={{ marginTop: '1rem', position: 'relative', display: 'inline-block' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={clearFile}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    zIndex: 10,
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    padding: 0,
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Remove media"
                >
                  ✕
                </button>
                {file.type.startsWith('video/') ? (
                  <video
                    src={filePreview}
                    controls
                    style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: 'var(--radius-sm)' }}
                  />
                ) : (
                  <img
                    src={filePreview}
                    alt="Preview"
                    style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="post-tags">Tags (comma separated)</label>
          <input
            id="post-tags"
            className="form-input"
            name="tags"
            placeholder="RPG, Elden Ring, Co-op"
            value={form.tags}
            onChange={handleChange}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
            {COMMON_TAGS.map(tag => (
              <button key={tag} type="button" className="tag" style={{ cursor: 'pointer' }}
                onClick={() => addTag(tag)}>+ {tag}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          {onCancel && (
            <button type="button" className="btn btn-ghost" onClick={handleCancelClick}>Cancel</button>
          )}
          <button id="post-submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Uploading & Saving...' : editing ? 'Save Changes' : 'Publish Post'}
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={showCancelConfirm}
        title="Discard changes?"
        message="Are you sure you want to discard your changes? Unsaved modifications will be permanently lost."
        confirmText="Discard"
        cancelText="Keep Editing"
        isDanger={true}
        onConfirm={() => {
          setShowCancelConfirm(false);
          onCancel();
        }}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
};

export default PostForm;
