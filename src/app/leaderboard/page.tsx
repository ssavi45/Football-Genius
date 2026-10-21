import { pageMetadata } from '@/lib/seo/metadata';
import LeaderboardPage from '@/components/account/LeaderboardPage';
import { Suspense } from 'react';
import { Caveat } from 'next/font/google';

const note = Caveat({ subsets: ['latin'], variable: '--font-leaderboard-note', display: 'swap' });

export const metadata = pageMetadata('/leaderboard');

export default function Page() {
  return <div className={note.variable}><Suspense fallback={<p role="status">Loading rankings...</p>}><LeaderboardPage /></Suspense></div>;
}
