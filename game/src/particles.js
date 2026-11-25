// particles.js — uap mengepul dari panci dan teks skor mengambang.
// Tidak ada gambar luar: semuanya digambar dari lingkaran dan teks kanvas.
import { STEAM_PARTICLES_MAX, FLOAT_TEXT_LIFETIME_MS } from './config.js';

export const STEAM_SPAWN_PER_SECOND = 22;
export const STEAM_RISE_SPEED = 34;
export const STEAM_MAX_RADIUS = 16;
export const FLOAT_RISE_SPEED = 42;

export function createParticleSystem() {
  return { steam: [], floats: [], spawnAcc: 0 };
}

export function spawnSteam(system, x, y, count) {
  for (let i = 0; i < count; i += 1) {
    if (system.steam.length >= STEAM_PARTICLES_MAX) return;
    system.steam.push({
      x: x + (Math.random() - 0.5) * 70,
      y: y + (Math.random() - 0.5) * 8,
      r: 4 + Math.random() * 6,
      life: 0,
      maxLife: 1.6 + Math.random() * 1.2,
      drift: (Math.random() - 0.5) * 14,
    });
  }
}

export function addFloatingScore(system, x, y, text, color) {
  system.floats.push({ x, y, text, color: color || '#ffd94a', born: performance.now() });
}

export function updateParticles(system, dt) {
  system.spawnAcc += dt * STEAM_SPAWN_PER_SECOND;
  while (system.spawnAcc >= 1) {
    system.spawnAcc -= 1;
    spawnSteam(system, 166, 296, 1);
    spawnSteam(system, 375, 296, 1);
    spawnSteam(system, 517, 296, 1);
  }
  const now = performance.now();
  system.steam = system.steam.filter((p) => {
    p.life += dt;
    p.y -= STEAM_RISE_SPEED * dt;
    p.x += p.drift * dt;
    p.r += dt * 3;
    return p.life < p.maxLife;
  });
  system.floats = system.floats.filter((f) => now - f.born < FLOAT_TEXT_LIFETIME_MS);
}

export function drawParticles(ctx, system) {
  for (const p of system.steam) {
    const alpha = 0.35 * (1 - p.life / p.maxLife);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.fill();
  }
  const now = performance.now();
  for (const f of system.floats) {
    const age = now - f.born;
    const t = age / FLOAT_TEXT_LIFETIME_MS;
    const y = f.y - FLOAT_RISE_SPEED * t * 1.4;
    ctx.globalAlpha = 1 - t;
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#3a1a08';
    ctx.strokeText(f.text, f.x, y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, y);
    ctx.globalAlpha = 1;
  }
}
