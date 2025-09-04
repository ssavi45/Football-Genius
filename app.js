/* Football Genius — Scoreline Quiz
   Author: Copilot
   Notes:
   - 10 questions per round.
   - 2 guesses per question.
   - Points: 10 (no hint), 7 (1 hint), 5 (2 hints), 3 (3 hints).
   - Scoreline equals the final score after extra time if played; shoot-outs not counted.
*/

const $ = (sel) => document.querySelector(sel);

const els = {
  qIndex: $("#qIndex"),
  score: $("#score"),
  potential: $("#potential"),
  guessesLeft: $("#guessesLeft"),

  competition: $("#competition"),
  homeName: $("#homeName"),
  awayName: $("#awayName"),
  homeLogo: $("#homeLogo"),
  awayLogo: $("#awayLogo"),
  date: $("#date"),
  venue: $("#venue"),

  homeScore: $("#homeScore"),
  awayScore: $("#awayScore"),
  submitGuess: $("#submitGuess"),
  nextQuestion: $("#nextQuestion"),
  feedback: $("#feedback"),

  hintBtns: [$("#hint1Btn"), $("#hint2Btn"), $("#hint3Btn")],
  hintTexts: [$("#hint1Text"), $("#hint2Text"), $("#hint3Text")],

  progressFill: $("#progressFill"),

  modal: $("#summaryModal"),
  finalScore: $("#finalScore"),
  roundBreakdown: $("#roundBreakdown"),
  playAgain: $("#playAgain"),
  closeModal: $("#closeModal"),

  year: $("#year"),
};

// Format helpers
const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

// Points mapping by hints used
const pointsForHints = (hintsUsed) => [10, 7, 5, 3][Math.min(hintsUsed, 3)];

