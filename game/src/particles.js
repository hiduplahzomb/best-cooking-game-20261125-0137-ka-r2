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

export function updateParticles(system, dt, baskets) {
  system.spawnAcc += dt * STEAM_SPAWN_PER_SECOND;
  while (system.spawnAcc >= 1) {
    system.spawnAcc -= 1;
    // Uap panci kaldu selalu mengepul; keranjang hanya saat berisi mi.
    spawnSteam(system, 166, 296, 1);
    if (baskets) {
      const centers = [375, 517];
      baskets.forEach((b, i) => {
        if (b.status === 'cooking' || b.status === 'ready') spawnSteam(system, centers[i], 296, 1);
      });
    }
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

// Uap digambar DI BELAKANG label: transparansi rendah, tidak menutupi teks.
export function drawSteam(ctx, system) {
  for (const p of system.steam) {
    const alpha = 0.10 * (1 - p.life / p.maxLife);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
    ctx.fill();
  }
}

export function drawParticles(ctx, system) {
  drawSteam(ctx, system);
  drawFloats(ctx, system);
}

// Teks skor mengambang: koridor vertikal kosong sekitar seperempat dari atas
// layar (y ~180) dengan latar gelap supaya tidak menabrak teks lain.
export function drawFloats(ctx, system) {
  const now = performance.now();
  system.floats.forEach((f, idx) => {
    const age = now - f.born;
    const t = age / FLOAT_TEXT_LIFETIME_MS;
    // Teks yang muncul bersamaan ditumpuk ke atas supaya tidak bertabrakan.
    const y = 180 - idx * 40 - FLOAT_RISE_SPEED * t * 1.4;
    ctx.globalAlpha = 1 - t;
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    const w = ctx.measureText(f.text).width + 28;
    ctx.fillStyle = 'rgba(20,10,2,0.72)';
    ctx.beginPath();
    ctx.roundRect(f.x - w / 2, y - 28, w, 38, 10);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#3a1a08';
    ctx.strokeText(f.text, f.x, y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, y);
    ctx.globalAlpha = 1;
  });
}
