import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { AuthProvider } from '@/lib/context/AuthContext';
import { PoultryProvider } from '@/lib/context/PoultryContext';
import { ToastProvider } from '@/components/common/ToastContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Eggstra OS | Commercial Poultry Management',
  description: 'Cloud-based layer farm operational tracking, egg production logs, and financial management system.',
  applicationName: 'Eggstra OS',
  authors: [{ name: 'Eggstra Systems' }],
  generator: 'Next.js',
  keywords: ['poultry management', 'layer farm tracker', 'egg production', 'poultry farm software', 'FCR calculator'],
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: 'Eggstra OS',
    description: 'Commercial Layer Poultry Management System',
    type: 'website',
    siteName: 'Eggstra OS',
    locale: 'en_PH',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#059669' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased min-h-screen">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <PoultryProvider>
                <AppShell>{children}</AppShell>
              </PoultryProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
