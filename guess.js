/* Football Genius — Guess Who? (AI Player Recognition)
   =====================================================
   Mechanics:
   - 10 players per round, shown as progressively de-pixelated images.
   - 5 reveal levels: heavy pixelation → clear.
   - Points: 10 (Level 1) → 8 → 6 → 4 → 2 (Level 5).
   - AI opponent (face-api.js) also tries to identify at each level.
   - Beat the AI to earn bragging rights!
*/

(() => {
  /* ── DOM ──────────────────────────────────────────────────────── */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    qIndex: $('#qIndex'),
    score: $('#score'),
    potential: $('#potential'),
    aiBeatCount: $('#aiBeatCount'),
    canvas: $('#guessCanvas'),
    levelDots: $$('.guess-level-dot'),
    aiGuess: $('#aiGuess'),
    aiConfFill: $('#aiConfFill'),
    aiLoadingBanner: $('#aiLoadingBanner'),
    guessInput: $('#guessInput'),
    submitGuess: $('#submitGuess'),
    autocomplete: $('#guessAutocomplete'),
    revealBtn: $('#revealBtn'),
    revealCost: $('#revealCost'),
    nextQuestion: $('#nextQuestion'),
    guessResult: $('#guessResult'),
    guessResultText: $('#guessResultText'),
    guessResultDetail: $('#guessResultDetail'),
    progressFill: $('#progressFill'),
    modal: $('#summaryModal'),
    finalScore: $('#finalScore'),
    aiBeatSummary: $('#aiBeatSummary'),
    roundBreakdown: $('#roundBreakdown'),
    year: $('#year'),
  };

  if (els.year) els.year.textContent = new Date().getFullYear();

  const ctx = els.canvas.getContext('2d');

  /* ── Constants ────────────────────────────────────────────────── */
  const CANVAS_SIZE = 280;
  // Pixelation resolutions per level (draw at this res, then scale up)
  const PIXEL_LEVELS = [5, 10, 20, 50, CANVAS_SIZE];
  const POINTS_PER_LEVEL = [10, 8, 6, 4, 2];
  const ROUND_COUNT = 10;

  /* ── State ────────────────────────────────────────────────────── */
  const state = {
    players: [],       // loaded from JSON
    questions: [],     // 10 shuffled for this round
    index: 0,
    score: 0,
    level: 0,          // current reveal level (0–4)
    answered: false,
    history: [],
    aiBeatTotal: 0,
    aiIdentifiedAt: -1, // level at which AI correctly identified (or -1)
    currentImg: null,   // loaded Image object
  };

  /* ── AI State ────────────────────────────────────────────────── */
  const ai = {
    ready: false,
    loading: false,
    descriptors: [],   // { name, descriptor }
    faceapi: null,     // face-api.js reference
  };

  /* ── Helpers ──────────────────────────────────────────────────── */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const canonicalize = (s = '') =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
     .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  /* ── Pixelation Engine ───────────────────────────────────────── */
  function drawPixelated(img, resolution) {
    const w = CANVAS_SIZE;
    const h = CANVAS_SIZE;
    // Step 1: Draw at low resolution into an offscreen canvas
    const off = document.createElement('canvas');
    off.width = resolution;
    off.height = resolution;
    const offCtx = off.getContext('2d');
    offCtx.imageSmoothingEnabled = false;
    offCtx.drawImage(img, 0, 0, resolution, resolution);

    // Step 2: Scale up to display canvas
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(off, 0, 0, resolution, resolution, 0, 0, w, h);
  }

  function renderCurrentLevel() {
    if (!state.currentImg) return;
    const res = PIXEL_LEVELS[state.level];
    drawPixelated(state.currentImg, res);
    updateLevelDots();
    updatePotential();
  }

  /* ── AI (face-api.js) ────────────────────────────────────────── */
  async function loadFaceAPI() {
    if (ai.ready || ai.loading) return;
    ai.loading = true;
    els.aiLoadingBanner.classList.add('show');

    try {
      // Load face-api.js from CDN
      await loadScript('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js');
      ai.faceapi = window.faceapi;

      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model/';

      // Load required models
      await Promise.all([
        ai.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        ai.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ai.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      // Pre-compute face descriptors for all players
      await buildFaceDescriptors();

      ai.ready = true;
      console.log(`AI ready — ${ai.descriptors.length} faces registered.`);
    } catch (err) {
      console.warn('face-api.js load failed:', err);
      // AI will gracefully degrade — show "AI unavailable"
    }

    ai.loading = false;
    els.aiLoadingBanner.classList.remove('show');
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function buildFaceDescriptors() {
    ai.descriptors = [];
    const batchSize = 5;
    for (let i = 0; i < state.players.length; i += batchSize) {
      const batch = state.players.slice(i, i + batchSize);
      const promises = batch.map(async (p) => {
        try {
          const img = await ai.faceapi.fetchImage(p.image);
          const detection = await ai.faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (detection) {
            ai.descriptors.push({ name: p.name, descriptor: detection.descriptor });
          }
        } catch (e) {
          // Skip players whose faces can't be detected
        }
      });
      await Promise.all(promises);
    }
  }

  async function aiAnalyze() {
    if (!ai.ready) {
      setAIStatus('AI model loading…', 0);
      return;
    }

    setAIStatus(null, 0); // thinking

    try {
      // Feed the current CANVAS (with pixelation) to the AI
      const detection = await ai.faceapi
        .detectSingleFace(els.canvas)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection || ai.descriptors.length === 0) {
        setAIStatus('Can\'t detect a face yet…', 0);
        return;
      }

      // Find closest match
      const faceMatcher = new ai.faceapi.FaceMatcher(
        ai.descriptors.map(d => new ai.faceapi.LabeledFaceDescriptors(d.name, [d.descriptor])),
        0.6  // distance threshold
      );
      const match = faceMatcher.findBestMatch(detection.descriptor);

      if (match.label === 'unknown') {
        const conf = Math.max(0, Math.round((1 - match.distance) * 100));
        setAIStatus(`Not sure yet… (${conf}%)`, conf);
      } else {
        const conf = Math.max(0, Math.round((1 - match.distance) * 100));
        setAIStatus(`${match.label} <span class="confidence">(${conf}%)</span>`, conf);

        // Check if AI is correct
        const correctName = currentPlayer().name;
        if (canonicalize(match.label) === canonicalize(correctName) && state.aiIdentifiedAt < 0) {
          state.aiIdentifiedAt = state.level;
        }
      }
    } catch (err) {
      setAIStatus('Analysis error', 0);
    }
  }

  function setAIStatus(text, confPercent) {
    if (text === null) {
      // Thinking animation
      els.aiGuess.innerHTML = '<span class="ai-thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span> Analyzing…';
    } else {
      els.aiGuess.innerHTML = text;
    }
    els.aiConfFill.style.width = `${confPercent || 0}%`;
  }

  /* ── Game Logic ──────────────────────────────────────────────── */
  function currentPlayer() {
    return state.questions[state.index];
  }

  function updateHud() {
    els.qIndex.textContent = state.index + 1;
    els.score.textContent = state.score;
    els.aiBeatCount.textContent = state.aiBeatTotal;
  }

  function updatePotential() {
    els.potential.textContent = POINTS_PER_LEVEL[state.level];
  }

  function updateProgress() {
    const pct = (state.index / ROUND_COUNT) * 100;
    els.progressFill.style.width = `${pct}%`;
  }

  function updateLevelDots() {
    els.levelDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === state.level);
      dot.classList.toggle('used', i < state.level);
    });
  }

  async function loadQuestion() {
    const p = currentPlayer();
    state.level = 0;
    state.answered = false;
    state.aiIdentifiedAt = -1;

    // Reset UI
    els.guessInput.value = '';
    els.guessInput.disabled = false;
    els.submitGuess.disabled = false;
    els.revealBtn.disabled = false;
    els.nextQuestion.hidden = true;
    els.guessResult.classList.remove('show', 'correct', 'wrong');
    els.autocomplete.classList.remove('show');

    // Load image
    state.currentImg = await loadImage(p.image);
    renderCurrentLevel();
    updateHud();
    updateProgress();
    updateRevealBtn();

    // Run AI analysis
    setTimeout(() => aiAnalyze(), 300);
  }

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Create placeholder
        const c = document.createElement('canvas');
        c.width = 280; c.height = 280;
        const cx = c.getContext('2d');
        cx.fillStyle = '#333';
        cx.fillRect(0, 0, 280, 280);
        cx.fillStyle = '#666';
        cx.font = '40px sans-serif';
        cx.textAlign = 'center';
        cx.fillText('?', 140, 155);
        const placeholder = new Image();
        placeholder.src = c.toDataURL();
        placeholder.onload = () => resolve(placeholder);
      };
      img.src = src;
    });
  }

  function updateRevealBtn() {
    if (state.level >= 4 || state.answered) {
      els.revealBtn.disabled = true;
      els.revealCost.textContent = '';
    } else {
      els.revealBtn.disabled = false;
      const nextPts = POINTS_PER_LEVEL[state.level + 1];
      const currentPts = POINTS_PER_LEVEL[state.level];
      els.revealCost.textContent = `(−${currentPts - nextPts} pts)`;
    }
  }

  function revealMore() {
    if (state.level >= 4 || state.answered) return;
    state.level++;
    renderCurrentLevel();
    updateRevealBtn();

    // Auto-submit if at max reveal
    if (state.level >= 4) {
      els.revealBtn.disabled = true;
    }

    // Re-run AI
    setTimeout(() => aiAnalyze(), 200);
  }

  function submitGuess() {
    if (state.answered) return;
    const guess = canonicalize(els.guessInput.value);
    const answer = canonicalize(currentPlayer().name);

    if (!guess) return;

    const correct = guess === answer;
    state.answered = true;

    const pts = correct ? POINTS_PER_LEVEL[state.level] : 0;
    if (correct) state.score += pts;

    // Did user beat the AI?
    let beatAI = false;
    if (correct && (state.aiIdentifiedAt < 0 || state.level < state.aiIdentifiedAt)) {
      beatAI = true;
      state.aiBeatTotal++;
    }

    // Show clear image
    state.level = 4;
    renderCurrentLevel();
    updateLevelDots();

    // Record
    state.history.push({
      player: currentPlayer().name,
      result: correct ? 'Correct' : 'Wrong',
      earned: pts,
      level: state.level,
      beatAI,
    });

    // Show result
    showResult(correct, pts, beatAI);

    // Disable inputs
    els.guessInput.disabled = true;
    els.submitGuess.disabled = true;
    els.revealBtn.disabled = true;
    els.nextQuestion.hidden = false;
    els.autocomplete.classList.remove('show');

    updateHud();

    // Final AI analysis on clear image
    setTimeout(() => aiAnalyze(), 100);
  }

  function showResult(correct, pts, beatAI) {
    els.guessResult.classList.add('show');
    els.guessResult.classList.toggle('correct', correct);
    els.guessResult.classList.toggle('wrong', !correct);

    if (correct) {
      els.guessResultText.textContent = `✓ Correct! +${pts} pts`;
      els.guessResultDetail.textContent = beatAI
        ? `🏆 You identified ${currentPlayer().name} before the AI!`
        : `${currentPlayer().name} — ${currentPlayer().club}`;
    } else {
      els.guessResultText.textContent = `✗ It was ${currentPlayer().name}`;
      els.guessResultDetail.textContent = `${currentPlayer().club} · ${currentPlayer().nation}`;
    }
  }

  function nextQuestion() {
    if (state.index < ROUND_COUNT - 1) {
      state.index++;
      loadQuestion();
    } else {
      endRound();
    }
  }

  function endRound() {
    els.progressFill.style.width = '100%';
    els.finalScore.textContent = state.score;
    els.aiBeatSummary.textContent = state.aiBeatTotal > 0
      ? `You beat the AI ${state.aiBeatTotal} time${state.aiBeatTotal === 1 ? '' : 's'}! 🤖🏆`
      : 'The AI was too fast this round. Try again!';

    // Breakdown
    const frag = document.createDocumentFragment();
    state.history.forEach((h, i) => {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `
        <div>#${i + 1} — ${h.player}</div>
        <div>${h.result}${h.beatAI ? ' 🤖✓' : ''}</div>
        <div>${h.earned} pts</div>`;
      frag.appendChild(row);
    });
    els.roundBreakdown.innerHTML = '';
    els.roundBreakdown.appendChild(frag);
    els.modal.hidden = false;

    // Save score
    if (window.auth?.saveScore) window.auth.saveScore('guess', state.score);
  }

  /* ── Autocomplete ────────────────────────────────────────────── */
  let acSelectedIdx = -1;

  function onInput() {
    const q = els.guessInput.value.trim();
    if (q.length < 2) {
      els.autocomplete.classList.remove('show');
      return;
    }

    const query = canonicalize(q);
    const matches = state.players
      .filter(p => canonicalize(p.name).includes(query))
      .slice(0, 6);

    if (matches.length === 0) {
      els.autocomplete.classList.remove('show');
      return;
    }

    acSelectedIdx = -1;
    els.autocomplete.innerHTML = matches.map((p, i) =>
      `<div class="guess-autocomplete-item" data-idx="${i}">${p.name}<span class="ac-club">${p.club}</span></div>`
    ).join('');

    els.autocomplete.classList.add('show');

    // Wire clicks
    els.autocomplete.querySelectorAll('.guess-autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        els.guessInput.value = matches[parseInt(item.dataset.idx)].name;
        els.autocomplete.classList.remove('show');
        els.guessInput.focus();
      });
    });
  }

  function onInputKeydown(e) {
    const items = els.autocomplete.querySelectorAll('.guess-autocomplete-item');
    if (!items.length) {
      if (e.key === 'Enter') submitGuess();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      acSelectedIdx = Math.min(acSelectedIdx + 1, items.length - 1);
      items.forEach((it, i) => it.classList.toggle('selected', i === acSelectedIdx));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      acSelectedIdx = Math.max(acSelectedIdx - 1, 0);
      items.forEach((it, i) => it.classList.toggle('selected', i === acSelectedIdx));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (acSelectedIdx >= 0 && items[acSelectedIdx]) {
        items[acSelectedIdx].click();
      } else {
        submitGuess();
      }
    } else if (e.key === 'Escape') {
      els.autocomplete.classList.remove('show');
    }
  }

  /* ── Init ─────────────────────────────────────────────────────── */
  async function init() {
    // Load player data
    try {
      const res = await fetch('data/guess-players.json?v=' + Date.now());
      state.players = await res.json();
    } catch (e) {
      console.error('Failed to load player data:', e);
      return;
    }

    // Select round
    state.questions = shuffle(state.players).slice(0, ROUND_COUNT);
    state.index = 0;
    state.score = 0;
    state.aiBeatTotal = 0;
    state.history = [];

    // Wire events
    els.revealBtn.addEventListener('click', revealMore);
    els.submitGuess.addEventListener('click', submitGuess);
    els.nextQuestion.addEventListener('click', nextQuestion);
    els.guessInput.addEventListener('input', onInput);
    els.guessInput.addEventListener('keydown', onInputKeydown);

    // Close autocomplete on outside click
    document.addEventListener('click', (e) => {
      if (!els.guessInput.contains(e.target) && !els.autocomplete.contains(e.target)) {
        els.autocomplete.classList.remove('show');
      }
    });

    // Load first question
    await loadQuestion();

    // Start loading AI models in background (non-blocking)
    loadFaceAPI();
  }

  init();
})();
