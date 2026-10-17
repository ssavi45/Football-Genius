import type { Metadata } from 'next';
import { Outfit, Orbitron, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import AppShell from '@/components/layout/AppShell';
import faviconAssets from '../../public/branding/favicon-assets.json';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://footygen.online'),
  title: 'FootyGen Arena — The Ultimate Football IQ Arena',
  description: 'Test your football encyclopedic knowledge across 8 gamified modes: Scoreline Hero, Scout\'s Duel, Football Matrix, The Journeyman, and more.',
  icons: {
    icon: faviconAssets.icon.map(({ url, type, sizes }) => ({ url: `${url}?v=${faviconAssets.version}`, type, sizes })),
    apple: { url: `${faviconAssets.apple.url}?v=${faviconAssets.version}`, type: faviconAssets.apple.type, sizes: faviconAssets.apple.sizes },
  },
  openGraph: {
    title: 'FootyGen Arena — The Ultimate Football IQ Arena',
    description: 'Test your football encyclopedic knowledge across 8 gamified modes.',
    url: 'https://footygen.online',
    siteName: 'FootyGen Arena',
    images: [
      {
        url: '/stadium_bg.jpg',
        width: 1200,
        height: 630,
        alt: 'FootyGen Arena',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${orbitron.variable} ${bebas.variable}`}>
      <body suppressHydrationWarning className="bg-[#F1F6FD] text-slate-900 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}

