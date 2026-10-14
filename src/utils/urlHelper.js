/**
 * Utility for robust URL extraction, cleaning, and platform detection.
 * Designed specifically for e-commerce (Shopee, Tokopedia, TikTok Shop, Lazada, Blibli)
 * and social media (Instagram, TikTok, YouTube) where users frequently copy share text
 * from mobile apps containing extra captions, brackets, or trailing punctuation.
 */

/**
 * Extracts and cleans a URL from any text input (including mobile app share snippets).
 * Examples:
 * - "Beli Mukena di Shopee https://s.shopee.co.id/8A9bXYZ" -> "https://s.shopee.co.id/8A9bXYZ"
 * - "Lihat (https://tokopedia.link/abc)." -> "https://tokopedia.link/abc"
 * - "s.shopee.co.id/abc" -> "https://s.shopee.co.id/abc"
 * - "instagram.com/myvendor" -> "https://instagram.com/myvendor"
 */
export const cleanUrlInput = (val) => {
  if (!val) return '';
  const str = String(val).trim();

  // 1. Check for standard http:// or https:// link within text
  const httpMatch = str.match(/https?:\/\/[^\s]+/i);
  if (httpMatch) {
    let url = httpMatch[0];
    // Strip trailing punctuation often appended by chat / share text (!, ., ,, ), ], >, ", ')
    url = url.replace(/[!.,;:?\)\]>"\']+$/g, '');
    return url;
  }

  // 2. Check for domain-style link with path (e.g. s.shopee.co.id/..., tokopedia.link/..., instagram.com/...)
  const domainMatch = str.match(/(?:[a-zA-Z0-9-]+\.)+(?:com|id|co\.id|link|me|ee|app|shop|site|net|org|co)\/[^\s]*/i);
  if (domainMatch) {
    let url = domainMatch[0].replace(/[!.,;:?\)\]>"\']+$/g, '');
    return `https://${url}`;
  }

  // 3. Simple domain without path (e.g. "amarawedding.id", "tokopedia.com")
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?$/.test(str)) {
    return `https://${str}`;
  }

  return str;
};

/**
 * Formats a URL for safe use in <a href="...">
 */
export const formatUrl = (url) => {
  if (!url) return '#';
  const cleaned = cleanUrlInput(url);
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `https://${cleaned}`;
};

/**
 * Detects known platform from URL for UX badges and visual cues
 */
export const detectUrlPlatform = (url) => {
  if (!url) return null;
  const lower = String(url).toLowerCase();
  if (lower.includes('shopee') || lower.includes('shp.ee')) {
    return { name: 'Shopee', badge: 'Shopee', color: '#EE4D2D', bgColor: 'rgba(238, 77, 45, 0.1)' };
  }
  if (lower.includes('tokopedia') || lower.includes('tokopedia.link')) {
    return { name: 'Tokopedia', badge: 'Tokopedia', color: '#03AC0E', bgColor: 'rgba(3, 172, 14, 0.1)' };
  }
  if (lower.includes('tiktok') || lower.includes('vt.tiktok.com')) {
    return { name: 'TikTok', badge: 'TikTok Shop / Medsos', color: '#000000', bgColor: 'rgba(0, 0, 0, 0.08)' };
  }
  if (lower.includes('instagram') || lower.includes('ig.me') || lower.includes('instagr.am')) {
    return { name: 'Instagram', badge: 'Instagram', color: '#E1306C', bgColor: 'rgba(225, 48, 108, 0.1)' };
  }
  if (lower.includes('lazada') || lower.includes('lazada.co.id')) {
    return { name: 'Lazada', badge: 'Lazada', color: '#0F146D', bgColor: 'rgba(15, 20, 109, 0.1)' };
  }
  if (lower.includes('blibli') || lower.includes('blibli.com')) {
    return { name: 'Blibli', badge: 'Blibli', color: '#0095DC', bgColor: 'rgba(0, 149, 220, 0.1)' };
  }
  if (lower.includes('youtube') || lower.includes('youtu.be')) {
    return { name: 'YouTube', badge: 'YouTube', color: '#FF0000', bgColor: 'rgba(255, 0, 0, 0.1)' };
  }
  if (lower.includes('wa.me') || lower.includes('whatsapp.com')) {
    return { name: 'WhatsApp', badge: 'WhatsApp', color: '#25D366', bgColor: 'rgba(37, 211, 102, 0.1)' };
  }
  return null;
};
