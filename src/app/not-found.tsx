import Link from 'next/link';
import { ArrowRight, Home } from 'lucide-react';
import '@/components/support/support.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page not found | FootyGen', description: 'This FootyGen page could not be found. Explore our football quizzes or return to the homepage.', robots: { index: false, follow: true }, alternates: { canonical: null } };

export default function NotFound() {
  return <section className="not-found-page" aria-labelledby="not-found-title"><div className="not-found-score" aria-label="Error 404"><span>4</span><span>0</span><span>4</span></div><h1 id="not-found-title">That page is offside.</h1><p>We couldn’t find this page. Head back to the pitch and pick your next football challenge.</p><div className="not-found-actions"><Link href="/"><Home size={17} />Back to home</Link><Link href="/game-modes">Explore game modes<ArrowRight size={17} /></Link></div><Link href="/contact" className="not-found-help">Found a broken link? Let us know.</Link></section>;
}
