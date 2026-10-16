'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import TopBar from '@/components/navigation/TopBar';
import Sidebar from '@/components/navigation/Sidebar';
import AuthModal from '@/components/auth/AuthModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isScorelinePage = pathname === '/games/scoreline';
  const isLandingPage = pathname === '/' || pathname === '/game-modes';

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900" suppressHydrationWarning>
      {/* Top Bar */}
      <TopBar
        isMobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className={`flex-1 flex w-full mx-auto ${isScorelinePage ? "scoreline-shell" : isLandingPage ? "" : "max-w-[1440px]"}`}>
        {/* On non-landing pages or on mobile menu, show Sidebar */}
        {!isLandingPage && (
          <Sidebar
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile drawer if toggled on landing page */}
        {isLandingPage && mobileMenuOpen && (
          <Sidebar
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
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
