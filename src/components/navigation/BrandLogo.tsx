import Image from 'next/image';
import fullLogo from '../../../public/branding/football-genius-logo.webp';
import compactLogo from '../../../public/branding/football-genius-mark.webp';

export default function BrandLogo({compact=false}:{compact?:boolean}) {
  return <span className={`sidebar-logo ${compact?'is-compact':''}`} role="img" aria-label="Football Genius">
    <Image src={fullLogo} alt="" className="sidebar-brand-image" sizes="147px" priority/>
    <Image src={compactLogo} alt="" className="sidebar-brand-image is-compact" sizes="54px" priority/>
  </span>;
}
