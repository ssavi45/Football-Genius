import HigherLowerGame from '@/components/dashboard/HigherLowerGame';
import { getHigherLowerSnapshot } from '@/lib/higher-lower/snapshot-store';
import './higher-lower.css';

export const dynamic = 'force-dynamic';

export default async function HigherLowerPage() {
  return <HigherLowerGame snapshot={await getHigherLowerSnapshot()} />;
}
