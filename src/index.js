const files = [
  'xa',
  'xb',
  'xc',
  'xd',
  'xe',
  'xf',
  'xg',
  'xh',
  'xi',
  'xj',
  'xk',
  'xl',
  'xm',
  'xn',
  'xo',
  'xp',
  'xq',
  'xr',
  'xs',
  'xt',
  'xu',
  'xv',
  'xw',
  'xx',
  'xy'
];

const mediaSource = new MediaSource();

const audioEl = document.querySelector('#sound-track');
const loggerEl = document.querySelector('#logger');

class Logger {
  static log() {
    const infos = [...arguments];
    loggerEl.textContent = infos.join(' ') + '\n' + loggerEl.textContent;
  }
}

let sourceBuffer;
let sourceBufferCounter = 0;

const BATCH = 10;

const loadedBuffers = [];

let audioAnalyser;
let canvas;
let canvasContext;

function startFileLoading(i) {
  fetch(`chunks/${files[i]}`)
    .then(res => res.arrayBuffer())
    .then(arrayBuffer => {
      console.log(i, 'loaded');
      loadedBuffers.push(arrayBuffer);

      if (!sourceBuffer.updating) {
        loadNextBuffer();
      }

      if (i === 0) {
        startPlayback();
      }

      i += 1;

      if (i < files.length) {
        if (i % BATCH === 0) {
          setTimeout(() => startFileLoading(i), 2000);
        } else {
          startFileLoading(i);
        }
      }
    })
    .catch(err => console.log('error happens when fetching file', files[i], err));
}

function loadNextBuffer() {
  if (loadedBuffers.length) {
    console.log('SourceBuffer: appending', files[sourceBufferCounter]);
    Logger.log('SourceBuffer: appending', files[sourceBufferCounter]);

    const ranges = sourceBuffer.buffered;

    sourceBuffer.appendBuffer(loadedBuffers.shift());
    sourceBufferCounter += 1;
  }

  if (sourceBufferCounter >= files.length && !sourceBuffer.updating) {
    mediaSource.endOfStream();
  }
}

mediaSource.addEventListener('sourceopen', sourceOpenCallback, false);
mediaSource.addEventListener('webkitsourceopen', sourceOpenCallback, false);
mediaSource.addEventListener('sourceclose', sourceCloseCallback, false);
mediaSource.addEventListener('webkitsourceclose', sourceCloseCallback, false);
mediaSource.addEventListener('sourceended', sourceEndedCallback, false);
mediaSource.addEventListener('webkitsourceended', sourceEndedCallback, false);

function sourceOpenCallback() {
  console.log('MediaSource readyState', this.readyState);
  Logger.log('MediaSource readyState', this.readyState);

  sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
  sourceBuffer.mode = 'sequence';
  sourceBuffer.addEventListener('updateend', loadNextBuffer, false);

  startFileLoading(0);
}

function sourceEndedCallback() {
  console.log('mediaSource readyState: ' + this.readyState);
  Logger.log('mediaSource readyState: ' + this.readyState);
}

function sourceCloseCallback() {
  console.log('mediaSource readyState: ' + this.readyState);
  Logger.log('mediaSource readyState: ' + this.readyState);
  mediaSource.removeSourceBuffer(sourceBuffer);
}

function startPlayback() {
  if (audioEl.paused) {
    audioEl.play();
  }
}

function setupWebAudio() {
  const audioContext = new AudioContext();
  audioAnalyser = audioContext.createAnalyser();
  audioAnalyser.fftSize = 4096;
  const source = audioContext.createMediaElementSource(audioEl);
  source.connect(audioAnalyser);
  audioAnalyser.connect(audioContext.destination);
}

function setupCanvas() {
  canvas = document.querySelector('canvas');
  canvas.width = 800;
  canvas.height = 256;
  canvasContext = canvas.getContext('2d');
  canvasContext.fillStyle = '#ff8b80'
}

function draw() {
  requestAnimationFrame(draw);
  const freq = new Uint8Array(audioAnalyser.frequencyBinCount);
  audioAnalyser.getByteFrequencyData(freq);
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < freq.length; ++i) {
    const h = freq[i] / 256 * canvas.height;
    canvasContext.fillRect(i * 2, canvas.height - h, 1, canvas.height);
  }
}

audioEl.src = window.URL.createObjectURL(mediaSource);

setupWebAudio();
setupCanvas();
draw();
