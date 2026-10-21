import { pageMetadata } from '@/lib/seo/metadata';
import ScoutsDuelGame from '@/components/scouts-duel/ScoutsDuelGame';
import './scouts-duel.css';
import './feedback.css';
export const metadata = pageMetadata('/games/scouts-duel');

export default function ScoutsDuelPage(){return <ScoutsDuelGame/>;}
