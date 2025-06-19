const keys = document.querySelectorAll(".key");
const waveformSelect = document.getElementById("waveform-select");
const octaveDownBtn = document.getElementById("octave-down");
const octaveUpBtn = document.getElementById("octave-up");
const octaveDisplay = document.getElementById("octave-display");

let audioContext;
let waveform = waveformSelect.value;
let octave = 4;  // octava inicial

// Notas base para la octava 4
const baseNotes = {
  a: 261.63, // C4
  s: 293.66, // D4
  d: 329.63, // E4
  f: 349.23, // F4
  g: 392.00, // G4
  h: 440.00, // A4
  j: 493.88  // B4
};

// Calcula la frecuencia para la octava actual
function getFrequency(noteFreqBase, currentOctave) {
  const octaveDifference = currentOctave - 4;
  return noteFreqBase * Math.pow(2, octaveDifference);
}

function playNote(freq) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  const now = audioContext.currentTime;

  const oscillator = audioContext.createOscillator();
  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(freq, now);

  const gainNode = audioContext.createGain();

  // Envolvente ADSR (ataque y liberación)
  const attackTime = 0.05;
  const releaseTime = 0.3;

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + attackTime);
  gainNode.gain.linearRampToValueAtTime(0, now + attackTime + releaseTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + attackTime + releaseTime + 0.05);
}

function handleKeyPress(key) {
  const baseFreq = baseNotes[key];
  if (baseFreq) {
    const freq = getFrequency(baseFreq, octave);
    playNote(freq);

    const el = document.querySelector(`.key[data-key="${key}"]`);
    if (el) {
      el.classList.add("playing");
      setTimeout(() => el.classList.remove("playing"), 150);
    }
  }
}

// Eventos de click en las teclas
keys.forEach((key) =>
  key.addEventListener("click", () => handleKeyPress(key.dataset.key))
);

// Eventos teclado físico
document.addEventListener("keydown", (e) => {
  handleKeyPress(e.key.toLowerCase());
});

// Cambio de forma de onda
waveformSelect.addEventListener("change", (e) => {
  waveform = e.target.value;
});

// Control de octava
octaveDownBtn.addEventListener("click", () => {
  if (octave > 2) {
    octave--;
    octaveDisplay.textContent = `Octava: ${octave}`;
  }
});
octaveUpBtn.addEventListener("click", () => {
  if (octave < 6) {
    octave++;
    octaveDisplay.textContent = `Octava: ${octave}`;
  }
});
