'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GAME_MODES } from '@/lib/constants/game-modes';
import {
  Home,
  Trophy,
  User,
  Sparkles,
  Grid3X3,
  Swords,
  PlaneTakeoff,
  TrendingUp,
  MessageSquareQuote,
  Shuffle,
  Eye,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon mapper for dynamic game mode icon rendering
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Grid3X3,
  Swords,
  PlaneTakeoff,
  TrendingUp,
  MessageSquareQuote,
  Shuffle,
  Eye,
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const mainLinks = [
    { label: 'Arena Home', href: '/', icon: Home },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'My Career & Stats', href: '/profile', icon: User },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between p-4 overflow-y-auto scrollbar-thin">
      <div>
        {/* Main Nav */}
        <div className="mb-6">
          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 font-outfit">
            Menu
          </p>
          <div className="space-y-1">
            {mainLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-neon-green/15 text-neon-green border border-neon-green/30 shadow-neon'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-neon-green' : 'text-text-muted'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Game Modes */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted font-outfit">
              Game Modes ({GAME_MODES.length})
            </p>
          </div>
          <div className="space-y-1">
            {GAME_MODES.map(mode => {
              const Icon = ICON_MAP[mode.iconName] || Sparkles;
              const isActive = pathname === mode.route;
              return (
                <Link
                  key={mode.id}
                  href={mode.route}
                  onClick={onClose}
                  className={`group flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="p-1.5 rounded-lg transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `${mode.accentColor}15`,
                        color: mode.accentColor,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="truncate">{mode.title}</span>
                  </div>

                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wide ${
                      mode.badge === 'DAILY'
                        ? 'bg-neon-green/15 text-neon-green'
                        : mode.badge === 'PVP'
                        ? 'bg-rose-500/15 text-rose-400'
                        : mode.badge === 'HOT'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-white/10 text-text-muted'
                    }`}
                  >
                    {mode.badge}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Pill */}
      <div className="pt-4 border-t border-white/10 mt-6">
        <div className="rounded-xl bg-pitch-card p-3 border border-white/5">
          <div className="flex items-center gap-2 text-neon-green text-xs font-bold mb-1">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Fair Play Verified</span>
          </div>
          <p className="text-[11px] text-text-muted leading-tight">
            Daily reset at 00:00 UTC. Guaranteed no duplicates.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-white/10 bg-pitch-dark/60 backdrop-blur-md sticky top-16 h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-pitch-dark border-r border-white/10 shadow-2xl z-10 animate-slideRight">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

