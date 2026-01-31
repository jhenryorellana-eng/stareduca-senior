import type { Metadata, Viewport } from 'next';
import { Quicksand } from 'next/font/google';
import './globals.css';

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StarEduca Senior',
  description: 'Recursos educativos para padres de adolescentes',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-72x72.png',
    shortcut: '/icons/icon-72x72.png',
    apple: '/icons/icon-72x72.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StarEduca Senior',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#d70fd7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={quicksand.variable}
    >
      <body className="font-quicksand antialiased">
        {children}
      </body>
    </html>
  );
}
