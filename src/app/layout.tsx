import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { AuthProvider } from '@/lib/context/AuthContext';
import { PoultryProvider } from '@/lib/context/PoultryContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Eggstra OS - Poultry Farm Management System',
  description: 'Production-grade layer flock, egg production, mortality, feed, and financial tracking system in Philippine Peso (PHP).',
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
          <AuthProvider>
            <PoultryProvider>
              <AppShell>{children}</AppShell>
            </PoultryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
