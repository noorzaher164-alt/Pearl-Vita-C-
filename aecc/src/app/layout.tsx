import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Manrope, Noto_Naskh_Arabic, Tajawal } from 'next/font/google';
import { LOCALE_META } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n/server';
import '@/styles/globals.css';

/**
 * Typography exactly as specified in the brand guide §3:
 *   Display  — Bodoni Moda (EN) / Noto Naskh Arabic (AR)
 *   UI/Body  — Manrope (EN)     / Tajawal (AR)
 * Each is self-hosted through next/font with the guide's fallbacks attached.
 */

const display = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

const ui = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-ui',
  display: 'swap',
  fallback: ['Arial', 'system-ui', 'sans-serif'],
});

const displayAr = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display-ar',
  display: 'swap',
  fallback: ['serif'],
});

const uiAr = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-ui-ar',
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aecc.aleman.edu'),
  title: {
    default: 'AECC — Al Eman Chemistry Club',
    template: '%s · AECC',
  },
  description:
    'Al Eman Chemistry Club — the club management platform and electronic science magazine of Al Eman Secondary School. Explore. React. Discover.',
  applicationName: 'AECC',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'AECC — Al Eman Chemistry Club',
    description: 'Explore. React. Discover.',
    siteName: 'AECC',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#FBEAE6',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const meta = LOCALE_META[locale];

  return (
    <html
      lang={meta.htmlLang}
      dir={meta.dir}
      className={`${display.variable} ${ui.variable} ${displayAr.variable} ${uiAr.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-dvh bg-ivory text-ink antialiased">{children}</body>
    </html>
  );
}
