// main.js — titik masuk Ramen Rush: kanvas, loop 60 fps, dan pengikat input.
// Skala kanvas logis 1280x720 ke ukuran jendela; status dibacakan ke #status.
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { createGameState, updateGame, SCREEN_PLAY } from './loop.js';
import { drawGame } from './renderer.js';
import { handleCanvasClick, handleKeyPress } from './input.js';
import { ensureAudio } from './audio.js';

export const FRAME_BUDGET_MS = 16.7;
export const STATUS_UPDATE_MS = 500;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const state = createGameState();

function resizeCanvas() {
  const scale = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT);
  canvas.width = Math.floor(CANVAS_WIDTH * scale);
  canvas.height = Math.floor(CANVAS_HEIGHT * scale);
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_WIDTH / rect.width;
  const scaleY = CANVAS_HEIGHT / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function updateStatus(message) {
  if (!statusEl) return;
  if (message) {
    statusEl.textContent = message;
    return;
  }
  statusEl.textContent = state.screen === SCREEN_PLAY
    ? `Skor ${state.score} dari 1000, kombo x${state.combo}, nyawa ${state.lives}, level ${state.level}, ${state.orders.length} pesanan aktif.`
    : 'Ramen Rush — Kedai Mie Beruap';
}

canvas.addEventListener('click', (event) => {
  ensureAudio();
  const point = canvasPoint(event);
  const message = handleCanvasClick(state, point.x, point.y);
  updateStatus(message);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'm' || event.key === 'M') ensureAudio();
  const message = handleKeyPress(state, event.key);
  if (message) updateStatus(message);
});

window.addEventListener('resize', resizeCanvas);

// Pegangan baca-saja untuk playtest otomatis (tidak dipakai permainan).
window.__ramenState = state;

resizeCanvas();

let lastTime = performance.now();
let lastStatusTime = 0;

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  updateGame(state, dt);
  ctx.setTransform(canvas.width / CANVAS_WIDTH, 0, 0, canvas.height / CANVAS_HEIGHT, 0, 0);
  drawGame(ctx, state);
  if (now - lastStatusTime > STATUS_UPDATE_MS) {
    lastStatusTime = now;
    updateStatus(null);
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
