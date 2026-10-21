import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import './support.css';

export default function InfoPage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <div className="info-page"><Link className="info-back" href="/game-modes"><ArrowLeft size={16} />Back to the games</Link><header className="info-hero"><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>{children}</div>;
}
