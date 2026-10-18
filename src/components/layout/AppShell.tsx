'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import TopBar from '@/components/navigation/TopBar';
import Sidebar from '@/components/navigation/Sidebar';
import AuthModal from '@/components/auth/AuthModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('footygen_sidebar_collapsed');
      setSidebarCollapsed(saved === null ? ['/games/matrix', '/games/journeyman'].includes(pathname) : saved === 'true');
    } catch { /* Keep navigation usable without browser storage. */ }
  }, [pathname]);
  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    try { localStorage.setItem('footygen_sidebar_collapsed', String(next)); } catch { /* The toggle still works for this visit. */ }
  };
  const isScorelinePage = pathname === '/games/scoreline';
  const isHigherLowerPage = pathname === '/games/higher-lower';
  const isMatrixPage = pathname === '/games/matrix';
  const isJourneymanPage = pathname === '/games/journeyman';
  const isLandingPage = pathname === '/' || pathname === '/game-modes';

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900" suppressHydrationWarning>
      {/* Top Bar */}
      <TopBar
        isMobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className={`flex-1 flex w-full mx-auto ${isScorelinePage ? "scoreline-shell" : isHigherLowerPage ? "higher-lower-shell" : isMatrixPage ? "matrix-shell" : isJourneymanPage ? "journey-shell" : isLandingPage ? "" : "max-w-[1440px]"}`}>
        {/* On non-landing pages or on mobile menu, show Sidebar */}
        {!isLandingPage && (
          <Sidebar
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={toggleSidebar}
          />
        )}

        {/* Mobile drawer if toggled on landing page */}
        {isLandingPage && mobileMenuOpen && (
          <Sidebar
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={toggleSidebar}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 max-w-full">
          {children}
        </main>
      </div>

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
}
