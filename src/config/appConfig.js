/**
 * Global Application Configuration & Feature Flags
 */
export const LYNK_PURCHASE_URL = 'https://lynk.id/rumahramai/5r8ww0x568z8';

// Toggle this flag to `false` after Promo 11.11 ends (after 11 November 2026)
// to seamlessly revert all landing & signup prices back to Rp119.000,-.
const IS_PROMO_11_11 = true;

export const PRICING_CONFIG = {
  IS_PROMO_ACTIVE: IS_PROMO_11_11,
  PROMO_TITLE: 'Promo 11.11',
  PROMO_PERIOD: '9–11 November 2026',
  PROMO_SHORT_PERIOD: '9–11 Nov 2026',
  ORIGINAL_PRICE: 'Rp499.000',
  CURRENT_PRICE: IS_PROMO_11_11 ? 'Rp99.000,-' : 'Rp119.000,-',
  CURRENT_PRICE_SHORT: IS_PROMO_11_11 ? 'Rp99.000' : 'Rp119.000',
  CURRENT_PRICE_SPACED: IS_PROMO_11_11 ? 'Rp 99.000,-' : 'Rp 119.000,-',
  CURRENT_PRICE_NUMERIC: IS_PROMO_11_11 ? 99000 : 119000,
  DISCOUNT_PERCENT: IS_PROMO_11_11 ? 80 : 76,
};

export const APP_CONFIG = {
  // Set to `true` when team approval is obtained to re-enable the Landing Page.
  // Set to `false` to temporarily hide/disable the Landing Page (redirects unauthenticated users directly to /login).
  ENABLE_LANDING_PAGE: true,
  LYNK_PURCHASE_URL,
  PRICING_CONFIG,
};