// Shuffle in-place
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Data: famous matches (2010 — present)
const MATCHES = [
  {
    id: "ucl-2022-final-rm-liv",
    competition: "UEFA Champions League",
    stage: "Final",
    date: "2022-05-28",
    venue: "Stade de France, Saint-Denis",
    homeTeam: "Real Madrid",
    awayTeam: "Liverpool",
    score: { home: 1, away: 0 },
    hints: [
      "Scorer: Vinícius Júnior scored a goal.",
      "Man of the Match: Thibaut Courtois.",
      "Fun fact: Courtois made a record number of saves in a UCL final for Madrid to win their 14th European Cup.",
    ],
  },
  {
    id: "wc-2014-semi-bra-ger",
    competition: "FIFA World Cup",
    stage: "Semi-final",
    date: "2014-07-08",
    venue: "Mineirão, Belo Horizonte",
    homeTeam: "Brazil",
    awayTeam: "Germany",
    score: { home: 1, away: 7 },
    hints: [
      "Brace: Toni Kroos scored twice in two minutes.",
      "Man of the Match: Toni Kroos.",
      "Fun fact: Miroslav Klose became the all-time World Cup top scorer in this game.",
    ],
  },
  {
    id: "wc-2018-final-fra-cro",
    competition: "FIFA World Cup",
    stage: "Final",
    date: "2018-07-15",
    venue: "Luzhniki Stadium, Moscow",
    homeTeam: "France",
    awayTeam: "Croatia",
    score: { home: 4, away: 2 },
    hints: [
      "Scorers: Griezmann, Pogba and Mbappé scored for France.",
      "Man of the Match: Antoine Griezmann.",
      "Fun fact: It was the highest-scoring World Cup final since 1966.",
    ],
  },
  {
    id: "ucl-2019-sf2-liv-bar",
    competition: "UEFA Champions League",
    stage: "Semi-final 2nd leg",
    date: "2019-05-07",
    venue: "Anfield, Liverpool",
    homeTeam: "Liverpool",
    awayTeam: "Barcelona",
    score: { home: 4, away: 0 },
    hints: [
      "Braces: Divock Origi and Georginio Wijnaldum each scored in the match.",
      "Iconic moment: 'Corner taken quickly' led to the decisive goal.",
      "Fun fact: Liverpool overturned a 3–0 first-leg deficit.",
    ],
  },
  {
    id: "ucl-2020-final-bay-psg",
    competition: "UEFA Champions League",
    stage: "Final",
    date: "2020-08-23",
    venue: "Estádio da Luz, Lisbon",
    homeTeam: "Bayern Munich",
    awayTeam: "Paris Saint-Germain",
    score: { home: 1, away: 0 },
    hints: [
      "Scorer: Kingsley Coman headed the winner.",
      "Man of the Match: Kingsley Coman.",
      "Fun fact: Bayern completed a treble under Hansi Flick.",
    ],
  },
  {
    id: "ucl-2013-final-bay-bvb",
    competition: "UEFA Champions League",
    stage: "Final",
    date: "2013-05-25",
    venue: "Wembley Stadium, London",
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    score: { home: 2, away: 1 },
    hints: [
      "Winner: Arjen Robben scored the decisive late goal.",
      "Man of the Match: Arjen Robben.",
      "Fun fact: It was the first all-German UCL final.",
    ],
  },
  {
    id: "ucl-2015-final-bar-juv",
    competition: "UEFA Champions League",
    stage: "Final",
    date: "2015-06-06",
    venue: "Olympiastadion, Berlin",
    homeTeam: "Barcelona",
    awayTeam: "Juventus",
    score: { home: 3, away: 1 },
    hints: [
      "Scorers: Rakitić, Suárez and Neymar scored for Barcelona.",
      "Man of the Match: Andrés Iniesta.",
      "Fun fact: Barcelona completed the treble under Luis Enrique.",
    ],
  },
  {
    id: "ucl-2011-final-bar-mun",
    competition: "UEFA Champions League",
    stage: "Final",
    date: "2011-05-28",
    venue: "Wembley Stadium, London",
    homeTeam: "Barcelona",
    awayTeam: "Manchester United",
    score: { home: 3, away: 1 },
    hints: [
      "Scorers: Pedro, Messi and Villa for Barça.",
      "Man of the Match: Lionel Messi.",
      "Fun fact: Sir Alex Ferguson called Barcelona the best team he had faced.",
    ],
  },
  {
    id: "ucl-2016-final-rm-atm",
    competition: "UEFA Champions League",
    stage: "Final",
    date: "2016-05-28",
    venue: "San Siro, Milan",
    homeTeam: "Real Madrid",
    awayTeam: "Atlético Madrid",
    score: { home: 1, away: 1 }, // Real won on pens
    hints: [
      "Scorers: Sergio Ramos for Madrid; Carrasco equalized for Atleti.",
      "Man of the Match: Sergio Ramos.",
      "Fun fact: Madrid won their 11th European Cup on penalties.",
    ],
  },
  {
    id: "ucl-2017-final-rm-juv",
    competition: "UEFA Champions League",
    stage: "Final",
    date: "2017-06-03",
    venue: "Millennium Stadium, Cardiff",
    homeTeam: "Real Madrid",
    awayTeam: "Juventus",
    score: { home: 4, away: 1 },
    hints: [
      "Brace: Cristiano Ronaldo scored twice.",
      "Spectacular strike: Mario Mandžukić scored a famous overhead kick.",
      "Fun fact: First team to retain the UCL era title.",
    ],
  },
  {
    id: "ucl-2021-final-che-mci",
    competition: "UEFA Champions League",
    stage: "Final",
    date: "2021-05-29",
    venue: "Estádio do Dragão, Porto",
    homeTeam: "Chelsea",
    awayTeam: "Manchester City",
    score: { home: 1, away: 0 },
    hints: [
      "Scorer: Kai Havertz rounded the keeper to score.",
      "Man of the Match: N'Golo Kanté.",
      "Fun fact: Chelsea kept a clean sheet in all knockout away games that season.",
    ],
  },
  {
    id: "euro-2012-final-esp-ita",
    competition: "UEFA EURO",
    stage: "Final",
    date: "2012-07-01",
    venue: "NSC Olimpiyskiy, Kyiv",
    homeTeam: "Spain",
    awayTeam: "Italy",
    score: { home: 4, away: 0 },
    hints: [
      "Scorers: Silva, Jordi Alba, Torres, Mata.",
      "Man of the Match: Andrés Iniesta.",
      "Fun fact: Largest margin in a EURO final.",
    ],
  },
  {
    id: "euro-2016-final-por-fra",
    competition: "UEFA EURO",
    stage: "Final",
    date: "2016-07-10",
    venue: "Stade de France, Saint-Denis",
    homeTeam: "Portugal",
    awayTeam: "France",
    score: { home: 1, away: 0 }, // AET
    hints: [
      "Scorer: Éder scored in extra time.",
      "Star sidelined: Cristiano Ronaldo went off injured early.",
      "Man of the Match: Pepe.",
    ],
  },
  {
    id: "wc-2010-final-esp-ned",
    competition: "FIFA World Cup",
    stage: "Final",
    date: "2010-07-11",
    venue: "Soccer City, Johannesburg",
    homeTeam: "Netherlands",
    awayTeam: "Spain",
    score: { home: 0, away: 1 }, // AET
    hints: [
      "Scorer: Andrés Iniesta struck in extra time.",
      "Golden Glove: Iker Casillas made key saves.",
      "Fun fact: Spain's first World Cup title.",
    ],
  },
  {
    id: "epl-2012-mci-qpr",
    competition: "Premier League",
    stage: "Matchweek 38",
    date: "2012-05-13",
    venue: "Etihad Stadium, Manchester",
    homeTeam: "Manchester City",
    awayTeam: "Queens Park Rangers",
    score: { home: 3, away: 2 },
    hints: [
      "Famous moment: '93:20' winner.",
      "Scorer: Sergio Agüero scored the title-winning goal.",
      "Fun fact: City won the league on goal difference.",
    ],
  },
  {
    id: "laliga-2010-bar-rma",
    competition: "LaLiga",
    stage: "El Clásico",
    date: "2010-11-29",
    venue: "Camp Nou, Barcelona",
    homeTeam: "Barcelona",
    awayTeam: "Real Madrid",
    score: { home: 5, away: 0 },
    hints: [
      "Brace: David Villa scored twice.",
      "Assists: Lionel Messi assisted two goals.",
      "Fun fact: Often called the 'Manita' Clásico.",
    ],
  },
  {
    id: "ucl-2013-sf1-bay-bar",
    competition: "UEFA Champions League",
    stage: "Semi-final 1st leg",
    date: "2013-04-23",
    venue: "Allianz Arena, Munich",
    homeTeam: "Bayern Munich",
    awayTeam: "Barcelona",
    score: { home: 4, away: 0 },
    hints: [
      "Scorers: Müller (2), Gomez, Robben.",
      "Man of the Match: Thomas Müller.",
      "Fun fact: Bayern won the tie 7–0 on aggregate.",
    ],
  },
  {
    id: "ucl-2023-sf2-mci-rma",
    competition: "UEFA Champions League",
    stage: "Semi-final 2nd leg",
    date: "2023-05-17",
    venue: "Etihad Stadium, Manchester",
    homeTeam: "Manchester City",
    awayTeam: "Real Madrid",
    score: { home: 4, away: 0 },
    hints: [
      "Brace: Bernardo Silva scored twice.",
      "Man of the Match: Bernardo Silva.",
      "Fun fact: City advanced to their second UCL final.",
    ],
  },
  {
    id: "epl-2018-liv-mci",
    competition: "Premier League",
    stage: "Matchweek 23",
    date: "2018-01-14",
    venue: "Anfield, Liverpool",
    homeTeam: "Liverpool",
    awayTeam: "Manchester City",
    score: { home: 4, away: 3 },
    hints: [
      "Scorers: Salah, Firmino and Mané all scored.",
      "Fun fact: City's first league defeat of the 2017–18 season.",
      "Late push: City scored twice in the final 10 minutes.",
    ],
  },
  {
    id: "cdr-2011-final-rm-bar",
    competition: "Copa del Rey",
    stage: "Final",
    date: "2011-04-20",
    venue: "Mestalla, Valencia",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    score: { home: 1, away: 0 }, // AET
    hints: [
      "Scorer: Cristiano Ronaldo scored an extra-time header.",
      "Manager duel: Mourinho vs Guardiola.",
      "Fun fact: Sergio Ramos famously dropped the trophy during celebrations on the bus.",
    ],
  },
  {
    id: "wc-2022-group-arg-ksa",
    competition: "FIFA World Cup",
    stage: "Group stage",
    date: "2022-11-22",
    venue: "Lusail Stadium, Lusail",
    homeTeam: "Argentina",
    awayTeam: "Saudi Arabia",
    score: { home: 1, away: 2 },
    hints: [
      "Upset: Tournament's first major shock.",
      "Scorer: Salem Al-Dawsari scored a stunning winner.",
      "Argentina went on to win the World Cup despite this loss.",
    ],
  },
  {
    id: "ucl-2023-final-mci-int",
    competition: "UEFA Champions League",
    stage: "Final",
    date: "2023-06-10",
    venue: "Atatürk Olympic Stadium, Istanbul",
    homeTeam: "Manchester City",
    awayTeam: "Inter",
    score: { home: 1, away: 0 },
    hints: [
      "Scorer: Rodri found the net from the edge of the box.",
      "Man of the Match: Rodri.",
      "Fun fact: Completed City's historic treble.",
    ],
  },
  {
    id: "ucl-2014-final-rm-atm",
    competition: "UEFA Champions League",
    stage: "Final",
    date: "2014-05-24",
    venue: "Estádio da Luz, Lisbon",
    homeTeam: "Real Madrid",
    awayTeam: "Atlético Madrid",
    score: { home: 4, away: 1 }, // AET
    hints: [
      "Equalizer: Sergio Ramos scored the famous equalizer in minute 92:48.",
      "Extra time scorers: Bale, Marcelo, Ronaldo.",
      "Fun fact: La Décima — Madrid's 10th European Cup.",
    ],
  },
  // --- Add new matches below ---
  {
    id: "wc-2006-final-ita-fra",
    competition: "FIFA World Cup",
    stage: "Final",
    date: "2006-07-09",
    venue: "Olympiastadion, Berlin",
    homeTeam: "Italy",
    awayTeam: "France",
    score: { home: 1, away: 1 }, // Italy won on pens
    hints: [
      "Zidane scored a Panenka penalty.",
      "Zidane was sent off for headbutting Materazzi.",
      "Italy won 5–3 on penalties.",
    ],
  },
  {
    id: "ucl-1999-final-mun-bay",
    competition: "UEFA Champions League",
    stage: "Final",
    date: "1999-05-26",
    venue: "Camp Nou, Barcelona",
    homeTeam: "Manchester United",
    awayTeam: "Bayern Munich",
    score: { home: 2, away: 1 },
    hints: [
      "United scored twice in injury time.",
      "Solskjær scored the winner.",
      "United completed the treble.",
    ],
  },
  {
    id: "epl-2013-crystal-liv",
    competition: "Premier League",
    stage: "Matchweek 37",
    date: "2014-05-05",
    venue: "Selhurst Park, London",
    homeTeam: "Crystal Palace",
    awayTeam: "Liverpool",
    score: { home: 3, away: 3 },
    hints: [
      "Liverpool led 3–0 before Palace's comeback.",
      "Dwight Gayle scored twice.",
      "Known as 'Crystanbul'.",
    ],
  },
  // ...add 97 more matches in this format...
];

