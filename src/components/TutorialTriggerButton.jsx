import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { getTutorialByPath, TUTORIAL_VIDEOS } from '../data/tutorialVideos';
import TutorialModal from './TutorialModal';
import '../styles/TutorialTriggerButton.css';

/**
 * TutorialTriggerButton
 * Contextual button that triggers the matching tutorial video modal based on route or explicit videoId/part.
 */
const TutorialTriggerButton = ({ videoId, part, className = '', label }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  let video = null;
  if (videoId) {
    video = TUTORIAL_VIDEOS.find(v => v.videoId === videoId || v.id === videoId);
  } else if (part) {
    video = TUTORIAL_VIDEOS.find(v => v.part === part || v.id === part);
  } else {
    video = getTutorialByPath(location.pathname);
  }

  if (!video) return null;

  return (
    <>
      <button
        type="button"
        className={`tutorial-trigger-btn ${className}`}
        onClick={() => setIsOpen(true)}
        title={`Tonton panduan: ${video.title} (${video.duration})`}
      >
        <span className="tutorial-trigger-play-icon">
          <PlayCircle size={16} />
        </span>
        <span className="tutorial-trigger-label">
          {label || `Video Panduan`}
        </span>
        <span className="tutorial-trigger-badge">{video.duration}</span>
      </button>

      <TutorialModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        video={video}
      />
    </>
  );
};

export default TutorialTriggerButton;
