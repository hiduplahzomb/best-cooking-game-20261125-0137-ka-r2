// loop.js — status permainan, pembaruan waktu, penyajian, kombo, dan menang/kalah.
import {
  WIN_SCORE, START_LIVES, MAX_ORDERS, MAX_COMBO, ORDER_SPAWN_SECONDS,
  ORDER_PATIENCE_SECONDS, PATIENCE_RUSH_SECONDS, SERVE_BASE_POINTS,
  SERVE_PATIENCE_BONUS_MAX, WRONG_SERVE_PENALTY, LEVEL_UP_EVERY_POINTS,
  MAX_LEVEL,
} from './config.js';
import { randomOrder, toppingsMatch } from './recipes.js';
import { createBaskets, createGrillSlots, createBowls, updateBasket, updateGrillSlot, emptyBowl } from './stations.js';
import { createParticleSystem, addFloatingScore, updateParticles } from './particles.js';
import { playDingSound, playErrorSound, playServeSound } from './audio.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';

export function createGameState() {
  return {
    screen: SCREEN_TITLE,
    score: 0,
    combo: 0,
    lives: START_LIVES,
    level: 1,
    time: 0,
    spawnTimer: 4,
    orders: [],
    baskets: createBaskets(),
    grill: createGrillSlots(),
    bowls: createBowls(),
    activeBowl: 0,
    selectedBroth: 'shoyu',
    particles: createParticleSystem(),
    muted: false,
    paused: false,
    demo: false,
    toast: '',
    toastUntil: 0,
  };
}

export function startGame(state) {
  const fresh = createGameState();
  Object.assign(state, fresh, { screen: SCREEN_PLAY });
  spawnOrder(state);
  spawnOrder(state);
}

export function spawnOrder(state) {
  if (state.orders.length >= MAX_ORDERS) return false;
  const used = state.orders.map((o) => o.name);
  const patience = state.level >= 3 ? PATIENCE_RUSH_SECONDS : ORDER_PATIENCE_SECONDS;
  const order = randomOrder(patience, used);
  if (!order) return false;
  state.orders.push(order);
  return true;
}

export function updateGame(state, dt) {
  if (state.screen !== SCREEN_PLAY || state.paused || state.demo) {
    updateParticles(state.particles, dt, state.baskets);
    return;
  }
  state.time += dt;
  updateParticles(state.particles, dt, state.baskets);
  for (const basket of state.baskets) updateBasket(basket, dt);
  for (const slot of state.grill) updateGrillSlot(slot, dt);
  // Kesabaran pelanggan menipis; pelanggan yang habis sabar pergi dan nyawa berkurang.
  for (let i = state.orders.length - 1; i >= 0; i -= 1) {
    const order = state.orders[i];
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders.splice(i, 1);
      loseLife(state, order.name + ' pergi karena menunggu terlalu lama!');
    }
  }
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    state.spawnTimer = Math.max(5, ORDER_SPAWN_SECONDS - state.level);
    spawnOrder(state);
  }
  const level = Math.min(MAX_LEVEL, 1 + Math.floor(state.score / LEVEL_UP_EVERY_POINTS));
  if (level > state.level) {
    state.level = level;
    state.toast = 'LEVEL ' + level + ' — pelanggan makin tidak sabar!';
    state.toastUntil = performance.now() + 2000;
  }
  if (state.score >= WIN_SCORE) {
    state.screen = SCREEN_WIN;
    playDingSound();
  }
}

export function loseLife(state, message) {
  state.lives -= 1;
  state.combo = 0;
  addFloatingScore(state.particles, 640, 180, message, '#ff6b4a');
  playErrorSound();
  if (state.lives <= 0) {
    state.screen = SCREEN_OVER;
  }
}

export function serveBowl(state, bowlIndex) {
  const bowl = state.bowls[bowlIndex];
  if (!bowl.broth || !bowl.noodles) return { ok: false, reason: 'Mangkuk belum lengkap: butuh kaldu dan mi.' };
  const matchIndex = state.orders.findIndex(
    (o) => o.broth === bowl.broth && toppingsMatch(o.toppings, bowl.toppings),
  );
  if (matchIndex === -1) {
    state.score = Math.max(0, state.score - WRONG_SERVE_PENALTY);
    state.combo = 0;
    emptyBowl(bowl);
    addFloatingScore(state.particles, 640, 180, 'SALAH PESANAN! -' + WRONG_SERVE_PENALTY, '#ff6b4a');
    playErrorSound();
    return { ok: false, reason: 'Tidak ada pesanan yang cocok — kombo putus.' };
  }
  const order = state.orders[matchIndex];
  state.orders.splice(matchIndex, 1);
  state.combo = Math.min(MAX_COMBO, state.combo + 1);
  const patienceBonus = Math.round((order.patience / order.patienceMax) * SERVE_PATIENCE_BONUS_MAX);
  const points = (SERVE_BASE_POINTS + patienceBonus + order.tip) * state.combo;
  state.score += points;
  emptyBowl(bowl);
  const rect = { x: 908 + bowlIndex * 172, y: 330 };
  addFloatingScore(state.particles, rect.x + 75, rect.y, '+' + points, '#ffd94a');
  if (state.combo >= 2) {
    addFloatingScore(state.particles, 640, 180, 'KOMBO x' + state.combo + '!', '#ffd94a');
  }
  addFloatingScore(state.particles, 640, 180, order.name + ' senang! +' + points, '#7ec850');
  playServeSound();
  if (state.score >= WIN_SCORE) state.screen = SCREEN_WIN;
  return { ok: true, points, combo: state.combo };
}
