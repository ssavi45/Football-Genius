import type { ReactNode } from 'react';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata('/game-modes');

export default function Layout({ children }: { children: ReactNode }) { return children; }
