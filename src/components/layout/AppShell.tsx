'use client';

import React, { useState } from 'react';
import TopBar from '@/components/navigation/TopBar';
import Sidebar from '@/components/navigation/Sidebar';
import AuthModal from '@/components/auth/AuthModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F6FD] text-slate-900">
      {/* Top Bar is fixed at the top */}
      <TopBar
        isMobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 max-w-full overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
}

