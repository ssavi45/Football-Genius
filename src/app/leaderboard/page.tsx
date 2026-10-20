import LeaderboardPage from '@/components/account/LeaderboardPage';
import { Suspense } from 'react';

export default function Page() {
  return <Suspense fallback={<p role="status">Loading rankings...</p>}><LeaderboardPage /></Suspense>;
}
