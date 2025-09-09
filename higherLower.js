(() => {
  const els = {
    modeLabel: document.getElementById('modeLabel'),
    score: document.getElementById('score'),
    best: document.getElementById('best'),
    streak: document.getElementById('streak'),
    feedback: document.getElementById('feedback'),
    year: document.getElementById('year'),
    statSelect: document.getElementById('statSelect'),
    newRound: document.getElementById('newRound'),
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
    }
  };
  if (els.year) els.year.textContent = new Date().getFullYear();

  const CATEGORIES = {
    goals: { key: 'careerGoals', label: 'Career goals', unit: 'goals' },
    trophies: { key: 'careerTrophies', label: 'Career trophies', unit: 'trophies' },
    transfer: { key: 'transfer.fee', label: 'Transfer fee', unit: 'USD millions' },
    value: { key: 'marketValue', label: 'Market value', unit: 'USD millions' }
  };

  // Club logos available in your img folder
  const TEAM_LOGOS = {
    'barcelona': 'img/fcb.png',
    'fc barcelona': 'img/fcb.png',
    'psg': 'img/psg.png',
    'real madrid': 'img/rmcf.png',
    'juventus': 'img/juve.png',
    'monaco': 'img/monaco.png',
    'borussia dortmund': 'img/bvb.png',
    'manchester city': 'img/mancity.png',
    'bayern munich': 'img/bayern.png',
    'arsenal': 'img/afc.png',
    'chelsea': 'img/cfc.png',
    'inter': 'img/inter.png',
    'tottenham': 'img/spurs.png',
    'liverpool': 'img/lfc.png',
    'manchester united': 'img/manu.png',
    'everton': 'img/efc.png',
    'west ham': 'img/whu.png',
    'bayer leverkusen': 'img/leverkusen.png',
    'newcastle united': 'img/nufc.png',
    'napoli': 'img/napoli.png',
    'porto': 'img/porto.png',
    'sporting': 'img/sporting.png',
    'ajax': 'img/ajax.png',
    'celtic': 'img/celtic.png',
    'atletico madrid': 'img/atletico.png'
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
    // keep-limit logic: track last kept player and how many consecutive times they were kept
    keep: { id: null, count: 0 } // count is number of consecutive "keeps" (max 1)
  };

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

    // Ensure consistent face framing for every load
    [els.left.img, els.right.img].forEach(img => {
      img.style.objectFit = 'cover';
      img.style.objectPosition = '50% 25%';
      img.width = 260; img.height = 260;
    });

    // Left
    els.left.img.src = state.left.image;
    els.left.img.alt = state.left.name;
    els.left.name.textContent = state.left.name;
    els.left.label.textContent = meta.label;
    els.left.value.textContent = state.revealed.has(revealKey(state.left))
      ? formatValue(cat, getStatRaw(state.left))
      : '?';

    // Right
    els.right.img.src = state.right.image;
    els.right.img.alt = state.right.name;
    els.right.name.textContent = state.right.name;
    els.right.label.textContent = 'Who has higher?';
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

    // Exclude every player whose stat has been revealed this round,
    // and also exclude the kept player's id.
    const excluded = revealedIds();
    excluded.add(state[keepSide].id);

    // Build the candidate list strictly from unrevealed players
    const candidates = state.pool.filter(p => !excluded.has(p.id));

    if (candidates.length === 0) {
      // No fresh opponents left — end of round
      els.feedback.textContent = 'Congratulations! You have completed the game. Start a new round or choose another stat.';
      els.newRound.hidden = false;
      setPickable(false);
      return;
    }

    // Pick a new, unrevealed opponent
    state[replaceSide] = candidates[Math.floor(Math.random() * candidates.length)];

    renderCards();
    setPickable(true);
  }

  function startRound(cat = state.category) {
    state.category = cat;
    state.pool = buildPoolForCategory(cat);
    state.revealed = new Set();
    state.keep = { id: null, count: 0 };
    els.newRound.hidden = true;

    if (state.pool.length < 2) {
      els.feedback.textContent = 'Not enough data for this stat. Please choose another.';
      setPickable(false);
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

    const cat = state.category;
    const leftVal = getStatRaw(state.left, cat);
    const rightVal = getStatRaw(state.right, cat);

    // persist reveal
    state.revealed.add(revealKey(state.left));
    state.revealed.add(revealKey(state.right));
    els.left.value.textContent  = formatValue(cat, leftVal);
    els.right.value.textContent = formatValue(cat, rightVal);

    // visual feedback
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
      // stop; allow starting a new round or changing stat
      els.newRound.hidden = false;
    }

    els.score.textContent = state.score;
    els.streak.textContent = state.streak;
    els.best.textContent = getBest();
  }

  async function loadData() {
    try {
      const res = await fetch('data/players.json?v=' + Date.now());
      const json = await res.json();
      state.players = json;
    } catch (e) {
      state.players = [];
      console.error('Failed to load players.json', e);
    }
  }

  function wireEvents() {
    els.left.card.addEventListener('click', () => onPick('left'));
    els.right.card.addEventListener('click', () => onPick('right'));
    els.newRound.addEventListener('click', () => startRound(state.category));
    els.statSelect.addEventListener('change', (e) => startRound(e.target.value));
  }

  (async function init() {
    wireEvents();
    await loadData();
    startRound(els.statSelect?.value || 'goals');
  })();
})();