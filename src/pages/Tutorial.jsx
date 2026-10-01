import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, ChevronLeft, ChevronRight, ArrowRight, Sparkles, CheckCircle2, Film } from 'lucide-react';
import { TUTORIAL_VIDEOS } from '../data/tutorialVideos';
import '../styles/Tutorial.css';

const Tutorial = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Read initial video from query parameter (e.g. ?id=4 or ?part=4)
  const searchParams = new URLSearchParams(location.search);
  const initialId = parseInt(searchParams.get('id') || searchParams.get('part'), 10) || 1;

  const [activeVideoId, setActiveVideoId] = useState(
    TUTORIAL_VIDEOS.some(v => v.id === initialId) ? initialId : 1
  );

  // Sync state if query parameter changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = parseInt(params.get('id') || params.get('part'), 10);
    if (id && TUTORIAL_VIDEOS.some(v => v.id === id)) {
      setActiveVideoId(id);
    }
  }, [location.search]);

  const activeVideo = TUTORIAL_VIDEOS.find(v => v.id === activeVideoId) || TUTORIAL_VIDEOS[0];
  const currentIndex = TUTORIAL_VIDEOS.findIndex(v => v.id === activeVideo.id);
  const prevVideo = currentIndex > 0 ? TUTORIAL_VIDEOS[currentIndex - 1] : null;
  const nextVideo = currentIndex < TUTORIAL_VIDEOS.length - 1 ? TUTORIAL_VIDEOS[currentIndex + 1] : null;

  const handleSelectVideo = (id) => {
    setActiveVideoId(id);
    navigate(`/tutorial?id=${id}`, { replace: true });
    // Scroll smoothly to player if on mobile
    if (window.innerWidth < 960) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="tutorial-page">
      {/* Header Section */}
      <header className="tutorial-header">
        <div className="tutorial-tag-badge">
          <Film size={13} />
          <span>Akademi Persiapan Pernikahan</span>
        </div>
        <h1 className="tutorial-title">Pusat Panduan Video Amara</h1>
        <p className="tutorial-subtitle">
          8 video panduan praktis step-by-step untuk membantu kamu dan calon pasangan memaksimalkan seluruh fitur Amara mulai dari langkah pertama hingga hari H.
        </p>
        <div className="tutorial-creator-pill">
          <span className="tutorial-creator-avatar">DM</span>
          <span className="tutorial-creator-text">Dipandu langsung oleh <strong>Dhova & Maipa</strong></span>
        </div>
      </header>

      {/* Main Split Layout: Player + Playlist */}
      <div className="tutorial-layout">
        {/* Left Column: Player & Active Details */}
        <section className="tutorial-player-card">
          <div className="tutorial-screen-container">
            <iframe
              key={activeVideo.videoId}
              src={`https://www.youtube.com/embed/${activeVideo.videoId}?rel=0&modestbranding=1&autoplay=0`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="tutorial-player-body">
            <div className="tutorial-active-meta">
              <span className="tutorial-active-part">{activeVideo.part}</span>
              <span className="tutorial-active-duration">
                <Clock size={14} /> Durasi: {activeVideo.duration}
              </span>
            </div>

            <h2 className="tutorial-active-title">{activeVideo.title}</h2>
            <p className="tutorial-active-desc">{activeVideo.description}</p>

            {activeVideo.tags && (
              <div className="tutorial-tag-list">
                {activeVideo.tags.map((tag, idx) => (
                  <span key={idx} className="tutorial-tag-item">#{tag}</span>
                ))}
              </div>
            )}

            <div className="tutorial-nav-controls">
              <button
                type="button"
                className="tutorial-btn-dir"
                disabled={!prevVideo}
                onClick={() => prevVideo && handleSelectVideo(prevVideo.id)}
              >
                <ChevronLeft size={16} />
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                className="tutorial-btn-action-feature"
                onClick={() => navigate(activeVideo.relatedPath)}
              >
                <span>{activeVideo.relatedName}</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                className="tutorial-btn-dir"
                disabled={!nextVideo}
                onClick={() => nextVideo && handleSelectVideo(nextVideo.id)}
              >
                <span>Selanjutnya</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Playlist Sidebar */}
        <aside className="tutorial-playlist-card">
          <div className="tutorial-playlist-header">
            <h3>Daftar Materi</h3>
            <span className="tutorial-playlist-count">8 Video Seri</span>
          </div>

          <div className="tutorial-video-list">
            {TUTORIAL_VIDEOS.map((item) => {
              const isActive = item.id === activeVideo.id;
              return (
                <div
                  key={item.id}
                  className={`tutorial-video-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleSelectVideo(item.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="tutorial-thumb-box">
                    <img
                      src={`https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`}
                      alt={item.title}
                      className="tutorial-thumb-img"
                      loading="lazy"
                    />
                    <span className="tutorial-thumb-duration">{item.duration}</span>
                  </div>

                  <div className="tutorial-item-info">
                    <div className="tutorial-item-top">
                      <span className="tutorial-item-part">{item.part}</span>
                      {isActive && (
                        <span className="tutorial-item-playing">
                          <PlayCircle size={12} /> Sedang Diputar
                        </span>
                      )}
                    </div>
                    <h4 className="tutorial-item-title">{item.title}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Tutorial;
