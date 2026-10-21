import type { MetadataRoute } from 'next';
import { SEO_PAGES, SITE_URL } from '@/lib/seo/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  return SEO_PAGES.filter(page => page.index).map(page => ({
    url: `${SITE_URL}${page.path === '/' ? '' : page.path}`,
    lastModified: '2026-10-21',
  }));
}
