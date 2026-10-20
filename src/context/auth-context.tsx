"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { supabaseConfigured } from '@/lib/supabase/config';
import type { UserProfile } from '@/lib/types/games';
import { appendLocalHistory } from '@/lib/account/history';

interface AuthContextType {
  profile: UserProfile; isLoading: boolean; isAuthModalOpen: boolean; soundEnabled: boolean;
  openAuthModal: () => void; closeAuthModal: () => void; toggleSound: () => void;
  signInWithGoogle: () => Promise<void>; signOut: () => Promise<void>;
  addXP: (amount: number, reason?: string) => Promise<void>;
  recordGameResult: (mode: string, won: boolean, score: number) => Promise<void>;
  updateUsername: (name: string) => Promise<void>; updateAvatar: (avatarUrl: string) => Promise<void>; refreshProfile: () => Promise<void>;
}
const EMPTY_GUEST: UserProfile = { id:'guest_default',username:'ScoutGuest',total_xp:0,level:1,current_streak:0,best_streak:0,coins:0,is_guest:true,games_played:0,games_won:0,created_at:'2026-10-19T00:00:00Z' };
const GUEST_KEY='footygen_guest_profile_v2', SOUND_KEY='footygen_sound_enabled';
const AuthContext=createContext<AuthContextType|undefined>(undefined);

