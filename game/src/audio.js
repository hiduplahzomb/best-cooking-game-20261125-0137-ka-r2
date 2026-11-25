// audio.js — semua bunyi dibuat dengan WebAudio, tanpa file suara.
// Tombol M membisukan semuanya; tidak ada suara sebelum interaksi pertama.
export const AUDIO_MASTER_GAIN = 0.16;
export const AUDIO_CLICK_HZ = 660;
export const AUDIO_DING_HZ = 880;
export const AUDIO_ERROR_HZ = 160;

let audioContext = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function ensureAudio() {
  if (!audioContext) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioContext = new AC();
    } catch (e) {
      audioContext = null;
    }
  }
  if (audioContext && audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function playTone(freq, durationMs, type, gainValue) {
  if (muted) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainValue || AUDIO_MASTER_GAIN, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationMs / 1000);
}

export function playClickSound() {
  playTone(AUDIO_CLICK_HZ, 70, 'triangle', 0.12);
}

export function playPourSound() {
  playTone(320, 180, 'sine', 0.12);
  setTimeout(() => playTone(420, 140, 'sine', 0.1), 90);
}

export function playSizzleSound() {
  playTone(1200, 120, 'sawtooth', 0.04);
}

export function playDingSound() {
  playTone(AUDIO_DING_HZ, 160, 'sine', 0.16);
  setTimeout(() => playTone(1318, 220, 'sine', 0.14), 120);
}

export function playErrorSound() {
  playTone(AUDIO_ERROR_HZ, 220, 'square', 0.1);
}

export function playServeSound() {
  playTone(523, 120, 'triangle', 0.15);
  setTimeout(() => playTone(659, 120, 'triangle', 0.15), 100);
  setTimeout(() => playTone(784, 200, 'triangle', 0.15), 200);
}
