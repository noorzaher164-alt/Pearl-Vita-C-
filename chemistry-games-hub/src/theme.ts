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

// Clean white + joyful colorful palette
const light: ThemeColors = {
  appBg: '#f5f7ff',
  sidebarBg: '#ffffff',
  sidebarBorder: '#e8eaf6',
  cardBg: '#ffffff',
  cardBorder: '#e8eaf6',
  text: '#1a1a2e',
  textMuted: '#6b7280',
  textFaint: '#9ca3af',
  inputBg: '#f9fafb',
  inputBorder: '#d1d5db',
  modalBg: '#ffffff',
  rowHover: '#f5f7ff',
  divider: '#f0f0f0',
  accent: '#6366f1',
  accentText: '#ffffff',
  accentLight: '#eef2ff',
  badge: '#f3f4f6',
  shadow: '0 2px 16px rgba(0,0,0,0.07)',
  danger: '#fee2e2',
  dangerText: '#dc2626',
  success: '#dcfce7',
  successText: '#16a34a',
  warning: '#fef9c3',
  warningText: '#ca8a04',
  headerBg: '#ffffff',
};

export const themes: Record<Theme, ThemeColors> = { dark, light };
export function getTheme(t: Theme): ThemeColors { return themes[t]; }
export const THEME_KEY = 'cgh_theme';
