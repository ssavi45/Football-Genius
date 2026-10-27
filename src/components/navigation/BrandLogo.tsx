import Image from 'next/image';
import logo from '../../../public/branding/logo-assets.json';

export default function BrandLogo({compact=false}:{compact?:boolean}) {
  return <span className={`sidebar-logo ${compact?'is-compact':''}`} role="img" aria-label="FootyGen">
    <Image src={logo.url} width={logo.width} height={logo.height} alt="" className="sidebar-brand-image" unoptimized priority/>
    <Image src={logo.mark.url} width={logo.mark.width} height={logo.mark.height} alt="" className="sidebar-brand-image is-compact" unoptimized priority/>
  </span>;
}
