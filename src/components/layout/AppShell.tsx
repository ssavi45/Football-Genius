'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import TopBar from '@/components/navigation/TopBar';
import Sidebar from '@/components/navigation/Sidebar';
import AuthModal from '@/components/auth/AuthModal';
import SiteFooter from './SiteFooter';
import { isSharedGameRoute } from '@/lib/navigation';
import './AppShell.css';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('footygen_sidebar_collapsed');
      setSidebarCollapsed(saved === 'true');
    } catch { /* Keep navigation usable without browser storage. */ }
  }, []);
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);
  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    try { localStorage.setItem('footygen_sidebar_collapsed', String(next)); } catch { /* The toggle still works for this visit. */ }
  };
  const isScorelinePage = pathname === '/games/scoreline';
  const isHigherLowerPage = pathname === '/games/higher-lower';
  const isMatrixPage = pathname === '/games/matrix';
  const isJourneymanPage = pathname === '/games/journeyman';
  const isScoutsDuelPage = pathname === '/games/scouts-duel';
  const isLandingPage = pathname === '/' || pathname === '/game-modes';

  const pageClass = isScorelinePage ? 'scoreline-shell' : isHigherLowerPage ? 'higher-lower-shell' : isMatrixPage ? 'matrix-shell' : isJourneymanPage ? 'journey-shell' : isScoutsDuelPage ? 'scout-shell' : isLandingPage ? 'landing-shell' : 'standard-shell';

  return (
    <div className={`app-frame ${sidebarCollapsed?'is-sidebar-collapsed':''}`} suppressHydrationWarning>
      <Sidebar isOpen={mobileMenuOpen} onClose={()=>setMobileMenuOpen(false)} collapsed={sidebarCollapsed} onToggleCollapsed={toggleSidebar}/>
      <div className="app-workspace">
        <TopBar isMobileMenuOpen={mobileMenuOpen} onToggleMobileMenu={()=>setMobileMenuOpen(!mobileMenuOpen)}/>
        <main className={`app-page-shell ${isSharedGameRoute(pathname)?'shared-game-shell':''} ${pageClass}`}>
          {children}
        </main>
        <SiteFooter />
      </div>
      <AuthModal/>
    </div>
  );
}
