import { pageMetadata } from '@/lib/seo/metadata';
import DecoyGame from '@/components/decoy/DecoyGame';

export const metadata = pageMetadata('/games/the-decoy');

export default function TheDecoyPage() { return <DecoyGame />; }
