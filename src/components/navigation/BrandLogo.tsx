import Image from 'next/image';

export default function BrandLogo({compact=false}:{compact?:boolean}) {
  return <span className={`sidebar-logo ${compact?'is-compact':''}`} role="img" aria-label="Football Genius">
    <Image src="/branding/football-genius-logo.webp" width={640} height={196} alt="" className="sidebar-brand-image" sizes="147px" priority/>
    <Image src="/branding/football-genius-mark.webp" width={256} height={214} alt="" className="sidebar-brand-image is-compact" sizes="54px" priority/>
  </span>;
}
