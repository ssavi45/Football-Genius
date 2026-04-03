// grid.js -- Daily Grid Challenge (Football Genius)
// No ES module imports -- uses window.auth exposed by auth.js

var playersDb = [];
var dbLoaded = false;

function normalizeKey(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[’']/g, "'")
    .replace(/[\u2010-\u2015]/g, '-') // normalize unicode dashes
    .replace(/\s*-\s*/g, '-');
}

function makeCanonicalMap(items) {
  var map = {};
  items.forEach(function(it) {
    map[normalizeKey(it.name)] = it.name;
  });
  return map;
}

// Built after CLUBS/NATIONS are declared
var CLUB_CANON = {};
var NATION_CANON = {};

// Aliases -> canonical names (kept intentionally small; extend as needed)
var CLUB_ALIASES = {
  'manchester united': 'Man United',
  'man utd': 'Man United',
  'manchester city': 'Man City',
  'psg': 'PSG',
  'paris saint-germain': 'PSG',
  'real madrid cf': 'Real Madrid',
  'fc barcelona': 'Barcelona',
  'bayern munich': 'Bayern Munich',
  'borussia dortmund': 'Dortmund',
  'tottenham hotspur': 'Tottenham',
  'atlético madrid': 'Atletico Madrid',
  'atlé tico madrid': 'Atletico Madrid',
  'atletico de madrid': 'Atletico Madrid',
  'internazionale': 'Inter Milan',
  'inter': 'Inter Milan',
  'ac milan': 'AC Milan'
};

var NATION_ALIASES = {
  'england': 'England',
  'germany': 'Germany',
  'netherlands': 'Netherlands',
  'croatia': 'Croatia',
  'uruguay': 'Uruguay',
  'argentina': 'Argentina',
  'brazil': 'Brazil',
  'france': 'France',
  'spain': 'Spain',
  'italy': 'Italy',
  'portugal': 'Portugal',
  'belgium': 'Belgium',
  'colombia': 'Colombia',
  'japan': 'Japan',
  'mexico': 'Mexico'
};

function canonicalizeClub(name) {
  var key = normalizeKey(name);
  var aliased = CLUB_ALIASES[key];
  if (aliased) return aliased;
  return CLUB_CANON[key] || String(name || '').trim();
}

function canonicalizeNation(name) {
  var key = normalizeKey(name);
  var aliased = NATION_ALIASES[key];
  if (aliased) return aliased;
  return NATION_CANON[key] || String(name || '').trim();
}

function canonicalizePlayerName(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[’']/g, "'")
    .replace(/[\u2010-\u2015]/g, '-');
}


var NATIONS = [
  { id: 'brazil',      name: 'Brazil',       img: 'img/teams/brazil.png' },
  { id: 'spain',       name: 'Spain',        img: 'img/teams/spain.png' },
  { id: 'france',      name: 'France',       img: 'img/teams/france.png' },
  { id: 'argentina',   name: 'Argentina',    img: 'img/teams/argentina.png' },
  { id: 'england',     name: 'England',      img: 'img/teams/england.png' },
  { id: 'germany',     name: 'Germany',      img: 'img/teams/germany.png' },
  { id: 'portugal',    name: 'Portugal',     img: 'img/teams/portugal.png' },
  { id: 'netherlands', name: 'Netherlands',  img: 'img/teams/netherlands.png' },
  { id: 'italy',       name: 'Italy',        img: 'img/teams/italy.png' },
  { id: 'croatia',     name: 'Croatia',      img: 'img/teams/croatia.png' },
  { id: 'colombia',    name: 'Colombia',     img: 'img/teams/colombia.png' },
  { id: 'belgium',     name: 'Belgium',      img: 'img/teams/belgium.png' },
  { id: 'uruguay',     name: 'Uruguay',      img: 'img/teams/uruguay.png' },
  { id: 'japan',       name: 'Japan',        img: 'img/teams/japan.png' },
  { id: 'mexico',      name: 'Mexico',       img: 'img/teams/mexico.png' }
];

var CLUBS = [
  { id: 'rmcf',      name: 'Real Madrid',      img: 'img/teams/rmcf.png' },
  { id: 'fcb',       name: 'Barcelona',        img: 'img/teams/fcb.png' },
  { id: 'manu',      name: 'Man United',       img: 'img/teams/manu.png' },
  { id: 'mancity',   name: 'Man City',         img: 'img/teams/mancity.png' },
  { id: 'lfc',       name: 'Liverpool',        img: 'img/teams/lfc.png' },
  { id: 'psg',       name: 'PSG',              img: 'img/teams/psg.png' },
  { id: 'bayern',    name: 'Bayern Munich',    img: 'img/teams/bayern.png' },
  { id: 'juve',      name: 'Juventus',         img: 'img/teams/juve.png' },
  { id: 'inter',     name: 'Inter Milan',      img: 'img/teams/inter.png' },
  { id: 'acmilan',   name: 'AC Milan',         img: 'img/teams/acmilan.png' },
  { id: 'atletico',  name: 'Atletico Madrid',  img: 'img/teams/atletico.png' },
  { id: 'cfc',       name: 'Chelsea',          img: 'img/teams/cfc.png' },
  { id: 'afc',       name: 'Arsenal',          img: 'img/teams/afc.png' },
  { id: 'spurs',     name: 'Tottenham',        img: 'img/teams/spurs.png' },
  { id: 'bvb',       name: 'Dortmund',         img: 'img/teams/bvb.png' }
];

var STAT_CRITERIA = [
  { id: 'goals400',        name: 'Scored 400+ career goals',         img: 'img/icons/over_400_career_goals.png' },
  { id: 'cl3',             name: 'Won 3+ Champions League titles',   img: 'img/icons/won_over_3_ucl.png' },
  { id: 'worldcup',        name: 'Won the World Cup',                img: 'img/icons/world_cup_winner.png' },
  { id: 'ballondor',       name: "Won the Ballon d'Or",              img: 'img/icons/balon_dor_winner.png' },
  { id: 'goals50season',   name: 'Scored 50+ goals in a season',     img: 'img/icons/over_50_goals_season.png' },
  { id: 'cl_topscorer',    name: 'UCL all-time top 15 scorer',       img: 'img/icons/top_15_scorer_ucl.png' },
  { id: 'captained',       name: 'Captained their national team',    img: 'img/icons/captained_teams.png' },
  { id: 'league_titles5',  name: 'Won 5+ league titles',             img: 'img/icons/won_over_5_league_titles.png' },
  { id: 'played_3clubs',   name: 'Played for 3+ top-5 league clubs', img: 'img/icons/played_3_plus_clubs.png' },
  { id: 'assists200',      name: 'Provided 200+ career assists',     img: 'img/icons/provide_over_200_assists.png' }
];

// Build lookup maps for fast criterion resolution
var CLUB_NAMES = {};
CLUBS.forEach(function(c) { CLUB_NAMES[c.name] = true; });
var NATION_NAMES = {};
NATIONS.forEach(function(n) { NATION_NAMES[n.name] = true; });
var STAT_ID_BY_NAME = {};
STAT_CRITERIA.forEach(function(s) { STAT_ID_BY_NAME[s.name] = s.id; });

// Build canonical maps now that criteria arrays exist
CLUB_CANON = makeCanonicalMap(CLUBS);
NATION_CANON = makeCanonicalMap(NATIONS);


function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function getDailySeed() {
  var today = new Date();
  var dateStr = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');
  var hash = 0;
  for (var i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function seededShuffle(arr, rng) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}


function checkGridSolvable(rows, cols) {
  for (var r = 0; r < rows.length; r++) {
    for (var c = 0; c < cols.length; c++) {
      var hasAnswer = false;
      for (var i = 0; i < playersDb.length; i++) {
        if (checkCriterion(playersDb[i], rows[r].name) && checkCriterion(playersDb[i], cols[c].name)) {
          hasAnswer = true;
          break;
        }
      }
      if (!hasAnswer) return false;
    }
  }
  return true;
}

function generateGrid(difficulty) {
  var seed = getDailySeed();
  var offset = difficulty.charCodeAt(0);

  // Try up to 50 seed offsets to find a solvable grid
  for (var attempt = 0; attempt < 50; attempt++) {
    var rng = mulberry32(seed + offset + attempt * 97);
    var rows, cols;

    if (difficulty === 'easy') {
      rows = seededShuffle(CLUBS, rng).slice(0, 3);
      cols = seededShuffle(NATIONS, rng).slice(0, 3);
    } else if (difficulty === 'medium') {
      rows = seededShuffle(CLUBS, rng).slice(0, 3);
      cols = seededShuffle(STAT_CRITERIA, rng).slice(0, 3);
    } else {
      var shuffled = seededShuffle(STAT_CRITERIA, rng);
      rows = shuffled.slice(0, 3);
      cols = shuffled.slice(3, 6);
    }

    if (dbLoaded && checkGridSolvable(rows, cols)) {
      return { rows: rows, cols: cols, difficulty: difficulty };
    }
  }

  // Fallback: return last generated grid even if not fully solvable
  return { rows: rows, cols: cols, difficulty: difficulty };
}


function searchPlayersLocal(query) {
  var q = query.toLowerCase();
  var results = [];
  for (var i = 0; i < playersDb.length && results.length < 8; i++) {
    if (playersDb[i].name.toLowerCase().indexOf(q) !== -1) {
      results.push(playersDb[i]);
    }
  }
  return results;
}


function checkCriterion(player, criterionName) {
  // Check if it's a club
  if (CLUB_NAMES[criterionName]) {
    return player.clubs.indexOf(criterionName) !== -1;
  }
  // Check if it's a nation
  if (NATION_NAMES[criterionName]) {
    return player.nation === criterionName;
  }
  // Check if it's a stat
  var statId = STAT_ID_BY_NAME[criterionName];
  if (statId) {
    return player.stats.indexOf(statId) !== -1;
  }
  return false;
}

function validateAnswerLocal(playerName, rowCriterionName, colCriterionName) {
  // Find player (case-insensitive)
  var playerLower = playerName.toLowerCase();
  var player = null;
  for (var i = 0; i < playersDb.length; i++) {
    if (playersDb[i].name.toLowerCase() === playerLower) {
      player = playersDb[i];
      break;
    }
  }

  if (!player) {
    return { valid: false, reason: playerName + ' is not in the database.' };
  }

  var matchesRow = checkCriterion(player, rowCriterionName);
  var matchesCol = checkCriterion(player, colCriterionName);

  if (matchesRow && matchesCol) {
    return { valid: true, reason: player.name + ' matches both criteria!' };
  }

  // Build explanation
  if (!matchesRow && !matchesCol) {
    return { valid: false, reason: player.name + " doesn't match either criterion." };
  }
  if (!matchesRow) {
    return { valid: false, reason: player.name + " doesn't match " + rowCriterionName + '.' };
  }
  return { valid: false, reason: player.name + " doesn't match " + colCriterionName + '.' };
}


var state = {
  grid: null,
  score: 0,
  cells: {},
  usedPlayers: new Set(),
  activeCell: null,
  gameOver: false,
  submitted: false
};


var els = {};

function cacheDom() {
  els = {
    difficultyScreen: document.getElementById('difficultyScreen'),
    gameScreen: document.getElementById('gameScreen'),
    gridBoard: document.getElementById('gridBoard'),
    filledCount: document.getElementById('filledCount'),
    score: document.getElementById('score'),
    difficultyLabel: document.getElementById('difficultyLabel'),
    feedback: document.getElementById('feedback'),
    searchContainer: document.getElementById('searchContainer'),
    searchInput: document.getElementById('playerSearchInput'),
    searchResults: document.getElementById('searchResults'),
    searchLoading: document.getElementById('searchLoading'),
    closeSearch: document.getElementById('closeSearch'),
    targetCriteria: document.getElementById('targetCriteria'),
    summaryModal: document.getElementById('summaryModal'),
    finalScore: document.getElementById('finalScore'),
    gridSummary: document.getElementById('gridSummary'),
    playAgain: document.getElementById('playAgain'),
    startGameBtn: document.getElementById('startGameBtn'),
    submitGrid: document.getElementById('submitGrid'),
    competition: document.getElementById('competition')
  };
}


// Helper: build a header cell (works for clubs, nations, AND stats — all now use img)
function buildHeaderContent(item) {
  var isStat = !!STAT_ID_BY_NAME[item.name];
  var imgClass = isStat ? 'grid-header-icon grid-header-icon-stat' : 'grid-header-icon';
  var visualClass = isStat ? 'grid-header-visual grid-header-visual-stat' : 'grid-header-visual';
  var html = '<div class="' + visualClass + '">' +
    '<img class="' + imgClass + '" src="' + item.img + '" alt="' + item.name + '" ' +
    'onerror="this.onerror=null;this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" />' +
    '<div class="stat-icon-fallback" style="display:none">' + item.name.charAt(0).toUpperCase() + '</div>' +
    '</div>' +
    '<span>' + item.name + '</span>';
  return html;
}

function renderGrid() {
  var rows = state.grid.rows;
  var cols = state.grid.cols;
  var board = els.gridBoard;
  board.innerHTML = '';

  // Top-left empty corner
  var corner = document.createElement('div');
  corner.className = 'grid-header empty';
  board.appendChild(corner);

  // Column headers
  cols.forEach(function(col, ci) {
    var hdr = document.createElement('div');
    hdr.className = 'grid-header col-header';
    hdr.dataset.col = ci;
    hdr.innerHTML = buildHeaderContent(col);
    board.appendChild(hdr);
  });

  // Rows
  rows.forEach(function(row, ri) {
    var rhdr = document.createElement('div');
    rhdr.className = 'grid-header row-header';
    rhdr.dataset.row = ri;
    rhdr.innerHTML = buildHeaderContent(row);
    board.appendChild(rhdr);

    cols.forEach(function(_col, ci) {
      var btn = document.createElement('button');
      btn.className = 'grid-cell';
      btn.dataset.row = ri;
      btn.dataset.col = ci;
      btn.innerHTML = '<span class="cell-plus">+</span>';
      btn.addEventListener('click', function() { openSearch(btn, ri, ci); });
      board.appendChild(btn);

      state.cells[ri + ',' + ci] = { status: 'empty', playerName: null };
    });
  });
}


var searchDebounceTimer = null;

function openSearch(btnEl, row, col) {
  if (state.gameOver || state.submitted) return;

  var rowCrit = state.grid.rows[row];
  var colCrit = state.grid.cols[col];

  state.activeCell = {
    row: row,
    col: col,
    btn: btnEl,
    rowName: rowCrit.name,
    colName: colCrit.name
  };

  els.targetCriteria.textContent = rowCrit.name + ' + ' + colCrit.name;
  els.searchInput.value = '';
  els.searchResults.innerHTML = '';
  els.searchLoading.hidden = true;
  els.searchContainer.removeAttribute('hidden');
  els.searchInput.focus();
}

function closeSearch() {
  els.searchContainer.setAttribute('hidden', '');
  state.activeCell = null;
}

function handleSearchInput(e) {
  var query = e.target.value.trim();
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);

  if (query.length < 2) {
    els.searchResults.innerHTML = '';
    return;
  }

  searchDebounceTimer = setTimeout(function() {
    els.searchResults.innerHTML = '';

    var players = searchPlayersLocal(query);

    if (players.length === 0) {
      els.searchResults.innerHTML =
        '<li style="justify-content:center;color:var(--muted)">No players found</li>';
      return;
    }

    players.forEach(function(p) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="search-player-icon">\u26BD</span><span>' + escapeHtml(p.name) + '</span>';
      li.addEventListener('click', function() { selectPlayer(p.name); });
      els.searchResults.appendChild(li);
    });
  }, 100);
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


function selectPlayer(playerName) {
  if (!state.activeCell || state.gameOver || state.submitted) return;

  var normalizedPlayerKey = normalizeKey(playerName);

  // Capture active cell BEFORE closing (closeSearch() clears state.activeCell)
  var cell = state.activeCell;
  var row = cell.row;
  var col = cell.col;
  var btn = cell.btn;

  // Duplicate check — exclude the current cell's existing player (for re-selection)
  var currentCellPlayer = state.cells[row + ',' + col].playerName;
  var currentCellKey = currentCellPlayer ? normalizeKey(currentCellPlayer) : null;
  if (state.usedPlayers.has(normalizedPlayerKey) && normalizedPlayerKey !== currentCellKey) {
    showFeedback(playerName + ' has already been used!', false);
    return;
  }

  closeSearch();

  // If this cell previously had a player, remove them from usedPlayers
  if (currentCellKey) {
    state.usedPlayers.delete(currentCellKey);
  }

  // Mark as filled (no validation yet)
  btn.classList.remove('correct', 'incorrect');
  btn.classList.add('filled');
  btn.innerHTML = '<span class="cell-player-name">' + escapeHtml(playerName) + '</span>';
  state.cells[row + ',' + col] = { status: 'filled', playerName: playerName };
  state.usedPlayers.add(normalizedPlayerKey);

  showFeedback(playerName + ' placed.', true);
  updateHUD();
  updateSubmitButton();
}


function showFeedback(msg, isSuccess) {
  els.feedback.textContent = msg;
  els.feedback.className = 'feedback ' + (isSuccess ? 'win' : 'fail');
}

function updateHUD() {
  var filled = 0;
  for (var key in state.cells) {
    if (state.cells[key].status === 'filled' || state.cells[key].status === 'correct' || state.cells[key].status === 'incorrect') {
      filled++;
    }
  }
  els.filledCount.textContent = filled;
  els.score.textContent = state.score;
}

function updateSubmitButton() {
  var allFilled = true;
  for (var key in state.cells) {
    if (state.cells[key].status === 'empty') {
      allFilled = false;
      break;
    }
  }
  if (els.submitGrid) {
    els.submitGrid.disabled = !allFilled;
    if (allFilled) {
      els.submitGrid.classList.add('ready');
    } else {
      els.submitGrid.classList.remove('ready');
    }
  }
}

function submitAllAnswers() {
  if (state.submitted || state.gameOver) return;
  state.submitted = true;
  state.gameOver = true;
  state.score = 0;

  // Validate all 9 cells
  var rows = state.grid.rows;
  var cols = state.grid.cols;
  var allBtns = els.gridBoard.querySelectorAll('.grid-cell');

  for (var r = 0; r < 3; r++) {
    for (var c = 0; c < 3; c++) {
      var cellKey = r + ',' + c;
      var cellData = state.cells[cellKey];
      var btn = allBtns[r * 3 + c];
      var rowName = rows[r].name;
      var colName = cols[c].name;

      var result = validateAnswerLocal(canonicalizePlayerName(cellData.playerName), rowName, colName);

      btn.classList.remove('filled');
      if (result.valid) {
        btn.classList.add('correct');
        state.cells[cellKey].status = 'correct';
        state.score++;
      } else {
        btn.classList.add('incorrect');
        state.cells[cellKey].status = 'incorrect';
      }
      btn.disabled = true;
    }
  }

  // Hide submit button, show Play Again button inline
  if (els.submitGrid) {
    els.submitGrid.style.display = 'none';
  }

  // Show Play Again button
  var playAgainBtn = document.getElementById('playAgainInline');
  if (playAgainBtn) {
    playAgainBtn.style.display = 'inline-flex';
  }

  updateHUD();

  // Show score as feedback
  setTimeout(function() {
    showFeedback('You scored ' + state.score + ' / 9!', state.score > 0);
  }, 800);

  // Save score to Supabase
  if (window.auth && window.auth.saveScore) {
    window.auth.saveScore('grid', state.score);
  }
}


function startGame(difficulty) {
  state.grid = generateGrid(difficulty);
  state.score = 0;
  state.cells = {};
  state.usedPlayers = new Set();
  state.activeCell = null;
  state.gameOver = false;
  state.submitted = false;

  var label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  els.difficultyLabel.textContent = label;
  els.competition.textContent = 'Daily Grid \u2014 ' + label;
  els.difficultyScreen.hidden = true;
  els.gameScreen.hidden = false;
  els.summaryModal.hidden = true;
  els.feedback.textContent = '';
  els.feedback.className = 'feedback';
  if (els.submitGrid) {
    els.submitGrid.disabled = true;
    els.submitGrid.classList.remove('ready');
    els.submitGrid.style.display = '';
  }
  // Hide play again button for new game
  var playAgainBtn = document.getElementById('playAgainInline');
  if (playAgainBtn) {
    playAgainBtn.style.display = 'none';
  }
  updateHUD();
  renderGrid();
  updateSubmitButton();
}

document.addEventListener('DOMContentLoaded', function() {
  cacheDom();

  // Load player database (Supabase → cache → JSON fallback)
  window.PlayerData.getGridPlayers().then(function(data) {
      // Normalize + deduplicate by name (keep the "best" record)
      var seen = {};
      var out = [];
      for (var i = 0; i < data.length; i++) {
        var raw = data[i] || {};
        var name = canonicalizePlayerName(raw.name);
        if (!name) continue;

        var clubs = Array.isArray(raw.clubs) ? raw.clubs.map(canonicalizeClub) : [];
        // remove empties + duplicates
        var clubsSeen = {};
        clubs = clubs.filter(function(c) {
          var k = normalizeKey(c);
          if (!k || clubsSeen[k]) return false;
          clubsSeen[k] = true;
          return true;
        });

        var nation = canonicalizeNation(raw.nation);
        var stats = Array.isArray(raw.stats) ? raw.stats.slice() : [];
        // normalize stats ids
        var statsSeen = {};
        stats = stats
          .map(function(s) { return String(s || '').trim(); })
          .filter(function(s) {
            var k2 = normalizeKey(s);
            if (!k2 || statsSeen[k2]) return false;
            statsSeen[k2] = true;
            return true;
          });

        var p = { name: name, clubs: clubs, nation: nation, stats: stats };
        var key = normalizeKey(name);

        if (!seen[key]) {
          seen[key] = { idx: out.length, score: clubs.length + stats.length };
          out.push(p);
        } else {
          // Prefer the entry with more info (clubs+stats)
          var score = clubs.length + stats.length;
          if (score > seen[key].score) {
            out[seen[key].idx] = p;
            seen[key].score = score;
          }
        }
      }
      playersDb = out;
      dbLoaded = true;
      els.startGameBtn.disabled = false;
    })
    .catch(function(err) {
      console.error('Failed to load player database:', err);
      showFeedback('Error loading player database. Please refresh.', false);
    });

  // Difficulty tab selection
  var selectedDifficulty = 'easy';
  document.querySelectorAll('.diff-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.diff-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      selectedDifficulty = tab.dataset.diff;
    });
  });

  // Start game button
  els.startGameBtn.addEventListener('click', function() {
    if (!dbLoaded) return;
    startGame(selectedDifficulty);
  });

  // Search modal
  els.searchInput.addEventListener('input', handleSearchInput);
  els.closeSearch.addEventListener('click', closeSearch);

  // Submit grid button
  if (els.submitGrid) {
    els.submitGrid.addEventListener('click', submitAllAnswers);
  }

  // Summary modal
  els.playAgain.addEventListener('click', function() { location.reload(); });

  // Escape key closes search modal
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !els.searchContainer.hidden) closeSearch();
  });
});
