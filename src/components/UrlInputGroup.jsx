import { useState, useId } from 'react';
import { ExternalLink, Clipboard, Check, X, Link2 } from 'lucide-react';
import { cleanUrlInput, formatUrl, detectUrlPlatform } from '../utils/urlHelper';

/**
 * Enhanced URL Input component with auto-clean for ecommerce share text,
 * one-tap paste, link test button, and platform badge indicators.
 */
const UrlInputGroup = ({
  label = 'Link Produk / Toko Online',
  placeholder = 'https://... (link produk / toko online)',
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

  // Handle direct paste via event
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
    // If user pasted a full snippet into input (contains spaces and http)
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

  // On-tap paste from clipboard API
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
      // If browser denies permission, user can still paste via input
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
    <div className="url-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label htmlFor={inputId} className="form-label" style={{ margin: 0 }}>
            {label} {required && <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>}
          </label>
          {platform && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: platform.color,
                background: platform.bgColor,
                padding: '2px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Check size={11} strokeWidth={3} />
              {platform.badge}
            </span>
          )}
        </div>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
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
            paddingRight: hasValue ? '78px' : '82px',
            fontFamily: 'inherit'
          }}
        />

        {/* Action buttons inside the right end of the input */}
        <div
          style={{
            position: 'absolute',
            right: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 2
          }}
        >
          {hasValue ? (
            <>
              <button
                type="button"
                onClick={handleTestLink}
                title="Buka dan tes link di tab baru"
                style={{
                  background: 'rgba(153, 24, 42, 0.08)',
                  border: '1px solid rgba(153, 24, 42, 0.2)',
                  color: 'var(--color-primary, #99182A)',
                  padding: '4px 7px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <span>Tes</span>
                <ExternalLink size={12} strokeWidth={2.2} />
              </button>

              <button
                type="button"
                onClick={handleClear}
                title="Hapus link"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted, #9ca3af)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
              >
                <X size={15} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleQuickPaste}
              title="Tempel link dari clipboard"
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--color-border, #e2e8f0)',
                color: 'var(--color-text, #374151)',
                padding: '4px 8px',
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
              <span>Tempel</span>
            </button>
          )}
        </div>
      </div>

      {pasteNotice && (
        <span
          style={{
            fontSize: '0.75rem',
            color: '#059669',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 500
          }}
        >
          <Check size={12} strokeWidth={2.5} />
          Tautan berhasil diekstrak otomatis dari teks e-commerce!
        </span>
      )}

      {helperText && !pasteNotice && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #94a3b8)', lineHeight: 1.3 }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default UrlInputGroup;
