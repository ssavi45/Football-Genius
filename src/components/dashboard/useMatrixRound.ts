'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/auth-context';
import { newMatrixRound } from '@/app/games/matrix/actions';
import { clearAnswers, combinationKey, emptyState, restoreSession, setAnswer, submitGrid, viewState } from '@/lib/matrix/engine';
import type { Criterion, MatrixPlayer, MatrixPuzzle, MatrixSession, MatrixState } from '@/lib/matrix/types';

export function useMatrixRound(initialPuzzle: MatrixPuzzle, players: MatrixPlayer[], catalog: Criterion[], datasetVersion: string) {
  const { profile, isLoading, addXP, recordGameResult } = useAuth();
  const [session, setSession] = useState<MatrixSession>(() => ({ puzzle: initialPuzzle, state: emptyState(initialPuzzle), history: [combinationKey(initialPuzzle)] }));
  const active = useRef(session);
  const request = useRef(0);
  const busy = useRef(false);
  const [readyKey, setReadyKey] = useState('');
  const [storageWarning, setStorageWarning] = useState(false);
  const [pendingRound, setPendingRound] = useState(false);
  const [notice, setNotice] = useState('');
  const storageKey = `footygen_matrix_rounds_v2:${profile.id}:${initialPuzzle.difficulty}`;
  const ready = !isLoading && readyKey === storageKey && session.puzzle.difficulty === initialPuzzle.difficulty;
  const { puzzle, state } = session;
  const view = useMemo(() => viewState(state, puzzle, players), [state, puzzle, players]);
  const decode = (raw: string) => restoreSession(JSON.parse(raw), players, catalog, datasetVersion, initialPuzzle.difficulty);

  function commit(next: MatrixSession) {
    // Persist submission before awarding rewards. Reloads only restore it.
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { setStorageWarning(true); }
    active.current = next; setSession(next);
  }
  useEffect(() => {
    if (isLoading) return;
    request.current++; busy.current = false; setPendingRound(false); setNotice(''); setStorageWarning(false);
    let next: MatrixSession = { puzzle: initialPuzzle, state: emptyState(initialPuzzle), history: [combinationKey(initialPuzzle)] };
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const restored = restoreSession(JSON.parse(raw), players, catalog, datasetVersion, initialPuzzle.difficulty);
        if (restored) next = restored;
      }
      // Save even a completely empty round, so refreshing does not reroll it.
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch { setStorageWarning(true); }
    active.current = next; setSession(next); setReadyKey(storageKey);
    return () => { request.current++; busy.current = false; };
  }, [storageKey, isLoading, initialPuzzle, players, catalog, datasetVersion]);

  useEffect(() => {
    if (!ready) return;
    const update = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return;
      try {
        const saved = restoreSession(JSON.parse(event.newValue), players, catalog, datasetVersion, initialPuzzle.difficulty);
        if (saved && (saved.puzzle.number > active.current.puzzle.number
          || (saved.puzzle.id === active.current.puzzle.id && saved.state.revision > active.current.state.revision))) {
          request.current++; busy.current = false; setPendingRound(false);
          active.current = saved; setSession(saved); setNotice('Round updated from another tab.');
        }
      } catch { /* Ignore incomplete external writes. */ }
    };
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, [ready, storageKey, players, catalog, datasetVersion, initialPuzzle.difficulty]);

  function latest(): MatrixSession | null {
    let before = active.current;
    try {
      const raw = localStorage.getItem(storageKey);
      const saved = raw && decode(raw);
      if (saved) {
        if (saved.puzzle.id !== before.puzzle.id) {
          active.current = saved; setSession(saved); setNotice('Round updated from another tab. Please check the grid.');
          return null;
        }
        if (saved.state.revision > before.state.revision) {
          active.current = saved; setSession(saved); before = saved;
        }
      }
    } catch { /* Retain in-memory progress if local storage becomes unavailable. */ }
    return before;
  }
  function edit(cell: number, playerId: string | null): boolean {
    if (!ready || busy.current) return false;
    const before = latest(); if (!before) return false;
    const next = setAnswer(before.state, players, cell, playerId);
    if (next === before.state) return false;
    commit({ ...before, state: next }); setNotice(''); return true;
  }
  function clear() {
    if (!ready || busy.current) return;
    const before = latest(); if (!before) return;
    commit({ ...before, state: clearAnswers(before.state) }); setNotice('');
  }
  function submit() {
    if (!ready || busy.current) return;
    const before = latest(); if (!before || before.state.submitted) return;
    const next: MatrixState = submitGrid(before.state);
    commit({ ...before, state: next }); setNotice('');
    const result = viewState(next, before.puzzle, players);
    if (result.xp) void addXP(result.xp, 'Football Matrix submitted grid').catch(() => {});
    void recordGameResult('matrix', result.won, result.xp).catch(() => {});
    if (result.won) void confetti({ particleCount: 120, spread: 80, colors: ['#0967ff', '#ffca32', '#19c88a'], disableForReducedMotion: true });
  }
  async function nextRound() {
    if (!ready || busy.current || !active.current.state.submitted) return;
    const before = latest(); if (!before || !before.state.submitted) return;
    const token = ++request.current;
    busy.current = true;
    setPendingRound(true); setNotice('');
    try {
      const next = await newMatrixRound(before.puzzle.difficulty, before.puzzle.number + 1, before.history);
      if (request.current !== token || active.current.puzzle.id !== before.puzzle.id) return;
      commit({ puzzle: next, state: emptyState(next), history: [...before.history, combinationKey(next)].slice(-200) });
    } catch { if (request.current === token) setNotice('Could not load a new round. Your result is saved. Please try again.'); }
    finally { if (request.current === token) { busy.current = false; setPendingRound(false); } }
  }
  return { puzzle, state, view, ready, storageWarning, pendingRound, notice, edit, clear, submit, nextRound };
}
