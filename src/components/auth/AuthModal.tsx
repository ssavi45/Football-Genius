'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { sound } from '@/lib/utils/sound';
import { X, Trophy, Flame, Zap, Shield, Check } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, profile, updateUsername } = useAuth();
  const [nickname, setNickname] = useState(profile.username);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  useEffect(()=>{if(isAuthModalOpen){setNickname(profile.username);setError(new URLSearchParams(window.location.search).has('auth_error')?'Sign-in could not be completed. Please try again.':'');}},[isAuthModalOpen,profile.username]);

  if (!isAuthModalOpen) return null;

  const handleUpdateNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setIsSubmitting(true);
    setError('');
    try { await updateUsername(nickname);setIsSaved(true);sound.playSuccess();setTimeout(() => setIsSaved(false), 2000); }
    catch(cause){setError(cause instanceof Error?cause.message:'Could not save your name.');}
    finally{setIsSubmitting(false);}
  };

  const handleGoogleSignIn = async () => {
    try {
      sound.playClick();
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error?e.message:'Could not start sign-in. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-blue-100 bg-white p-7 shadow-2xl shadow-blue-950/15"
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mb-3">
            <Trophy className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-outfit tracking-tight">
            FootyGen Profile
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Save your match streaks & compete on the global leaderboard
          </p>
        </div>

        {/* Guest Nickname Quick Edit */}
        {profile.is_guest && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Playing as Scout Handle
            </label>
            <form onSubmit={handleUpdateNickname} className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={20}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-blue-600 transition"
                placeholder="Enter handle"
              />
              <button
                type="submit"
                disabled={isSubmitting || nickname === profile.username}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 transition flex items-center gap-1 shadow-sm"
              >
                {isSaved ? <Check className="h-4 w-4 text-white" /> : 'Save'}
              </button>
            </form>
          </div>
        )}

        {/* Google OAuth Button */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold font-outfit text-sm transition shadow-lg shadow-slate-900/10 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
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
            Sign in with Google
          </button>
        </div>

        {/* Feature Highlights */}
        {error && <p role="alert" className="mb-4 text-center text-xs text-rose-600">{error}</p>}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
          <div className="p-2 rounded-xl bg-slate-50">
            <Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-800">Streaks</div>
            <div className="text-[10px] text-slate-400">Save progress</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <Zap className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-800">Live Duels</div>
            <div className="text-[10px] text-slate-400">1v1 Lobbies</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <Shield className="h-4 w-4 text-amber-500 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-slate-800">Ranks</div>
            <div className="text-[10px] text-slate-400">Hall of Fame</div>
          </div>
        </div>
      </div>
    </div>
  );
}
