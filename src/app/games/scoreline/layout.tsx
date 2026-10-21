import type { ReactNode } from 'react';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata('/games/scoreline');

export default function Layout({ children }: { children: ReactNode }) { return children; }
