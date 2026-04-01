/* ═══════════════════════════════════════════════════════════════════
   Football Genius — Scout's Duel  (Core Game Engine)
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  /* ── Question Bank ─────────────────────────────────────────────── */
  const QUESTIONS = {
    position: [
      { text: "Is your player a forward?", attr: "position", value: "FW" },
      { text: "Is your player a midfielder?", attr: "position", value: "MF" },
      { text: "Is your player a defender?", attr: "position", value: "DF" },
      { text: "Is your player a goalkeeper?", attr: "position", value: "GK" },
    ],
    continent: [
      { text: "Is your player from Europe?", attr: "continent", value: "Europe" },
      { text: "Is your player from South America?", attr: "continent", value: "South America" },
      { text: "Is your player from Africa?", attr: "continent", value: "Africa" },
      { text: "Is your player French?", attr: "nationality", value: "France" },
      { text: "Is your player Brazilian?", attr: "nationality", value: "Brazil" },
      { text: "Is your player English?", attr: "nationality", value: "England" },
      { text: "Is your player German?", attr: "nationality", value: "Germany" },
      { text: "Is your player Spanish?", attr: "nationality", value: "Spain" },
      { text: "Is your player Argentine?", attr: "nationality", value: "Argentina" },
      { text: "Is your player Portuguese?", attr: "nationality", value: "Portugal" },
      { text: "Is your player Dutch?", attr: "nationality", value: "Netherlands" },
    ],
    league: [
      { text: "Has your player played in the Premier League?", attr: "premierLeague", value: true },
      { text: "Has your player played in La Liga?", attr: "laLiga", value: true },
      { text: "Has your player played in Serie A?", attr: "serieA", value: true },
      { text: "Has your player played in the Bundesliga?", attr: "bundesliga", value: true },
      { text: "Has your player played in Ligue 1?", attr: "ligue1", value: true },
    ],
    status: [
      { text: "Is your player retired?", attr: "isRetired", value: true },
      { text: "Is your player currently active?", attr: "isRetired", value: false },
      { text: "Is your player under 25?", attr: "ageRange", value: "under25" },
      { text: "Is your player between 25 and 30?", attr: "ageRange", value: "25-30" },
      { text: "Is your player between 31 and 35?", attr: "ageRange", value: "31-35" },
      { text: "Is your player over 35?", attr: "ageRange", value: "35+" },
    ],
    achievements: [
      { text: "Has your player won the Ballon d'Or?", attr: "ballonDor", value: true },
      { text: "Has your player won the World Cup?", attr: "worldCupWinner", value: true },
      { text: "Has your player won the Champions League?", attr: "clWinner", value: true },
      { text: "Does your player have 100+ international caps?", attr: "over100Caps", value: true },
    ],
    physical: [
      { text: "Is your player left-footed?", attr: "footedness", value: "left" },
      { text: "Is your player right-footed?", attr: "footedness", value: "right" },
    ],
  };

  /* ── Constants ─────────────────────────────────────────────────── */
  const CARD_COUNT = 24;

  /* ── State ─────────────────────────────────────────────────────── */
  const state = {
    allPlayers: [],
    cardPool: [],       // 24 players for this game
    mode: null,         // 'ai' | 'online' | 'custom'
    phase: 'lobby',     // 'lobby' | 'selection' | 'game' | 'end'
    myPlayer: null,     // player I selected
    opponentPlayer: null,
    myEliminated: new Set(),
    isMyTurn: true,
    turnNumber: 1,
    questionsAsked: 0,
    questionLog: [],
    selectedForGuess: null,
    selectionChoice: null,
    pendingShootAction: null,
  };

  /* ── DOM Refs ──────────────────────────────────────────────────── */
  const dom = {};
  function cacheDom() {
    dom.lobbyScreen = $('#lobbyScreen');
    dom.selectionScreen = $('#selectionScreen');
    dom.gameScreen = $('#gameScreen');
    dom.endScreen = $('#endScreen');
    dom.gameHud = $('#gameHud');
    dom.turnNumber = $('#turnNumber');
    dom.questionsAsked = $('#questionsAsked');
    dom.cardsRemaining = $('#cardsRemaining');
    dom.selectionGrid = $('#selectionGrid');
    dom.gameGrid = $('#gameGrid');
    dom.guessGrid = $('#guessGrid');
    dom.btnLockIn = $('#btnLockIn');
    dom.questionPanel = $('#questionPanel');
    dom.questionTabs = $('#questionTabs');
    dom.questionOptions = $('#questionOptions');
    dom.freetextPanel = $('#freetextPanel');
    dom.freetextInput = $('#freetextInput');
    dom.answerOverlay = $('#answerOverlay');
    dom.answerQuestionText = $('#answerQuestionText');
    dom.guessModal = $('#guessModal');
    dom.btnConfirmGuess = $('#btnConfirmGuess');
    dom.shootResultModal = $('#shootResultModal');
    dom.shootResultCard = $('#shootResultCard');
    dom.shootResultBadge = $('#shootResultBadge');
    dom.shootResultKicker = $('#shootResultKicker');
    dom.shootResultTitle = $('#shootResultTitle');
    dom.shootResultMessage = $('#shootResultMessage');
    dom.btnShootResultPrimary = $('#btnShootResultPrimary');
    dom.questionLog = $('#questionLog');
    dom.logEntries = $('#logEntries');
    dom.turnLabel = $('#turnLabel');
    dom.playerYou = $('#playerYouInfo');
    dom.playerOpponent = $('#playerOpponentInfo');
    dom.opponentStatus = $('#opponentSelectionStatus');
    dom.roomPanel = $('#roomPanel');
    dom.matchmakingPanel = $('#matchmakingPanel');
    dom.toast = $('#sdToast');
    dom.toastText = $('#sdToastText');
    dom.year = $('#year');
  }

  /* ── Helpers ───────────────────────────────────────────────────── */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function showToast(msg, type = '') {
    dom.toastText.textContent = msg;
    dom.toast.className = 'sd-toast' + (type ? ' ' + type : '');
    dom.toast.hidden = false;
    clearTimeout(state._toastTimer);
    state._toastTimer = setTimeout(() => { dom.toast.hidden = true; }, 3000);
  }

  function answerPredefined(question, player) {
    return player[question.attr] === question.value ? 'Yes' : 'No';
  }

  function buildCardPool() {
    return shuffle(state.allPlayers).slice(0, CARD_COUNT);
  }

  /* ── Screen Management ─────────────────────────────────────────── */
  function showScreen(name) {
    state.phase = name;
    [dom.lobbyScreen, dom.selectionScreen, dom.gameScreen, dom.endScreen].forEach(s => {
      if (s) s.hidden = true;
    });
    const el = $(`#${name}Screen`);
    if (el) el.hidden = false;
    dom.gameHud.style.display = (name === 'game') ? 'flex' : 'none';
  }

  /* ═══════════════════════════════════════════════════════════════
     CARD RENDERING
     ═══════════════════════════════════════════════════════════════ */
  function createCardHTML(player) {
    const flagHtml = player.nationalityFlag
      ? `<img class="sd-card-flag" src="${player.nationalityFlag}" alt="${player.nationality}" />`
      : `<span class="sd-card-flag" style="font-size:10px">${player.nationality.slice(0,3)}</span>`;

    let clubHtml = '';
    if (player.isRetired) {
      clubHtml = `<span class="sd-card-retired-icon" title="Retired">🥾</span>`;
    } else if (player.clubBadge) {
      clubHtml = `<img class="sd-card-badge" src="${player.clubBadge}" alt="${player.club}" />`;
    }

    const posClass = player.position.toLowerCase();

    return `
      <div class="sd-card" data-id="${player.id}">
        <div class="sd-card-inner">
          <div class="sd-card-front">
            <img class="sd-card-img" src="${player.image}" alt="${player.name}"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2258%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2232%22>?</text></svg>'" />
            <div class="sd-card-info">
              <div class="sd-card-name">${player.name}</div>
              <div class="sd-card-meta">
                ${flagHtml}
                ${clubHtml}
                <span class="sd-card-pos ${posClass}">${player.position}</span>
              </div>
            </div>
          </div>
          <div class="sd-card-back"></div>
        </div>
      </div>`;
  }

  function renderGrid(container, cards, clickHandler) {
    container.innerHTML = cards.map(p => createCardHTML(p)).join('');
    container.querySelectorAll('.sd-card').forEach(el => {
      el.addEventListener('click', () => clickHandler(el, el.dataset.id));
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     LOBBY
     ═══════════════════════════════════════════════════════════════ */
  function setupLobby() {
    // Mode buttons
    $('#btnVsAI').addEventListener('click', () => startGame('ai'));
    $('#btnCustomRoom').addEventListener('click', showRoomPanel);
    $('#btnOnlineMatch').addEventListener('click', () => startMatchmaking());
    $('#btnBackToLobby').addEventListener('click', hidePanels);
    $('#btnCancelMatch').addEventListener('click', hidePanels);

    // Room tabs
    $('#tabCreateRoom').addEventListener('click', () => switchRoomTab('create'));
    $('#tabJoinRoom').addEventListener('click', () => switchRoomTab('join'));
    $('#btnCreateRoom').addEventListener('click', createRoom);
    $('#btnJoinRoom').addEventListener('click', joinRoom);
    $('#btnCopyCode').addEventListener('click', copyRoomCode);
  }

  function showRoomPanel() {
    dom.roomPanel.hidden = false;
    dom.matchmakingPanel.hidden = true;
  }
  function hidePanels() {
    dom.roomPanel.hidden = true;
    dom.matchmakingPanel.hidden = true;
    if (window.ScoutsDuelOnline) window.ScoutsDuelOnline.leaveMatchmaking();
  }
  function switchRoomTab(tab) {
    $('#tabCreateRoom').classList.toggle('active', tab === 'create');
    $('#tabJoinRoom').classList.toggle('active', tab === 'join');
    $('#createRoomView').hidden = (tab !== 'create');
    $('#joinRoomView').hidden = (tab !== 'join');
  }

  function createRoom() {
    if (window.ScoutsDuelOnline) {
      const pool = buildCardPool();
      state.cardPool = pool;
      window.ScoutsDuelOnline.createRoom(pool);
    } else {
      showToast('Online play requires login.', 'error');
    }
  }
  function joinRoom() {
    const code = $('#joinCodeInput').value.trim().toUpperCase();
    if (code.length < 4) { showToast('Enter a valid room code.', 'error'); return; }
    if (window.ScoutsDuelOnline) {
      window.ScoutsDuelOnline.joinRoom(code);
    }
  }
  function copyRoomCode() {
    const code = $('#roomCodeValue').textContent;
    navigator.clipboard.writeText(code).then(() => showToast('Code copied!'));
  }
  function startMatchmaking() {
    dom.roomPanel.hidden = true;
    dom.matchmakingPanel.hidden = false;
    if (window.ScoutsDuelOnline) {
      const pool = buildCardPool();
      state.cardPool = pool;
      window.ScoutsDuelOnline.findMatch(pool);
    } else {
      showToast('Online play requires login.', 'error');
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     START GAME
     ═══════════════════════════════════════════════════════════════ */
  function startGame(mode, cardPoolOverride) {
    state.mode = mode;
    state.myPlayer = null;
    state.opponentPlayer = null;
    state.myEliminated = new Set();
    state.isMyTurn = true;
    state.turnNumber = 1;
    state.questionsAsked = 0;
    state.questionLog = [];
    state.selectionChoice = null;
    state.selectedForGuess = null;
    state.pendingShootAction = null;

    if (dom.shootResultModal) {
      dom.shootResultModal.hidden = true;
    }

    // Pick 24 random players if not provided by online host
    state.cardPool = Array.isArray(cardPoolOverride) && cardPoolOverride.length
      ? cardPoolOverride
      : buildCardPool();

    goToSelection();
  }

  /* ═══════════════════════════════════════════════════════════════
     SELECTION PHASE
     ═══════════════════════════════════════════════════════════════ */
  function goToSelection() {
    showScreen('selection');
    renderGrid(dom.selectionGrid, state.cardPool, onSelectionClick);
    dom.btnLockIn.disabled = true;
    dom.btnLockIn.textContent = '🔒 Lock In Selection';
    dom.opponentStatus.style.display = (state.mode === 'ai') ? 'none' : 'flex';
  }

  function onSelectionClick(cardEl, playerId) {
    // Deselect previous
    dom.selectionGrid.querySelectorAll('.sd-card').forEach(c => c.classList.remove('selected'));
    cardEl.classList.add('selected');
    state.selectionChoice = playerId;
    dom.btnLockIn.disabled = false;
  }

  function lockInSelection() {
    if (!state.selectionChoice) return;
    state.myPlayer = state.cardPool.find(p => p.id === state.selectionChoice);

    if (state.mode === 'ai') {
      // AI picks a random player (different from user's)
      const available = state.cardPool.filter(p => p.id !== state.myPlayer.id);
      state.opponentPlayer = available[Math.floor(Math.random() * available.length)];
      goToGame();
    } else {
      // Inform online system
      if (window.ScoutsDuelOnline) {
        window.ScoutsDuelOnline.lockIn(state.selectionChoice);
      }
      // Waiting state
      dom.btnLockIn.disabled = true;
      dom.btnLockIn.textContent = '✓ Locked in — waiting for opponent...';
    }
  }

  // Called by online module when both players are ready
  window._sdBothReady = function(opponentPlayerId, iGoFirst) {
    state.opponentPlayer = state.cardPool.find(p => p.id === opponentPlayerId);
    state.isMyTurn = iGoFirst;
    goToGame();
  };

  /* ═══════════════════════════════════════════════════════════════
     GAME PHASE
     ═══════════════════════════════════════════════════════════════ */
  function goToGame() {
    showScreen('game');
    renderGrid(dom.gameGrid, state.cardPool, onGameCardClick);

    // Mark my player
    const myCard = dom.gameGrid.querySelector(`[data-id="${state.myPlayer.id}"]`);
    if (myCard) myCard.classList.add('my-pick');

    setupQuestionPanel();
    updateHud();
    updateTurnUI();

    // Wire events
    $('#btnShoot').addEventListener('click', openGuessModal);
    $('#btnConfirmGuess').addEventListener('click', confirmGuess);
    $('#btnCancelGuess').addEventListener('click', closeGuessModal);
    $('#btnToggleLog').addEventListener('click', () => { dom.questionLog.hidden = !dom.questionLog.hidden; });
    $('#btnCloseLog').addEventListener('click', () => { dom.questionLog.hidden = true; });
    $('#btnAnswerYes').addEventListener('click', () => answer('Yes'));
    $('#btnAnswerNo').addEventListener('click', () => answer('No'));
    $('#btnAskFreetext').addEventListener('click', askFreetext);
    dom.freetextInput.addEventListener('keydown', e => { if (e.key === 'Enter') askFreetext(); });
  }

  function onGameCardClick(cardEl, playerId) {
    // Only allow elimination of non-own players during game phase
    if (playerId === state.myPlayer.id) return;
    if (cardEl.classList.contains('eliminated')) {
      // Un-eliminate (toggle)
      cardEl.classList.remove('eliminated');
      state.myEliminated.delete(playerId);
    } else {
      cardEl.classList.add('eliminated');
      state.myEliminated.add(playerId);
    }
    updateHud();
  }

  function updateHud() {
    dom.turnNumber.textContent = state.turnNumber;
    dom.questionsAsked.textContent = state.questionsAsked;
    dom.cardsRemaining.textContent = CARD_COUNT - state.myEliminated.size;
  }

  function updateTurnUI() {
    dom.playerYou.classList.toggle('active-turn', state.isMyTurn);
    dom.playerOpponent.classList.toggle('active-turn', !state.isMyTurn);
    dom.turnLabel.textContent = state.isMyTurn ? 'YOUR TURN' : "OPPONENT'S TURN";
    dom.turnLabel.classList.toggle('opponent', !state.isMyTurn);
    dom.questionPanel.classList.toggle('disabled', !state.isMyTurn);

    if (state.isMyTurn) {
      dom.answerOverlay.hidden = true;
    }
  }

  function endTurn() {
    state.isMyTurn = !state.isMyTurn;
    state.turnNumber++;
    updateTurnUI();
    updateHud();

    // If AI's turn now, let AI play
    if (!state.isMyTurn && state.mode === 'ai') {
      setTimeout(() => aiTakeTurn(), 1200);
    }
  }

  /* ── Question Panel Setup ──────────────────────────────────────── */
  function setupQuestionPanel() {
    const tabs = dom.questionTabs.querySelectorAll('.sd-q-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        showQuestionCategory(tab.dataset.cat);
      });
    });
    showQuestionCategory('position');
  }

  function showQuestionCategory(cat) {
    dom.freetextPanel.hidden = (cat !== 'freetext');
    dom.questionOptions.style.display = (cat === 'freetext') ? 'none' : 'flex';

    if (cat === 'freetext') return;

    const questions = QUESTIONS[cat] || [];
    dom.questionOptions.innerHTML = questions.map((q, i) =>
      `<button class="sd-q-option" data-cat="${cat}" data-idx="${i}">${q.text}</button>`
    ).join('');

    dom.questionOptions.querySelectorAll('.sd-q-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const question = QUESTIONS[btn.dataset.cat][parseInt(btn.dataset.idx)];
        askPredefined(question);
      });
    });
  }

  /* ── Asking Questions ──────────────────────────────────────────── */
  function askPredefined(question) {
    if (!state.isMyTurn) return;

    if (state.mode === 'ai') {
      const ans = answerPredefined(question, state.opponentPlayer);
      receiveAnswer(question.text, ans, 'predefined');
    } else {
      // Send to online opponent
      if (window.ScoutsDuelOnline) {
        window.ScoutsDuelOnline.sendQuestion(question.text, question);
      }
      dom.questionPanel.classList.add('disabled');
      showToast('Waiting for opponent\'s answer...');
    }
  }

  function askFreetext() {
    if (!state.isMyTurn) return;
    const text = dom.freetextInput.value.trim();
    if (!text) return;
    dom.freetextInput.value = '';

    if (state.mode === 'ai') {
      // Use AI module to answer
      dom.questionPanel.classList.add('disabled');
      showToast('AI is thinking...');
      if (window.ScoutsDuelAI) {
        window.ScoutsDuelAI.answerFreeText(text, state.opponentPlayer)
          .then(ans => receiveAnswer(text, ans, 'freetext'))
          .catch(() => receiveAnswer(text, 'No', 'freetext'));
      } else {
        // Fallback: random
        receiveAnswer(text, Math.random() > 0.5 ? 'Yes' : 'No', 'freetext');
      }
    } else {
      if (window.ScoutsDuelOnline) {
        window.ScoutsDuelOnline.sendQuestion(text, null);
      }
      dom.questionPanel.classList.add('disabled');
    }
  }

  function receiveAnswer(questionText, answer, type) {
    state.questionsAsked++;
    const entry = { from: 'you', question: questionText, answer, type };
    state.questionLog.push(entry);
    addLogEntry(entry);
    showToast(`Answer: ${answer}`, answer === 'Yes' ? '' : 'error');
    updateHud();

    // Continue — player eliminates cards manually, then ends turn
    dom.questionPanel.classList.remove('disabled');
    setTimeout(() => endTurn(), 1500);
  }

  /* ── Receiving Questions (from opponent / AI) ──────────────────── */
  // Called when opponent asks me a question
  window._sdReceiveQuestion = function(questionText, questionData) {
    dom.answerQuestionText.textContent = questionText;
    dom.answerOverlay.hidden = false;
    state._pendingQuestion = { text: questionText, data: questionData };
  };

  function answer(ans) {
    dom.answerOverlay.hidden = true;
    const q = state._pendingQuestion;
    const entry = { from: 'opponent', question: q.text, answer: ans };
    state.questionLog.push(entry);
    state.questionsAsked++;
    addLogEntry(entry);

    if (state.mode !== 'ai' && window.ScoutsDuelOnline) {
      window.ScoutsDuelOnline.sendAnswer(ans);
    }

    updateHud();
    setTimeout(() => endTurn(), 800);
  }

  /* ── AI Turn ───────────────────────────────────────────────────── */
  async function aiTakeTurn() {
    if (state.isMyTurn || state.phase !== 'game') return;

    // AI decides: ask a question or shoot
    const remainingForAI = state.cardPool.filter(p => !state._aiEliminated?.has(p.id) && p.id !== state.opponentPlayer?.id);

    if (!state._aiEliminated) state._aiEliminated = new Set();

    // If 2 or fewer candidates, AI guesses
    if (remainingForAI.length <= 2) {
      const guess = remainingForAI[Math.floor(Math.random() * remainingForAI.length)];
      showToast(`🤖 AI guesses: ${guess.name}!`);

      setTimeout(() => {
        if (guess.id === state.myPlayer.id) {
          // AI wins
          endGame(false);
        } else {
          showToast('🤖 Wrong guess! Your turn.');
          endTurn();
        }
      }, 1500);
      return;
    }

    // AI asks a strategic question
    let bestQuestion = null;
    let bestScore = Infinity;

    // Find the question that splits remaining candidates closest to 50/50
    for (const cat of Object.keys(QUESTIONS)) {
      for (const q of QUESTIONS[cat]) {
        const yesCount = remainingForAI.filter(p => p[q.attr] === q.value).length;
        const split = Math.abs(yesCount - (remainingForAI.length - yesCount));
        if (split < bestScore) {
          bestScore = split;
          bestQuestion = q;
        }
      }
    }

    if (!bestQuestion) bestQuestion = QUESTIONS.position[0];

    // Ask the question
    showToast(`🤖 AI asks: "${bestQuestion.text}"`);

    setTimeout(() => {
      // Auto-answer based on your player
      const ans = answerPredefined(bestQuestion, state.myPlayer);

      const entry = { from: 'opponent', question: bestQuestion.text, answer: ans };
      state.questionLog.push(entry);
      state.questionsAsked++;
      addLogEntry(entry);

      // AI eliminates cards based on answer
      state.cardPool.forEach(p => {
        const match = p[bestQuestion.attr] === bestQuestion.value;
        if ((ans === 'Yes' && !match) || (ans === 'No' && match)) {
          state._aiEliminated.add(p.id);
        }
      });

      showToast(`You answered: ${ans}`, ans === 'Yes' ? '' : 'error');
      updateHud();

      setTimeout(() => endTurn(), 1500);
    }, 2000);
  }

  /* ── Question Log ──────────────────────────────────────────────── */
  function addLogEntry(entry) {
    const div = document.createElement('div');
    div.className = 'sd-log-entry';
    div.innerHTML = `
      <div class="sd-log-who ${entry.from === 'opponent' ? 'opponent' : ''}">${entry.from === 'you' ? '🔍 You asked' : '🤖 Opponent asked'}</div>
      <div class="sd-log-q">"${entry.question}"</div>
      <div class="sd-log-a ${entry.answer === 'Yes' ? 'yes' : 'no'}">→ ${entry.answer}</div>`;
    dom.logEntries.prepend(div);
  }

  /* ═══════════════════════════════════════════════════════════════
     GUESS (SHOOT)
     ═══════════════════════════════════════════════════════════════ */
  function openGuessModal() {
    if (!state.isMyTurn) return;
    const remaining = state.cardPool.filter(p =>
      !state.myEliminated.has(p.id) && p.id !== state.myPlayer.id
    );
    renderGrid(dom.guessGrid, remaining, onGuessCardClick);
    state.selectedForGuess = null;
    dom.btnConfirmGuess.disabled = true;
    dom.guessModal.hidden = false;
  }

  function onGuessCardClick(cardEl, playerId) {
    dom.guessGrid.querySelectorAll('.sd-card').forEach(c => c.classList.remove('selected'));
    cardEl.classList.add('selected');
    state.selectedForGuess = playerId;
    dom.btnConfirmGuess.disabled = false;
  }

  function closeGuessModal() {
    dom.guessModal.hidden = true;
    state.selectedForGuess = null;
  }

  function openShootResult(config) {
    const {
      type = 'win',
      badge = '🎯',
      kicker = 'Shot Result',
      title = 'Guess submitted',
      message = '',
      buttonText = 'Continue',
      onConfirm = null,
    } = config || {};

    state.pendingShootAction = typeof onConfirm === 'function' ? onConfirm : null;
    dom.shootResultCard.className = `sd-shoot-result-card ${type}`;
    dom.shootResultBadge.textContent = badge;
    dom.shootResultKicker.textContent = kicker;
    dom.shootResultTitle.textContent = title;
    dom.shootResultMessage.textContent = message;
    dom.btnShootResultPrimary.textContent = buttonText;
    dom.shootResultModal.hidden = false;
  }

  function resolveShootResult() {
    const action = state.pendingShootAction;
    state.pendingShootAction = null;
    dom.shootResultModal.hidden = true;

    if (action) action();
  }

  function confirmGuess() {
    if (!state.selectedForGuess) return;
    closeGuessModal();

    const guessedPlayer = state.cardPool.find(p => p.id === state.selectedForGuess);
    const isCorrect = state.selectedForGuess === state.opponentPlayer.id;

    if (state.mode !== 'ai' && window.ScoutsDuelOnline) {
      window.ScoutsDuelOnline.sendGuess(state.selectedForGuess);
    }

    if (isCorrect) {
      openShootResult({
        type: 'win',
        badge: '🏆',
        kicker: 'Perfect Shot',
        title: 'You got it right!',
        message: `Your prediction was correct. It was ${guessedPlayer.name}.`,
        buttonText: 'Celebrate Win',
        onConfirm: () => endGame(true),
      });
    } else {
      openShootResult({
        type: 'error',
        badge: '❌',
        kicker: 'Wrong Guess',
        title: 'That is not the player',
        message: `It is not ${guessedPlayer.name}. Press Resume to continue the duel.`,
        buttonText: 'Resume',
        onConfirm: () => endTurn(),
      });
    }
  }

  // Called by online module when opponent guesses
  window._sdOpponentGuesses = function(playerId) {
    const guessedPlayer = state.cardPool.find(p => p.id === playerId);
    const isCorrect = playerId === state.myPlayer.id;

    if (isCorrect) {
      showToast(`Opponent correctly guessed ${guessedPlayer.name}!`);
      endGame(false);
    } else {
      showToast(`Opponent guessed ${guessedPlayer.name} — Wrong!`);
      setTimeout(() => endTurn(), 1500);
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     END GAME
     ═══════════════════════════════════════════════════════════════ */
  function endGame(iWon) {
    showScreen('end');

    const endIcon = $('#endIcon');
    const endTitle = $('#endTitle');
    const endSubtitle = $('#endSubtitle');

    if (iWon) {
      endIcon.textContent = '🏆';
      endTitle.textContent = 'You Win!';
      endTitle.className = 'sd-end-title';
      endSubtitle.textContent = "You correctly identified your opponent's player!";
    } else {
      endIcon.textContent = '😞';
      endTitle.textContent = 'You Lost';
      endTitle.className = 'sd-end-title loss';
      endSubtitle.textContent = "Your opponent guessed your player first.";
    }

    // Reveal players
    renderEndPlayer($('#endYourPlayer'), state.myPlayer);
    renderEndPlayer($('#endOpponentPlayer'), state.opponentPlayer);

    // Stats
    $('#endTurns').textContent = state.turnNumber;
    $('#endQuestions').textContent = state.questionsAsked;

    // Save score
    if (iWon && window.auth?.saveScore) {
      const score = Math.max(10, 100 - (state.turnNumber * 5));
      window.auth.saveScore('scoutsduel', score);
    }

    // Play again
    $('#btnPlayAgain').onclick = () => startGame(state.mode);
  }

  function renderEndPlayer(container, player) {
    if (!player) { container.innerHTML = '<div class="name">Unknown</div>'; return; }
    container.innerHTML = `
      <img src="${player.image}" alt="${player.name}" onerror="this.style.display='none'" />
      <div class="name">${player.name}</div>`;
  }

  /* ═══════════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════════ */
  async function init() {
    cacheDom();
    if (dom.year) dom.year.textContent = new Date().getFullYear();

    // Load player data
    try {
      const res = await fetch('data/scouts-duel-players.json?v=' + Date.now());
      state.allPlayers = await res.json();
    } catch (e) {
      console.error('[ScoutsDuel] Failed to load player data:', e);
      showToast('Failed to load player data.', 'error');
      return;
    }

    setupLobby();
    dom.btnLockIn.addEventListener('click', lockInSelection);
    dom.btnShootResultPrimary.addEventListener('click', resolveShootResult);
    showScreen('lobby');

    console.log(`[ScoutsDuel] Ready — ${state.allPlayers.length} players loaded.`);
  }

  // Public API
  window.ScoutsDuel = { startGame, state, showToast, QUESTIONS, answerPredefined, buildCardPool };

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
