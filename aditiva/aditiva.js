const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let osc1, osc2;
let isPlaying1 = false, isPlaying2 = false, isPlayingBoth = false;

const play1 = document.getElementById("play1");
const play2 = document.getElementById("play2");
const playBoth = document.getElementById("playBoth");

function createOscillator(freq, wave) {
  const osc = audioCtx.createOscillator();
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.type = wave;
  osc.connect(audioCtx.destination);
  return osc;
}

play1.onclick = () => {
  if (!isPlaying1) {
    osc1 = createOscillator(freq1.value, wave1.value);
    osc1.start();
    isPlaying1 = true;
  } else {
    osc1.stop();
    isPlaying1 = false;
  }
};

play2.onclick = () => {
  if (!isPlaying2) {
    osc2 = createOscillator(freq2.value, wave2.value);
    osc2.start();
    isPlaying2 = true;
  } else {
    osc2.stop();
    isPlaying2 = false;
  }
};

playBoth.onclick = () => {
  if (!isPlayingBoth) {
    osc1 = createOscillator(freq1.value, wave1.value);
    osc2 = createOscillator(freq2.value, wave2.value);
    osc1.start();
    osc2.start();
    isPlayingBoth = true;
  } else {
    osc1.stop();
    osc2.stop();
    isPlayingBoth = false;
  }
};