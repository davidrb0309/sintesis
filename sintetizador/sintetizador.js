const pianoKeys = document.querySelectorAll(".key"),
      volumeSlider = document.querySelector(".volume-slider input"),
      keysCheckbox = document.querySelector(".keys-checkbox input"),
      octaveDownBtn = document.getElementById("octave-down"),
      octaveUpBtn = document.getElementById("octave-up"),
      octaveDisplay = document.getElementById("octave-display");

let audioContext = null,
    octave = 4, // octava inicial
    volume = 0.5, // volumen inicial

// Frecuencias base para una octava 4 (C4=261.63Hz)
baseNotes = {
    a: 261.63,  // C
    w: 277.18,  // C#
    s: 293.66,  // D
    e: 311.13,  // D#
    d: 329.63,  // E
    f: 349.23,  // F
    t: 370.00,  // F#
    g: 392.00,  // G
    y: 415.30,  // G#
    h: 440.00,  // A
    u: 466.16,  // A#
    j: 493.88,  // B
    k: 523.25,  // C (octava 5)
    o: 554.37,  // C# (octava 5)
    l: 587.33,  // D (octava 5)
    p: 622.25,  // D# (octava 5)
    ñ: 659.26   // E (octava 5)
};

// Crear contexto de audio si no existe
const createAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
};

// Calcular frecuencia según octava actual
const getFrequency = (key) => {
    if(!baseNotes[key]) return null;
    let freq = baseNotes[key];
    
    // Ajustar frecuencia si la tecla está en octava diferente a 4
    // Aquí asumimos que las teclas a-j están en octava 4,
    // y las demás k-ñ están en octava 5 por ejemplo.
    // Mejor aún: calcular el factor de octava para todas.
    
    // Nota: para simplicidad, tomamos que octava 4 es referencia.
    // La fórmula para cambiar octava es freq * 2^(octave - 4)
    return freq * Math.pow(2, octave - 4);
}

// Reproducir nota
const playNote = (freq) => {
    if (!freq) return;
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
};

// Reproducir nota y activar tecla visual
const playKey = (key) => {
    const freq = getFrequency(key);
    if (!freq) return;

    playNote(freq);

    const clickedKey = document.querySelector(`[data-key="${key}"]`);
    if (!clickedKey) return;

    clickedKey.classList.add("active");
    setTimeout(() => {
        clickedKey.classList.remove("active");
    }, 150);
};

// Armar array de teclas válidas
const allKeys = Array.from(pianoKeys).map(k => k.dataset.key);

// Eventos click para teclas
pianoKeys.forEach(key => {
    key.addEventListener("click", () => playKey(key.dataset.key));
});

// Control volumen
const handleVolume = (e) => {
    volume = e.target.value;
};

// Mostrar/ocultar etiquetas de teclas
const showHideKeys = () => {
    pianoKeys.forEach(key => key.classList.toggle("hide"));
};

// Cambiar octava y actualizar display
const changeOctave = (direction) => {
    if (direction === "up" && octave < 6) {
        octave++;
    } else if (direction === "down" && octave > 2) {
        octave--;
    }
    octaveDisplay.textContent = `Octava: ${octave}`;
};

// Tecla presionada en teclado físico
const pressedKey = (e) => {
    const key = e.key.toLowerCase();
    if (allKeys.includes(key)) {
        playKey(key);
    }
};

// Listeners
volumeSlider.addEventListener("input", handleVolume);
keysCheckbox.addEventListener("click", showHideKeys);
document.addEventListener("keydown", pressedKey);

octaveDownBtn.addEventListener("click", () => changeOctave("down"));
octaveUpBtn.addEventListener("click", () => changeOctave("up"));

