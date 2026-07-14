export type Theme = 'dark' | 'light';

export interface ThemeColors {
  appBg: string;
  sidebarBg: string;
  sidebarBorder: string;
  cardBg: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  textFaint: string;
  inputBg: string;
  inputBorder: string;
  modalBg: string;
  rowHover: string;
  divider: string;
  accent: string;
  accentText: string;
  accentLight: string;
  badge: string;
  shadow: string;
  danger: string;
  dangerText: string;
  success: string;
  successText: string;
  warning: string;
  warningText: string;
  headerBg: string;
}

const dark: ThemeColors = {
  appBg: 'linear-gradient(135deg, #0f0a1e 0%, #1a0933 50%, #0d1f3c 100%)',
  sidebarBg: '#0d0820',
  sidebarBorder: 'rgba(192,132,252,0.15)',
  cardBg: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.1)',
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.45)',
  textFaint: 'rgba(255,255,255,0.2)',
  inputBg: 'rgba(255,255,255,0.08)',
  inputBorder: 'rgba(192,132,252,0.35)',
  modalBg: '#140a28',
  rowHover: 'rgba(255,255,255,0.04)',
  divider: 'rgba(255,255,255,0.07)',
  accent: '#c084fc',
  accentText: '#ffffff',
  accentLight: 'rgba(192,132,252,0.15)',
  badge: 'rgba(255,255,255,0.06)',
  shadow: '0 8px 32px rgba(0,0,0,0.4)',
  danger: 'rgba(239,68,68,0.15)',
  dangerText: '#fca5a5',
  success: 'rgba(34,197,94,0.15)',
  successText: '#6ee7b7',
  warning: 'rgba(251,191,36,0.15)',
  warningText: '#fbbf24',
  headerBg: 'rgba(0,0,0,0.3)',
};

const light: ThemeColors = {
  appBg: '#f3f0ff',
  sidebarBg: '#ffffff',
  sidebarBorder: 'rgba(124,58,237,0.12)',
  cardBg: '#ffffff',
  cardBorder: 'rgba(124,58,237,0.1)',
  text: '#1e1340',
  textMuted: 'rgba(60,40,120,0.6)',
  textFaint: 'rgba(60,40,120,0.35)',
  inputBg: '#faf8ff',
  inputBorder: 'rgba(124,58,237,0.3)',
  modalBg: '#ffffff',
  rowHover: 'rgba(124,58,237,0.04)',
  divider: 'rgba(124,58,237,0.08)',
  accent: '#7c3aed',
  accentText: '#ffffff',
  accentLight: 'rgba(124,58,237,0.1)',
  badge: 'rgba(124,58,237,0.07)',
  shadow: '0 4px 24px rgba(124,58,237,0.1)',
  danger: 'rgba(239,68,68,0.08)',
  dangerText: '#dc2626',
  success: 'rgba(34,197,94,0.1)',
  successText: '#16a34a',
  warning: 'rgba(245,158,11,0.1)',
  warningText: '#d97706',
  headerBg: '#ffffff',
};

export const themes: Record<Theme, ThemeColors> = { dark, light };
export function getTheme(t: Theme): ThemeColors { return themes[t]; }
export const THEME_KEY = 'cgh_theme';
