// Esperamos al DOM para evitar problemas
window.addEventListener('DOMContentLoaded', () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
    // Controles DOM
    const playWhiteBtn = document.getElementById('playWhite');
    const playPinkBtn = document.getElementById('playPink');
    const playBothBtn = document.getElementById('playNoiseBoth');
  
    const whiteCutoff = document.getElementById('whiteCutoff');
    const pinkCutoff = document.getElementById('pinkCutoff');
  
    const whiteAmp = document.getElementById('whiteAmp');
    const pinkAmp = document.getElementById('pinkAmp');
  
    const whiteFreqVal = document.getElementById('whiteFreqVal');
    const pinkFreqVal = document.getElementById('pinkFreqVal');
    const whiteAmpVal = document.getElementById('whiteAmpVal');
    const pinkAmpVal = document.getElementById('pinkAmpVal');
  
    let whiteSource, pinkSource;
    let whiteFilter, pinkFilter;
    let whiteGainNode, pinkGainNode;
    let analyser;
    let dataArray, bufferLength;
    let canvas, canvasCtx;
  
    let isWhitePlaying = false;
    let isPinkPlaying = false;
    let isBothPlaying = false;
  
    // Actualizar valores en UI y filtros/gains en tiempo real
    whiteCutoff.addEventListener('input', () => {
      whiteFreqVal.textContent = `${whiteCutoff.value} Hz`;
      if (whiteFilter) whiteFilter.frequency.setValueAtTime(whiteCutoff.value, audioCtx.currentTime);
    });
  
    pinkCutoff.addEventListener('input', () => {
      pinkFreqVal.textContent = `${pinkCutoff.value} Hz`;
      if (pinkFilter) pinkFilter.frequency.setValueAtTime(pinkCutoff.value, audioCtx.currentTime);
    });
  
    whiteAmp.addEventListener('input', () => {
      whiteAmpVal.textContent = parseFloat(whiteAmp.value).toFixed(2);
      if (whiteGainNode) whiteGainNode.gain.setValueAtTime(whiteAmp.value, audioCtx.currentTime);
    });
  
    pinkAmp.addEventListener('input', () => {
      pinkAmpVal.textContent = parseFloat(pinkAmp.value).toFixed(2);
      if (pinkGainNode) pinkGainNode.gain.setValueAtTime(pinkAmp.value, audioCtx.currentTime);
    });
  
    // Funciones para crear ruido blanco y rosa (igual que tu código)
    function createWhiteNoise() {
      const bufferSize = 2 * audioCtx.sampleRate;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
  
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
  
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = whiteCutoff.value;
  
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = whiteAmp.value;
  
      noise.connect(filter).connect(gainNode);
  
      return { noise, filter, gainNode };
    }
  
    function createPinkNoise() {
      const bufferSize = 4096;
      const noiseNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  
      noiseNode.onaudioprocess = function (e) {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 1;
          b6 = white * 0.115926;
        }
      };
  
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = pinkCutoff.value;
  
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = pinkAmp.value;
  
      noiseNode.connect(filter).connect(gainNode);
  
      return { noiseNode, filter, gainNode };
    }
  
    // Visualizador
    function setupVisualizer() {
      if (!canvas) {
        canvas = document.getElementById('visualizer');
        canvasCtx = canvas.getContext('2d');
      }
      if (!analyser) {
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        bufferLength = analyser.fftSize;
        dataArray = new Uint8Array(bufferLength);
      }
  
      // Creamos un nodo maestro de ganancia para conectar los gainNodes
      const masterGain = audioCtx.createGain();
      masterGain.gain.value = 1;
  
      // Desconectar gainNodes de destino y conectar a masterGain
      if (whiteGainNode) {
        whiteGainNode.disconnect();
        whiteGainNode.connect(masterGain);
      }
      if (pinkGainNode) {
        pinkGainNode.disconnect();
        pinkGainNode.connect(masterGain);
      }
  
      masterGain.connect(analyser);
      masterGain.connect(audioCtx.destination);
    }
  
    function stopVisualizer() {
      if (analyser) {
        analyser.disconnect();
        analyser = null;
      }
      if (canvasCtx && canvas) {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  
    // Función para dibujar visualización
    function draw() {
      if (!analyser) return;
  
      requestAnimationFrame(draw);
  
      analyser.getByteTimeDomainData(dataArray);
  
      canvasCtx.fillStyle = '#111';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = '#dc3545';
  
      canvasCtx.beginPath();
  
      let sliceWidth = canvas.width / bufferLength;
      let x = 0;
  
      for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
        let y = v * canvas.height / 2;
  
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
  
        x += sliceWidth;
      }
  
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    }
  
    // Eventos botones
    playWhiteBtn.addEventListener('click', () => {
      // Iniciar contexto en evento usuario para evitar bloqueo
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (!isWhitePlaying) {
        const white = createWhiteNoise();
        whiteSource = white.noise;
        whiteFilter = white.filter;
        whiteGainNode = white.gainNode;
        whiteSource.start();
  
        if (isPinkPlaying) setupVisualizer();
        else whiteGainNode.connect(audioCtx.destination);
  
        isWhitePlaying = true;
      } else {
        if (whiteSource) {
          whiteSource.stop();
          whiteSource.disconnect();
        }
        if (whiteFilter) whiteFilter.disconnect();
        if (whiteGainNode) whiteGainNode.disconnect();
  
        isWhitePlaying = false;
        if (!isPinkPlaying) stopVisualizer();
      }
    });
  
    playPinkBtn.addEventListener('click', () => {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (!isPinkPlaying) {
        const pink = createPinkNoise();
        pinkSource = pink.noiseNode;
        pinkFilter = pink.filter;
        pinkGainNode = pink.gainNode;
  
        if (isWhitePlaying) setupVisualizer();
        else pinkGainNode.connect(audioCtx.destination);
  
        isPinkPlaying = true;
      } else {
        if (pinkSource) pinkSource.disconnect();
        if (pinkFilter) pinkFilter.disconnect();
        if (pinkGainNode) pinkGainNode.disconnect();
  
        isPinkPlaying = false;
        if (!isWhitePlaying) stopVisualizer();
      }
    });
  
    playBothBtn.addEventListener('click', () => {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (!isBothPlaying) {
        // White
        const white = createWhiteNoise();
        whiteSource = white.noise;
        whiteFilter = white.filter;
        whiteGainNode = white.gainNode;
        whiteSource.start();
  
        // Pink
        const pink = createPinkNoise();
        pinkSource = pink.noiseNode;
        pinkFilter = pink.filter;
        pinkGainNode = pink.gainNode;
  
        setupVisualizer();
  
        isWhitePlaying = true;
        isPinkPlaying = true;
        isBothPlaying = true;
      } else {
        if (whiteSource) {
          whiteSource.stop();
          whiteSource.disconnect();
        }
        if (whiteFilter) whiteFilter.disconnect();
        if (whiteGainNode) whiteGainNode.disconnect();
  
        if (pinkSource) pinkSource.disconnect();
        if (pinkFilter) pinkFilter.disconnect();
        if (pinkGainNode) pinkGainNode.disconnect();
  
        isWhitePlaying = false;
        isPinkPlaying = false;
        isBothPlaying = false;
  
        stopVisualizer();
      }
    });
  
    // Iniciamos visualizador y loop dibujo
    draw();
  
    // Inicializamos valores UI (por si no están)
    whiteFreqVal.textContent = `${whiteCutoff.value} Hz`;
    pinkFreqVal.textContent = `${pinkCutoff.value} Hz`;
    whiteAmpVal.textContent = parseFloat(whiteAmp.value).toFixed(2);
    pinkAmpVal.textContent = parseFloat(pinkAmp.value).toFixed(2);
  });
  