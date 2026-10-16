import type { SVGProps } from 'react';

export function CoinStack(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M6 17v6c0 2.2 4.2 4 9.5 4s9.5-1.8 9.5-4v-6M6 20c0 2.2 4.2 4 9.5 4s9.5-1.8 9.5-4" />
    <ellipse cx="15.5" cy="17" rx="9.5" ry="4" />
    <path d="M9 10v5c0 2.2 4.2 4 9.5 4S28 17.2 28 15v-5M9 12c0 2.2 4.2 4 9.5 4S28 14.2 28 12" />
    <ellipse cx="18.5" cy="9" rx="9.5" ry="4" />
  </svg>;
}

export function FootballIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="16" cy="16" r="12" />
    <path d="m16 10 5.7 4.1-2.2 6.7h-7l-2.2-6.7Z" fill="currentColor" />
    <path d="m16 10 0-6M21.7 14.1l5.8-2M19.5 20.8l3.5 5M12.5 20.8l-3.5 5M10.3 14.1l-5.8-2M11 5l5 2 5-2M5 19l3-4-3-4M27 11l-3 4 3 4M12 27l-1-5-5-1M26 21l-5 1-1 5" />
  </svg>;
}