// Local logos (from /img). Update paths if you rename files.
const TEAM_LOGOS = {
  "Real Madrid": "img/rmcf.png",
  "Liverpool": "img/lfc.png",
  "Brazil": "img/brazil.png",
  "Germany": "img/germany.png",
  "France": "img/france.png",
  "Croatia": "img/croatia.png",
  "Barcelona": "img/fcb.png",
  "Bayern Munich": "img/bayern.png",
  "Paris Saint-Germain": "img/psg.png",
  "Borussia Dortmund": "img/bvb.png",
  "Juventus": "img/juve.png",
  "Manchester United": "img/manu.png",
  "Atlético Madrid": "img/atletico.png",
  "Chelsea": "img/cfc.png",
  "Manchester City": "img/mancity.png",
  "Spain": "img/spain.png",
  "Italy": "img/italy.png",
  "Portugal": "img/portugal.png",
  "Netherlands": "img/netherlands.png",
  "Queens Park Rangers": "img/qpr.png",
  "Inter": "img/inter.png",
  "Argentina": "img/argentina.png",
  "Saudi Arabia": "img/saudi.png",
  "Crystal Palace": "img/crystalpalace.png",
  // Add new teams as needed, e.g.:
  "AC Milan": "img/acmilan.png",
  "Ajax": "img/ajax.png",
  "AS Roma": "img/asroma.png",
  "Aston Villa": "img/astonvilla.png",
  "Atalanta": "img/atalanta.png",
  "Benfica": "img/benfica.png",
  "Celtic": "img/celtic.png",
  "Feyenoord": "img/feyenoord.png",
  "Fiorentina": "img/fiorentina.png",
  "Galatasaray": "img/galatasaray.png",
  "Lazio": "img/lazio.png",
  "Leverkusen": "img/leverkusen.png",
  "Lille": "img/lille.png",
  "Monaco": "img/monaco.png",
  "Napoli": "img/napoli.png",
  "Nice": "img/nice.png",
  "Porto": "img/porto.png",
  "Sevilla": "img/sevilla.png",
  "Sporting": "img/sporting.png",
  "Spurs": "img/spurs.png",
  "West Ham": "img/whu.png",
  // ...add more as you add matches...
};
const DEFAULT_LOGO = "img/ucl.png"; // use any local placeholder you like

