/**
 * Global Application Configuration & Feature Flags
 */
export const LYNK_PURCHASE_URL = 'https://lynk.id/rumahramai/5r8ww0x568z8';

// Target end of Promo 11.11: 11 November 2026, 23:59:59 WIB (Asia/Jakarta, UTC+7)
export const PROMO_END_TIMESTAMP = new Date('2026-11-11T23:59:59+07:00').getTime();

export const isPromoActiveNow = () => {
  try {
    return Date.now() <= PROMO_END_TIMESTAMP;
  } catch {
    return false;
  }
};

export const PRICING_CONFIG = {
  get IS_PROMO_ACTIVE() {
    return isPromoActiveNow();
  },
  PROMO_TITLE: 'Promo 11.11',
  PROMO_PERIOD: '9–11 November 2026',
  PROMO_SHORT_PERIOD: '9–11 Nov 2026',
  PROMO_END_DATE: '2026-11-11',
  PROMO_END_TIME: '23:59:59',
  PROMO_TIMEZONE: 'Asia/Jakarta',
  ORIGINAL_PRICE: 'Rp499.000',
  NORMAL_PRICE: 'Rp119.000,-',
  NORMAL_PRICE_SHORT: 'Rp119.000',
  NORMAL_PRICE_SPACED: 'Rp 119.000,-',
  NORMAL_PRICE_NUMERIC: 119000,
  PROMO_PRICE: 'Rp99.000,-',
  PROMO_PRICE_SHORT: 'Rp99.000',
  PROMO_PRICE_SPACED: 'Rp 99.000,-',
  PROMO_PRICE_NUMERIC: 99000,
  get CURRENT_PRICE() {
    return this.IS_PROMO_ACTIVE ? this.PROMO_PRICE : this.NORMAL_PRICE;
  },
  get CURRENT_PRICE_SHORT() {
    return this.IS_PROMO_ACTIVE ? this.PROMO_PRICE_SHORT : this.NORMAL_PRICE_SHORT;
  },
  get CURRENT_PRICE_SPACED() {
    return this.IS_PROMO_ACTIVE ? this.PROMO_PRICE_SPACED : this.NORMAL_PRICE_SPACED;
  },
  get CURRENT_PRICE_NUMERIC() {
    return this.IS_PROMO_ACTIVE ? this.PROMO_PRICE_NUMERIC : this.NORMAL_PRICE_NUMERIC;
  },
  get DISCOUNT_PERCENT() {
    return this.IS_PROMO_ACTIVE ? 80 : 76;
  },
};

export const APP_CONFIG = {
  // Set to `true` when team approval is obtained to re-enable the Landing Page.
  // Set to `false` to temporarily hide/disable the Landing Page (redirects unauthenticated users directly to /login).
  ENABLE_LANDING_PAGE: true,
  LYNK_PURCHASE_URL,
  PRICING_CONFIG,
};
