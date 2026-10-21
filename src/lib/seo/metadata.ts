import type { Metadata } from 'next';
import pages from '@/data/page-seo.json';

export const SITE_URL = 'https://www.footygen.online';
export const SITE_NAME = 'Football Genius';
export const CONTACT_EMAIL = 'football.genius.site@gmail.com';
export const SEO_PAGES = pages;

export function pageMetadata(path: string): Metadata {
  const page = pages.find(item => item.path === path);
  if (!page) throw new Error(`Missing page metadata: ${path}`);
  const title = path === '/' ? page.title : `${page.title} | ${SITE_NAME}`;
  const image = { url: `${SITE_URL}/social/${page.slug}.jpg`, width: 1200, height: 630, alt: `${SITE_NAME}: ${page.tagline}` };
  return {
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: `${SITE_URL}${path === '/' ? '' : path}` },
    robots: { index: page.index, follow: true, googleBot: { index: page.index, follow: true, 'max-image-preview': 'large' } },
    openGraph: { type: 'website', locale: 'en_US', siteName: SITE_NAME, title, description: page.description, url: `${SITE_URL}${path === '/' ? '' : path}`, images: [image] },
    twitter: { card: 'summary_large_image', title, description: page.description, images: [image] },
  };
}
