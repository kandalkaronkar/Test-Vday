// -------------------- Elements --------------------
const area = document.getElementById("buttonArea");
const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const claimBtn = document.getElementById("claimBtn");
const restartBtn = document.getElementById("restartBtn");
const tinyText = document.getElementById("tinyText");

const screenQuestion = document.getElementById("screenQuestion");
const screenYay = document.getElementById("screenYay");
const screenRoses = document.getElementById("screenRoses");

// -------------------- Settings --------------------
const PADDING = 10;
const BASE_RADIUS = 110;     // how close before No runs
const SHRINK_STEP = 0.12;    // shrink per attempt
const MIN_SCALE = 0.25;
const SPEED_UP_AFTER = 6;

let attempts = 0;
let scale = 1;
let yesBoosted = false;

// -------------------- Helpers --------------------
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

function setNoScale(newScale){
  scale = clamp(newScale, MIN_SCALE, 1);
  noBtn.style.transform = `scale(${scale})`;
  noBtn.style.transformOrigin = "center";
}

function getAreaRect(){ return area.getBoundingClientRect(); }

function effectiveBtnSize(){
  return { w: noBtn.offsetWidth * scale, h: noBtn.offsetHeight * scale };
}

function randomizeNoPosition(){
  const r = getAreaRect();
  const { w, h } = effectiveBtnSize();

  const maxX = r.width - w - PADDING;
  const maxY = r.height - h - PADDING;

  const x = Math.random() * Math.max(0, maxX) + PADDING;
  const y = Math.random() * Math.max(0, maxY) + PADDING;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

function attemptNo(){
  attempts += 1;
  setNoScale(scale - SHRINK_STEP);
  randomizeNoPosition();

  // Keep hint exactly as requested (one emoji, no counter)
  tinyText.textContent = `No seems a little bit shy 👿`;

  // Boost YES only once
  if (!yesBoosted) {
    yesBoosted = true;
    yesBtn.classList.add("boost");
  }
}

function flee(pointerX, pointerY){
  const r = getAreaRect();
  const btn = noBtn.getBoundingClientRect();

  const centerX = btn.left + btn.width/2;
  const centerY = btn.top + btn.height/2;

  const dx = centerX - pointerX;
  const dy = centerY - pointerY;
  const dist = Math.hypot(dx, dy);

  const radius = attempts >= SPEED_UP_AFTER ? (BASE_RADIUS + 50) : BASE_RADIUS;
  if (dist > radius) return;

  let curLeft = parseFloat(noBtn.style.left || "0") || 0;
  let curTop  = parseFloat(noBtn.style.top  || "0") || 0;

  const push = attempts >= SPEED_UP_AFTER ? 190 : 150;
  const rand = () => (Math.random() - 0.5) * (attempts >= SPEED_UP_AFTER ? 200 : 140);

  let newLeft = curLeft + (dx / (dist || 1)) * push + rand();
  let newTop  = curTop  + (dy / (dist || 1)) * push + rand();

  const { w, h } = effectiveBtnSize();
  const maxLeft = r.width - w - PADDING;
  const maxTop  = r.height - h - PADDING;

  newLeft = clamp(newLeft, PADDING, Math.max(PADDING, maxLeft));
  newTop  = clamp(newTop,  PADDING, Math.max(PADDING, maxTop));

  noBtn.style.left = `${newLeft}px`;
  noBtn.style.top  = `${newTop}px`;
}

// -------------------- Reset / Start Over --------------------
function resetToStart(){
  // Screens
  screenRoses.hidden = true;
  screenYay.hidden = true;
  screenQuestion.hidden = false;

  // Reset No button behavior
  attempts = 0;
  scale = 1;
  setNoScale(1);
  randomizeNoPosition();

  // Reset hint + YES boost
  tinyText.textContent = `No seems a little bit shy 👿`;
  yesBoosted = false;
  yesBtn.classList.remove("boost");
}

// -------------------- Init --------------------
noBtn.style.position = "absolute";
noBtn.setAttribute("tabindex", "-1");
setNoScale(1);
randomizeNoPosition();

// Handle Fold / rotation resize
window.addEventListener("resize", () => randomizeNoPosition(), { passive:true });

// Desktop: move away when mouse comes close
area.addEventListener("mousemove", (e) => flee(e.clientX, e.clientY));

// Desktop: count attempt if hovered/clicked
noBtn.addEventListener("mouseenter", () => attemptNo());
noBtn.addEventListener("click", (e) => { e.preventDefault(); attemptNo(); });

// Mobile: move away when finger moves near
area.addEventListener("touchmove", (e) => {
  const t = e.touches && e.touches[0];
  if (!t) return;
  flee(t.clientX, t.clientY);
}, { passive:true });

// Mobile: if she taps No, shrink + jump (block click)
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  attemptNo();
}, { passive:false });

// Scroll attempt (throttled)
let scrollTimer = null;
window.addEventListener("scroll", () => {
  if (scrollTimer) return;
  scrollTimer = setTimeout(() => scrollTimer = null, 350);
  attemptNo();
}, { passive:true });

// YES FLOW: YAAY -> ROSES
yesBtn.addEventListener("click", () => {
  screenQuestion.hidden = true;
  screenYay.hidden = false;
});

claimBtn.addEventListener("click", () => {
  screenYay.hidden = true;
  screenRoses.hidden = false;
});

restartBtn.addEventListener("click", () => {
  resetToStart();
});

