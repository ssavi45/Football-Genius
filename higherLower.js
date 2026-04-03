(() => {
  const els = {
    modeLabel: document.getElementById('modeLabel'),
    score: document.getElementById('score'),
    best: document.getElementById('best'),
    streak: document.getElementById('streak'),
    feedback: document.getElementById('feedback'),
    year: document.getElementById('year'),
    statSelect: document.getElementById('statSelect'),
    left: {
      card: document.getElementById('leftCard'),
      img: document.getElementById('leftImg'),
      name: document.getElementById('leftName'),
      label: document.getElementById('leftLabel'),
      value: document.getElementById('leftValue'),
      xfer: document.getElementById('leftXfer')
    },
    right: {
      card: document.getElementById('rightCard'),
      img: document.getElementById('rightImg'),
      name: document.getElementById('rightName'),
      label: document.getElementById('rightLabel'),
      value: document.getElementById('rightValue'),
      xfer: document.getElementById('rightXfer')
    },
    arena: document.querySelector('main.arena'),
    overlay: {
      el: document.getElementById('roundOverlay'),
      score: document.getElementById('overlayScore'),
      newRound: document.getElementById('overlayNewRound'),
      changeStat: document.getElementById('overlayChangeStat')
    }
  };
  if (els.year) els.year.textContent = new Date().getFullYear();

  const HEADSHOT_OUTPUT_SIZE = 360;
  const headshotCache = new Map();
  const HEADSHOT_ZOOM_MIN = 0.64;
  const HEADSHOT_ZOOM_MAX = 0.72;
  const HEADSHOT_ZOOM_ADJUST = 0.02;
  const HEADSHOT_VERTICAL_SHIFT = 0.04;
  const HEADSHOT_MIN_Y = 0.24;
  const HEADSHOT_MAX_Y = 0.32;
  const HEADSHOT_FRAMES = {
    default: { zoom: 0.64, x: 0.5, y: 0.28 },
    messi: { zoom: 0.62, x: 0.5, y: 0.24 },
    ronaldo: { zoom: 0.62, x: 0.5, y: 0.22 },
    mbappe: { zoom: 0.62, x: 0.5, y: 0.22 },
    haaland: { zoom: 0.6, x: 0.5, y: 0.2 },
    bellingham: { zoom: 0.63, x: 0.5, y: 0.2 },
    neymar: { zoom: 0.62, x: 0.5, y: 0.22 },
    lewandowski: { zoom: 0.7, x: 0.5, y: 0.3 },
    benzema: { zoom: 0.62, x: 0.5, y: 0.23 },
    modric: { zoom: 0.58, x: 0.5, y: 0.21 },
    bruyne: { zoom: 0.6, x: 0.5, y: 0.2 },
    zlatan: { zoom: 0.6, x: 0.5, y: 0.18 },
    rooney: { zoom: 0.62, x: 0.5, y: 0.2 },
    henry: { zoom: 0.6, x: 0.5, y: 0.2 },
    drogba: { zoom: 0.61, x: 0.5, y: 0.21 },
    lampard: { zoom: 0.56, x: 0.5, y: 0.16 },
    salah: { zoom: 0.62, x: 0.5, y: 0.22 },
    kane: { zoom: 0.6, x: 0.5, y: 0.21 },
    vinicius: { zoom: 0.62, x: 0.5, y: 0.22 },
    valverde: { zoom: 0.6, x: 0.5, y: 0.22 },
    rodri: { zoom: 0.6, x: 0.5, y: 0.2 },
    bernardo: { zoom: 0.54, x: 0.5, y: 0.17 },
    foden: { zoom: 0.6, x: 0.5, y: 0.18 },
    palmer: { zoom: 0.6, x: 0.5, y: 0.18 },
    saka: { zoom: 0.66, x: 0.5, y: 0.25 }
  };

  function getHeadshotFrame(playerId) {
    const baseFrame = HEADSHOT_FRAMES[playerId] || HEADSHOT_FRAMES.default;
    return {
      x: baseFrame.x,
      zoom: Math.max(HEADSHOT_ZOOM_MIN, Math.min(HEADSHOT_ZOOM_MAX, baseFrame.zoom + HEADSHOT_ZOOM_ADJUST)),
      y: Math.max(HEADSHOT_MIN_Y, Math.min(HEADSHOT_MAX_Y, baseFrame.y + HEADSHOT_VERTICAL_SHIFT))
    };
  }

  const CATEGORIES = {
    goals: { key: 'careerGoals', label: 'Career goals', unit: 'goals' },
    trophies: { key: 'careerTrophies', label: 'Career trophies', unit: 'trophies' },
    transfer: { key: 'transfer.fee', label: 'Transfer fee', unit: 'USD millions' },
    value: { key: 'marketValue', label: 'Market value', unit: 'USD millions' }
  };

  // Club logos available in your img/teams folder
  const TEAM_LOGOS = {
    'barcelona': 'img/teams/fcb.png',
    'fc barcelona': 'img/teams/fcb.png',
    'psg': 'img/teams/psg.png',
    'real madrid': 'img/teams/rmcf.png',
    'juventus': 'img/teams/juve.png',
    'monaco': 'img/teams/monaco.png',
    'borussia dortmund': 'img/teams/bvb.png',
    'manchester city': 'img/teams/mancity.png',
    'bayern munich': 'img/teams/bayern.png',
    'arsenal': 'img/teams/afc.png',
    'chelsea': 'img/teams/cfc.png',
    'inter': 'img/teams/inter.png',
    'tottenham': 'img/teams/spurs.png',
    'liverpool': 'img/teams/lfc.png',
    'manchester united': 'img/teams/manu.png',
    'everton': 'img/teams/efc.png',
    'west ham': 'img/teams/whu.png',
    'bayer leverkusen': 'img/teams/leverkusen.png',
    'newcastle united': 'img/teams/nufc.png',
    'napoli': 'img/teams/napoli.png',
    'porto': 'img/teams/porto.png',
    'sporting': 'img/teams/sporting.png',
    'ajax': 'img/teams/ajax.png',
    'celtic': 'img/teams/celtic.png',
    'atletico madrid': 'img/teams/atletico.png'
  };

  const state = {
    players: [],
    pool: [],
    left: null,
    right: null,
    score: 0,
    streak: 0,
    category: 'goals',
    canPick: false,
    revealed: new Set(),
    statSwitchEnabled: false,
    // keep-limit logic: track last kept player and how many consecutive times they were kept
    keep: { id: null, count: 0 } // count is number of consecutive "keeps" (max 1)
  };

  function syncStatPicker(value) {
    if (els.statSelect) els.statSelect.value = value;
    document.querySelectorAll('.stat-chip').forEach((button) => {
      const isActive = button.dataset.stat === value;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function setStatSwitchEnabled(enabled) {
    state.statSwitchEnabled = enabled;
    document.querySelectorAll('.stat-chip').forEach((button) => {
      button.disabled = !enabled;
    });
  }

  function cropHeadshot(src, playerId) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        if (!width || !height) {
          reject(new Error('Invalid image dimensions'));
          return;
        }

        const frame = getHeadshotFrame(playerId);
        const shorterSide = Math.min(width, height);
        const cropSize = Math.round(shorterSide * frame.zoom);
        const focusX = width * frame.x;
        const focusY = height * frame.y;
        const maxX = Math.max(0, width - cropSize);
        const maxY = Math.max(0, height - cropSize);
        const sourceX = Math.max(0, Math.min(maxX, Math.round(focusX - cropSize / 2)));
        const sourceY = Math.max(0, Math.min(maxY, Math.round(focusY - cropSize / 2)));

        const canvas = document.createElement('canvas');
        canvas.width = HEADSHOT_OUTPUT_SIZE;
        canvas.height = HEADSHOT_OUTPUT_SIZE;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unavailable'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          cropSize,
          cropSize,
          0,
          0,
          HEADSHOT_OUTPUT_SIZE,
          HEADSHOT_OUTPUT_SIZE
        );

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  async function applyHeadshot(imgEl, player) {
    const src = player?.image;
    const name = player?.name || 'Player';
    imgEl.alt = name;

    if (!src) {
      imgEl.src = '';
      return;
    }

    imgEl.dataset.playerId = player.id;

    const cacheKey = `${player.id}:${src}`;
    let cacheEntry = headshotCache.get(cacheKey);
    if (!cacheEntry) {
      cacheEntry = cropHeadshot(src, player.id).catch(() => src);
      headshotCache.set(cacheKey, cacheEntry);
    }

    const finalSrc = await cacheEntry;
    if (imgEl.dataset.playerId === player.id) {
      imgEl.src = finalSrc;
    }
  }

  const revealKey = (p, cat = state.category) => `${cat}:${p.id}`;

  // Gather revealed player ids for the current category
  function revealedIds() {
    const ids = new Set();
    for (const k of state.revealed) {
      const [cat, id] = k.split(':');
      if (cat === state.category) ids.add(id);
    }
    return ids;
  }

  function getBestKey() { return `hl_best_${state.category}`; }
  function getBest() { return Number(localStorage.getItem(getBestKey()) || 0); }
  function setBest(v) { localStorage.setItem(getBestKey(), String(v)); }

  function getStatRaw(p, cat = state.category) {
    const k = CATEGORIES[cat].key;
    if (k.includes('.')) {
      const [a, b] = k.split('.');
      return p.stats?.[a]?.[b] ?? null;
    }
    return p.stats?.[k] ?? null;
  }

  function formatValue(cat, val) {
    if (val == null) return '—';
    if (cat === 'transfer' || cat === 'value') return `$${Number(val).toLocaleString()} m`;
    return `${Number(val).toLocaleString()}`;
  }

  function pickRandom(pool, excludeIds = new Set()) {
    const filtered = pool.filter(p => !excludeIds.has(p.id));
    const arr = filtered.length ? filtered : pool;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function buildPoolForCategory(cat) {
    return state.players.filter(p => typeof getStatRaw(p, cat) === 'number');
  }

  function setPickable(can) {
    state.canPick = can;
    els.left.card.toggleAttribute('data-disabled', !can);
    els.right.card.toggleAttribute('data-disabled', !can);
  }

  function clubLogo(teamName) {
    if (!teamName) return null;
    const key = teamName.toLowerCase().trim();
    return TEAM_LOGOS[key] || null;
  }

  function renderTransfer(el, p) {
    const tr = p.stats?.transfer;
    if (!tr) { el.style.display = 'none'; el.innerHTML = ''; return; }
    const fromLogo = clubLogo(tr.from);
    const toLogo = clubLogo(tr.to);
    const fromHTML = fromLogo
      ? `<span class="club-pill"><img class="logo" src="${fromLogo}" alt="${tr.from} logo"/><span>${tr.from}</span></span>`
      : `<span class="club-pill"><span>${tr.from}</span></span>`;
    const toHTML = toLogo
      ? `<span class="club-pill"><img class="logo" src="${toLogo}" alt="${tr.to} logo"/><span>${tr.to}</span></span>`
      : `<span class="club-pill"><span>${tr.to}</span></span>`;
    el.innerHTML = `${fromHTML}<span class="arrow">➜</span>${toHTML}`;
    el.style.display = 'flex';
  }

  function renderCards(initial = false) {
    const cat = state.category;
    const meta = CATEGORIES[cat];

    els.modeLabel.textContent = meta.label;

    // Left
    void applyHeadshot(els.left.img, state.left);
    els.left.name.textContent = state.left.name;
    els.left.label.textContent = meta.label;  // same label on both
    els.left.value.textContent = state.revealed.has(revealKey(state.left))
      ? formatValue(cat, getStatRaw(state.left))
      : '?';

    // Right
    void applyHeadshot(els.right.img, state.right);
    els.right.name.textContent = state.right.name;
    els.right.label.textContent = meta.label; // same label on both
    els.right.value.textContent = state.revealed.has(revealKey(state.right))
      ? formatValue(cat, getStatRaw(state.right))
      : '?';

    if (cat === 'transfer') {
      renderTransfer(els.left.xfer, state.left);
      renderTransfer(els.right.xfer, state.right);
    } else {
      els.left.xfer.style.display = 'none';
      els.right.xfer.style.display = 'none';
    }

    if (!initial) {
      els.left.card.classList.remove('flash-win', 'flash-lose');
      els.right.card.classList.remove('flash-win', 'flash-lose');
    }

    els.score.textContent = state.score;
    els.streak.textContent = state.streak;
    els.best.textContent = getBest();
    els.feedback.textContent = '';
  }

  function showRoundOver() {
    els.overlay.score.textContent = state.score;
    els.overlay.el.hidden = false;
    els.arena.classList.add('round-over');
    setPickable(false);
    setStatSwitchEnabled(true);

    // Save score to Supabase
    if (window.auth?.saveScore) window.auth.saveScore('higherlower', state.score);
  }

  function hideRoundOver() {
    els.overlay.el.hidden = true;
    els.arena.classList.remove('round-over');
  }

  function computeKeepSide(pickedSide) {
    // Intended behavior: chosen side stays
    let keepSide = pickedSide;
    const intendedId = state[pickedSide].id;

    // If we would keep the same player more than once in a row, force switch
    // This enforces: a player can appear in at most two consecutive comparisons.
    if (state.keep.id === intendedId && state.keep.count >= 1) {
      keepSide = pickedSide === 'left' ? 'right' : 'left';
      state.keep.id = state[keepSide].id;
      state.keep.count = 1; // opponent now begins their own keep run
    } else {
      // keep the intended one and update counters
      if (state.keep.id === intendedId) {
        state.keep.count += 1;
      } else {
        state.keep.id = intendedId;
        state.keep.count = 1;
      }
    }
    return keepSide;
  }

  function spawnNewOpponentKeeping(keepSide, incrementScore = true) {
    if (incrementScore) {
      state.score += 1;
      state.streak += 1;
      if (state.score > getBest()) setBest(state.score);
    }

    const replaceSide = keepSide === 'left' ? 'right' : 'left';

    // Exclude revealed and the kept player's id
    const excluded = revealedIds();
    excluded.add(state[keepSide].id);

    const candidates = state.pool.filter(p => !excluded.has(p.id));

    if (candidates.length === 0) {
      els.feedback.textContent = 'No more new players left in this mode.';
      showRoundOver();
      return;
    }

    state[replaceSide] = candidates[Math.floor(Math.random() * candidates.length)];
    renderCards();
    setPickable(true);
  }

  function startRound(cat = state.category) {
    state.category = cat;
    syncStatPicker(cat);
    setStatSwitchEnabled(true);
    state.pool = buildPoolForCategory(cat);
    state.revealed = new Set();
    state.keep = { id: null, count: 0 };
    hideRoundOver();

    if (state.pool.length < 2) {
      els.feedback.textContent = 'Not enough data for this stat. Please choose another.';
      setPickable(false);
      setStatSwitchEnabled(true);
      return;
    }
    state.score = 0;
    state.streak = 0;

    state.left = pickRandom(state.pool);
    let right = pickRandom(state.pool, new Set([state.left.id]));
    if (!right || right.id === state.left.id) {
      right = state.pool.find(p => p.id !== state.left.id) || state.pool[0];
    }
    state.right = right;

    renderCards(true);
    setPickable(true);
  }

  function onPick(side) {
    if (!state.canPick) return;
    setPickable(false);
    setStatSwitchEnabled(false);

    const cat = state.category;
    const leftVal = getStatRaw(state.left, cat);
    const rightVal = getStatRaw(state.right, cat);

    state.revealed.add(revealKey(state.left));
    state.revealed.add(revealKey(state.right));
    els.left.value.textContent  = formatValue(cat, leftVal);
    els.right.value.textContent = formatValue(cat, rightVal);

    const pickedCard = side === 'left' ? els.left.card : els.right.card;
    const otherCard  = side === 'left' ? els.right.card : els.left.card;

    if (leftVal === rightVal) {
      els.feedback.textContent = 'Equal! Free point.';
      els.left.card.classList.add('flash-win');
      els.right.card.classList.add('flash-win');
      const keepSide = computeKeepSide(side);
      setTimeout(() => spawnNewOpponentKeeping(keepSide, true), 1000);
      return;
    }

    const pickedVal = side === 'left' ? leftVal : rightVal;
    const otherVal  = side === 'left' ? rightVal : leftVal;
    const correct = pickedVal > otherVal;

    if (correct) {
      pickedCard.classList.add('flash-win');
      els.feedback.textContent = 'Correct!';
      const keepSide = computeKeepSide(side);
      setTimeout(() => spawnNewOpponentKeeping(keepSide, true), 1000);
    } else {
      pickedCard.classList.add('flash-lose');
      otherCard.classList.add('flash-win');
      els.feedback.textContent = `Wrong! Your run ended at ${state.score}.`;
      // Blur and show overlay button with a slick animation
      setTimeout(showRoundOver, 250);
    }

    els.score.textContent = state.score;
    els.streak.textContent = state.streak;
    els.best.textContent = getBest();
  }

  async function loadData() {
    state.players = await window.PlayerData.getGlobalPlayers();
  }

  function wireEvents() {
    els.left.card.addEventListener('click', () => onPick('left'));
    els.right.card.addEventListener('click', () => onPick('right'));
    els.overlay.newRound.addEventListener('click', () => startRound(state.category));
    els.overlay.changeStat.addEventListener('click', () => {
      hideRoundOver();
      setStatSwitchEnabled(true);
      document.querySelector('.stat-chip.active')?.focus();
    });
    els.statSelect.addEventListener('change', (e) => {
      if (!state.statSwitchEnabled && e.target.value !== state.category) {
        e.target.value = state.category;
        return;
      }
      startRound(e.target.value);
    });
    document.querySelectorAll('.stat-chip').forEach((button) => {
      button.addEventListener('click', () => {
        if (!state.statSwitchEnabled && button.dataset.stat !== state.category) return;
        startRound(button.dataset.stat);
      });
    });
  }

  (async function init() {
    wireEvents();
    await loadData();
    startRound(els.statSelect?.value || 'goals');
  })();
})();
