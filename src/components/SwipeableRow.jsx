import { useRef, useState, useEffect, useCallback } from 'react';
import '../styles/SwipeableRow.css';

/**
 * SwipeableRow – Reusable swipe-to-reveal component (WhatsApp-style).
 *
 * Props:
 *  - children: Card content (the visible foreground)
 *  - actions: Array of { icon, onClick, className } for reveal buttons
 *  - actionWidth: Width of each action button (default 64)
 *  - disabled: Disable swipe (e.g. for read-only mode)
 *  - swipeHint: If true, play a "bounce" animation on mount as a visual cue
 *  - onSwipeOpen: Callback when this row opens
 *  - onSwipeClose: Callback when this row closes
 *  - activeSwipeId: Currently open row ID (for single-open management)
 *  - id: Unique ID for this row
 */
const SwipeableRow = ({
  children,
  actions = [],
  actionWidth = 64,
  disabled = false,
  swipeHint = false,
  onSwipeOpen,
  onSwipeClose,
  activeSwipeId,
  id,
}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const touchRef = useRef({
    startX: 0,
    startY: 0,
    currentX: 0,
    isSwiping: false,
    isScrolling: null, // null = undecided, true = vertical scroll, false = horizontal swipe
  });

  const [isOpen, setIsOpen] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [hintPlayed, setHintPlayed] = useState(false);

  const maxSwipe = actions.length * actionWidth;

  // Close when another row opens
  useEffect(() => {
    if (activeSwipeId && activeSwipeId !== id && isOpen) {
      setIsOpen(false);
      setTranslateX(0);
      onSwipeClose?.();
    }
  }, [activeSwipeId, id, isOpen, onSwipeClose]);

  // Bounce hint animation
  useEffect(() => {
    if (!swipeHint || hintPlayed || disabled) return;

    const timer = setTimeout(() => {
      setTranslateX(-maxSwipe * 0.6);
      setTimeout(() => {
        setTranslateX(0);
        setHintPlayed(true);
      }, 350);
    }, 800);

    return () => clearTimeout(timer);
  }, [swipeHint, hintPlayed, disabled, maxSwipe]);

  const handleTouchStart = useCallback((e) => {
    if (disabled) return;
    const touch = e.touches[0];
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: translateX,
      isSwiping: true,
      isScrolling: null,
    };
  }, [disabled, translateX]);

  const handleTouchMove = useCallback((e) => {
    if (disabled || !touchRef.current.isSwiping) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchRef.current.startX;
    const deltaY = touch.clientY - touchRef.current.startY;

    // Determine scroll direction on first significant move
    if (touchRef.current.isScrolling === null) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        // Vertical scroll - let browser handle it
        touchRef.current.isScrolling = true;
        touchRef.current.isSwiping = false;
        return;
      }
      if (Math.abs(deltaX) > 8) {
        touchRef.current.isScrolling = false;
      } else {
        return; // Not enough movement yet
      }
    }

    if (touchRef.current.isScrolling) return;

    // Prevent vertical scroll while swiping horizontally
    e.preventDefault();

    let newX = touchRef.current.currentX + deltaX;

    // Clamp: don't go past max reveal or past 0 (no right swipe)
    if (newX > 0) newX = 0;
    if (newX < -maxSwipe) {
      // Rubber band effect past max
      const overswipe = Math.abs(newX) - maxSwipe;
      newX = -(maxSwipe + overswipe * 0.2);
    }

    setTranslateX(newX);
  }, [disabled, maxSwipe]);

  const handleTouchEnd = useCallback(() => {
    if (disabled || !touchRef.current.isSwiping) return;
    touchRef.current.isSwiping = false;

    const threshold = maxSwipe * 0.4;

    if (Math.abs(translateX) >= threshold) {
      // Lock open
      setTranslateX(-maxSwipe);
      setIsOpen(true);
      onSwipeOpen?.();
    } else {
      // Snap back
      setTranslateX(0);
      setIsOpen(false);
      onSwipeClose?.();
    }
  }, [disabled, translateX, maxSwipe, onSwipeOpen, onSwipeClose]);

  // Close on tap when open
  const handleContentClick = useCallback((e) => {
    if (isOpen) {
      e.preventDefault();
      e.stopPropagation();
      setTranslateX(0);
      setIsOpen(false);
      onSwipeClose?.();
    }
  }, [isOpen, onSwipeClose]);

  const isAnimating = !touchRef.current.isSwiping || touchRef.current.isScrolling !== false;

  return (
    <div className="swipeable-row" ref={containerRef}>
      {/* Background action buttons */}
      <div className="swipeable-actions" style={{ width: `${maxSwipe}px` }}>
        {actions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            className={`swipeable-action-btn ${action.className || ''}`}
            style={{ width: `${actionWidth}px` }}
            onClick={(e) => {
              e.stopPropagation();
              // Close row after action
              setTranslateX(0);
              setIsOpen(false);
              onSwipeClose?.();
              action.onClick?.();
            }}
            title={action.title || ''}
          >
            {action.icon}
          </button>
        ))}
      </div>

      {/* Foreground card content */}
      <div
        className={`swipeable-content ${isAnimating ? 'animating' : ''}`}
        ref={contentRef}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleContentClick}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableRow;
