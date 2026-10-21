import type { Metadata } from 'next';
import { pageMetadata, SITE_URL } from '@/lib/seo/metadata';
import { Outfit, Orbitron, Bebas_Neue } from 'next/font/google';
import './globals.css';
import './image-assets.css';
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
  ...pageMetadata('/'),
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: faviconAssets.icon.map(({ url, type, sizes }) => ({ url: `${url}?v=${faviconAssets.version}`, type, sizes })),
    apple: { url: `${faviconAssets.apple.url}?v=${faviconAssets.version}`, type: faviconAssets.apple.type, sizes: faviconAssets.apple.sizes },
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

