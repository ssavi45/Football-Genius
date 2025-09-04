/* Football Genius — Game 2: Unscramble the Player
   Mechanics:
   - 10 questions per round.
   - 2 guesses per question.
   - Hints: Club, Record, Name Structure.
   - Points: 10 (no hint), 7 (1 hint), 5 (2 hints), 3 (3 hints).
*/
const $ = (sel) => document.querySelector(sel);

const els = {
  qIndex: $("#qIndex"),
  score: $("#score"),
  potential: $("#potential"),
  guessesLeft: $("#guessesLeft"),
  scrambleText: $("#scrambleText"),
  answerInput: $("#answerInput"),
  submitGuess: $("#submitGuess"),
  nextQuestion: $("#nextQuestion"),
  feedback: $("#feedback"),
  hintBtns: [$("#hint1Btn"), $("#hint2Btn"), $("#hint3Btn")],
  hintTexts: [$("#hint1Text"), $("#hint2Text"), $("#hint3Text")],
  progressFill: $("#progressFill"),
  modal: $("#summaryModal"),
  finalScore: $("#finalScore"),
  roundBreakdown: $("#roundBreakdown"),
  year: $("#year"),
};

// helpers
const canonicalize = (s="") => s.toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();

const pointsForHints = (h) => [10,7,5,3][Math.min(h,3)];

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function nameStructure(fullName){
  return fullName.split(/\s+/).map(p=>p.replace(/[^A-Za-z]/g,"").length).join("-");
}

