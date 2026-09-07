import { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Hapus Tugas?',
  message = 'Tugas yang dihapus tidak dapat dikembalikan.',
  itemName = '',
  confirmText = 'Hapus',
  cancelText = 'Batal',
  danger = true,
  isLoading = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 14, 23, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="card modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '400px',
          padding: '24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          borderRadius: 'var(--border-radius-xl)',
          backgroundColor: 'var(--color-surface-solid)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <button 
          onClick={onClose} 
          className="modal-close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex'
          }}
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        {/* Warning Icon Badge */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: danger ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: danger ? 'var(--color-danger)' : 'var(--color-warning)',
          marginBottom: '4px'
        }}>
          {danger ? <Trash2 size={26} /> : <AlertTriangle size={26} />}
        </div>

        {/* Text Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: 0,
            fontFamily: 'var(--font-title)'
          }}>
            {title}
          </h3>

          {itemName && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: 'var(--color-background)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--color-border)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              wordBreak: 'break-word'
            }}>
              "{itemName}"
            </div>
          )}

          <p style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
            margin: 0
          }}>
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
          <button 
            type="button" 
            onClick={onClose}
            className="btn-secondary"
            disabled={isLoading}
            style={{ flex: 1, padding: '10px 16px', fontSize: '0.9rem', textAlign: 'center' }}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px 16px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'white',
              backgroundColor: danger ? 'var(--color-danger)' : 'var(--color-primary)',
              borderRadius: 'var(--border-radius-full)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: danger ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'var(--shadow-sm)',
              transition: 'all 0.2s',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? '...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
