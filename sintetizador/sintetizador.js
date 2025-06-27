const keyboard = document.getElementById("keyboard");
const waveformSelector = document.getElementById("waveform");
const freqBaseSelector = document.getElementById("freq-base");
const freqBaseVal = document.getElementById("freq-base-val");
const canvas = document.getElementById("oscilloscope");
const ctx = canvas.getContext("2d");

// Dos octavas: C4-B5 (24 notas, sin repetir teclas físicas)
const keyOrder = [
  // Primera octava (C4–B4)
  { key: 'a', note: 'C4', idx: 0, type: 'white' },
  { key: 'w', note: 'C#4', idx: 1, type: 'black' },
  { key: 's', note: 'D4', idx: 2, type: 'white' },
  { key: 'e', note: 'D#4', idx: 3, type: 'black' },
  { key: 'd', note: 'E4', idx: 4, type: 'white' },
  { key: 'f', note: 'F4', idx: 5, type: 'white' },
  { key: 't', note: 'F#4', idx: 6, type: 'black' },
  { key: 'g', note: 'G4', idx: 7, type: 'white' },
  { key: 'y', note: 'G#4', idx: 8, type: 'black' },
  { key: 'h', note: 'A4', idx: 9, type: 'white' },
  { key: 'u', note: 'A#4', idx: 10, type: 'black' },
  { key: 'j', note: 'B4', idx: 11, type: 'white' },
  // Segunda octava (C5–B5)
  { key: 'q', note: 'C5', idx: 12, type: 'white' },
  { key: '2', note: 'C#5', idx: 13, type: 'black' },
  { key: 'z', note: 'D5', idx: 14, type: 'white' },
  { key: '3', note: 'D#5', idx: 15, type: 'black' },
  { key: 'x', note: 'E5', idx: 16, type: 'white' },
  { key: 'c', note: 'F5', idx: 17, type: 'white' },
  { key: '4', note: 'F#5', idx: 18, type: 'black' },
  { key: 'v', note: 'G5', idx: 19, type: 'white' },
  { key: '5', note: 'G#5', idx: 20, type: 'black' },
  { key: 'b', note: 'A5', idx: 21, type: 'white' },
  { key: '6', note: 'A#5', idx: 22, type: 'black' },
  { key: 'n', note: 'B5', idx: 23, type: 'white' }
];

// Separa las teclas blancas y negras para renderizado y posicionamiento
const whiteKeys = keyOrder.filter(k => k.type === 'white');
const blackKeys = keyOrder.filter(k => k.type === 'black');

let waveform = "sine";
let freqBase = 440; // A4
let keyMap = {};

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.fftSize;
const dataArray = new Uint8Array(bufferLength);
analyser.connect(audioCtx.destination);

// Calcula las frecuencias de todas las notas según la frecuencia base
function updateKeyMap() {
  keyMap = {};
  keyOrder.forEach(({ key, idx }) => {
    keyMap[key] = +(freqBase * Math.pow(2, (idx - 9) / 12)).toFixed(2);
  });
}
updateKeyMap();

// Inicializa el valor mostrado en el span
freqBaseVal.textContent = `${freqBaseSelector.value} Hz`;

waveformSelector.addEventListener("change", e => {
  waveform = e.target.value;
});

freqBaseSelector.addEventListener("input", e => {
  freqBase = parseFloat(e.target.value) || 440;
  freqBaseVal.textContent = `${freqBase} Hz`;
  updateKeyMap();
});

// Guardar osciladores activos por tecla
const activeOscillators = {};

function playSoundStart(key) {
  if (activeOscillators[key]) return; // Ya está sonando

  const freq = keyMap[key];
  if (!freq) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = waveform;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  osc.connect(gain).connect(analyser).connect(audioCtx.destination);
  osc.start();
  activeOscillators[key] = { osc, gain };

  const el = document.querySelector(`.key[data-key="${key}"]`);
  if (el) el.classList.add("active");
}

function playSoundStop(key) {
  const active = activeOscillators[key];
  if (active) {
    active.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);
    active.osc.stop(audioCtx.currentTime + 0.05);
    setTimeout(() => {
      active.osc.disconnect();
      active.gain.disconnect();
    }, 100);
    delete activeOscillators[key];
  }
  const el = document.querySelector(`.key[data-key="${key}"]`);
  if (el) el.classList.remove("active");
}

function createKey(key, type, note) {
  const el = document.createElement("div");
  el.classList.add("key", type);
  el.dataset.key = key;
  el.dataset.note = note;
  const label = document.createElement("span");
  label.textContent = key.toUpperCase();
  el.appendChild(label);

  // Mouse events para mantener la nota mientras está presionada
  el.addEventListener("mousedown", () => playSoundStart(key));
  el.addEventListener("mouseup", () => playSoundStop(key));
  el.addEventListener("mouseleave", () => playSoundStop(key));
  el.addEventListener("touchstart", (e) => { e.preventDefault(); playSoundStart(key); });
  el.addEventListener("touchend", (e) => { e.preventDefault(); playSoundStop(key); });

  return el;
}

function renderKeyboard() {
  keyboard.innerHTML = "";

  // Renderizar teclas blancas
  whiteKeys.forEach(({ key, note }) => {
    const white = createKey(key, "white", note);
    keyboard.appendChild(white);
  });

  // Renderizar teclas negras en la posición correcta usando left %
  const totalWhites = whiteKeys.length;
  blackKeys.forEach(({ key, note, idx }) => {
    // Encuentra el índice de la tecla blanca a la izquierda
    let leftWhiteIdx = -1;
    for (let i = 0; i < whiteKeys.length - 1; i++) {
      if (whiteKeys[i].idx < idx && whiteKeys[i + 1].idx > idx) {
        leftWhiteIdx = i;
        break;
      }
    }
    if (leftWhiteIdx !== -1) {
      // La posición es entre leftWhiteIdx y leftWhiteIdx+1
      // Calculamos el porcentaje respecto al total de teclas blancas
      const percent = ((leftWhiteIdx + 1) / totalWhites) * 100;
      const black = createKey(key, "black", note);
      black.style.position = "absolute";
      black.style.left = `calc(${percent}% - 2.5%)`; // Ajusta el -2.5% para centrar la tecla negra
      black.style.top = "0";
      black.style.height = "65%";
      keyboard.appendChild(black);
    }
  });
}

window.addEventListener("DOMContentLoaded", renderKeyboard);
window.addEventListener("resize", renderKeyboard);

// Teclado físico
const pressedKeys = new Set();
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (!pressedKeys.has(key)) {
    playSoundStart(key);
    pressedKeys.add(key);
  }
});
document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  playSoundStop(key);
  pressedKeys.delete(key);
});

// Visualizador igual que aditiva.html
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function draw() {
  requestAnimationFrame(draw);
  analyser.getByteTimeDomainData(dataArray);
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#dc3545";
  ctx.beginPath();
  let sliceWidth = canvas.width / bufferLength;
  let x = 0;
  for(let i = 0; i < bufferLength; i++) {
    let v = dataArray[i] / 128.0;
    let y = v * canvas.height / 2;
    if(i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}
draw();