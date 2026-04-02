/* ═══════════════════════════════════════════════════════════════════
   Football Genius — Scout's Duel Online  (Supabase Realtime)
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  let supabase = null;  // set lazily from window.auth
  let channel = null;
  let roomCode = null;
  let isHost = false;
  let myUserId = null;
  let opponentLockedIn = false;
  let myLockedPlayerId = null;

  function getSupabase() {
    if (!supabase && window.auth?.supabase) supabase = window.auth.supabase;
    return supabase;
  }

  async function getUserId() {
    if (myUserId) return myUserId;
    try {
      const session = await window.auth?.getSession();
      myUserId = session?.user?.id || ('anon_' + Math.random().toString(36).slice(2, 8));
    } catch (_) {
      myUserId = 'anon_' + Math.random().toString(36).slice(2, 8);
    }
    return myUserId;
  }

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function setStatus(elId, msg, type) {
    const el = document.getElementById(elId);
    if (el) {
      el.textContent = msg;
      el.className = 'sd-room-status' + (type ? ' ' + type : '');
    }
  }

  function resetReadyState() {
    opponentLockedIn = false;
    myLockedPlayerId = null;
    window._opponentPlayerId = null;
  }

  /* ── Create Room ───────────────────────────────────────────────── */
  async function createRoom(cardPool) {
    const sb = getSupabase();
    if (!sb) { setStatus('createRoomStatus', 'Please log in first.', 'error'); return false; }
    if (!Array.isArray(cardPool) || !cardPool.length) {
      setStatus('createRoomStatus', 'Could not prepare the shared player pool. Reload and try again.', 'error');
      return false;
    }

    await getUserId();
    roomCode = generateCode();
    isHost = true;
    resetReadyState();

    // Show the code
    document.getElementById('roomCodeDisplay').hidden = false;
    document.getElementById('roomCodeValue').textContent = roomCode;
    setStatus('createRoomStatus', 'Waiting for your friend to join with this code...', 'waiting');

    // Subscribe to channel
    joinChannel(roomCode, cardPool);
    return true;
  }

  /* ── Join Room ─────────────────────────────────────────────────── */
  async function joinRoom(code) {
    const sb = getSupabase();
    if (!sb) { setStatus('joinRoomStatus', 'Please log in first.', 'error'); return false; }

    await getUserId();
    roomCode = code.toUpperCase();
    isHost = false;
    resetReadyState();

    setStatus('joinRoomStatus', 'Joining room and waiting for the host...', 'waiting');
    joinChannel(roomCode, null);
    return true;
  }

  /* ── Join Channel ──────────────────────────────────────────────── */
  function joinChannel(code, cardPool) {
    const sb = getSupabase();
    if (channel) { sb.removeChannel(channel); channel = null; }
    resetReadyState();

    channel = sb.channel('scouts_duel_' + code);

    channel
      .on('broadcast', { event: 'join' }, ({ payload }) => onPlayerJoined(payload, cardPool))
      .on('broadcast', { event: 'card_pool' }, ({ payload }) => onCardPool(payload))
      .on('broadcast', { event: 'ready' }, ({ payload }) => onOpponentReady(payload))
      .on('broadcast', { event: 'question' }, ({ payload }) => onQuestion(payload))
      .on('broadcast', { event: 'answer' }, ({ payload }) => onAnswer(payload))
      .on('broadcast', { event: 'guess' }, ({ payload }) => onGuess(payload))
      .on('broadcast', { event: 'play_again' }, ({ payload }) => {
        if (window._sdOpponentWantsToPlayAgain) window._sdOpponentWantsToPlayAgain(payload.cardPool);
      })
      .on('broadcast', { event: 'play_again_accept' }, () => {
        if (window._sdOpponentAcceptedPlayAgain) window._sdOpponentAcceptedPlayAgain();
      })
      .on('broadcast', { event: 'exit' }, () => {
        if (window._sdOpponentExited) window._sdOpponentExited();
      })
      .subscribe(async (status, err) => {
        console.log('[Scouts Duel] Channel Status:', status, err || '');
        if (status === 'SUBSCRIBED') {
          // Announce ourselves
          channel.send({
            type: 'broadcast',
            event: 'join',
            payload: { userId: myUserId, isHost }
          });
        } else if (status === 'CHANNEL_ERROR') {
          setStatus(isHost ? 'createRoomStatus' : 'joinRoomStatus', 'Could not connect. Ensure Realtime is enabled in Supabase.', 'error');
        } else if (status === 'TIMED_OUT') {
          // Channel didn't subscribe in time. Try once or twice to reconnect.
          setStatus(isHost ? 'createRoomStatus' : 'joinRoomStatus', 'Connecting...', 'waiting');
          setTimeout(() => {
            if (roomCode) joinChannel(roomCode, cardPool);
          }, 3000);
        } else if (status === 'CLOSED') {
          if (!roomCode) {
            setStatus(isHost ? 'createRoomStatus' : 'joinRoomStatus', 'Room connection closed.', 'error');
          }
        }
      });
  }

  function onPlayerJoined(payload, cardPool) {
    if (isHost && payload.userId !== myUserId) {
      setStatus('createRoomStatus', 'Opponent connected! Starting game...', 'success');
      // Send card pool to joiner
      const pool = cardPool || window.ScoutsDuel?.state?.cardPool;
      if (pool) {
        channel.send({
          type: 'broadcast',
          event: 'card_pool',
          payload: { cardPool: pool, hostId: myUserId }
        });
      }
      setTimeout(() => {
        window.ScoutsDuel?.startGame('online', pool);
      }, 500);
    } else if (!isHost) {
      setStatus('joinRoomStatus', 'Connected! Waiting for host...', 'success');
    }
  }

  function onCardPool(payload) {
    if (!isHost) {
      const pool = payload.cardPool;
      setStatus('joinRoomStatus', 'Game starting!', 'success');
      setTimeout(() => {
        window.ScoutsDuel?.startGame('online', pool);
      }, 500);
    }
  }

  /* ── Lock In ───────────────────────────────────────────────────── */
  function lockIn(playerId) {
    myLockedPlayerId = playerId;
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'ready',
        payload: { userId: myUserId, playerId }
      });
    }
    if (opponentLockedIn) {
      bothReady();
    }
  }

  function onOpponentReady(payload) {
    opponentLockedIn = true;
    window._opponentPlayerId = payload.playerId;
    if (myLockedPlayerId) {
      bothReady();
    } else {
      const statusEl = document.getElementById('opponentSelectionStatus');
      if (statusEl) statusEl.innerHTML = '<span class="sd-status-dot" style="background:var(--accent-2)"></span> Opponent is ready!';
    }
  }

  function bothReady() {
    // Deterministic who goes first: host goes first
    const iGoFirst = isHost;
    window._sdBothReady(window._opponentPlayerId, iGoFirst);
    opponentLockedIn = false;
    myLockedPlayerId = null;
  }

  /* ── Questions & Answers ───────────────────────────────────────── */
  function sendQuestion(text, questionData) {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'question',
        payload: { text, questionData }
      });
    }
  }

  function onQuestion(payload) {
    if (window._sdReceiveQuestion) {
      window._sdReceiveQuestion(payload.text, payload.questionData);
    }
  }

  function sendAnswer(ans) {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'answer',
        payload: { answer: ans }
      });
    }
  }

  function onAnswer(payload) {
    if (window._sdReceiveOnlineAnswer) {
      window._sdReceiveOnlineAnswer(payload.answer);
    }
  }

  /* ── Guessing ──────────────────────────────────────────────────── */
  function sendGuess(playerId) {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'guess',
        payload: { playerId }
      });
    }
  }

  function onGuess(payload) {
    if (window._sdOpponentGuesses) {
      window._sdOpponentGuesses(payload.playerId);
    }
  }

  /* ── Play Again / Exit ─────────────────────────────────────────── */
  function sendPlayAgain(cardPool) {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'play_again',
        payload: { cardPool }
      });
    }
  }

  function sendPlayAgainAccept() {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'play_again_accept',
        payload: {}
      });
    }
  }

  function sendExit() {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'exit',
        payload: {}
      });
    }
  }

  /* ── Matchmaking ───────────────────────────────────────────────── */
  let matchChannel = null;

  async function findMatch(cardPool) {
    const sb = getSupabase();
    if (!sb) return;
    await getUserId();

    matchChannel = sb.channel('scouts_duel_matchmaking', {
      config: { presence: { key: myUserId } }
    });

    matchChannel
      .on('presence', { event: 'sync' }, () => {
        const state = matchChannel.presenceState();
        const users = Object.keys(state).filter(k => k !== myUserId);
        if (users.length > 0) {
          // Match found! Lower ID hosts
          const opponentId = users[0];
          const iAmHost = myUserId < opponentId;
          const code = generateCode();

          if (iAmHost) {
            // Tell opponent the room code
            matchChannel.send({
              type: 'broadcast',
              event: 'match_found',
              payload: { roomCode: code, hostId: myUserId, guestId: opponentId }
            });
            sb.removeChannel(matchChannel);
            matchChannel = null;
            isHost = true;
            roomCode = code;
            joinChannel(code, cardPool);
            setTimeout(() => window.ScoutsDuel?.startGame('online', cardPool), 1000);
          }
        }
      })
      .on('broadcast', { event: 'match_found' }, ({ payload }) => {
        if (payload.guestId === myUserId) {
          sb.removeChannel(matchChannel);
          matchChannel = null;
          isHost = false;
          roomCode = payload.roomCode;
          joinChannel(payload.roomCode, null);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await matchChannel.track({ userId: myUserId, joinedAt: Date.now() });
        }
      });
  }

  function leaveMatchmaking() {
    const sb = getSupabase();
    if (matchChannel && sb) {
      sb.removeChannel(matchChannel);
      matchChannel = null;
    }
  }

  function leaveRoom() {
    const sb = getSupabase();
    resetReadyState();
    roomCode = null;
    isHost = false;
    if (channel && sb) {
      sb.removeChannel(channel);
      channel = null;
    }
  }

  /* ── Cleanup ───────────────────────────────────────────────────── */
  window.addEventListener('beforeunload', () => {
    const sb = getSupabase();
    if (channel && sb) sb.removeChannel(channel);
    leaveMatchmaking();
  });

  // Expose
  window.ScoutsDuelOnline = {
    createRoom, joinRoom, lockIn, sendQuestion, sendAnswer,
    sendGuess, findMatch, leaveMatchmaking, leaveRoom,
    sendPlayAgain, sendPlayAgainAccept, sendExit
  };
})();
