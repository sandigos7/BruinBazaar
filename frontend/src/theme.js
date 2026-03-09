/**
 * BruinBazaar design tokens
 * Single source of truth for colors, spacing, typography, and shadows.
 * Import from any component: import { colors, text, shadow } from '../theme';
 */

export const colors = {
  // Brand
  uclaBlue:      '#2774AE',
  uclaGold:      '#FFD100',

  // Neutrals
  white:         '#FFFFFF',
  bgPage:        '#F3F4F6',
  bgCard:        '#F8FAFC',
  bgMuted:       '#F1F5F9',
  border:        '#F1F5F9',

  // Text
  textPrimary:   '#0F172A',
  textSecondary: '#475569',
  textMuted:     '#94A3B8',
  textBlue:      '#2774AE',

  // Semantic
  green:         '#22C55E',
  red:           '#EF4444',
  redLight:      '#FEE2E2',
  greenLight:    '#DCFCE7',
  greenDark:     '#16A34A',
  amber:         '#D97706',
  amberLight:    '#FEF3C7',
};

export const font = {
  brand:  'Jomhuria, serif',
  body:   'Inter, sans-serif',
};

export const shadow = {
  card:  '0 1px 4px rgba(0,0,0,0.25)',
  panel: '0 25px 50px -12px rgba(0,0,0,0.25)',
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  pill: 9999,
  full: '50%',
};

// Pre-built style objects reused across multiple pages
export const iconBtnStyle = {
  background: 'none',
  border:     'none',
  cursor:     'pointer',
  padding:    0,
  display:    'flex',
  alignItems: 'center',
};

export const topBarStyle = {
  background: colors.uclaBlue,
  padding:    '8px 16px 16px',
};

export const statusBarStyle = {
  height:     44,
  background: colors.uclaBlue,
};