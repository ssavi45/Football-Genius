/* Football Genius — Game 3: Who said it?
   Mechanics:
   - 10 questions per round.
   - One attempt per question.
   - One hint (context). Scoring: 10 (no hint), 7 (after hint).
   - Show correct result with player image (place at img/players/<slug>.jpg).
*/
const $ = (sel) => document.querySelector(sel);

const els = {
  qIndex: $("#qIndex"),
  score: $("#score"),
  potential: $("#potential"),
  quoteText: $("#quoteText"),
  options: $("#options"),
  hintBtn: $("#hintBtn"),
  hintText: $("#hintText"),
  nextQuestion: $("#nextQuestion"),
  feedback: $("#feedback"),
  progressFill: $("#progressFill"),
  modal: $("#summaryModal"),
  finalScore: $("#finalScore"),
  roundBreakdown: $("#roundBreakdown"),
  revealImg: $("#revealImg"),
  revealName: $("#revealName"),
  year: $("#year"),
};

const pointsForHints = (h) => [10,7][Math.min(h,1)];

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function slugify(name){
  return name
    .normalize("NFD")                    // remove accents
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Map normalized names -> image filenames (under img/players/)
const IMAGE_MAP = {
  "cristiano-ronaldo": "ronaldo.jpg",
  "lionel-messi": "messi.jpg",
  "neymar-jr": "neymar.jpg",
  "didier-drogba": "drogba.jpg",
  "wayne-rooney": "rooney.jpg",
  "frank-lampard": "lampard.jpg",
  "sir-alex-ferguson": "ferguson.jpg",
  "jose-mourinho": "mourinho.jpg",
  "pep-guardiola": "guardiola.jpg",
  "carlo-ancelotti": "ancelotti.jpg",
  "arsene-wenger": "wenger.jpg",
  "zlatan-ibrahimovic": "zlatan.jpg",
  "kylian-mbappe": "mbappe.jpg",
  "thierry-henry": "henry.jpg",
  "kobe-bryant": "kobe.jpg",
  "luka-modric": "modric.jpg",
  "erling-haaland": "haaland.jpg",
  "jude-bellingham": "bellingham.jpg",
  "robert-lewandowski": "lewandowski.jpg",
  "johan-cruyff": "cruyff.jpg",
  "kevin-de-bruyne": "bruyne.jpg",
  "karim-benzema": "benzema.jpg",
  "diego-simeone": "simeone.jpg"
};

const PLACEHOLDER_IMG = "img/players/_placeholder.jpg";

function getImagePath(name, explicit){
  if (explicit) return "img/" + explicit;
  const key = slugify(name);
  const mapped = IMAGE_MAP[key];
  if (mapped) return "img/players/" + mapped;
  return "img/players/" + key + ".jpg";
}

const QUESTIONS = [
  {
    quote: "Your love makes me strong, your hate makes me unstoppable.",
    options: ["Cristiano Ronaldo","Lionel Messi","Neymar Jr"],
    answer: 0,
    context: "Said in response to critics and adoration during his peak years.",
    image: "players/ronaldo.jpg"
  },
  {
    quote: "It's a disgrace, it's a fucking disgrace.",
    options: ["Didier Drogba","Wayne Rooney","Frank Lampard"],
    answer: 0,
    context: "Post‑match outburst on live TV after a controversial UCL semi‑final vs Barcelona (2009).",
    image: "players/drogba.jpg"
  },
  {
    quote: "If I speak, I am in big trouble.",
    options: ["Sir Alex Ferguson","José Mourinho","Pep Guardiola"],
    answer: 1,
    context: "Press conference remark implying he would be punished if he said what he really thought about refereeing.",
    image: "players/mourinho.jpg"
  },
  {
    quote: "The most important thing is to try and inspire people so that they can be great in whatever they want to do.",
    options: ["Kylian Mbappé","Kobe Bryant","Thierry Henry"],
    answer: 1,
    context: "Cross‑sport icon whose mentality has inspired many footballers.",
    image: "players/kobe.jpg"
  },
  {
    quote: "I don't need the best haircut to play.",
    options: ["Gareth Bale","Luka Modrić","Erling Haaland"],
    answer: 1,
    context: "Down‑to‑earth line from a Ballon d'Or winning midfielder.",
    image: "players/modric.jpg"
  },
  {
    quote: "I think I'm a special one.",
    options: ["José Mourinho","Zlatan Ibrahimović","Carlo Ancelotti"],
    answer: 0,
    context: "Introductory press conference in England that coined a nickname.",
    image: "players/mourinho.jpg"
  },
  {
    quote: "I have more trophies than the other 19 managers combined.",
    options: ["Pep Guardiola","Arsène Wenger","José Mourinho"],
    answer: 2,
    context: "A pointed comparison about managerial silverware in the league.",
    image: "players/mourinho.jpg"
  },
  {
    quote: "I will bring you the Champions League.",
    options: ["Cristiano Ronaldo","Zlatan Ibrahimović","Didier Drogba"],
    answer: 2,
    context: "Said to the Chelsea owner before the club's first UCL title; later scored the equaliser and winning penalty in the final.",
    image: "players/drogba.jpg"
  },
  {
    quote: "I don't know about pressure. I don't think I've felt it.",
    options: ["Kylian Mbappé","Erling Haaland","Jude Bellingham"],
    answer: 1,
    context: "Norwegian striker speaking on handling expectations.",
    image: "players/haaland.jpg"
  },
  {
    quote: "I start early and I stay late, day after day, year after year.",
    options: ["Cristiano Ronaldo","Lionel Messi","Robert Lewandowski"],
    answer: 0,
    context: "On relentless work ethic outside matchdays.",
    image: "players/ronaldo.jpg"
  },
  {
    quote: "I prefer to win 5–4 than 1–0.",
    options: ["Pep Guardiola","Johan Cruyff","Diego Simeone"],
    answer: 1,
    context: "A manager/philosopher expressing a love for attacking football.",
    image: "players/cruyff.jpg"
  },
  {
    quote: "Sometimes you have to accept you cannot always be the best.",
    options: ["Lionel Messi","Kevin De Bruyne","Karim Benzema"],
    answer: 1,
    context: "Modest reflection from a creative Premier League playmaker.",
    image: "players/bruyne.jpg"
  }
];

const state = {
  questions: [],
  index: 0,
  score: 0,
  hintsUsed: 0,
  usedHintThisQ: false,
  history: [],
  locked: false,
  lastCorrect: null,
};

function newRound(){
  state.questions = shuffle(QUESTIONS).slice(0,10);
  state.index = 0;
  state.score = 0;
  state.hintsUsed = 0;
  state.history = [];
  state.locked = false;
  loadQuestion();
  updateHud();
  setFeedback("");
  updateProgress();
}

function currentQ(){ return state.questions[state.index]; }

function updateHud(){
  els.qIndex.textContent = state.index + 1;
  els.score.textContent = state.score;
  els.potential.textContent = pointsForHints(state.usedHintThisQ ? 1 : 0);
}

function updateProgress(){
  const pct = (state.index/10)*100;
  els.progressFill.style.width = pct + "%";
}

function setFeedback(msg, type=""){
  els.feedback.textContent = msg;
  els.feedback.classList.remove("win","fail");
  if(type==="win") els.feedback.classList.add("win");
  if(type==="fail") els.feedback.classList.add("fail");
}

function loadQuestion(){
  const q = currentQ();
  state.locked = false;
  state.usedHintThisQ = false;
  els.quoteText.textContent = `"${q.quote}"`;
  els.hintText.textContent = "";
  els.hintBtn.disabled = false;
  els.nextQuestion.hidden = true;

  els.options.innerHTML = "";
  const shuffled = shuffle(q.options.map((opt,idx)=>({opt,idx})));
  shuffled.forEach(({opt,idx})=>{
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.setAttribute("aria-label", `Choose ${opt}`);

    const img = document.createElement("img");
    img.className = "option-avatar";
    // Use the same resolution logic for every option; do not special-case the correct one
    img.src = getImagePath(opt, (opt === q.options[q.answer] ? q.image : undefined));
    img.alt = opt;
    img.onerror = () => {
      // fall back to a placeholder, keep the round frame visible
      if (img.src.endsWith("_placeholder.jpg")) return;
      img.src = PLACEHOLDER_IMG;
    };

    const label = document.createElement("span");
    label.className = "option-label";
    label.textContent = opt;

    btn.appendChild(img);
    btn.appendChild(label);
    btn.addEventListener("click", ()=> choose(idx));
    els.options.appendChild(btn);
  });

  setFeedback("");
  updateHud();
  updateProgress();
}

function choose(chosenIdx){
  if(state.locked) return;
  state.locked = true;
  const q = currentQ();
  const correct = chosenIdx === q.answer;
  const earned = correct ? pointsForHints(state.usedHintThisQ ? 1 : 0) : 0;
  if(correct){
    state.score += earned;
    setFeedback(`Correct! You earned ${earned} pts.`, "win");
  }else{
    setFeedback(`No points. Correct answer: ${q.options[q.answer]}.`, "fail");
  }
  state.history.push({
    q: `"${q.quote}"`,
    result: correct ? "Correct" : "Wrong",
    earned,
    answer: q.options[q.answer],
    image: q.image
  });
  // reveal correct with image below feedback
  showReveal(q.options[q.answer], q.image);
  els.nextQuestion.hidden = false;
}

function showReveal(name, imagePath){
  els.revealName.textContent = name;
  els.revealImg.src = getImagePath(name, imagePath);
  els.revealImg.alt = name;
  els.revealImg.style.display = "block";
  els.revealImg.onerror = () => {
    if (els.revealImg.src.endsWith("_placeholder.jpg")) return;
    els.revealImg.src = PLACEHOLDER_IMG;
  };
}

function unlockHint(){
  if(state.usedHintThisQ) return;
  const q = currentQ();
  els.hintText.textContent = q.context;
  state.usedHintThisQ = true;
  els.hintBtn.disabled = true;
  updateHud();
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
els.hintBtn.addEventListener("click", unlockHint);
els.nextQuestion.addEventListener("click", nextQuestion);

// init
els.year.textContent = new Date().getFullYear();
newRound();