// Data: players (keep hints non-obvious)
const PLAYERS = [
  { name:"Cristiano Ronaldo", scramble:"NORDACIALSIRNTOON", hints:[
    "Played for a club in Lisbon and another in Turin.",
    "Only player to win league titles in England, Spain and Italy with 400+ club league goals.",
    `Name pattern: ${nameStructure("Cristiano Ronaldo")}`
  ]},
  { name:"Lionel Messi", scramble:"SEILLMNIOE", hints:[
    "Won a World Cup while playing for a Parisian club.",
    "Most Ballon d'Or awards of any player.",
    `Name pattern: ${nameStructure("Lionel Messi")}`
  ]},
  { name:"Neymar Junior", scramble:"RANYUJONIRME", hints:[
    "Moved for a world-record fee from Spain to France.",
    "One of Brazil's top international scorers.",
    `Name pattern: ${nameStructure("Neymar Junior")}`
  ]},
  { name:"Kylian Mbappe", scramble:"LPYAEKMBANPI", hints:[
    "A teenage star at Monaco before moving to the capital.",
    "Youngest to reach 40+ UCL knockout goals (modern era).",
    `Name pattern: ${nameStructure("Kylian Mbappe")}`
  ]},
  { name:"Erling Haaland", scramble:"LNDARLEHINAGA", hints:[
    "Scored a record Premier League tally in his first season at a Manchester club (sky blue).",
    "Fastest to 50+ UCL goals.",
    `Name pattern: ${nameStructure("Erling Haaland")}`
  ]},
  { name:"Virgil van Dijk", scramble:"VIRGILVANDIJK", hints:[
    "Won UCL with a Merseyside club.",
    "One of the most expensive defenders when he moved from Southampton.",
    `Name pattern: ${nameStructure("Virgil van Dijk")}`
  ]},
  { name:"Luka Modric", scramble:"KALUODICMR", hints:[
    "Midfield maestro from the Balkans who shone in Madrid.",
    "First Ballon d'Or winner to break the Messi/Ronaldo streak since 2007.",
    `Name pattern: ${nameStructure("Luka Modric")}`
  ]},
  { name:"Kevin De Bruyne", scramble:"EVKINEBURDENY", hints:[
    "Became a key playmaker after returning to England from Germany.",
    "Multiple Premier League Playmaker of the Season awards.",
    `Name pattern: ${nameStructure("Kevin De Bruyne")}`
  ]},
  { name:"Robert Lewandowski", scramble:"REDWROSNALWTOEIKB", hints:[
    "Goal machine in Germany before moving to Spain.",
    "Scored 5 goals in 9 minutes in a Bundesliga match.",
    `Name pattern: ${nameStructure("Robert Lewandowski")}`
  ]},
  { name:"Andres Iniesta", scramble:"SDAREENISTA", hints:[
    "Scored a famous World Cup Final goal.",
    "Long-time Barcelona midfielder known for 'La Masia' roots.",
    `Name pattern: ${nameStructure("Andres Iniesta")}`
  ]},
  { name:"Didier Drogba", scramble:"ARDBGIDODIR", hints:[
    "Ivory Coast legend and a Chelsea hero in Munich.",
    "Scored the equaliser and winning penalty in a UCL final.",
    `Name pattern: ${nameStructure("Didier Drogba")}`
  ]},
  { name:"Francesco Totti", scramble:"SCOFCTTTOERANI", hints:[
    "Spent entire European club career in the Italian capital.",
    "One-club icon known as 'Il Capitano'.",
    `Name pattern: ${nameStructure("Francesco Totti")}`
  ]},
  { name:"Zlatan Ibrahimovic", scramble:"BAHTNMRIALIIZCVO", hints:[
    "Won league titles in the Netherlands, Italy, Spain and France.",
    "Acrobatic overhead kick from distance vs England.",
    `Name pattern: ${nameStructure("Zlatan Ibrahimovic")}`
  ]},
  { name:"Xavi Hernandez", scramble:"HENXZVAAIERD", hints:[
    "Midfield metronome later returned as coach of his boyhood club.",
    "World Cup and EURO winner, master of the pass-and-move style.",
    `Name pattern: ${nameStructure("Xavi Hernandez")}`
  ]},
  { name:"Sergio Ramos", scramble:"RGOESMSOIRA", hints:[
    "Captained a Madrid giant; also played in Paris.",
    "Defender known for clutch late goals in European finals.",
    `Name pattern: ${nameStructure("Sergio Ramos")}`
  ]},
  { name:"Mohamed Salah", scramble:"AOLHSMEAHMD", hints:[
    "Egyptian king of goals on Merseyside.",
    "Broke a 38‑game Premier League season scoring record.",
    `Name pattern: ${nameStructure("Mohamed Salah")}`
  ]},
  { name:"Karim Benzema", scramble:"KAZRIMBEMANE", hints:[
    "Formed a famous trio with two superstars in Madrid.",
    "Won Ballon d'Or after a prolific 2021–22 season.",
    `Name pattern: ${nameStructure("Karim Benzema")}`
  ]},
  { name:"Wayne Rooney", scramble:"WNOYEYROANE", hints:[
    "Record scorer for an English club in red.",
    "Bicycle kick vs rivals in a Manchester derby.",
    `Name pattern: ${nameStructure("Wayne Rooney")}`
  ]},
  { name:"Sadio Mane", scramble:"AEDSOMNAI", hints:[
    "Premier League Golden Boot (shared) before moving to Germany and Saudi Arabia.",
    "AFCON winner with his national team.",
    `Name pattern: ${nameStructure("Sadio Mane")}`
  ]},
  { name:"Manuel Neuer", scramble:"NEUNRMAUEL", hints:[
    "Revolutionised the 'sweeper-keeper' role in Germany.",
    "World Cup winner and multi-time Bundesliga champion.",
    `Name pattern: ${nameStructure("Manuel Neuer")}`
  ]},
];

// State
const state = {
  questions: [],
  index: 0,
  score: 0,
  guessesLeft: 2,
  hintsUsed: 0,
  revealedHints: [false,false,false],
  history: [],
};

function selectRound(){
  state.questions = shuffle(PLAYERS).slice(0,10);
  state.index = 0;
  state.score = 0;
  state.history = [];
  loadQuestion();
  updateHud();
  setFeedback("");
  updateProgress();
}

