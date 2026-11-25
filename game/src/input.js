// input.js — klik mouse dan tombol keyboard dipetakan ke stasiun dapur.
// Semua hit-test memakai layoutRects() yang sama dengan renderer, jadi tidak meleset.
import { layoutRects } from './renderer.js';
import {
  startNoodles, clearBasket, startGrill, takeGrillTopping,
  pourBrothIntoBowl, addNoodlesToBowl, addToppingToBowl,
  BASKET_EMPTY, BASKET_READY, BASKET_BURNT, GRILL_DONE,
} from './stations.js';
import { serveBowl, startGame } from './loop.js';
import { playClickSound, playPourSound, playSizzleSound, toggleMute } from './audio.js';

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function handleCanvasClick(state, canvasX, canvasY) {
  if (state.screen === 'title') {
    startGame(state);
    playClickSound();
    return 'Mulai bermain';
  }
  if (state.screen === 'win' || state.screen === 'over') return 'Layar akhir — tekan R';
  if (state.paused) return 'Jeda — tekan P';
  const rects = layoutRects();
  // Mangkuk saji: pilih mangkuk aktif.
  for (let i = 0; i < rects.bowls.length; i += 1) {
    if (pointInRect(canvasX, canvasY, rects.bowls[i])) {
      state.activeBowl = i;
      playClickSound();
      return 'Mangkuk ' + (i + 1) + ' dipilih';
    }
  }
  // Tombol SAJIKAN di bawah tiap mangkuk.
  for (let i = 0; i < rects.serveButtons.length; i += 1) {
    if (pointInRect(canvasX, canvasY, rects.serveButtons[i])) {
      const result = serveBowl(state, i);
      return result.ok ? 'Disajikan! +' + result.points : result.reason;
    }
  }
  // Panci kaldu: tuang kaldu terpilih ke mangkuk aktif.
  if (pointInRect(canvasX, canvasY, rects.pot)) {
    const ok = pourBrothIntoBowl(state.bowls[state.activeBowl], state.selectedBroth);
    if (ok) playPourSound();
    return ok ? 'Kaldu dituang' : 'Mangkuk sudah berisi kaldu';
  }
  // Tombol kaldu: pilih + tuang langsung.
  for (const rect of rects.brothButtons) {
    if (pointInRect(canvasX, canvasY, rect)) {
      state.selectedBroth = rect.id;
      const ok = pourBrothIntoBowl(state.bowls[state.activeBowl], rect.id);
      if (ok) playPourSound();
      return ok ? 'Kaldu dituang' : 'Mangkuk sudah berisi kaldu';
    }
  }
  // Keranjang mi: mulai rebus, ambil yang matang, atau buang yang gosong.
  for (let i = 0; i < rects.baskets.length; i += 1) {
    if (pointInRect(canvasX, canvasY, rects.baskets[i])) {
      const basket = state.baskets[i];
      if (basket.status === BASKET_EMPTY) {
        startNoodles(basket);
        playSizzleSound();
        return 'Mi mulai direbus';
      }
      if (basket.status === BASKET_READY) {
        const ok = addNoodlesToBowl(state.bowls[state.activeBowl]);
        if (ok) {
          clearBasket(basket);
          playPourSound();
          return 'Mi masuk mangkuk';
        }
        return 'Mangkuk butuh kaldu dulu / sudah berisi mi';
      }
      if (basket.status === BASKET_BURNT) {
        clearBasket(basket);
        playClickSound();
        return 'Mi gosong dibuang';
      }
      return 'Mi masih merebus...';
    }
  }
  // Slot panggangan: ambil topping yang sudah matang.
  for (let i = 0; i < rects.grillSlots.length; i += 1) {
    if (pointInRect(canvasX, canvasY, rects.grillSlots[i])) {
      const slot = state.grill[i];
      if (slot.status === GRILL_DONE) {
        const topping = takeGrillTopping(slot);
        const ok = addToppingToBowl(state.bowls[state.activeBowl], topping);
        if (ok) {
          playClickSound();
          return 'Topping masuk mangkuk';
        }
        return 'Mangkuk butuh kaldu + mi dulu';
      }
      return slot.status === 'cooking' ? 'Topping masih dimasak...' : 'Slot kosong — pilih topping di bawah';
    }
  }
  // Tombol topping: mulai panggang/potong di slot kosong.
  for (const rect of rects.toppingButtons) {
    if (pointInRect(canvasX, canvasY, rect)) {
      const slot = state.grill.find((s) => s.status === 'empty');
      if (!slot) return 'Kedua slot panggangan penuh!';
      startGrill(slot, rect.id);
      playSizzleSound();
      return 'Memasak topping';
    }
  }
  return null;
}

export function handleKeyPress(state, key) {
  const k = key.toLowerCase();
  if (k === 'm') {
    state.muted = toggleMute();
    return state.muted ? 'Suara dimatikan' : 'Suara dinyalakan';
  }
  if (k === 'r' && (state.screen === 'win' || state.screen === 'over')) {
    startGame(state);
    return 'Main lagi';
  }
  if (state.screen !== 'play') return null;
  if (k === 'p') {
    state.paused = !state.paused;
    return state.paused ? 'Jeda' : 'Lanjut';
  }
  if (k === '1') {
    state.activeBowl = 0;
    playClickSound();
    return 'Mangkuk 1 dipilih';
  }
  if (k === '2') {
    state.activeBowl = 1;
    playClickSound();
    return 'Mangkuk 2 dipilih';
  }
  return null;
}
