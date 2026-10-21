import Link from 'next/link';
import './SiteFooter.css';

export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="site-footer-main"><p>© {new Date().getUTCFullYear()} <Link href="/">Football Genius</Link></p><nav aria-label="Support and legal"><Link href="/privacy">Privacy policy</Link><Link href="/licences">Licences & credits</Link><Link href="/contact">Contact us</Link></nav></div>
  </footer>;
}
