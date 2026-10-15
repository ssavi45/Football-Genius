'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { X, Trophy, Flame, Zap, Shield, Check } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, profile, updateUsername } = useAuth();
  const [nickname, setNickname] = useState(profile.username);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleUpdateNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setIsSubmitting(true);
    await updateUsername(nickname);
    setIsSubmitting(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-pitch-dark/95 p-6 shadow-2xl shadow-neon-green/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-neon-green/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-trophy-gold/15 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 rounded-full p-2 text-text-secondary hover:bg-white/10 hover:text-white transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green mb-3">
            <Trophy className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-outfit tracking-tight">
            Join FootyGen Arena
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Compete on the global leaderboard & save your stats
          </p>
        </div>

        {/* Guest Nickname Quick Edit */}
        {profile.is_guest && (
          <div className="mb-6 p-4 rounded-xl bg-pitch-card border border-white/10">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Playing as Guest Nickname
            </label>
            <form onSubmit={handleUpdateNickname} className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={20}
                className="flex-1 px-3 py-2 rounded-lg bg-pitch-black border border-white/15 text-white text-sm focus:outline-none focus:border-neon-green transition"
                placeholder="Enter scout handle"
              />
              <button
                type="submit"
                disabled={isSubmitting || nickname === profile.username}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold disabled:opacity-40 transition flex items-center gap-1.5"
              >
                {isSaved ? <Check className="h-4 w-4 text-neon-green" /> : 'Save'}
              </button>
            </form>
          </div>
        )}

        {/* Google OAuth Button */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold font-outfit text-sm transition shadow-lg shadow-white/5 active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center">
          <div className="p-2 rounded-lg bg-white/[0.03]">
            <Flame className="h-4 w-4 text-orange-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-white">Daily Streaks</div>
            <div className="text-[10px] text-text-muted">Keep progress</div>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.03]">
            <Zap className="h-4 w-4 text-neon-green mx-auto mb-1" />
            <div className="text-[11px] font-bold text-white">Live Duels</div>
            <div className="text-[10px] text-text-muted">1v1 Real-time</div>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.03]">
            <Shield className="h-4 w-4 text-trophy-gold mx-auto mb-1" />
            <div className="text-[11px] font-bold text-white">Verified Rank</div>
            <div className="text-[10px] text-text-muted">Hall of Fame</div>
          </div>
        </div>
      </div>
    </div>
  );
}

