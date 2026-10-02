import { useState, useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import '../styles/PullToRefresh.css';

const PULL_THRESHOLD = 65;
const MAX_PULL = 110;
const DAMPING = 0.42;

export default function PullToRefresh({ onRefresh }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isEligibleRef = useRef(false);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    // Only activate for iOS / iPadOS / WebKit touch devices where Apple disables native PWA pull-to-refresh
    const isIOSDevice = () => {
      const ua = window.navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
      return isIOS;
    };

    if (!isIOSDevice()) return;

    const getScrollTop = () => {
      return (
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      );
    };

    const handleTouchStart = (e) => {
      if (isRefreshingRef.current) return;
      if (getScrollTop() <= 0) {
        startYRef.current = e.touches[0].clientY;
        isEligibleRef.current = true;
      } else {
        isEligibleRef.current = false;
      }
    };

    const handleTouchMove = (e) => {
      if (!isEligibleRef.current || isRefreshingRef.current) return;

      const currentY = e.touches[0].clientY;
      const diffY = currentY - startYRef.current;

      if (diffY > 0 && getScrollTop() <= 0) {
        const distance = Math.min(diffY * DAMPING, MAX_PULL);
        setIsPulling(true);
        setPullDistance(distance);

        // Haptic feedback when crossing threshold
        if (distance >= PULL_THRESHOLD && pullDistance < PULL_THRESHOLD) {
          try {
            if (window.navigator?.vibrate) {
              window.navigator.vibrate(12);
            }
          } catch (_e) {}
        }
      } else {
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isEligibleRef.current || isRefreshingRef.current) return;
      isEligibleRef.current = false;
      setIsPulling(false);

      if (pullDistance >= PULL_THRESHOLD) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setPullDistance(50); // Keep indicator visible during refresh

        try {
          if (onRefresh) {
            await Promise.all([
              onRefresh(),
              new Promise((resolve) => setTimeout(resolve, 600)) // minimum smooth duration
            ]);
          }
        } catch (err) {
          console.error('Error during pull to refresh:', err);
        } finally {
          setIsRefreshing(false);
          isRefreshingRef.current = false;
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onRefresh, pullDistance]);

  const translateY = isRefreshing ? 20 : pullDistance > 0 ? pullDistance - 45 : -60;
  const isPassedThreshold = pullDistance >= PULL_THRESHOLD;

  if (pullDistance === 0 && !isRefreshing) {
    return null;
  }

  return (
    <div
      className={`pull-to-refresh-container ${isPulling ? 'is-pulling' : ''} ${pullDistance > 0 || isRefreshing ? 'is-active' : ''}`}
      style={{
        transform: `translateY(${translateY}px)`
      }}
    >
      <div className="pull-to-refresh-pill">
        {isRefreshing ? (
          <>
            <div className="pull-to-refresh-spinner" />
            <span>Memperbarui data...</span>
          </>
        ) : (
          <>
            <span className={`pull-to-refresh-icon ${isPassedThreshold ? 'rotate-180' : ''}`}>
              <ArrowDown size={16} />
            </span>
            <span>{isPassedThreshold ? 'Lepas untuk refresh' : 'Tarik untuk refresh'}</span>
          </>
        )}
      </div>
    </div>
  );
}
