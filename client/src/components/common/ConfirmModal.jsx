import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  isDanger = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <h3 className="modal-title" style={{ marginTop: 0, fontSize: '1.2rem' }}>
          {title}
        </h3>
        
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: '1.5rem', 
          fontSize: '0.92rem', 
          lineHeight: '1.5' 
        }}>
          {message}
        </p>

        <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-ghost" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className="btn" 
            onClick={onConfirm}
            style={{
              background: isDanger ? 'var(--danger)' : 'var(--primary)',
              color: '#fff',
              border: 'none',
              boxShadow: isDanger ? 'none' : 'var(--shadow-glow)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