function readGuest():UserProfile {
  try {
    const raw=localStorage.getItem(GUEST_KEY);
    if(raw){const saved=JSON.parse(raw);if(saved.is_guest&&typeof saved.id==='string'&&typeof saved.username==='string')return {...EMPTY_GUEST,...saved};}
    const id='guest_'+crypto.randomUUID();const guest={...EMPTY_GUEST,id,username:'Scout_'+id.slice(-4).toUpperCase(),created_at:new Date().toISOString()};
    localStorage.setItem(GUEST_KEY,JSON.stringify(guest));return guest;
  } catch { return EMPTY_GUEST; }
}
export function AuthProvider({children}:{children:React.ReactNode}) {
  const [profile,setProfile]=useState<UserProfile>(EMPTY_GUEST),[isLoading,setIsLoading]=useState(true);
  const [isAuthModalOpen,setIsAuthModalOpen]=useState(false),[soundEnabled,setSoundEnabled]=useState(true);
  const current=useRef(profile);current.current=profile;
  const generation=useRef(0),mounted=useRef(true);
  const loadUser=useCallback(async(user:User)=>{
    const token=++generation.current;
    const [account,settings]=await Promise.all([
      supabase.from('profiles').select('*').eq('id',user.id).single(),
      supabase.from('user_preferences').select('sound_enabled').eq('user_id',user.id).maybeSingle(),
    ]);
    const {data,error}=account;
    if(error||!data)throw new Error('Your account profile could not be loaded. Please retry.');
    if(!mounted.current||generation.current!==token)return;
    setProfile({id:user.id,username:data.username,email:user.email,avatar_url:data.avatar_url||undefined,total_xp:Number(data.total_xp)||0,level:Math.floor((Number(data.total_xp)||0)/200)+1,current_streak:data.streak_days??0,best_streak:data.best_streak??0,coins:Number(data.coins)||0,is_guest:false,games_played:data.games_played??0,games_won:data.games_won??0,created_at:data.created_at,last_played_at:data.last_played_at});
    const {data:preferences}=settings;
    if(preferences&&mounted.current&&generation.current===token){setSoundEnabled(preferences.sound_enabled);try{localStorage.setItem(SOUND_KEY,String(preferences.sound_enabled));}catch{}}
  },[]);
  useEffect(()=>{
    mounted.current=true;try{setSoundEnabled(localStorage.getItem(SOUND_KEY)!=='false');if(new URLSearchParams(window.location.search).has('auth_error'))setIsAuthModalOpen(true);}catch{}
    const guest=()=>{generation.current++;if(mounted.current)setProfile(readGuest());};
    const initialize=async()=>{
      try{if(!supabaseConfigured){guest();return;}const {data:{session}}=await supabase.auth.getSession();if(session?.user)await loadUser(session.user);else guest();}
      catch{guest();}finally{if(mounted.current)setIsLoading(false);}
    };
    void initialize();
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==='INITIAL_SESSION')return;
      // Run database reads after the auth callback releases its session lock.
      queueMicrotask(()=>{if(!mounted.current)return;if(session?.user)void loadUser(session.user).then(()=>setIsAuthModalOpen(false)).catch(()=>{}).finally(()=>setIsLoading(false));else{guest();setIsLoading(false);}});
    });
    return()=>{mounted.current=false;generation.current++;subscription.unsubscribe();};
  },[loadUser]);
  const refreshProfile=useCallback(async()=>{if(current.current.is_guest)return;const {data:{session},error}=await supabase.auth.getSession();if(error||!session?.user)throw new Error('Please sign in again.');await loadUser(session.user);},[loadUser]);
  const toggleSound=useCallback(()=>setSoundEnabled(previous=>{const next=!previous;try{localStorage.setItem(SOUND_KEY,String(next));}catch{}if(!current.current.is_guest)void supabase.from('user_preferences').upsert({user_id:current.current.id,sound_enabled:next,updated_at:new Date().toISOString()}).then(()=>{});return next;}),[]);
  const openAuthModal=useCallback(()=>setIsAuthModalOpen(true),[]),closeAuthModal=useCallback(()=>setIsAuthModalOpen(false),[]);
  const signInWithGoogle=useCallback(async()=>{
    if(!supabaseConfigured)throw new Error('Sign-in is not connected yet.');
    const next=window.location.pathname+window.location.hash;
    const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`}});
    if(error)throw new Error(error.message);
  },[]);
  const signOut=useCallback(async()=>{const {error}=await supabase.auth.signOut();if(error)throw error;generation.current++;setProfile(readGuest());},[]);
  // Signed-in rewards are credited exclusively by validated game APIs.
  const addXP=useCallback(async(amount:number)=>{
    if(!current.current.is_guest)return;
    if(!Number.isSafeInteger(amount)||amount<0||amount>10000)return;
    const previous=current.current;const total=previous.total_xp+amount;
    const updated={...previous,total_xp:total,level:Math.floor(total/200)+1,coins:previous.coins+Math.floor(amount/5)};
    current.current=updated;setProfile(updated);try{localStorage.setItem(GUEST_KEY,JSON.stringify(updated));}catch{}
  },[]);
  const recordGameResult=useCallback(async(mode:string,won:boolean,score:number)=>{
    if(!current.current.is_guest)return;
    const previous=current.current,streak=won?previous.current_streak+1:0;
    const updated={...previous,games_played:previous.games_played+1,games_won:previous.games_won+(won?1:0),current_streak:streak,best_streak:Math.max(previous.best_streak,streak)};
    current.current=updated;setProfile(updated);try{localStorage.setItem(GUEST_KEY,JSON.stringify(updated));}catch{}
    appendLocalHistory(previous.id,mode,won,score);
  },[]);
  const updateUsername=useCallback(async(value:string)=>{
    const username=value.trim();if(!username||username.length>32)throw new Error('Use a display name between 1 and 32 characters.');
    const before=current.current;
    if(!before.is_guest){const {error}=await supabase.from('profiles').update({username}).eq('id',before.id).select('id').single();if(error)throw new Error('Could not save your display name. Please retry.');}
    const updated={...current.current,username};if(updated.id!==before.id)return;
    if(updated.is_guest){try{localStorage.setItem(GUEST_KEY,JSON.stringify(updated));}catch{throw new Error('Could not save on this device. Check browser storage settings.');}}
    current.current=updated;setProfile(updated);
  },[]);
  const updateAvatar=useCallback(async(value:string)=>{
    const avatarUrl=value.trim();
    if(!avatarUrl||!/^(?:\/(?!\/)|https:\/\/)/.test(avatarUrl))throw new Error("Please choose a valid avatar image.");
    const before=current.current;
    if(!before.is_guest){
      const {error}=await supabase.from("profiles").update({avatar_url:avatarUrl}).eq("id",before.id).select("id").single();
      if(error)throw new Error("Could not save your avatar. Please retry.");
    }
    const updated={...current.current,avatar_url:avatarUrl};
    if(updated.id!==before.id)return;
    if(updated.is_guest){
      try{localStorage.setItem(GUEST_KEY,JSON.stringify(updated));}catch{throw new Error("Could not save on this device. Check browser storage settings.");}
    }
    current.current=updated;
    setProfile(updated);
  },[]);
  return <AuthContext.Provider value={{profile,isLoading,isAuthModalOpen,soundEnabled,openAuthModal,closeAuthModal,toggleSound,signInWithGoogle,signOut,addXP,recordGameResult,updateUsername,updateAvatar,refreshProfile}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const context=useContext(AuthContext);if(!context)throw new Error('useAuth must be used within an AuthProvider');return context;}
