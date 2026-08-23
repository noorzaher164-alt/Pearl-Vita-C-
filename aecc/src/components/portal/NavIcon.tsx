import {
  Award,
  Brain,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  ChartColumn,
  ClipboardCheck,
  Crown,
  FlaskConical,
  History,
  Images,
  LayoutDashboard,
  Leaf,
  Library,
  Lightbulb,
  ListChecks,
  Medal,
  Megaphone,
  Microscope,
  Network,
  Newspaper,
  PenLine,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  UserCog,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * One icon family, one stroke weight (guide §5 / Do-Not table). Every icon used in
 * navigation, badges and empty states is resolved through this map so no second
 * library or emoji can creep in.
 */
const ICONS: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  users: Users,
  network: Network,
  'calendar-days': CalendarDays,
  'clipboard-check': ClipboardCheck,
  sparkles: Sparkles,
  trophy: Trophy,
  'list-checks': ListChecks,
  'flask-conical': FlaskConical,
  brain: Brain,
  lightbulb: Lightbulb,
  medal: Medal,
  megaphone: Megaphone,
  newspaper: Newspaper,
  images: Images,
  library: Library,
  'scroll-text': ScrollText,
  'chart-column': ChartColumn,
  'user-cog': UserCog,
  'shield-check': ShieldCheck,
  history: History,
  'sliders-horizontal': SlidersHorizontal,
  // badge icons
  microscope: Microscope,
  award: Award,
  leaf: Leaf,
  'calendar-check': CalendarCheck,
  crown: Crown,
  'calendar-range': CalendarRange,
  'pen-line': PenLine,
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}
