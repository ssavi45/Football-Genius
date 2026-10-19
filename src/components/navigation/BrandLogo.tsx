import Image from 'next/image';
import fullLogo from '../../../public/branding/football-genius-logo.webp';
import compactLogo from '../../../public/branding/football-genius-mark.webp';

export default function BrandLogo({compact=false}:{compact?:boolean}) {
  return <Image src={compact?compactLogo:fullLogo} alt="Football Genius" className={`sidebar-brand-image ${compact?'is-compact':''}`} sizes={compact?'44px':'176px'} priority/>;
}
