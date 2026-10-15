'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sound } from '@/lib/utils/sound';
import {
  Gamepad2,
  Trophy,
  BarChart2,
  Users2,
  ShieldCheck,
  Settings,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Play Game', href: '/', icon: Gamepad2, activePattern: pathname === '/' || pathname.startsWith('/games') },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy, activePattern: pathname === '/leaderboard' },
    { label: 'My Stats', href: '/profile', icon: BarChart2, activePattern: pathname === '/profile' },
    { label: 'Challenges', href: '/games/scouts-duel', icon: Users2, activePattern: pathname === '/games/scouts-duel' },
    { label: 'Achievements', href: '/profile#badges', icon: ShieldCheck, activePattern: false },
    { label: 'Settings', href: '/profile#settings', icon: Settings, activePattern: false },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between p-4">
      {/* Nav Items */}
      <div className="space-y-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = item.activePattern;

          return (
            <Link
              key={item.label}
              href={item.href}
              onMouseEnter={() => sound.playHover()}
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Quote & Watermark (Matching Mockup) */}
      <div className="relative pt-6 border-t border-blue-50/80 mt-6 select-none overflow-hidden">
        {/* Subtle Watermark Starball Graphic */}
        <div className="absolute -bottom-6 -left-6 opacity-[0.06] text-blue-900 pointer-events-none">
          <svg className="w-36 h-36" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" />
          </svg>
        </div>

        <div className="relative z-10 space-y-2">
          <p className="text-sm font-semibold font-outfit text-blue-900/60 italic leading-snug">
            Great<br />
            football<br />
            minds<br />
            predict<br />
            the future.
          </p>
          <div className="w-8 h-1 rounded-full bg-blue-600" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Floating Sidebar Card */}
      <aside className="hidden lg:block w-56 shrink-0 py-6 pl-4 sm:pl-6">
        <div className="card-white rounded-3xl p-2 sticky top-24 h-[calc(100vh-8rem)] flex flex-col justify-between shadow-sm border border-blue-100/80">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-white shadow-2xl z-10 p-2 animate-slideRight">
            <div className="flex justify-end p-2">
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
