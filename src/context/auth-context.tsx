'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';
import { UserProfile } from '../lib/types/games';

interface AuthContextType {
  profile: UserProfile;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  soundEnabled: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  toggleSound: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  addXP: (amount: number, reason?: string) => Promise<void>;
  recordGameResult: (mode: string, won: boolean, score: number) => Promise<void>;
  updateUsername: (newUsername: string) => Promise<void>;
}

const DEFAULT_GUEST_PROFILE: UserProfile = {
  id: 'guest_default',
  username: 'ScoutGuest',
  avatar_url: '/img/players/bellingham.jpg',
  total_xp: 250,
  level: 2,
  current_streak: 3,
  best_streak: 5,
  coins: 100,
  is_guest: true,
  games_played: 12,
  games_won: 8,
  created_at: '2026-01-01T00:00:00.000Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'footygen_guest_profile_v2';
const SOUND_STORAGE_KEY = 'footygen_sound_enabled';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_GUEST_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load initial settings & profile
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Sound preference
    const savedSound = localStorage.getItem(SOUND_STORAGE_KEY);
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }

    // Load guest profile or check Supabase session
    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          await loadSupabaseProfile(session.user);
        } else {
          loadStoredGuestProfile();
        }
      } catch (err) {
        console.warn('Auth init fallback to guest mode:', err);
        loadStoredGuestProfile();
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadSupabaseProfile(session.user);
      } else {
        loadStoredGuestProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadStoredGuestProfile = () => {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        const randomId = 'guest_' + Math.random().toString(36).substring(2, 9);
        const initialGuest: UserProfile = {
          ...DEFAULT_GUEST_PROFILE,
          id: randomId,
          username: `Scout_${randomId.slice(-4).toUpperCase()}`,
        };
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(initialGuest));
        setProfile(initialGuest);
      }
    } catch {
      setProfile(DEFAULT_GUEST_PROFILE);
    }
  };

  const loadSupabaseProfile = async (authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setProfile({
          id: data.id,
          username: data.username || authUser.email?.split('@')[0] || 'FootballPro',
          email: authUser.email,
          avatar_url: data.avatar_url || (authUser.user_metadata?.avatar_url as string) || '/img/players/messi.jpg',
          total_xp: data.total_xp || 0,
          level: Math.floor((data.total_xp || 0) / 200) + 1,
          current_streak: data.streak_days || 1,
          best_streak: data.streak_days || 1,
          coins: data.coins || 50,
          is_guest: false,
          games_played: data.games_played || 0,
          games_won: data.games_won || 0,
          created_at: data.created_at || new Date().toISOString(),
        });
      } else {
        // Create initial profile in Supabase
        const initialProfile: UserProfile = {
          id: authUser.id,
          username: (authUser.user_metadata?.name as string) || authUser.email?.split('@')[0] || 'FootballPro',
          email: authUser.email,
          avatar_url: (authUser.user_metadata?.avatar_url as string) || '/img/players/messi.jpg',
          total_xp: profile.is_guest ? profile.total_xp : 100, // migrate guest XP
          level: Math.floor((profile.is_guest ? profile.total_xp : 100) / 200) + 1,
          current_streak: profile.is_guest ? profile.current_streak : 1,
          best_streak: profile.is_guest ? profile.best_streak : 1,
          coins: 100,
          is_guest: false,
          games_played: profile.is_guest ? profile.games_played : 0,
          games_won: profile.is_guest ? profile.games_won : 0,
          created_at: new Date().toISOString(),
        };

        await supabase.from('profiles').upsert({
          id: initialProfile.id,
          username: initialProfile.username,
          avatar_url: initialProfile.avatar_url,
          total_xp: initialProfile.total_xp,
          streak_days: initialProfile.current_streak,
        });

        setProfile(initialProfile);
      }
    } catch (err) {
      console.error('Supabase profile load exception:', err);
    }
  };

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem(SOUND_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
    } catch (err) {
      console.error('Google sign in error:', err);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      loadStoredGuestProfile();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, []);

  const addXP = useCallback(async (amount: number) => {
    setProfile(prev => {
      const newXP = prev.total_xp + amount;
      const newLevel = Math.floor(newXP / 200) + 1;
      const updated: UserProfile = {
        ...prev,
        total_xp: newXP,
        level: newLevel,
        coins: prev.coins + Math.floor(amount / 5),
      };

      if (prev.is_guest) {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
      } else {
        supabase
          .from('profiles')
          .update({ total_xp: newXP })
          .eq('id', prev.id)
          .then();
      }

      return updated;
    });
  }, []);

  const recordGameResult = useCallback(async (mode: string, won: boolean, score: number) => {
    setProfile(prev => {
      const updated: UserProfile = {
        ...prev,
        games_played: prev.games_played + 1,
        games_won: won ? prev.games_won + 1 : prev.games_won,
        current_streak: won ? prev.current_streak + 1 : prev.current_streak,
        best_streak: won ? Math.max(prev.best_streak, prev.current_streak + 1) : prev.best_streak,
      };

      if (prev.is_guest) {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
      } else {
        supabase
          .from('profiles')
          .update({
            streak_days: updated.current_streak,
          })
          .eq('id', prev.id)
          .then();

        // Record in game_sessions
        supabase
          .from('game_sessions')
          .insert({
            user_id: prev.id,
            game_mode: mode,
            score: score,
            won: won,
          })
          .then();
      }

      return updated;
    });
  }, []);

  const updateUsername = useCallback(async (newUsername: string) => {
    if (!newUsername.trim()) return;
    setProfile(prev => {
      const updated = { ...prev, username: newUsername.trim() };
      if (prev.is_guest) {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
      } else {
        supabase
          .from('profiles')
          .update({ username: newUsername.trim() })
          .eq('id', prev.id)
          .then();
      }
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        profile,
        isLoading,
        isAuthModalOpen,
        soundEnabled,
        openAuthModal,
        closeAuthModal,
        toggleSound,
        signInWithGoogle,
        signOut,
        addXP,
        recordGameResult,
        updateUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

