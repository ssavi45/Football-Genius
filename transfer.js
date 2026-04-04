/* Football Genius - Transfer Trail
   =================================
   Guess the player from the order of clubs in their career timeline.
*/

(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const ROUND_SIZE = 10;
  const GUESSES_PER_PLAYER = 2;
  const SCORE_CURVE = [10, 8, 6, 4, 2];
  const NORMALIZED_LOGO_SIZE = 42;
  const NORMALIZED_LOGO_PADDING = 3;

  const els = {
    competition: $('#competition'),
    qIndex: $('#qIndex'),
    score: $('#score'),
    potential: $('#potential'),
    guessesLeft: $('#guessesLeft'),
    clubCount: $('#clubCount'),
    revealedCount: $('#revealedCount'),
    trailShell: document.querySelector('.trail-shell'),
    trail: $('#clubTrail'),
    input: $('#guessInput'),
    submit: $('#submitGuess'),
    autocomplete: $('#guessAutocomplete'),
    revealBtn: $('#revealBtn'),
    revealCost: $('#revealCost'),
    next: $('#nextQuestion'),
    result: $('#guessResult'),
    resultText: $('#guessResultText'),
    resultDetail: $('#guessResultDetail'),
    progressFill: $('#progressFill'),
    modal: $('#summaryModal'),
    finalScore: $('#finalScore'),
    roundSummary: $('#roundSummary'),
    saveStatus: $('#saveStatus'),
    roundBreakdown: $('#roundBreakdown'),
    year: $('#year'),
  };

  const state = {
    pool: [],
    searchPool: [],
    questions: [],
    index: 0,
    score: 0,
    guessesLeft: GUESSES_PER_PLAYER,
    revealsUsed: 0,
    answered: false,
    revealAll: false,
    history: [],
    suggestions: [],
    selectedSuggestionIndex: -1,
    lastRevealedIndex: null,
    hasSubmittedGuess: false,
  };

  if (els.year) {
    els.year.textContent = new Date().getFullYear();
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function canonicalize(text = '') {
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseSearchQuery(rawQuery = '') {
    const raw = String(rawQuery || '');
    const trimmed = raw.trim();
    const lower = trimmed.toLowerCase();

    if (lower === '/players') {
      return {
        mode: 'players',
        term: '',
      };
    }

    if (lower.startsWith('/players ')) {
      return {
        mode: 'players',
        term: canonicalize(trimmed.slice(8)),
      };
    }

    return {
      mode: 'default',
      term: canonicalize(raw),
    };
  }

  function prepareSearchEntry(player) {
    const aliases = Array.isArray(player.aliases) ? player.aliases.filter(Boolean) : [];
    const canonicalName = canonicalize(player.name);
    const canonicalAliases = aliases.map((alias) => canonicalize(alias)).filter(Boolean);
    const tokens = new Set(canonicalName.split(' ').filter(Boolean));

    canonicalAliases.forEach((alias) => {
      alias.split(' ').filter(Boolean).forEach((token) => tokens.add(token));
    });

    return {
      name: player.name,
      aliases,
      canonicalName,
      canonicalAliases,
      canonicalTokens: Array.from(tokens),
    };
  }

  function getCurrentQuestion() {
    return state.questions[state.index];
  }

  function getHiddenIndices(question) {
    const indices = [];
    for (let i = 1; i < question.clubs.length - 1; i += 1) {
      indices.push(i);
    }
    return indices;
  }

  function getRevealScore() {
    return SCORE_CURVE[Math.min(state.revealsUsed, SCORE_CURVE.length - 1)];
  }

  function getVisibleIndices(question) {
    const visible = new Set();
    const lastIndex = question.clubs.length - 1;

    visible.add(0);
    visible.add(lastIndex);

    if (state.revealAll) {
      for (let i = 0; i <= lastIndex; i += 1) {
        visible.add(i);
      }
      return visible;
    }

    const hiddenIndices = getHiddenIndices(question);
    const revealCount = Math.min(state.revealsUsed, hiddenIndices.length);
    for (let i = 0; i < revealCount; i += 1) {
      visible.add(hiddenIndices[i]);
    }

    return visible;
  }

  function getRevealCount(question) {
    if (state.revealAll) return question.clubs.length;
    return getVisibleIndices(question).size;
  }

  function makeFallbackBadge(label) {
    const initials = label
      .split(/\s+/)
      .map((part) => part[0] || '')
      .join('')
      .slice(0, 3)
      .toUpperCase() || '?';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#4fbcff"/>
            <stop offset="100%" stop-color="#2ecc71"/>
          </linearGradient>
        </defs>
        <path d="M48 6 78 16v27c0 22-14 38-30 47C32 81 18 65 18 43V16L48 6Z" fill="url(#g)" />
        <path d="M48 13.5 72 21v21.6c0 18-10.8 31.2-24 39.4C34.8 73.8 24 60.6 24 42.6V21l24-7.5Z" fill="rgba(6,14,8,0.25)" />
        <text x="48" y="56" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#ffffff">${initials}</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function normalizeBadgeImage(img) {
    if (!img || img.dataset.normalized === 'true' || !img.complete) return;

    const naturalWidth = img.naturalWidth || 0;
    const naturalHeight = img.naturalHeight || 0;
    if (!naturalWidth || !naturalHeight) return;

    const buffer = document.createElement('canvas');
    buffer.width = naturalWidth;
    buffer.height = naturalHeight;

    const bufferCtx = buffer.getContext('2d', { willReadFrequently: true });
    if (!bufferCtx) return;

    bufferCtx.clearRect(0, 0, naturalWidth, naturalHeight);
    bufferCtx.drawImage(img, 0, 0, naturalWidth, naturalHeight);

    const imageData = bufferCtx.getImageData(0, 0, naturalWidth, naturalHeight).data;
    let minX = naturalWidth;
    let minY = naturalHeight;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < naturalHeight; y += 1) {
      for (let x = 0; x < naturalWidth; x += 1) {
        const alpha = imageData[(y * naturalWidth + x) * 4 + 3];
        if (alpha > 8) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      img.dataset.normalized = 'true';
      return;
    }

    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;
    const output = document.createElement('canvas');
    output.width = NORMALIZED_LOGO_SIZE;
    output.height = NORMALIZED_LOGO_SIZE;

    const outputCtx = output.getContext('2d');
    if (!outputCtx) return;

    const drawableSize = NORMALIZED_LOGO_SIZE - (NORMALIZED_LOGO_PADDING * 2);
    const scale = Math.min(drawableSize / cropWidth, drawableSize / cropHeight);
    const drawWidth = cropWidth * scale;
    const drawHeight = cropHeight * scale;
    const offsetX = (NORMALIZED_LOGO_SIZE - drawWidth) / 2;
    const offsetY = (NORMALIZED_LOGO_SIZE - drawHeight) / 2;

    outputCtx.clearRect(0, 0, output.width, output.height);
    outputCtx.drawImage(
      buffer,
      minX,
      minY,
      cropWidth,
      cropHeight,
      offsetX,
      offsetY,
      drawWidth,
      drawHeight
    );

    img.dataset.normalized = 'true';
    img.src = output.toDataURL('image/png');
  }

  function clearAutocomplete() {
    state.suggestions = [];
    state.selectedSuggestionIndex = -1;
    els.autocomplete.classList.remove('show');
    els.autocomplete.classList.remove('command-mode');
    els.autocomplete.replaceChildren();
  }

  function setResult(type, title, detail = '') {
    els.result.className = `transfer-result show ${type}`;
    els.resultText.textContent = title;
    els.resultDetail.textContent = detail;
  }

  function clearResult() {
    els.result.className = 'transfer-result';
    els.resultText.textContent = '';
    els.resultDetail.textContent = '';
  }

  function updateHud() {
    const question = getCurrentQuestion();
    const totalQuestions = state.questions.length || ROUND_SIZE;

    els.qIndex.textContent = Math.min(state.index + 1, totalQuestions);
    els.score.textContent = state.score;
    els.potential.textContent = getRevealScore();
    els.guessesLeft.textContent = state.guessesLeft;

    if (question) {
      els.clubCount.textContent = question.clubs.length;
      els.revealedCount.textContent = getRevealCount(question);
    }
  }

  function updateProgress() {
    const total = state.questions.length || ROUND_SIZE;
    const completed = state.index;
    els.progressFill.style.width = `${(completed / total) * 100}%`;
  }

  function updateCompetitionCopy() {
    const question = getCurrentQuestion();
    if (!question) return;

    const hiddenRemaining = getHiddenIndices(question).length - Math.min(state.revealsUsed, getHiddenIndices(question).length);
    els.competition.textContent = `${question.clubs.length} clubs in the trail. ${hiddenRemaining} hidden stop${hiddenRemaining === 1 ? '' : 's'} left.`;
  }

  function updateRevealButton() {
    const question = getCurrentQuestion();
    if (!question) return;

    const hiddenIndices = getHiddenIndices(question);
    const hiddenRemaining = hiddenIndices.length - Math.min(state.revealsUsed, hiddenIndices.length);

    if (state.answered) {
      els.revealBtn.disabled = true;
      els.revealCost.textContent = '';
      return;
    }

    if (hiddenRemaining <= 0) {
      els.revealBtn.disabled = true;
      els.revealCost.textContent = '(all shown)';
      return;
    }

    els.revealBtn.disabled = false;
    if (state.revealsUsed >= SCORE_CURVE.length - 1) {
      els.revealCost.textContent = '(score floor)';
      return;
    }

    const currentScore = SCORE_CURVE[state.revealsUsed];
    const nextScore = SCORE_CURVE[state.revealsUsed + 1];
    els.revealCost.textContent = `(-${currentScore - nextScore} pts)`;
  }

  function createTrailStep(club, index, isVisible, isEndpoint, isNewReveal) {
    const isFirst = index === 0;
    const isLast = index === getCurrentQuestion().clubs.length - 1;
    const stateClass = isFirst
      ? ' is-first'
      : isLast
        ? ' is-last'
        : isVisible
          ? ' is-revealed'
          : ' is-locked';

    const step = document.createElement('div');
    step.className = `trail-step ${isVisible ? 'is-visible' : 'is-hidden'}${isEndpoint ? ' is-endpoint' : ''}${isNewReveal ? ' revealed-now' : ''}${stateClass}`;
    step.dataset.index = String(index);

    const order = document.createElement('div');
    order.className = 'trail-order';
    order.textContent = String(index + 1);
    step.appendChild(order);

    const badge = document.createElement('div');
    badge.className = `trail-badge${isVisible ? '' : ' is-hidden'}`;

    if (isVisible) {
      const img = document.createElement('img');
      img.addEventListener('load', () => {
        normalizeBadgeImage(img);
      });
      img.alt = club.label;
      img.loading = 'lazy';
      img.onerror = () => {
        img.onerror = null;
        img.src = makeFallbackBadge(club.label);
      };
      img.src = club.logo || makeFallbackBadge(club.label);
      badge.appendChild(img);
    }

    const name = document.createElement('div');
    name.className = 'trail-name';
    name.textContent = isVisible ? club.label : 'Hidden Club';

    const tag = document.createElement('div');
    tag.className = 'trail-tag';
    if (isFirst) {
      tag.textContent = 'First Club';
      tag.classList.add('is-first');
    } else if (isLast) {
      tag.textContent = 'Current / Last';
      tag.classList.add('is-last');
    } else if (isVisible) {
      tag.textContent = 'Revealed';
      tag.classList.add('is-revealed');
    } else {
      tag.textContent = 'Locked';
      tag.classList.add('is-locked');
    }

    step.appendChild(badge);
    step.appendChild(name);
    step.appendChild(tag);

    return step;
  }

  function syncTrailLayout(options = {}) {
    const { reset = false, focusIndex = null } = options;
    if (!els.trailShell || !els.trail) return;

    window.requestAnimationFrame(() => {
      const overflow = els.trail.scrollWidth > els.trailShell.clientWidth - 8;
      els.trailShell.classList.toggle('is-scrollable', overflow);
      els.trail.classList.toggle('is-scrollable', overflow);

      if (reset) {
        els.trailShell.scrollLeft = 0;
      }

      if (!overflow || focusIndex === null || focusIndex === undefined) return;

      const step = els.trail.querySelector(`.trail-step[data-index="${focusIndex}"]`);
      if (step) {
        step.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    });
  }

  function renderTrail() {
    const question = getCurrentQuestion();
    if (!question) return;

    const visibleIndices = getVisibleIndices(question);
    els.trail.replaceChildren();

    question.clubs.forEach((club, index) => {
      const isVisible = visibleIndices.has(index);
      const isEndpoint = index === 0 || index === question.clubs.length - 1;
      const isNewReveal = isVisible && state.lastRevealedIndex === index;
      els.trail.appendChild(createTrailStep(club, index, isVisible, isEndpoint, isNewReveal));

      if (index < question.clubs.length - 1) {
        const link = document.createElement('div');
        const nextVisible = visibleIndices.has(index) && visibleIndices.has(index + 1);
        link.className = `trail-link${nextVisible ? '' : ' is-hidden'}`;
        els.trail.appendChild(link);
      }
    });

    syncTrailLayout({
      reset: state.lastRevealedIndex === null,
      focusIndex: state.lastRevealedIndex,
    });
  }

  function getSuggestions(query) {
    const parsedQuery = parseSearchQuery(query);
    const normalizedQuery = parsedQuery.term;

    if (parsedQuery.mode !== 'players' && !normalizedQuery) return [];

    const matches = state.searchPool
      .filter((player) => {
        if (parsedQuery.mode === 'players' && !normalizedQuery) return true;
        if (player.canonicalName.startsWith(normalizedQuery)) return true;
        if (player.canonicalAliases.some((alias) => alias.startsWith(normalizedQuery))) return true;
        return player.canonicalTokens.some((token) => token.startsWith(normalizedQuery));
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
;

    if (parsedQuery.mode === 'players') {
      return matches;
    }

    return matches.slice(0, 8);
  }

  function renderAutocomplete() {
    els.autocomplete.replaceChildren();

    const parsedQuery = parseSearchQuery(els.input.value);

    if (!state.suggestions.length || state.answered) {
      els.autocomplete.classList.remove('show');
      els.autocomplete.classList.remove('command-mode');
      return;
    }

    els.autocomplete.classList.toggle('command-mode', parsedQuery.mode === 'players');

    state.suggestions.forEach((player, index) => {
      const item = document.createElement('div');
      item.className = `transfer-autocomplete-item${index === state.selectedSuggestionIndex ? ' selected' : ''}`;
      item.addEventListener('mousedown', (event) => {
        event.preventDefault();
        pickSuggestion(index);
      });

      const name = document.createElement('div');
      name.className = 'transfer-autocomplete-name';
      name.textContent = player.name;

      item.appendChild(name);
      els.autocomplete.appendChild(item);
    });

    els.autocomplete.classList.add('show');
  }

  function pickSuggestion(index) {
    const player = state.suggestions[index];
    if (!player) return;
    els.input.value = player.name;
    clearAutocomplete();
    els.input.focus();
  }

  function updateAutocomplete() {
    state.selectedSuggestionIndex = -1;
    state.suggestions = getSuggestions(els.input.value);
    renderAutocomplete();
  }

  function isCorrectGuess(question, value) {
    const normalizedValue = canonicalize(value);
    if (!normalizedValue) return false;

    const accepted = [question.name, ...(question.aliases || [])].map((entry) => canonicalize(entry));
    return accepted.includes(normalizedValue);
  }

  function getTrailSummary(question) {
    return question.clubs.map((club) => club.label).join(' -> ');
  }

  function finalizeQuestion(isCorrect) {
    const question = getCurrentQuestion();
    const earned = isCorrect ? getRevealScore() : 0;
    const attemptsUsed = GUESSES_PER_PLAYER - state.guessesLeft + (isCorrect ? 1 : 0);

    if (isCorrect) {
      state.score += earned;
      setResult(
        'correct',
        `${question.name} for ${earned} points.`,
        `Solved after ${state.revealsUsed} reveal${state.revealsUsed === 1 ? '' : 's'}.`
      );
    } else {
      setResult(
        'wrong',
        `Out of guesses. It was ${question.name}.`,
        'The full trail is visible above.'
      );
    }

    state.answered = true;
    state.revealAll = true;
    state.lastRevealedIndex = null;
    state.history.push({
      name: question.name,
      score: earned,
      reveals: state.revealsUsed,
      attempts: Math.max(1, attemptsUsed),
      correct: isCorrect,
    });

    els.input.disabled = true;
    els.submit.disabled = true;
    els.next.hidden = !state.hasSubmittedGuess;
    els.next.disabled = !state.hasSubmittedGuess;
    els.next.textContent = state.index === state.questions.length - 1 ? 'See Results' : 'Next Player';

    updateHud();
    updateRevealButton();
    updateCompetitionCopy();
    renderTrail();
  }

  function submitGuess() {
    if (state.answered) return;

    const value = els.input.value.trim();
    if (!value) {
      setResult('info', 'Type a player name first.', 'Use the autocomplete if you want a quick exact match.');
      return;
    }

    if (parseSearchQuery(value).mode === 'players') {
      setResult('info', 'Browse mode is open.', 'Pick a player from the list, or remove `/players` to make a direct guess.');
      return;
    }

    state.hasSubmittedGuess = true;

    const question = getCurrentQuestion();
    if (isCorrectGuess(question, value)) {
      finalizeQuestion(true);
      return;
    }

    state.guessesLeft -= 1;
    updateHud();

    if (state.guessesLeft > 0) {
      const guessLabel = state.guessesLeft === 1 ? 'guess' : 'guesses';
      setResult('info', 'Not quite.', `You have ${state.guessesLeft} ${guessLabel} left. Keep reading the trail or reveal another club.`);
      return;
    }

    finalizeQuestion(false);
  }

  function revealNextClub() {
    if (state.answered) return;

    const question = getCurrentQuestion();
    const hiddenIndices = getHiddenIndices(question);
    if (state.revealsUsed >= hiddenIndices.length) return;

    state.lastRevealedIndex = hiddenIndices[state.revealsUsed];
    state.revealsUsed += 1;

    updateHud();
    updateRevealButton();
    updateCompetitionCopy();
    renderTrail();
    setResult('info', 'Next club revealed.', `Potential score is now ${getRevealScore()} points.`);
  }

  function loadQuestion() {
    const question = getCurrentQuestion();
    if (!question) return;

    state.guessesLeft = GUESSES_PER_PLAYER;
    state.revealsUsed = 0;
    state.answered = false;
    state.revealAll = false;
    state.lastRevealedIndex = null;
    state.hasSubmittedGuess = false;

    els.input.value = '';
    els.input.disabled = false;
    els.submit.disabled = false;
    els.next.hidden = true;
    els.next.disabled = true;

    clearAutocomplete();
    updateHud();
    updateProgress();
    updateRevealButton();
    updateCompetitionCopy();
    renderTrail();
    clearResult();
  }

  function nextQuestion() {
    if (state.index >= state.questions.length - 1) {
      finishRound();
      return;
    }

    state.index += 1;
    loadQuestion();
  }

  function renderBreakdown() {
    els.roundBreakdown.replaceChildren();

    state.history.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'transfer-breakdown-item';

      const copy = document.createElement('div');
      copy.className = 'transfer-breakdown-copy';

      const name = document.createElement('div');
      name.className = 'transfer-breakdown-name';
      name.textContent = item.name;

      const meta = document.createElement('div');
      meta.className = 'transfer-breakdown-meta';
      meta.textContent = item.correct
        ? `${item.score} pts, ${item.reveals} reveal${item.reveals === 1 ? '' : 's'}, solved in ${item.attempts} guess${item.attempts === 1 ? '' : 'es'}`
        : `Missed after ${GUESSES_PER_PLAYER} guesses`;

      const score = document.createElement('div');
      score.className = 'transfer-breakdown-score';
      score.textContent = item.correct ? `+${item.score}` : '0';

      copy.appendChild(name);
      copy.appendChild(meta);
      row.appendChild(copy);
      row.appendChild(score);
      els.roundBreakdown.appendChild(row);
    });
  }

  async function saveRoundScore() {
    els.saveStatus.textContent = '';
    els.saveStatus.className = 'transfer-summary-save';

    if (!window.auth || typeof window.auth.saveScore !== 'function') {
      els.saveStatus.textContent = 'Sign in to save this score to the leaderboard.';
      return;
    }

    try {
      const result = await window.auth.saveScore('transfer', state.score);
      if (result && result.error) {
        els.saveStatus.textContent = 'Sign in to save this score to the leaderboard.';
        els.saveStatus.classList.add('error');
        return;
      }

      els.saveStatus.textContent = 'Score saved to JourneyMan.';
      els.saveStatus.classList.add('success');
    } catch (_err) {
      els.saveStatus.textContent = 'Could not save score right now.';
      els.saveStatus.classList.add('error');
    }
  }

  async function finishRound() {
    els.finalScore.textContent = String(state.score);

    const correctAnswers = state.history.filter((item) => item.correct).length;
    els.roundSummary.textContent = `You solved ${correctAnswers} of ${state.history.length} trails this round.`;

    renderBreakdown();
    els.modal.hidden = false;
    updateProgress();
    els.progressFill.style.width = '100%';

    await saveRoundScore();
  }

  async function init() {
    try {
      if (!window.PlayerData || typeof window.PlayerData.getTransferPlayers !== 'function') {
        throw new Error('Transfer data loader missing.');
      }

      const players = await window.PlayerData.getTransferPlayers();
      if (!Array.isArray(players) || players.length < ROUND_SIZE) {
        throw new Error('Not enough transfer trails to start a round.');
      }

      const searchPlayers = typeof window.PlayerData.getPlayerSearchIndex === 'function'
        ? await window.PlayerData.getPlayerSearchIndex()
        : [];

      state.pool = players;
      state.searchPool = (Array.isArray(searchPlayers) && searchPlayers.length ? searchPlayers : players)
        .map((player) => prepareSearchEntry(player));
      state.questions = shuffle(players).slice(0, ROUND_SIZE);

      loadQuestion();
    } catch (err) {
      els.competition.textContent = 'JourneyMan could not load.';
      els.trail.replaceChildren();
      setResult('wrong', 'Unable to start the game.', err.message || 'Please refresh and try again.');
      els.input.disabled = true;
      els.submit.disabled = true;
      els.revealBtn.disabled = true;
    }
  }

  els.submit.addEventListener('click', submitGuess);
  els.revealBtn.addEventListener('click', revealNextClub);
  els.next.addEventListener('click', nextQuestion);

  els.input.addEventListener('input', updateAutocomplete);
  els.input.addEventListener('focus', () => {
    if (els.input.value.trim()) updateAutocomplete();
  });
  els.input.addEventListener('blur', () => {
    window.setTimeout(clearAutocomplete, 120);
  });

  els.input.addEventListener('keydown', (event) => {
    if (!state.suggestions.length) {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitGuess();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      state.selectedSuggestionIndex = (state.selectedSuggestionIndex + 1) % state.suggestions.length;
      renderAutocomplete();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      state.selectedSuggestionIndex = state.selectedSuggestionIndex <= 0
        ? state.suggestions.length - 1
        : state.selectedSuggestionIndex - 1;
      renderAutocomplete();
      return;
    }

    if (event.key === 'Escape') {
      clearAutocomplete();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (state.selectedSuggestionIndex >= 0) {
        pickSuggestion(state.selectedSuggestionIndex);
      } else {
        submitGuess();
      }
    }
  });

  window.addEventListener('resize', () => {
    syncTrailLayout();
  });

  init();
})();
