import { useState, useEffect } from 'react';
import { PRICING_CONFIG } from '../config/appConfig.js';

const EMPTY_STATE = {
  ready: false,
  isExpired: false,
  days: null,
  hours: null,
  minutes: null,
  seconds: null,
  formattedLong: '',
  compactSummary: '',
  isoDuration: '',
};

const padUnit = (value) => {
  if (value === null || value === undefined) return '--';
  return String(Math.max(0, value)).padStart(2, '0');
};

const formatDurationWithLocale = (duration, style) => {
  try {
    if (typeof duration?.toLocaleString === 'function') {
      const formatted = duration.toLocaleString('id-ID', { style });
      if (formatted) return formatted;
    }
  } catch {
    // Graceful fallback only if legacy browser lacks Intl.DurationFormat support
  }
  const parts = [];
  if (duration.days > 0) {
    parts.push(`${duration.days} ${style === 'short' ? 'hr' : 'hari'}`);
  }
  if (duration.hours > 0) {
    parts.push(`${duration.hours} ${style === 'short' ? 'j' : 'jam'}`);
  }
  if (parts.length === 0 && duration.minutes > 0) {
    parts.push(`${duration.minutes} ${style === 'short' ? 'mnt' : 'menit'}`);
  }
  if (parts.length === 0) {
    parts.push(`${Math.max(0, duration.seconds)} ${style === 'short' ? 'dtk' : 'detik'}`);
  }
  return parts.join(', ');
};

export const computeRemainingSnapshot = (TemporalApi, endDateStr, endTimeStr, timeZone, referenceNow) => {
  const now = referenceNow || TemporalApi.Now.zonedDateTimeISO(timeZone);
  const end = TemporalApi.PlainDate.from(endDateStr)
    .toPlainDateTime(endTimeStr)
    .toZonedDateTime(timeZone);

  const exactRemaining = now.until(end, {
    largestUnit: 'day',
    smallestUnit: 'second',
  });

  if (exactRemaining.sign <= 0) {
    return {
      ready: true,
      isExpired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedLong: 'Periode promo telah berakhir',
      compactSummary: 'Berakhir',
      isoDuration: 'PT0S',
    };
  }

  let summarySmallestUnit = 'second';
  if (exactRemaining.days > 0 || exactRemaining.hours > 0) {
    summarySmallestUnit = 'hour';
  } else if (exactRemaining.minutes > 0) {
    summarySmallestUnit = 'minute';
  }

  const roundedSummary = now.until(end, {
    largestUnit: 'day',
    smallestUnit: summarySmallestUnit,
  });

  return {
    ready: true,
    isExpired: false,
    days: exactRemaining.days,
    hours: exactRemaining.hours,
    minutes: exactRemaining.minutes,
    seconds: exactRemaining.seconds,
    formattedLong: formatDurationWithLocale(roundedSummary, 'long'),
    compactSummary: formatDurationWithLocale(roundedSummary, 'short'),
    isoDuration: exactRemaining.toString(),
  };
};

export const usePromoCountdown = ({
  enabled = PRICING_CONFIG.IS_PROMO_ACTIVE,
  endDate = PRICING_CONFIG.PROMO_END_DATE,
  endTime = PRICING_CONFIG.PROMO_END_TIME,
  timeZone = PRICING_CONFIG.PROMO_TIMEZONE,
} = {}) => {
  const [snapshot, setSnapshot] = useState(() => {
    if (!enabled || typeof globalThis.Temporal === 'undefined') {
      return EMPTY_STATE;
    }
    try {
      return computeRemainingSnapshot(globalThis.Temporal, endDate, endTime, timeZone);
    } catch {
      return EMPTY_STATE;
    }
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;
    let timerId = null;
    let activeTemporal = globalThis.Temporal;

    const tick = () => {
      if (cancelled || !activeTemporal) return;
      try {
        setSnapshot(computeRemainingSnapshot(activeTemporal, endDate, endTime, timeZone));
      } catch {
        // Keep previous safe state if system clock shifts unexpectedly
      }
    };

    const handleVisibilityOrFocus = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        tick();
      }
    };

    const init = async () => {
      if (!activeTemporal) {
        try {
          const mod = await import('temporal-polyfill');
          activeTemporal = mod.Temporal;
          globalThis.Temporal = mod.Temporal;
        } catch {
          return;
        }
      }

      if (cancelled) return;
      tick();
      timerId = window.setInterval(tick, 1000);
      document.addEventListener('visibilitychange', handleVisibilityOrFocus);
      window.addEventListener('focus', handleVisibilityOrFocus);
    };

    init();

    return () => {
      cancelled = true;
      if (timerId !== null) {
        window.clearInterval(timerId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [enabled, endDate, endTime, timeZone]);

  return {
    ...snapshot,
    daysPadded: padUnit(snapshot.days),
    hoursPadded: padUnit(snapshot.hours),
    minutesPadded: padUnit(snapshot.minutes),
    secondsPadded: padUnit(snapshot.seconds),
  };
};
