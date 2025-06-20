const pianoKeys = document.querySelectorAll(".piano-keys .key"),
      volumeSlider = document.querySelector(".volume-slider input"),
      keysCheckbox = document.querySelector(".keys-checkbox input"),
      octaveDownBtn = document.getElementById("octave-down"),
      octaveUpBtn = document.getElementById("octave-up"),
      octaveDisplay = document.getElementById("octave-display");

let allKeys = [],
    audioContext = null,
    octave = 4, // octava inicial
    volume = 0.5, // volumen inicial
    baseNotes = {
        a: 261.63, // C4
        s: 293.66, // D4
        d: 329.63, // E4
        f: 349.23, // F4
        g: 392.00, // G4
        h: 440.00, // A4
        j: 493.88, // B4
        k: 523.25, // C5
        l: 554.37, // D5
        ñ: 587.33, // E5
        w: 277.18, // C#4
        e: 311.13, // D#4
        t: 370.00, // F#4
        y: 415.30, // G#4
        u: 466.16, // A#4
        o: 554.37, // C#5
        p: 622.25 // D#5
    };

// Crear contexto de audio si no existe
const createAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
};

// Reproducir nota
const playNote = (freq) => {
    createAudioContext();
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine"; // Tipo de onda, se puede modificar a "square", "triangle", etc.
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5); // Duración de la nota
};

// Manejar la tecla presionada
const playKey = (key) => {
    const note = baseNotes[key];
    if (note) {
        playNote(note);
        const clickedKey = document.querySelector(`[data-key="${key}"]`);
        clickedKey.classList.add("active");
        setTimeout(() => {
            clickedKey.classList.remove("active");
        }, 150);
    }
};

// Reproducir nota al hacer clic
pianoKeys.forEach((key) => {
    allKeys.push(key.dataset.key);
    key.addEventListener("click", () => playKey(key.dataset.key));
});

// Cambiar volumen
const handleVolume = (e) => {
    volume = e.target.value;
};

// Mostrar/ocultar teclas
const showHideKeys = () => {
    pianoKeys.forEach((key) => key.classList.toggle("hide"));
};

// Cambiar octava
const changeOctave = (direction) => {
    if (direction === "up" && octave < 6) {
        octave++;
    } else if (direction === "down" && octave > 2) {
        octave--;
    }
    octaveDisplay.textContent = `Octava: ${octave}`;
};

// Manejador de teclas presionadas en el teclado
const pressedKey = (e) => {
    const key = e.key.toLowerCase();
    if (allKeys.includes(key)) {
        playKey(key);
    }
};

// Eventos
volumeSlider.addEventListener("input", handleVolume);
keysCheckbox.addEventListener("click", showHideKeys);
document.addEventListener("keydown", pressedKey);

octaveDownBtn.addEventListener("click", () => changeOctave("down"));
octaveUpBtn.addEventListener("click", () => changeOctave("up"));