function currentQ(){ return state.questions[state.index]; }

function updateHud(){
  els.qIndex.textContent = state.index + 1;
  els.score.textContent = state.score;
  els.guessesLeft.textContent = state.guessesLeft;
  els.potential.textContent = pointsForHints(state.hintsUsed);
}

function updateProgress(){
  const pct = (state.index/10)*100;
  els.progressFill.style.width = pct + "%";
}

function loadQuestion(){
  const q = currentQ();
  state.guessesLeft = 2;
  state.hintsUsed = 0;
  state.revealedHints = [false,false,false];
  els.scrambleText.textContent = q.scramble.toUpperCase();
  els.answerInput.value = "";
  els.submitGuess.disabled = false;
  els.nextQuestion.hidden = true;
  els.hintBtns.forEach((b)=>{ b.disabled=false; b.classList.remove("secondary"); });
  els.hintTexts.forEach((p)=> p.textContent = "");
  setFeedback("");
  updateHud();
  updateProgress();
}

function setFeedback(msg, type=""){
  els.feedback.textContent = msg;
  els.feedback.classList.remove("win","fail");
  if(type==="win") els.feedback.classList.add("win");
  if(type==="fail") els.feedback.classList.add("fail");
}

function unlockHint(i){
  const q = currentQ();
  if(state.revealedHints[i]) return;
  els.hintTexts[i].textContent = q.hints[i];
  state.revealedHints[i] = true;
  state.hintsUsed = state.revealedHints.filter(Boolean).length;
  els.hintBtns[i].disabled = true;
  els.hintBtns[i].classList.add("secondary");
  updateHud();
}

function submitGuess(){
  const q = currentQ();
  const guess = canonicalize(els.answerInput.value);
  const answer = canonicalize(q.name);
  const correct = guess === answer;
  if(correct){
    const pts = pointsForHints(state.hintsUsed);
    state.score += pts;
    state.history.push({
      q: q.scramble + " → " + q.name,
      result: "Correct",
      earned: pts,
      hints: state.hintsUsed,
      attempts: 3 - state.guessesLeft,
    });
    setFeedback(`Correct! It was ${q.name}. You earned ${pts} pts.`, "win");
    els.submitGuess.disabled = true;
    els.nextQuestion.hidden = false;
  }else{
    state.guessesLeft -= 1;
    updateHud();
    if(state.guessesLeft > 0){
      setFeedback("Not quite! Try again — you have 1 guess left.", "fail");
    }else{
      state.history.push({
        q: q.scramble + " → " + q.name,
        result: "Wrong",
        earned: 0,
        hints: state.hintsUsed,
        attempts: 2,
      });
      setFeedback(`No points. Correct answer was ${q.name}.`, "fail");
      els.submitGuess.disabled = true;
      els.nextQuestion.hidden = false;
    }
  }
}

function nextQuestion(){
  if(state.index < 9){
    state.index += 1;
    loadQuestion();
  }else{
    endRound();
  }
}

function endRound(){
  els.progressFill.style.width = "100%";
  els.finalScore.textContent = state.score;
  const frag = document.createDocumentFragment();
  state.history.forEach((h,i)=>{
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div>#${i+1} — ${h.q}</div><div>${h.result}</div><div>${h.earned} pts</div>`;
    frag.appendChild(row);
  });
  els.roundBreakdown.innerHTML = "";
  els.roundBreakdown.appendChild(frag);
  els.modal.hidden = false;
}

// events
els.hintBtns.forEach((btn)=> btn.addEventListener("click", (e)=>{
  unlockHint(parseInt(e.currentTarget.dataset.index,10));
}));
els.submitGuess.addEventListener("click", submitGuess);
els.nextQuestion.addEventListener("click", nextQuestion);
els.answerInput.addEventListener("keydown", (e)=>{
  if(e.key === "Enter"){ submitGuess(); }
});

// init
els.year.textContent = new Date().getFullYear();
selectRound();