// Normalize names (lowercase, remove accents/punctuation)
const canonicalize = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // strip diacritics
    .replace(/[^a-z0-9\s]/g, " ")     // remove punctuation
    .replace(/\s+/g, " ")             // collapse spaces
    .trim();

// Common aliases -> official keys in TEAM_LOGOS
const ALIASES = {
  "psg": "Paris Saint-Germain",
  "paris saint germain": "Paris Saint-Germain",
  "man city": "Manchester City",
  "manchester city": "Manchester City",
  "man utd": "Manchester United",
  "man united": "Manchester United",
  "manchester utd": "Manchester United",
  "inter milan": "Inter",
  "internazionale": "Inter",
  "fc internazionale": "Inter",
  "bayern munchen": "Bayern Munich",
  "fc bayern munchen": "Bayern Munich",
  "fc bayern munchen 2017": "Bayern Munich",
  "atletico madrid": "Atlético Madrid",
  "atletico de madrid": "Atlético Madrid",
  "barca": "Barcelona",
  "fc barcelona": "Barcelona",
  "real madrid cf": "Real Madrid",
  "real madrid c f": "Real Madrid",
  "qpr": "Queens Park Rangers",
  "borussia dortmund": "Borussia Dortmund",
  "bvb": "Borussia Dortmund",
  "ksa": "Saudi Arabia",
};

