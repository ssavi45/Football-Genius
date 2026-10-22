import Image from 'next/image';
import './app-download.css';
import { ArrowUpRight, Check, Wifi, Zap } from 'lucide-react';

const APP_URL = 'https://footygen.online';

function StoreIcon({ apple }: { apple?: boolean }) {
  return apple ? (
    <svg viewBox="0 0 24 28" fill="currentColor" aria-hidden="true"><path d="M18.9 14.8c0-3 2.5-4.5 2.6-4.6-1.4-2-3.6-2.3-4.4-2.3-1.9-.2-3.7 1.1-4.7 1.1S9.9 7.9 8.3 8C6.2 8 4.2 9.2 3.1 11c-2.2 3.8-.6 9.5 1.5 12.6 1 1.5 2.2 3.1 3.9 3 1.6-.1 2.2-1 4.2-1s2.5 1 4.2 1c1.8 0 2.9-1.5 3.9-3 .7-1.1 1.3-2.3 1.7-3.5-.1 0-3.6-1.4-3.6-5.3ZM15.7 5.8C16.6 4.7 17.2 3.2 17 1.7c-1.3.1-2.9.9-3.9 2-.9 1-1.7 2.6-1.5 4 1.5.1 3-.7 4.1-1.9Z" /></svg>
  ) : (
    <svg viewBox="0 0 28 30" aria-hidden="true"><path d="M2 2 17 15 2 28Z" fill="#4bc6ff"/><path d="m2 2 18 10-3 3Z" fill="#5de4a0"/><path d="m2 28 15-13 3 3Z" fill="#ff687f"/><path d="m17 15 3-3 6 3-6 3Z" fill="#ffda65"/></svg>
  );
}

export default function AppDownloadSection() {
  return (
    <section className="app-download landing-container" aria-labelledby="app-download-title">
      <div className="app-promo">
        <picture className="app-promo-backdrop" aria-hidden="true">
          <source media="(max-width: 1280px)" srcSet="/img/app-promo/stadium-night-mobile.webp" />
          <Image src="/img/app-promo/stadium-night.webp" alt="" fill sizes="(max-width: 1280px) 100vw, 90vw" />
        </picture>
        <div className="app-promo-copy">
          <span className="app-coming-soon"><span />THE NEXT CHAPTER · COMING SOON</span>
          <h2 id="app-download-title">Big football energy.<br /><span>Pocket-sized.</span></h2>
          <p>Your football obsession, on the go. Football Genius is coming to iOS and Android. Your next great challenge is always a tap away.</p>
          <div className="app-store-links">
            <a href={APP_URL} className="app-store-link" aria-label="Football Genius on the App Store — coming soon; visit FootyGen for now"><StoreIcon apple /><span><small>COMING SOON ON THE</small><strong>App Store</strong></span><ArrowUpRight className="store-arrow" size={16} /></a>
            <a href={APP_URL} className="app-store-link" aria-label="Football Genius on Google Play — coming soon; visit FootyGen for now"><StoreIcon /><span><small>COMING SOON ON</small><strong>Google Play</strong></span><ArrowUpRight className="store-arrow" size={16} /></a>
          </div>
        </div>
        <div className="app-promo-visual" aria-hidden="true">
          <div className="app-orbit orbit-one" /><div className="app-orbit orbit-two" />
          <div className="app-floating-badge app-xp"><span><Zap size={20} fill="currentColor" /></span><div><small>KNOW YOUR GAME</small><strong>Level up your football IQ</strong></div></div>
          <div className="app-phone">
            <span className="phone-side-button phone-side-button-left" /><span className="phone-side-button phone-side-button-right" />
            <div className="phone-screen">
              <div className="phone-status-bar">
                <span className="phone-status-time">9:41</span>
                <div className="phone-status-indicators">
                  <svg className="phone-status-signal" viewBox="0 0 16 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx=".7" /><rect x="4" y="5.5" width="3" height="6.5" rx=".7" /><rect x="8" y="3" width="3" height="9" rx=".7" /><rect x="12" width="3" height="12" rx=".7" /></svg>
                  <Wifi className="phone-status-wifi" strokeWidth={2.5} />
                  <svg className="phone-status-battery" viewBox="0 0 26 13" fill="currentColor"><rect x=".75" y=".75" width="21" height="11.5" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".6" /><rect x="3" y="3" width="16.5" height="7" rx="1.3" /><path d="M23 4v5a2.5 2.5 0 0 0 0-5Z" opacity=".6" /></svg>
                </div>
              </div>
              <div className="phone-camera" />
              <div className="phone-screen-content"><Image src="/img/app-promo/neon-game-screen.webp" alt="" fill sizes="(max-width: 360px) 190px, (max-width: 480px) 235px, 270px" /></div>
              <div className="phone-home-bar" />
            </div>
          </div>
          <div className="app-floating-badge app-streak"><span><Check size={19} strokeWidth={3} /></span><div><small>ONE GAME. ENDLESS POSSIBILITIES.</small><strong>Made for football fans.</strong></div></div>
        </div>
      </div>
    </section>
  );
}
