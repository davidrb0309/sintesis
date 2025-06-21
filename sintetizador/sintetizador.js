const pianoKeys = document.querySelectorAll(".piano-keys .key"),
  volumeSlider = document.getElementById("volume"),
  octaveDownBtn = document.getElementById("octave-down"),
  octaveUpBtn = document.getElementById("octave-up"),
  octaveDisplay = document.getElementById("octave-display");

let audioContext = null,
  octave = 4,
  volume = 0.5;

// Notas base para la octava 4 y 5 (las frecuencias se multiplican según octava)
const baseNotes = {
  a: 261.63, // C4
  w: 277.18, // C#4
  s: 293.66, // D4
  e: 311.13, // D#4
  d: 329.63, // E4
  f: 349.23, // F4
  t: 370.00, // F#4
  g: 392.00, // G4
  y: 415.30, // G#4
  h: 440.00, // A4
  u: 466.16, // A#4
  j: 493.88, // B4
  k: 523.25, // C5
  o: 554.37, // C#5
  l: 587.33, // D5
  p: 622.25, // D#5
  ñ: 659.26  // E5
};

// Crear contexto de audio
function createAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Reproducir nota con la frecuencia ajustada según octava
function playNote(freq) {
  createAudioContext();

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5);
}

// Ajustar frecuencia según octava
function getFrequency(key) {
  let baseFreq = baseNotes[key];
  if (!baseFreq) return null;

  // Ajustar según octava: cada octava es el doble/mitad en frecuencia
  const baseOctave = 4;
  const octaveDiff = octave - baseOctave;
  return baseFreq * Math.pow(2, octaveDiff);
}

// Reproducir la nota de una tecla
function playKey(key) {
  const freq = getFrequency(key);
  if (!freq) return;

  playNote(freq);

  const pianoKey = document.querySelector(`.key[data-key="${key}"]`);
  if (pianoKey) {
    pianoKey.classList.add("active");
    setTimeout(() => pianoKey.classList.remove("active"), 150);
  }
}

// Manejar clic en tecla
pianoKeys.forEach((key) => {
  key.addEventListener("click", () => {
    playKey(key.dataset.key);
  });
});

// Cambiar volumen
volumeSlider.addEventListener("input", (e) => {
  volume = parseFloat(e.target.value);
});

// Cambiar octava
function changeOctave(direction) {
  if (direction === "up" && octave < 6) {
    octave++;
  } else if (direction === "down" && octave > 2) {
    octave--;
  }
  octaveDisplay.textContent = `Octava: ${octave}`;
}

octaveDownBtn.addEventListener("click", () => changeOctave("down"));
octaveUpBtn.addEventListener("click", () => changeOctave("up"));

// Escuchar tecla del teclado físico
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (baseNotes[key]) {
    playKey(key);
  }
});

