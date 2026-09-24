/* ============================================================
   TRUNG THU CINEMATIC — Story-driven UI
============================================================ */

const CONFIG = {
  name: "Kim Oanh - Mafia nhí",
  message:
    "Chúc bạn một mùa Trung Thu thật ấm áp.<br><br>" +
    "Mong dưới ánh trăng tròn, mọi muộn phiền đều nhẹ đi, " +
    "mọi ước mong đều dần thành hiện thực...<br><br>" +
    "Và bên cạnh bạn luôn có những người khiến bạn mỉm cười.",
  finalPhotos: [
    "./trung-thu-canh-7.png",
    "./trung-thu-canh-6.png",
    "./trung-thu-canh-5.png",
  ],

  story: [
    {
      type: "text",
      duration: 4,
      lines: ["NHẬT KÝ ĐIỆP VỤ...", "Kế hoạch thâu đêm phá cỗ bắt đầu!"],
    },
    {
      type: "image",
      duration: 6,
      src: "./trung-thu-canh-1.png",
      emoji: "🥸",
      caption: "BƯỚC 1: Cải trang hoàn hảo để đánh lừa chị Hằng...",
    },
    {
      type: "image",
      duration: 6,
      src: "./trung-thu-canh-2.png",
      emoji: "💤",
      caption: "BƯỚC 2: Mới canh mâm cỗ được 5 phút thì...",
    },
    {
      type: "text",
      duration: 4,
      lines: ["Không ổn rồi!", "Phải đổi chiến thuật vận động mạnh..."],
    },
    {
      type: "image",
      duration: 6,
      src: "./trung-thu-canh-3.png",
      emoji: "🏃",
      caption: "BƯỚC 3: Chuyển sang bộ môn sinh tồn...",
    },
    {
      type: "image",
      duration: 6,
      src: "./trung-thu-canh-8.png",
      emoji: "💓",
      caption: "Tim đập rộn ràng hơn cả tiếng trống múa lân ngoài ngõ!",
    },
    {
      type: "text",
      duration: 4,
      lines: ["Nhiệm vụ thất bại...", "Trở về với thực tại phũ phàng!"],
    },
    {
      type: "image",
      duration: 6,
      src: "./trung-thu-canh-4.png",
      emoji: "✨",
      caption: "Thôi gội đầu làm đẹp, dẹp điệp vụ sang một bên!",
    },
  ],
};

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const intro = document.getElementById("intro");
const bars = document.getElementById("bars");
const startBtn = document.getElementById("startBtn");
const stage = document.getElementById("stage");
const finalUI = document.getElementById("finalUI");
const replayBtn = document.getElementById("replayBtn");
const nameText = document.getElementById("nameText");
const messageText = document.getElementById("messageText");
const finalPhotos = document.getElementById("finalPhotos");

nameText.textContent = `Gửi ${CONFIG.name} ❤️`;
messageText.innerHTML = CONFIG.message;

let W = 0,
  H = 0,
  DPR = 1,
  started = false,
  showStartTime = 0;
let mouseX = 0,
  mouseY = 0,
  targetX = 0,
  targetY = 0;
let activeBeat = null,
  timeouts = [];
let totalDuration = 0;

const stars = Array.from({ length: 150 }, () => ({
  x: Math.random(),
  y: Math.random() * 0.78,
  r: 0.35 + Math.random() * 1.5,
  tw: Math.random() * Math.PI * 2,
  speed: 0.4 + Math.random() * 1.6,
  depth: 0.4 + Math.random() * 1.2,
}));
const clouds = [
  { x: 0.04, y: 0.31, s: 1.15, d: 0.16, a: 0.18 },
  { x: 0.73, y: 0.24, s: 0.75, d: 0.1, a: 0.14 },
  { x: 0.61, y: 0.57, s: 0.95, d: 0.12, a: 0.12 },
];
const lanterns = [
  { x: 0.09, y: 0.16, s: 0.88, p: 0.2, c: "#ff4d63" },
  { x: 0.87, y: 0.2, s: 0.72, p: 1.2, c: "#ff6b65" },
];

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener("resize", resize);
resize();

window.addEventListener("pointermove", (e) => {
  targetX = (e.clientX / W - 0.5) * 2;
  targetY = (e.clientY / H - 0.5) * 2;
});

