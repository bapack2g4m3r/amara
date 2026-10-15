import React, { useState, useEffect } from 'react';
import { Megaphone, AlertTriangle, CheckCircle, Info, X, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../styles/ReadOnlyBanner.css';

export default function GlobalAnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAnnouncement = async () => {
      try {
        const { data, error } = await supabase
          .from('system_announcements')
          .select('*')
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          // Table might not exist yet if migration not run, silently ignore
          return;
        }

        if (isMounted && data) {
          const dismissedId = sessionStorage.getItem(`amara_announcement_${data.id}`);
          if (!dismissedId) {
            setAnnouncement(data);
          }
        }
      } catch (_e) {
        // ignore
      }
    };

    fetchAnnouncement();

    // Listen to real-time changes
    const channel = supabase
      .channel('public:system_announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_announcements' },
        () => {
          fetchAnnouncement();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  if (!announcement || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (announcement.id) {
      sessionStorage.setItem(`amara_announcement_${announcement.id}`, 'true');
    }
  };

  const getStyleAndIcon = () => {
    switch (announcement.type) {
      case 'urgent':
        return {
          bg: '#dc2626',
          icon: <AlertTriangle size={16} color="#ffffff" />,
          color: '#ffffff'
        };
      case 'warning':
        return {
          bg: '#f59e0b',
          icon: <AlertTriangle size={16} color="#ffffff" />,
          color: '#ffffff'
        };
      case 'success':
        return {
          bg: '#10b981',
          icon: <CheckCircle size={16} color="#ffffff" />,
          color: '#ffffff'
        };
      default:
        return {
          bg: 'var(--color-primary, #99182a)',
          icon: <Megaphone size={16} color="#ffffff" />,
          color: '#ffffff'
        };
    }
  };

  const bannerTheme = getStyleAndIcon();

  return (
    <div 
      style={{
        background: bannerTheme.bg,
        color: bannerTheme.color,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        fontSize: '0.86rem',
        fontWeight: 500,
        position: 'relative',
        zIndex: 40,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
        {bannerTheme.icon}
        <span>{announcement.message}</span>
        {announcement.link_url && (
          <a
            href={announcement.link_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#ffffff',
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
              marginLeft: '4px'
            }}
          >
            <span>{announcement.link_text || 'Lihat Selengkapnya'}</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      <button
        onClick={handleDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.85
        }}
        title="Tutup pengumuman"
      >
        <X size={16} />
      </button>
    </div>
  );
}
