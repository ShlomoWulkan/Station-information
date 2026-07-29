export const colors = {
  bg: '#00050f',
  bgGlow: '#001a4a',
  card: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.08)',
  text: '#e8f0ff',
  textSub: 'rgba(180,210,255,0.38)',
  textMuted: 'rgba(255,255,255,0.3)',
  accent: '#60a5fa',
  accentBorder: 'rgba(60,130,255,0.35)',
  accentBg: 'rgba(0,70,180,0.2)',
  /** טקסט על גבי accent. היה צרוב כ-'#000d28' בכשמונה מקומות. */
  onAccent: '#000d28',
  liveDot: '#4ade80',
  /** שגיאות. היה צרוב כ-'#f87171' בחמישה מקומות. */
  error: '#f87171',
  errorBg: 'rgba(248,113,113,0.1)',
  errorBorder: 'rgba(248,113,113,0.35)',
  /** אזהרות ומצב לא-טרי. */
  warning: '#fbbf24',
  warningBg: 'rgba(251,191,36,0.12)',
  warningBorder: 'rgba(251,191,36,0.4)',
  /** משטח מורם מעל הרקע — מודלים ופאנלים. */
  surfaceRaised: '#001230',
  badge: '#93c5fd',
  badgeBg: 'rgba(30,80,200,0.3)',
  badgeBorder: 'rgba(60,130,255,0.4)',
  tabBar: 'rgba(0,20,60,0.95)',
  tabBarBorder: 'rgba(60,130,255,0.12)',
  tabActive: '#60a5fa',
  tabInactive: 'rgba(255,255,255,0.25)',
  divider: 'rgba(60,130,255,0.3)',
};

export const neonColors = {
  blue: '#3b82f6',
  cyan: '#22d3ee',
  yellow: '#facc15',
  lightBlue: '#60a5fa',
  green: '#34d399',
};

export const iconGradients = {
  location: ['#1d4ed8', '#1e40af'] as const,
  recent:   ['#0e7490', '#0c4a6e'] as const,
  star:     ['#b45309', '#92400e'] as const,
  number:   ['#1e40af', '#1e3a8a'] as const,
  map:      ['#047857', '#065f46'] as const,
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 22, full: 999,
};
