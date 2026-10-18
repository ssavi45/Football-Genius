import Image from 'next/image';
import './app-download.css';
import { ArrowUpRight, BarChart3, Bell, Check, Crown, Grid2X2, Home, Smartphone, Trophy, UserRound, Zap } from 'lucide-react';

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
          <div className="app-availability"><Smartphone size={15} /><span>The app is on its way. Play on the web today.</span></div>
        </div>
        <div className="app-promo-visual" aria-hidden="true">
          <div className="app-orbit orbit-one" /><div className="app-orbit orbit-two" />
          <div className="app-floating-badge app-xp"><span><Zap size={20} fill="currentColor" /></span><div><small>KNOW YOUR GAME</small><strong>Level up your football IQ</strong></div></div>
          <div className="app-phone">
            <span className="phone-side-button phone-side-button-left" /><span className="phone-side-button phone-side-button-right" />
            <div className="phone-screen">
              <div className="phone-camera" />
              <div className="phone-topline"><span>9:41</span><span>▮▮▮  ▰</span></div>
              <div className="phone-brand"><Trophy size={18} /><span>Football<span>Genius</span></span><Bell className="phone-notification" size={16} /></div>
              <div className="phone-greeting">YOUR DAILY DOSE OF FOOTBALL</div>
              <div className="phone-title">Ready for<br />a hat-trick?</div>
              <div className="phone-feature"><div className="phone-feature-top"><Trophy size={23} /><span>DAILY CHALLENGE</span></div><h3>Legends are made.<br />Geniuses are tested.</h3><div className="phone-feature-action">Let’s play <ArrowUpRight size={16} /></div></div>
              <div className="phone-section-label">Find your game <span>See all</span></div>
              <div className="phone-games"><div><Grid2X2 size={22} /><strong>Football Matrix</strong><small>Connect the legends</small></div><div><Crown size={22} /><strong>The Journeyman</strong><small>Follow the journey</small></div></div>
              <div className="phone-bottom-nav"><span><Home size={17} /><small>Home</small></span><span><Grid2X2 size={17} /><small>Games</small></span><span><BarChart3 size={17} /><small>Stats</small></span><span><UserRound size={17} /><small>Profile</small></span></div>
              <div className="phone-home-bar" />
            </div>
          </div>
          <div className="app-floating-badge app-streak"><span><Check size={19} strokeWidth={3} /></span><div><small>ONE GAME. ENDLESS POSSIBILITIES.</small><strong>Made for football fans.</strong></div></div>
          <span className="app-preview-label">APP PREVIEW · COMING SOON</span>
        </div>
      </div>
    </section>
  );
}
