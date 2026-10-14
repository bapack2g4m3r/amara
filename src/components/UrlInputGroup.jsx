import { useState, useId } from 'react';
import { ExternalLink, Clipboard, Check, X } from 'lucide-react';
import { cleanUrlInput, formatUrl, detectUrlPlatform } from '../utils/urlHelper';
import { useTranslation } from '../store/useLanguageStore';

/**
 * Clean & spacious URL Input component.
 * Actions (Paste, Open, Clear, Badge) are positioned neatly in the header row
 * to prevent any overlapping with placeholder or input text, especially in narrow/2-column layouts.
 */
const UrlInputGroup = ({
  label = 'Link Produk / Toko Online',
  placeholder = 'https://... atau link produk',
  value = '',
  onChange,
  required = false,
  helperText,
  id: customId,
  autoFocus = false
}) => {
  const { language } = useTranslation();
  const generatedId = useId();
  const inputId = customId || generatedId;
  const [pasteNotice, setPasteNotice] = useState(false);

  const platform = detectUrlPlatform(value);
  const hasValue = Boolean(value && value.trim());

  // Handle direct paste via paste event
  const handlePaste = (e) => {
    const text = e.clipboardData?.getData('text');
    if (text) {
      const cleaned = cleanUrlInput(text);
      if (cleaned) {
        e.preventDefault();
        onChange(cleaned);
        if (cleaned !== text.trim()) {
          showPasteNotice();
        }
      }
    }
  };

  // Handle onChange (handles mobile clipboard suggestions, autocomplete, typing)
  const handleChange = (e) => {
    const rawVal = e.target.value;
    // If user pasted a full snippet into input (contains spaces and url indicators)
    if (rawVal.includes(' ') && (rawVal.includes('http') || rawVal.includes('.co') || rawVal.includes('.com') || rawVal.includes('.link'))) {
      const cleaned = cleanUrlInput(rawVal);
      onChange(cleaned);
      if (cleaned !== rawVal.trim()) {
        showPasteNotice();
      }
    } else {
      onChange(rawVal);
    }
  };

  // One-tap paste from clipboard API
  const handleQuickPaste = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const cleaned = cleanUrlInput(text);
          onChange(cleaned);
          showPasteNotice();
        }
      }
    } catch (_err) {
      const el = document.getElementById(inputId);
      if (el) el.focus();
    }
  };

  const showPasteNotice = () => {
    setPasteNotice(true);
    setTimeout(() => setPasteNotice(false), 3000);
  };

  const handleClear = () => {
    onChange('');
    const el = document.getElementById(inputId);
    if (el) el.focus();
  };

  const handleTestLink = (e) => {
    e.preventDefault();
    if (!hasValue) return;
    const target = formatUrl(value);
    if (target && target !== '#') {
      window.open(target, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="url-input-group" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Header / Label Row: Single line, guaranteed identical height */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '20px',
          marginBottom: '6px',
          gap: '6px'
        }}
      >
        <label
          htmlFor={inputId}
          style={{
            margin: 0,
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {label} {required && <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>}
        </label>

        {platform && (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: platform.color,
              background: platform.bgColor,
              padding: '1px 6px',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              flexShrink: 0
            }}
          >
            <Check size={10} strokeWidth={3} />
            <span>{platform.badge}</span>
          </span>
        )}
      </div>

      {/* Input Box: Seamless flex container with suffix action buttons */}
      <div
        className="url-input-box"
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '42px',
          background: 'var(--color-background)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius)',
          padding: '0 6px 0 12px',
          gap: '6px',
          boxSizing: 'border-box',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <input
          id={inputId}
          type="text"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          placeholder={placeholder}
          value={value || ''}
          onChange={handleChange}
          onPaste={handlePaste}
          required={required}
          autoFocus={autoFocus}
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            padding: 0,
            margin: 0,
            fontFamily: 'inherit',
            fontSize: '0.92rem',
            color: 'var(--color-text)'
          }}
        />

        {hasValue ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleTestLink}
              title={language === 'en' ? 'Open link in new tab' : 'Buka link di tab baru'}
              style={{
                background: 'rgba(153, 24, 42, 0.08)',
                border: '1px solid rgba(153, 24, 42, 0.2)',
                color: 'var(--color-primary, #99182A)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{language === 'en' ? 'Open' : 'Buka'}</span>
              <ExternalLink size={11} strokeWidth={2.4} />
            </button>

            <button
              type="button"
              onClick={handleClear}
              title={language === 'en' ? 'Clear link' : 'Hapus link'}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted, #9ca3af)',
                cursor: 'pointer',
                padding: '3px 5px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleQuickPaste}
            title={language === 'en' ? 'Paste link from clipboard' : 'Tempel link langsung dari clipboard'}
            style={{
              background: 'rgba(153, 24, 42, 0.06)',
              border: '1px solid rgba(153, 24, 42, 0.18)',
              color: 'var(--color-primary, #99182A)',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
          >
            <Clipboard size={11} />
            <span>{language === 'en' ? 'Paste' : 'Tempel'}</span>
          </button>
        )}
      </div>

      {/* Helper text or notification */}
      <div style={{ minHeight: '16px', marginTop: '4px', display: 'flex', alignItems: 'center' }}>
        {pasteNotice ? (
          <span
            style={{
              fontSize: '0.74rem',
              color: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}
          >
            <Check size={12} strokeWidth={2.5} />
            Tautan berhasil diekstrak otomatis!
          </span>
        ) : helperText ? (
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted, #94a3b8)', lineHeight: 1.3 }}>
            {helperText}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default UrlInputGroup;
