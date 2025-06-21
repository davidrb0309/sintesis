const keyboard = document.getElementById("keyboard");
const waveformSelector = document.getElementById("waveform");
const canvas = document.getElementById("oscilloscope");
const ctx = canvas.getContext("2d");

const whiteKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j'];
const blackKeys = ['w', 'e', null, 't', 'y', 'u'];

const keyMap = {
  a: 261.63, // C4
  w: 277.18,
  s: 293.66,
  e: 311.13,
  d: 329.63,
  f: 349.23,
  t: 370.00,
  g: 392.00,
  y: 415.30,
  h: 440.00,
  u: 466.16,
  j: 493.88,
};

let waveform = "sine";
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyser = audioCtx.createAnalyser();

waveformSelector.addEventListener("change", e => {
  waveform = e.target.value;
});

function createKey(key, type) {
  const el = document.createElement("div");
  el.classList.add("key", type);
  el.dataset.key = key;
  const label = document.createElement("span");
  label.textContent = key;
  el.appendChild(label);
  el.addEventListener("mousedown", () => playSound(key));
  return el;
}

whiteKeys.forEach((key, i) => {
  const white = createKey(key, "white");
  keyboard.appendChild(white);
  if (blackKeys[i]) {
    const black = createKey(blackKeys[i], "black");
    black.style.left = `${i * 60 + 45}px`;
    keyboard.appendChild(black);
  }
});

function playSound(key) {
  const freq = keyMap[key];
  if (!freq) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = waveform;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(analyser);
  analyser.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
  const el = document.querySelector(`.key[data-key="${key}"]`);
  if (el) {
    el.classList.add("active");
    setTimeout(() => el.classList.remove("active"), 150);
  }
}

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  playSound(key);
});

function visualize() {
  analyser.fftSize = 2048;
  const bufferLength = analyser.fftSize;
  const dataArray = new Uint8Array(bufferLength);
  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#0f0";
    ctx.beginPath();
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }
  draw();
}

visualize();
