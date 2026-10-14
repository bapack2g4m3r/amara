import { useState, useId } from 'react';
import { ExternalLink, Clipboard, Check, X } from 'lucide-react';
import { cleanUrlInput, formatUrl, detectUrlPlatform } from '../utils/urlHelper';

/**
 * Clean & spacious URL Input component.
 * Actions (Paste, Test, Clear, Badge) are positioned neatly in the header row
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
    <div className="url-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {/* Header Row: Label on left, Actions & Badges on right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', minHeight: '24px' }}>
        <label htmlFor={inputId} className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem' }}>
          {label} {required && <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>}
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {platform && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: platform.color,
                background: platform.bgColor,
                padding: '2px 7px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <Check size={11} strokeWidth={3} />
              <span>{platform.badge}</span>
            </span>
          )}

          {hasValue ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={handleTestLink}
                title="Buka dan tes link di tab baru"
                style={{
                  background: 'rgba(153, 24, 42, 0.08)',
                  border: '1px solid rgba(153, 24, 42, 0.2)',
                  color: 'var(--color-primary, #99182A)',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>Tes Link</span>
                <ExternalLink size={11} strokeWidth={2.4} />
              </button>

              <button
                type="button"
                onClick={handleClear}
                title="Hapus / Kosongkan link"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted, #9ca3af)',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '0.74rem',
                  fontWeight: 500
                }}
              >
                <X size={13} />
                <span>Hapus</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickPaste}
              title="Tempel link langsung dari clipboard"
              style={{
                background: 'rgba(153, 24, 42, 0.06)',
                border: '1px solid rgba(153, 24, 42, 0.2)',
                color: 'var(--color-primary, #99182A)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
            >
              <Clipboard size={12} />
              <span>Tempel Link</span>
            </button>
          )}
        </div>
      </div>

      {/* Input Field: Clean, Uncluttered, 100% Full Width */}
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
        className="form-input"
        style={{
          width: '100%',
          padding: '10px 14px',
          fontFamily: 'inherit',
          boxSizing: 'border-box'
        }}
      />

      {/* Helper text or notification */}
      {pasteNotice && (
        <span
          style={{
            fontSize: '0.75rem',
            color: '#059669',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600
          }}
        >
          <Check size={12} strokeWidth={2.5} />
          Tautan e-commerce berhasil diekstrak otomatis!
        </span>
      )}

      {helperText && !pasteNotice && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #94a3b8)', lineHeight: 1.35 }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default UrlInputGroup;
