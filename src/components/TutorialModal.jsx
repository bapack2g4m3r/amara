import { useEffect } from 'react';
import { X, Play, ExternalLink, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/TutorialModal.css';

const TutorialModal = ({ isOpen, onClose, video }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  return (
    <div className="tutorial-modal-overlay" onClick={onClose}>
      <div 
        className="tutorial-modal-container" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="tutorial-modal-header">
          <div className="tutorial-modal-title-row">
            <span className="tutorial-badge-part">{video.part}</span>
            <h3 className="tutorial-modal-title">{video.title}</h3>
          </div>
          <button 
            type="button" 
            className="tutorial-modal-close-btn" 
            onClick={onClose}
            aria-label="Tutup Video"
          >
            <X size={20} />
          </button>
        </div>

        <div className="tutorial-modal-player-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="tutorial-modal-footer">
          <p className="tutorial-modal-desc">{video.description}</p>
          <div className="tutorial-modal-actions">
            <button
              type="button"
              className="tutorial-btn-all"
              onClick={() => {
                onClose();
                navigate('/tutorial');
              }}
            >
              <Sparkles size={14} />
              <span>Semua Panduan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