window.addEventListener("touchmove", (e) => {
  if (e.touches.length > 0) {
    targetX = (e.touches[0].clientX / W - 0.5) * 2;
    targetY = (e.touches[0].clientY / H - 0.5) * 2;
  }
});

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * clamp(t, 0, 1));
function rgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function drawBackground(t) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#100622");
  sky.addColorStop(0.38, "#200e47");
  sky.addColorStop(0.72, "#2f1052");
  sky.addColorStop(1, "#07030d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(mouseX * 12, mouseY * 8);
  stars.forEach((s) => {
    const tw = 0.55 + 0.45 * Math.sin(t * s.speed + s.tw);
    ctx.globalAlpha = tw * (0.2 + 0.5 * s.depth);
    ctx.fillStyle = s.depth > 1 ? "#fff8d6" : "#fff";
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r * tw, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawMoon(t) {
  const p = smooth(clamp(t / 2.4, 0, 1));
  const y = lerp(H * 0.47, H * 0.16, p);
  const x = W * 0.5 + mouseX * 18;
  const r = Math.min(W, H) * 0.18;

  const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
  halo.addColorStop(0, "rgba(255,232,157,.2)");
  halo.addColorStop(0.5, "rgba(255,210,97,.1)");
  halo.addColorStop(1, "rgba(255,180,60,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(x - r * 2.5, y - r * 2.5, r * 5, r * 5);

  const g = ctx.createRadialGradient(
    x - r * 0.25,
    y - r * 0.28,
    r * 0.1,
    x,
    y,
    r,
  );
  g.addColorStop(0, "#fffceb");
  g.addColorStop(0.4, "#ffeb99");
  g.addColorStop(0.75, "#ffca57");
  g.addColorStop(1, "#f29c29");

  ctx.shadowColor = "rgba(255,213,105,.5)";
  ctx.shadowBlur = 30;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawCloud(c, t) {
  const x = c.x * W + ((t * 0.008 * c.d) % 1) * W - 60;
  const y = c.y * H + mouseY * 8 * c.d;
  ctx.save();
  ctx.globalAlpha = c.a;
  ctx.fillStyle = "#f5f3ff";
  ctx.filter = "blur(2px)";
  ctx.beginPath();
  ctx.ellipse(x, y, 120 * c.s, 22 * c.s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - 40 * c.s, y - 12 * c.s, 34 * c.s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 12 * c.s, y - 21 * c.s, 45 * c.s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLantern(l, t) {
  const x = l.x * W + mouseX * 16 * l.s;
  const y = l.y * H;
  const swing = Math.sin(t * 1.35 + l.p) * 0.045;
  const r = 30 * l.s;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(swing);

  ctx.strokeStyle = "rgba(255,220,125,.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -70 * l.s);
  ctx.lineTo(0, -25 * l.s);
  ctx.stroke();

  ctx.fillStyle = l.c;
  ctx.shadowColor = rgba(l.c, 0.7);
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 1.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function schedule(fn, delay) {
  const id = setTimeout(fn, delay);
  timeouts.push(id);
  return id;
}
function clearAllTimeouts() {
  timeouts.forEach(clearTimeout);
  timeouts = [];
}

function buildBeatText(beat) {
  const wrapper = document.createElement("div");
  wrapper.className = "beat beat-text";
  let cumulative = 0;
  beat.lines.forEach((line, lineIndex) => {
    const lineEl = document.createElement("div");
    lineEl.className = "line";
    const words = line.split(" ");
    words.forEach((word, wi) => {
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = word;
      span.style.animationDelay = `${cumulative}ms`;
      cumulative += 80;
      lineEl.appendChild(span);
      if (wi < words.length - 1)
        lineEl.appendChild(document.createTextNode(" "));
    });
    cumulative += lineIndex === 0 ? 250 : 0;
    wrapper.appendChild(lineEl);
  });
  return wrapper;
}

function buildBeatImage(beat) {
  const wrapper = document.createElement("div");
  wrapper.className = "beat beat-image";
  const photo = document.createElement("div");
  photo.className = "photo";

  if (beat.src) {
    const img = document.createElement("img");
    img.src = beat.src;
    photo.appendChild(img);
  }
  wrapper.appendChild(photo);

  if (beat.caption) {
    const cap = document.createElement("div");
    cap.className = "photo-caption";
    cap.innerHTML = `<span class="emoji">${beat.emoji || ""}</span> ${beat.caption}`;
    wrapper.appendChild(cap);
  }
  return wrapper;
}

function showBeat(beat) {
  if (activeBeat) {
    activeBeat.classList.remove("in");
    activeBeat.classList.add("out");
    const old = activeBeat;
    setTimeout(() => old.remove(), 900);
    activeBeat = null;
  }
  const el = beat.type === "image" ? buildBeatImage(beat) : buildBeatText(beat);
  stage.appendChild(el);
  activeBeat = el;
  requestAnimationFrame(() => el.classList.add("in"));
}

function playStory() {
  totalDuration = CONFIG.story.reduce((sum, b) => sum + b.duration, 0);
  let t = 600;
  CONFIG.story.forEach((beat) => {
    schedule(() => showBeat(beat), t);
    t += beat.duration * 1000;
  });
  schedule(showFinalCard, t + 400);
}

function showFinalCard() {
  if (activeBeat) {
    activeBeat.classList.remove("in");
    activeBeat.classList.add("out");
    setTimeout(() => activeBeat.remove(), 900);
    activeBeat = null;
  }
  if (CONFIG.finalPhotos && CONFIG.finalPhotos.length) {
    let html = "";
    const rotations = [-8, 5, -5];
    CONFIG.finalPhotos.forEach((src, i) => {
      html += `<div class="thumb" style="--r: ${rotations[i] || 0}"><img src="${src}" alt="" /></div>`;
    });
    finalPhotos.innerHTML = html;
  }
  finalUI.classList.add("show");
}

let last = 0;
function render(now) {
  last = now;
  targetX *= 0.95;
  targetY *= 0.95;
  mouseX = lerp(mouseX, targetX, 0.08);
  mouseY = lerp(mouseY, targetY, 0.08);
  const t = started ? (now - showStartTime) / 1000 : 0;

  drawBackground(t);
  clouds.forEach((c) => drawCloud(c, t));
  drawMoon(t);
  lanterns.forEach((l) => drawLantern(l, t));

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

function startShow() {
  clearAllTimeouts();
  started = true;
  showStartTime = performance.now();
  last = showStartTime;
  stage.innerHTML = "";
  activeBeat = null;
  finalUI.classList.remove("show");
  intro.classList.add("hide");
  bars.classList.add("open");

  const bgm = document.getElementById("bgm");
  if (bgm) {
    bgm.volume = 0;
    bgm.play().catch((e) => console.log("Cần tương tác để phát nhạc"));
    let vol = 0;
    const fade = setInterval(() => {
      if (vol < 0.6) {
        vol += 0.05;
        bgm.volume = vol;
      } else {
        clearInterval(fade);
      }
    }, 200);
  }
  playStory();
}

startBtn.addEventListener("click", startShow);
replayBtn.addEventListener("click", startShow);
