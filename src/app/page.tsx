'use client';

import LandingHero from '@/components/landing/LandingHero';
import GameModesShowcase from '@/components/landing/GameModesShowcase';
import AppDownloadSection from '@/components/landing/AppDownloadSection';
import './landing.css';

export default function HomeArenaPage() {
  return <div className="landing-page"><LandingHero /><GameModesShowcase /><section id="about" className="landing-container landing-about"><h2>Made for the love of football.</h2><p>From iconic matches to unforgettable players, Football Genius brings your football knowledge to life. Pick a challenge, compete with friends, and climb the global leaderboard.</p></section><AppDownloadSection /></div>;
}