// Resolve a name to a logo URL using aliases and fallbacks
function getTeamLogo(name) {
  if (!name) return DEFAULT_LOGO;
  // Direct hit
  if (TEAM_LOGOS[name]) return TEAM_LOGOS[name];

  const key = canonicalize(name);
  // Alias hit
  const aliasName = ALIASES[key];
  if (aliasName && TEAM_LOGOS[aliasName]) return TEAM_LOGOS[aliasName];

  // Heuristic: strip common suffixes/prefixes like "fc", "cf", "club", etc.
  const stripped = key
    .replace(/\b(fc|cf|afc|sc|ac|club|de|cf\.)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const alias2 = ALIASES[stripped];
  if (alias2 && TEAM_LOGOS[alias2]) return TEAM_LOGOS[alias2];

  return DEFAULT_LOGO;
}

/* State */
const state = {
  questions: [],
  index: 0,
  score: 0,
  guessesLeft: 2,
  hintsUsed: 0,
  revealedHints: [false, false, false],
  history: [], // for breakdown
};

function newRound() {
  state.questions = shuffle(MATCHES).slice(0, 10);
  state.index = 0;
  state.score = 0;
  state.history = [];
  loadQuestion();
  updateHud();
  setFeedback("");
  updateProgress();
}

function currentMatch() {
  return state.questions[state.index];
}

function updateHud() {
  els.qIndex.textContent = state.index + 1;
  els.score.textContent = state.score;
  els.guessesLeft.textContent = state.guessesLeft;
  els.potential.textContent = pointsForHints(state.hintsUsed);
}

function updateProgress() {
  const pct = (state.index / 10) * 100;
  els.progressFill.style.width = `${pct}%`;
}

function loadQuestion() {
  const m = currentMatch();
  // reset per-question state
  state.guessesLeft = 2;
  state.hintsUsed = 0;
  state.revealedHints = [false, false, false];

  // UI defaults
  els.homeScore.value = 0;
  els.awayScore.value = 0;
  els.submitGuess.disabled = false;
  els.nextQuestion.hidden = true;

  els.hintBtns.forEach((b) => {
    b.disabled = false;
    b.classList.remove("secondary");
  });
  els.hintTexts.forEach((p) => (p.textContent = ""));

  // Fill view
  const label = m.stage ? `${m.competition} — ${m.stage}` : m.competition;
  els.competition.textContent = label;
  els.homeName.textContent = m.homeTeam;
  els.awayName.textContent = m.awayTeam;

  // Safer image setup + robust resolution
  [els.homeLogo, els.awayLogo].forEach((img) => {
    img.decoding = "async";
    img.loading = "eager";
    img.onerror = () => (img.src = DEFAULT_LOGO);
  });
  els.homeLogo.src = getTeamLogo(m.homeTeam);
  els.homeLogo.alt = `${m.homeTeam} logo`;
  els.awayLogo.src = getTeamLogo(m.awayTeam);
  els.awayLogo.alt = `${m.awayTeam} logo`;

  els.date.textContent = formatDate(m.date);
  els.venue.textContent = m.venue;

  setFeedback("");
  updateHud();
  updateProgress();
}

function setFeedback(msg, type = "") {
  els.feedback.textContent = msg;
  els.feedback.classList.remove("win", "fail");
  if (type === "win") els.feedback.classList.add("win");
  if (type === "fail") els.feedback.classList.add("fail");
}

function unlockHint(i) {
  const m = currentMatch();
  if (state.revealedHints[i]) return;

  // Reveal
  els.hintTexts[i].textContent = m.hints[i];
  state.revealedHints[i] = true;

  // Count hints used (unique ones only)
  state.hintsUsed = state.revealedHints.filter(Boolean).length;

  // Disable this button
  els.hintBtns[i].disabled = true;
  els.hintBtns[i].classList.add("secondary");

  // Update potential points
  updateHud();
}

function onAdjust(side, delta) {
  const input = side === "home" ? els.homeScore : els.awayScore;
  let val = parseInt(input.value || "0", 10) + delta;
  val = Math.max(0, Math.min(15, val));
  input.value = val;
}

function submitGuess() {
  const m = currentMatch();
  const h = parseInt(els.homeScore.value || "0", 10);
  const a = parseInt(els.awayScore.value || "0", 10);

  const correct = h === m.score.home && a === m.score.away;

  if (correct) {
    const pts = pointsForHints(state.hintsUsed);
    state.score += pts;

    state.history.push({
      q: `${m.homeTeam} ${m.score.home}–${m.score.away} ${m.awayTeam}`,
      result: "Correct",
      earned: pts,
      hints: state.hintsUsed,
      attempts: 3 - state.guessesLeft,
    });

    setFeedback(`Correct! You earned ${pts} point${pts === 1 ? "" : "s"}.`, "win");
    els.submitGuess.disabled = true;
    els.nextQuestion.hidden = false;
  } else {
    state.guessesLeft -= 1;
    updateHud();

    if (state.guessesLeft > 0) {
      setFeedback("Not quite! Try again — you have 1 guess left.", "fail");
    } else {
      state.history.push({
        q: `${m.homeTeam} ${m.score.home}–${m.score.away} ${m.awayTeam}`,
        result: "Wrong",
        earned: 0,
        hints: state.hintsUsed,
        attempts: 2,
      });

      setFeedback(
        `No points. Correct score was ${m.homeTeam} ${m.score.home}–${m.score.away} ${m.awayTeam}.`,
        "fail"
      );
      els.submitGuess.disabled = true;
      els.nextQuestion.hidden = false;
    }
  }
}

function nextQuestion() {
  if (state.index < 9) {
    state.index += 1;
    loadQuestion();
  } else {
    endRound();
  }
}

function endRound() {
  els.progressFill.style.width = "100%";
  els.finalScore.textContent = state.score;
  // Breakdown
  const frag = document.createDocumentFragment();
  state.history.forEach((h, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <div>#${i + 1} — ${h.q}</div>
      <div>${h.result}</div>
      <div>${h.earned} pts</div>
    `;
    frag.appendChild(row);
  });
  els.roundBreakdown.innerHTML = "";
  els.roundBreakdown.appendChild(frag);

  els.modal.hidden = false;
}

function closeModal() {
  els.modal.hidden = true;
}

function playAgain() {
  closeModal();
  newRound();
}

// Wire up events
els.hintBtns.forEach((btn) =>
  btn.addEventListener("click", (e) => {
    unlockHint(parseInt(e.currentTarget.dataset.index, 10));
  })
);

document.querySelectorAll(".score-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const side = e.currentTarget.dataset.side;
    const delta = e.currentTarget.classList.contains("plus") ? 1 : -1;
    onAdjust(side, delta);
  });
});

els.submitGuess.addEventListener("click", submitGuess);
els.nextQuestion.addEventListener("click", nextQuestion);
els.playAgain.addEventListener("click", playAgain);
els.closeModal.addEventListener("click", closeModal);

// Keyboard support: arrow keys bump focused score field
[els.homeScore, els.awayScore].forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); input.value = Math.min(15, (+input.value || 0) + 1); }
    if (e.key === "ArrowDown") { e.preventDefault(); input.value = Math.max(0, (+input.value || 0) - 1); }
  });
});

// Initialize
els.year.textContent = new Date().getFullYear();
newRound();