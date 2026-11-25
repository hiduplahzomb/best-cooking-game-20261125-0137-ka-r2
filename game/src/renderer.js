// renderer.js — semua gambar digambar dengan kanvas 2D: meja kayu, panci kaldu,
// keranjang mi, talenan, dan mangkuk ramen berlapis. Tidak ada emoji makanan.
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, HUD_HEIGHT, ORDER_BOARD_Y, ORDER_CARD_WIDTH,
  ORDER_CARD_HEIGHT, ORDER_CARD_GAP, POT_X, POT_Y, POT_WIDTH, POT_HEIGHT,
  BASKET_X, BASKET_Y, BASKET_WIDTH, BASKET_HEIGHT, BASKET_GAP,
  GRILL_X, GRILL_Y, GRILL_WIDTH, GRILL_HEIGHT, GRILL_SLOT_GAP,
  BOWL_X, BOWL_Y, BOWL_WIDTH, BOWL_HEIGHT, BOWL_GAP,
  TOPPING_BAR_Y, TOPPING_BUTTON_WIDTH, TOPPING_BUTTON_HEIGHT, TOPPING_BUTTON_GAP,
  BROTH_BAR_Y, BROTH_BUTTON_WIDTH, BROTH_BUTTON_HEIGHT,
} from './config.js';
import { BROTHS, TOPPINGS, brothById, toppingById } from './recipes.js';
import { BASKET_COOKING, BASKET_READY, BASKET_BURNT, GRILL_COOKING, GRILL_DONE, basketProgress, grillProgress } from './stations.js';
import { drawSteam, drawFloats } from './particles.js';

export const WOOD_DARK = '#6b4423';
export const WOOD_LIGHT = '#a4713b';
export const COUNTER_TOP = '#c98d54';
export const CREAM = '#fff6e6';
export const INK = '#2a1a0c';

export function layoutRects() {
  const rects = { pot: { x: POT_X, y: POT_Y, w: POT_WIDTH, h: POT_HEIGHT }, baskets: [], grillSlots: [], bowls: [], serveButtons: [], toppingButtons: [], brothButtons: [] };
  for (let i = 0; i < 2; i += 1) {
    rects.baskets.push({ x: BASKET_X + i * (BASKET_WIDTH + BASKET_GAP), y: BASKET_Y, w: BASKET_WIDTH, h: BASKET_HEIGHT });
  }
  for (let i = 0; i < 2; i += 1) {
    rects.grillSlots.push({ x: GRILL_X + 12 + i * ((GRILL_WIDTH - 24 - GRILL_SLOT_GAP) / 2 + GRILL_SLOT_GAP), y: GRILL_Y + 34, w: (GRILL_WIDTH - 24 - GRILL_SLOT_GAP) / 2, h: 96 });
  }
  for (let i = 0; i < 2; i += 1) {
    rects.bowls.push({ x: BOWL_X + i * (BOWL_WIDTH + BOWL_GAP), y: BOWL_Y, w: BOWL_WIDTH, h: BOWL_HEIGHT });
    rects.serveButtons.push({ x: BOWL_X + i * (BOWL_WIDTH + BOWL_GAP), y: BOWL_Y + BOWL_HEIGHT + 14, w: BOWL_WIDTH, h: 40 });
  }
  TOPPINGS.forEach((t, i) => {
    rects.toppingButtons.push({ x: 16 + i * (TOPPING_BUTTON_WIDTH + TOPPING_BUTTON_GAP), y: TOPPING_BAR_Y, w: TOPPING_BUTTON_WIDTH, h: TOPPING_BUTTON_HEIGHT, id: t.id });
  });
  BROTHS.forEach((b, i) => {
    rects.brothButtons.push({ x: 16 + i * (BROTH_BUTTON_WIDTH + 12), y: BROTH_BAR_Y, w: BROTH_BUTTON_WIDTH, h: BROTH_BUTTON_HEIGHT, id: b.id });
  });
  rects.orderCards = [];
  for (let i = 0; i < 4; i += 1) {
    rects.orderCards.push({ x: 16 + i * (ORDER_CARD_WIDTH + ORDER_CARD_GAP), y: ORDER_BOARD_Y, w: ORDER_CARD_WIDTH, h: ORDER_CARD_HEIGHT });
  }
  return rects;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawToppingIcon(ctx, x, y, r, id) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'chashu') {
    // Irisan daging chashu karamel: cokelat panggang bertepi gelap, bukan spiral.
    ctx.fillStyle = '#8a4b1f';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c98a4b';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8b878';
    ctx.beginPath(); ctx.ellipse(0, -r * 0.1, r * 0.5, r * 0.34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#5a2c0e'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2); ctx.stroke();
  } else if (id === 'egg') {
    ctx.fillStyle = '#fff8e0';
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.72, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f5a623';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2); ctx.fill();
    // Kilau kuning telur.
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath(); ctx.ellipse(-r * 0.16, -r * 0.18, r * 0.16, r * 0.1, -0.5, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'nori') {
    ctx.fillStyle = '#2e4d2e';
    ctx.fillRect(-r * 0.8, -r * 0.9, r * 1.6, r * 1.8);
    ctx.fillStyle = '#3f6b3f';
    for (let i = -1; i <= 1; i += 1) ctx.fillRect(-r * 0.8, i * r * 0.55, r * 1.6, 2);
  } else if (id === 'negi') {
    ctx.fillStyle = '#7ec850';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath(); ctx.arc(i * r * 0.62, 0, r * 0.42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a8a2a';
      ctx.beginPath(); ctx.arc(i * r * 0.62, 0, r * 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7ec850';
    }
  } else if (id === 'corn') {
    ctx.fillStyle = '#ffd94a';
    const spots = [[-0.5, -0.4], [0.4, -0.5], [0, 0], [-0.4, 0.5], [0.5, 0.4]];
    for (const [dx, dy] of spots) {
      ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.32, 0, Math.PI * 2); ctx.fill();
    }
  } else if (id === 'shiitake') {
    ctx.fillStyle = '#8a5a33';
    ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 0.85, Math.PI, 0); ctx.fill();
    // Potongan silang putih khas shiitake.
    ctx.strokeStyle = '#f7efdc'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-r * 0.45, -r * 0.75); ctx.lineTo(r * 0.45, -r * 0.25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.45, -r * 0.75); ctx.lineTo(-r * 0.45, -r * 0.25); ctx.stroke();
    ctx.fillStyle = '#f2e3c2';
    ctx.fillRect(-r * 0.25, -r * 0.2, r * 0.5, r * 0.7);
  }
  ctx.restore();
}

export function drawFace(ctx, x, y, r, face) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = face.skin;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = face.hair;
  if (face.hairStyle === 'bun') {
    ctx.beginPath(); ctx.arc(0, -r * 0.85, r * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -r * 0.25, r, Math.PI, 0); ctx.fill();
  } else if (face.hairStyle === 'long') {
    ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 1.02, Math.PI, 0); ctx.fill();
    ctx.fillRect(-r, -r * 0.2, r * 0.35, r * 1.1);
    ctx.fillRect(r * 0.65, -r * 0.2, r * 0.35, r * 1.1);
  } else if (face.hairStyle === 'cap') {
    ctx.beginPath(); ctx.arc(0, -r * 0.3, r * 1.02, Math.PI, 0); ctx.fill();
    ctx.fillRect(-r, -r * 0.55, r * 2, r * 0.3);
  } else if (face.hairStyle === 'bob') {
    ctx.beginPath(); ctx.arc(0, -r * 0.15, r * 1.02, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(0, -r * 0.3, r * 1.0, Math.PI, 0); ctx.fill();
  }
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.05, r * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.05, r * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#7a3a1a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, r * 0.3, r * 0.35, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  ctx.restore();
}

export function drawRamenBowl(ctx, x, y, w, bowl) {
  const cx = x + w / 2;
  // Sudut tiga perempat: mulut mangkuk dalam (elips tinggi) supaya isi terbaca.
  const bowlTop = y + 30;
  const bowlH = 72;
  // Mangkuk luar bergaris.
  ctx.fillStyle = '#b8322a';
  ctx.beginPath();
  ctx.moveTo(x + 6, bowlTop);
  ctx.lineTo(x + w - 6, bowlTop);
  ctx.lineTo(x + w - 22, bowlTop + bowlH);
  ctx.lineTo(x + 22, bowlTop + bowlH);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d94f3d';
  ctx.fillRect(x + 6, bowlTop, w - 12, 8);
  // Alas mangkuk.
  ctx.fillStyle = '#8a2318';
  ctx.fillRect(x + 34, bowlTop + bowlH, w - 68, 6);
  ctx.fillStyle = '#f7e8c8';
  ctx.beginPath(); ctx.ellipse(cx, bowlTop, w / 2 - 6, 22, 0, 0, Math.PI * 2); ctx.fill();
  if (bowl.broth) {
    const b = brothById(bowl.broth);
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.ellipse(cx, bowlTop, w / 2 - 14, 18, 0, 0, Math.PI * 2); ctx.fill();
    // Kilau kaldu: bedakan ketiga warna kaldu dengan jelas.
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(cx - 18, bowlTop - 6, 26, 6, -0.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = b.light;
    ctx.beginPath(); ctx.ellipse(cx + 24, bowlTop + 6, 16, 4, 0.2, 0, Math.PI * 2); ctx.fill();
  }
  if (bowl.noodles) {
    ctx.strokeStyle = '#f2d38a';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i += 1) {
      const yy = bowlTop - 6 + i * 4;
      ctx.beginPath();
      for (let px = -w / 2 + 20; px <= w / 2 - 20; px += 6) {
        const py = yy + Math.sin(px * 0.35 + i) * 2.5;
        if (px === -w / 2 + 20) ctx.moveTo(cx + px, py); else ctx.lineTo(cx + px, py);
      }
      ctx.stroke();
    }
  }
  if (bowl.toppings.length > 0) {
    const spots = [[-0.28, -0.1], [0.26, -0.12], [0, 0.08], [-0.05, -0.22], [0.3, 0.08], [-0.3, 0.1]];
    bowl.toppings.forEach((t, i) => {
      const [dx, dy] = spots[i % spots.length];
      if (t === 'nori') {
        // Nori miring menempel di sisi mangkuk.
        ctx.save();
        ctx.translate(cx + dx * w, bowlTop + dy * 40 - 6);
        ctx.rotate(-0.45);
        drawToppingIcon(ctx, 0, 0, 17, t);
        ctx.restore();
      } else {
        drawToppingIcon(ctx, cx + dx * w, bowlTop + dy * 40, 18, t);
      }
    });
  }
  // Uap kecil di atas mangkuk berisi.
  if (bowl.broth) {
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 26, bowlTop - 22);
      ctx.quadraticCurveTo(cx + i * 26 + 6, bowlTop - 32, cx + i * 26, bowlTop - 40);
      ctx.stroke();
    }
  }
}

function drawButton(ctx, rect, label, sub, enabled, active) {
  ctx.save();
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 9);
  ctx.fillStyle = enabled ? (active ? '#e8a33d' : '#fff3d6') : '#d8c9b0';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = active ? '#8a4b1f' : '#8a6a42';
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 - (sub ? 2 : -5));
  if (sub) {
    ctx.font = '11px Georgia, serif';
    ctx.fillStyle = '#6b4a2a';
    ctx.fillText(sub, rect.x + rect.w / 2, rect.y + rect.h / 2 + 15);
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 10, size / 10);
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.bezierCurveTo(-6, -3, -11, 2, 0, 9);
  ctx.bezierCurveTo(11, 2, 6, -3, 0, 3);
  ctx.fillStyle = filled ? '#d94f3d' : '#5a4632';
  ctx.fill();
  ctx.restore();
}

export function drawGame(ctx, state) {
  const rects = layoutRects();
  // Dinding kedai: plester krem terang — jelas beda dari meja kayu gelap.
  ctx.fillStyle = '#ecd9a8';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // Meja kayu gelap.
  ctx.fillStyle = '#4a2c14';
  ctx.fillRect(0, 196, CANVAS_WIDTH, 364);
  ctx.fillStyle = COUNTER_TOP;
  ctx.fillRect(0, 196, CANVAS_WIDTH, 14);
  ctx.fillStyle = '#2e1a08';
  for (let x = 0; x < CANVAS_WIDTH; x += 160) {
    ctx.fillRect(x, 210, 3, 350);
  }
  // Uap DI BELAKANG semua label dan stasiun, transparansi rendah.
  drawSteam(ctx, state.particles);
  drawOrderBoard(ctx, state, rects);
  drawKitchen(ctx, state, rects);
  drawBottomBar(ctx, state, rects);
  drawFloats(ctx, state.particles);
  drawHud(ctx, state);
  if (state.screen === 'title') drawTitle(ctx, state);
  if (state.screen === 'win') drawEndPanel(ctx, 'MENANG! Kedai Ramen Rush berjaya!', `Skor akhir ${state.score} — target ${1000} tercapai. Tekan R untuk main lagi.`);
  if (state.screen === 'over') drawEndPanel(ctx, 'Kedai tutup... pelanggan kecewa.', `Skor akhir ${state.score}. Tekan R untuk mencoba lagi.`);
}

function drawStationShadow(ctx, cx, y, w) {
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(cx, y, w / 2, 10, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHud(ctx, state) {
  ctx.fillStyle = '#241608';
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = '#ffd94a';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('RAMEN RUSH', 16, 30);
  // Lampion merah kecil — identitas kedai di HUD.
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath(); ctx.ellipse(208, 24, 11, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd94a';
  ctx.fillRect(202, 8, 12, 4);
  ctx.fillRect(202, 36, 12, 4);
  ctx.fillStyle = '#fff6e6';
  ctx.beginPath(); ctx.arc(208, 24, 4, 0, Math.PI * 2); ctx.fill();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff6e6';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(`SKOR ${state.score} / 1000`, 640, 30);
  ctx.font = '13px Georgia, serif';
  ctx.fillStyle = state.combo > 1 ? '#ffd94a' : '#c9b18a';
  ctx.fillText(state.combo > 1 ? `KOMBO x${state.combo} — sajian beruntun!` : 'Sajikan beruntun untuk kombo sampai x4', 640, 50);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff6e6';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.fillText('NYAWA', 1010, 26);
  for (let i = 0; i < 3; i += 1) drawHeart(ctx, 1030 + i * 26, 22, 20, i < state.lives);
  ctx.font = '13px Georgia, serif';
  ctx.fillStyle = '#e8c98a';
  ctx.fillText(`LEVEL ${state.level}   SUARA: ${state.muted ? 'MATI (M)' : 'NYALA (M)'}`, 1264, 50);
  ctx.textAlign = 'left';
}

function drawOrderBoard(ctx, state, rects) {
  ctx.fillStyle = INK;
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('PAPAN PESANAN', 16, 79);
  ctx.font = '12px Georgia, serif';
  ctx.fillStyle = '#6b4a2a';
  ctx.fillText('Sajikan mangkuk yang sama persis dengan pesanan', 170, 79);
  state.orders.forEach((order, i) => {
    const card = rects.orderCards[i];
    const frac = order.patience / order.patienceMax;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    roundRect(ctx, card.x + 3, card.y + 4, card.w, card.h, 10);
    ctx.fill();
    roundRect(ctx, card.x, card.y, card.w, card.h, 10);
    ctx.fillStyle = frac < 0.3 ? '#ffe0d0' : '#fff6e6';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#8a6a42';
    ctx.stroke();
    drawFace(ctx, card.x + 34, card.y + 34, 24, order.face);
    ctx.fillStyle = INK;
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(order.name, card.x + 66, card.y + 26);
    ctx.font = '12px Georgia, serif';
    ctx.fillStyle = '#6b4a2a';
    ctx.fillText(order.archetype.label, card.x + 66, card.y + 44);
    const broth = brothById(order.broth);
    ctx.fillStyle = broth.color;
    roundRect(ctx, card.x + 66, card.y + 52, 74, 20, 8);
    ctx.fill();
    ctx.fillStyle = broth.id === 'tonkotsu' ? INK : '#fff6e6';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(broth.name, card.x + 103, card.y + 66);
    ctx.textAlign = 'left';
    order.toppings.forEach((t, j) => {
      drawToppingIcon(ctx, card.x + 160 + j * 30, card.y + 62, 11, t);
    });
    ctx.fillStyle = '#6b4a2a';
    ctx.font = '11px Georgia, serif';
    ctx.fillText('KESABARAN', card.x + 12, card.y + 98);
    ctx.fillStyle = '#d8c9b0';
    ctx.fillRect(card.x + 92, card.y + 88, 180, 12);
    ctx.fillStyle = frac > 0.5 ? '#4a8a2a' : frac > 0.25 ? '#e8a33d' : '#d94f3d';
    ctx.fillRect(card.x + 92, card.y + 88, 180 * frac, 12);
    ctx.fillStyle = INK;
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Tip +${order.tip}`, card.x + card.w - 10, card.y + 26);
    ctx.textAlign = 'left';
    ctx.restore();
  });
}

function drawKitchen(ctx, state, rects) {
  // Label stasiun (bayangan gelap di bawah teks supaya tetap terbaca di balik uap).
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'center';
  const stationLabels = [
    ['PANCI KALDU', POT_X + POT_WIDTH / 2, POT_Y - 12],
    ['PEREBUS MI — 2 KERANJANG', BASKET_X + BASKET_WIDTH + BASKET_GAP / 2, BASKET_Y - 12],
    ['PANGGANG / POTONG', GRILL_X + GRILL_WIDTH / 2, GRILL_Y - 12],
    ['MANGKUK SAJI — 2 BUAH', BOWL_X + BOWL_WIDTH + BOWL_GAP / 2 + 30, BOWL_Y - 12],
  ];
  for (const [label, x, y] of stationLabels) {
    ctx.fillStyle = 'rgba(20,10,2,0.85)';
    ctx.fillText(label, x + 1.5, y + 1.5);
    ctx.fillStyle = '#fff6e6';
    ctx.fillText(label, x, y);
  }
  ctx.textAlign = 'left';
  drawStationShadow(ctx, POT_X + POT_WIDTH / 2, POT_Y + POT_HEIGHT + 6, POT_WIDTH);
  drawStationShadow(ctx, BASKET_X + BASKET_WIDTH + BASKET_GAP / 2, BASKET_Y + BASKET_HEIGHT + 6, BASKET_WIDTH * 2 + BASKET_GAP);
  drawStationShadow(ctx, GRILL_X + GRILL_WIDTH / 2, GRILL_Y + GRILL_HEIGHT + 6, GRILL_WIDTH);
  drawStationShadow(ctx, BOWL_X + BOWL_WIDTH + BOWL_GAP / 2, BOWL_Y + BOWL_HEIGHT + 6, BOWL_WIDTH * 2 + BOWL_GAP);
  drawPot(ctx, state);
  state.baskets.forEach((b, i) => drawBasket(ctx, b, rects.baskets[i], i));
  drawGrill(ctx, state, rects);
  state.bowls.forEach((bowl, i) => {
    const r = rects.bowls[i];
    const active = state.activeBowl === i;
    if (active) {
      ctx.save();
      roundRect(ctx, r.x - 8, r.y - 8, r.w + 16, r.h + 16, 12);
      ctx.strokeStyle = '#ffd94a';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
    drawRamenBowl(ctx, r.x, r.y, r.w, bowl);
    ctx.fillStyle = '#fff6e6';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(active ? 'MANGKUK AKTIF' : 'Mangkuk ' + (i + 1), r.x + r.w / 2, r.y + r.h - 2);
    const serve = rects.serveButtons[i];
    const ready = bowl.broth && bowl.noodles;
    drawButton(ctx, serve, 'SAJIKAN', ready ? 'siap diantar' : 'butuh kaldu + mi', ready, false);
  });
  // Talenan di bawah panggangan (di atas bar bawah, tidak menabrak panel).
  ctx.fillStyle = '#e8c98a';
  roundRect(ctx, GRILL_X + 8, 500, GRILL_WIDTH - 16, 26, 6);
  ctx.fill();
  ctx.fillStyle = '#8a6a42';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('TALENAN — klik topping matang', GRILL_X + GRILL_WIDTH / 2, 518);
}

function drawPot(ctx, state) {
  ctx.fillStyle = '#3a3a3a';
  roundRect(ctx, POT_X, POT_Y + 30, POT_WIDTH, POT_HEIGHT - 30, 12);
  ctx.fill();
  ctx.fillStyle = '#555';
  ctx.fillRect(POT_X, POT_Y + 30, POT_WIDTH, 10);
  const broth = brothById(state.selectedBroth);
  ctx.fillStyle = broth.color;
  ctx.beginPath();
  ctx.ellipse(POT_X + POT_WIDTH / 2, POT_Y + 36, POT_WIDTH / 2 - 12, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2d38a';
  for (let i = 0; i < 5; i += 1) {
    const x = POT_X + 40 + i * 34;
    ctx.beginPath();
    ctx.ellipse(x, POT_Y + 36, 12, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fff6e6';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Kaldu: ${broth.name}`, POT_X + POT_WIDTH / 2, POT_Y + POT_HEIGHT + 16);
  ctx.font = '11px Georgia, serif';
  ctx.fillStyle = '#e8c98a';
  ctx.fillText('Klik panci untuk tuang ke mangkuk aktif', POT_X + POT_WIDTH / 2, POT_Y + POT_HEIGHT + 32);
}

function drawBasket(ctx, basket, rect, index) {
  // Perebus baja abu-abu dengan gagang, bukan biru polos.
  ctx.fillStyle = '#9aa0a6';
  roundRect(ctx, rect.x, rect.y + 40, rect.w, rect.h - 40, 10);
  ctx.fill();
  ctx.fillStyle = '#6e7378';
  ctx.fillRect(rect.x, rect.y + 40, rect.w, 8);
  ctx.fillStyle = '#c3c8cd';
  ctx.fillRect(rect.x + 6, rect.y + 48, 4, rect.h - 56);
  ctx.fillStyle = '#d7dee3';
  ctx.beginPath();
  ctx.ellipse(rect.x + rect.w / 2, rect.y + 44, rect.w / 2 - 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Gagang baja melintang di atas keranjang.
  ctx.fillStyle = '#5a5e63';
  ctx.fillRect(rect.x + 6, rect.y + 14, 8, 28);
  ctx.fillRect(rect.x + rect.w - 14, rect.y + 14, 8, 28);
  ctx.fillStyle = '#3a3d40';
  roundRect(ctx, rect.x + 6, rect.y + 8, rect.w - 12, 10, 5);
  ctx.fill();
  ctx.fillStyle = '#fff6e6';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Keranjang ' + (index + 1), rect.x + rect.w / 2, rect.y + rect.h + 14);
  if (basket.status === BASKET_COOKING) {
    ctx.strokeStyle = '#f2d38a';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i += 1) {
      const yy = rect.y + 30 + i * 6;
      ctx.beginPath();
      ctx.moveTo(rect.x + 24, yy);
      ctx.quadraticCurveTo(rect.x + rect.w / 2, yy - 5, rect.x + rect.w - 24, yy);
      ctx.stroke();
    }
    const p = basketProgress(basket);
    ctx.fillStyle = '#d8c9b0';
    ctx.fillRect(rect.x + 10, rect.y + rect.h - 22, rect.w - 20, 8);
    ctx.fillStyle = '#e8a33d';
    ctx.fillRect(rect.x + 10, rect.y + rect.h - 22, (rect.w - 20) * p, 8);
    ctx.fillStyle = '#fff6e6';
    ctx.font = '11px Georgia, serif';
    ctx.fillText('Merebus...', rect.x + rect.w / 2, rect.y + rect.h - 26);
  } else if (basket.status === BASKET_READY) {
    ctx.strokeStyle = '#f2d38a';
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i += 1) {
      const yy = rect.y + 28 + i * 7;
      ctx.beginPath();
      ctx.moveTo(rect.x + 22, yy);
      ctx.quadraticCurveTo(rect.x + rect.w / 2, yy - 6, rect.x + rect.w - 22, yy);
      ctx.stroke();
    }
    const p = basketProgress(basket);
    ctx.fillStyle = '#d8c9b0';
    ctx.fillRect(rect.x + 10, rect.y + rect.h - 22, rect.w - 20, 8);
    ctx.fillStyle = '#4a8a2a';
    ctx.fillRect(rect.x + 10, rect.y + rect.h - 22, (rect.w - 20) * p, 8);
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText('MATANG! Klik!', rect.x + rect.w / 2, rect.y + rect.h - 26);
  } else if (basket.status === BASKET_BURNT) {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(rect.x + rect.w / 2, rect.y + 40, rect.w / 2 - 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff6b4a';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText('GOSONG! Buang', rect.x + rect.w / 2, rect.y + rect.h - 26);
  } else {
    ctx.fillStyle = '#c9b18a';
    ctx.font = '11px Georgia, serif';
    ctx.fillText('Kosong — klik rebus', rect.x + rect.w / 2, rect.y + rect.h - 26);
  }
}

function drawGrill(ctx, state, rects) {
  ctx.fillStyle = '#4a4a4a';
  roundRect(ctx, GRILL_X, GRILL_Y + 20, GRILL_WIDTH, GRILL_HEIGHT - 20, 10);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.fillRect(GRILL_X + 8, GRILL_Y + 28, GRILL_WIDTH - 16, 6);
  state.grill.forEach((slot, i) => {
    const r = rects.grillSlots[i];
    ctx.save();
    roundRect(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.fillStyle = slot.status === GRILL_DONE ? '#fff3d6' : '#6b5a48';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#8a6a42';
    ctx.stroke();
    if (slot.status === GRILL_COOKING) {
      drawToppingIcon(ctx, r.x + r.w / 2, r.y + 34, 16, slot.topping);
      const p = grillProgress(slot);
      ctx.fillStyle = '#d8c9b0';
      ctx.fillRect(r.x + 10, r.y + 66, r.w - 20, 8);
      ctx.fillStyle = '#e8a33d';
      ctx.fillRect(r.x + 10, r.y + 66, (r.w - 20) * p, 8);
      ctx.fillStyle = '#fff6e6';
      ctx.font = '11px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Memasak...', r.x + r.w / 2, r.y + 88);
    } else if (slot.status === GRILL_DONE) {
      drawToppingIcon(ctx, r.x + r.w / 2, r.y + 34, 18, slot.topping);
      ctx.fillStyle = '#4a8a2a';
      ctx.font = 'bold 12px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('SIAP! Klik!', r.x + r.w / 2, r.y + 82);
    } else {
      ctx.fillStyle = '#c9b18a';
      ctx.font = '12px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Slot kosong', r.x + r.w / 2, r.y + 48);
    }
    ctx.restore();
  });
}

function drawBottomBar(ctx, state, rects) {
  // Baki bahan stainless (bukan tombol form krem polos).
  const trayGrad = ctx.createLinearGradient(0, 566, 0, 720);
  trayGrad.addColorStop(0, '#c9ccd0');
  trayGrad.addColorStop(0.5, '#a9adb2');
  trayGrad.addColorStop(1, '#878c91');
  ctx.fillStyle = trayGrad;
  ctx.fillRect(0, 566, CANVAS_WIDTH, 154);
  ctx.fillStyle = '#6e7378';
  ctx.fillRect(0, 566, CANVAS_WIDTH, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let y = 580; y < 716; y += 18) ctx.fillRect(0, y, CANVAS_WIDTH, 1);
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('TOPPING — klik untuk panggang / potong (2 slot):', 16, TOPPING_BAR_Y - 8);
  rects.toppingButtons.forEach((rect) => {
    const t = toppingById(rect.id);
    const busy = state.grill.some((s) => s.topping === rect.id && s.status !== 'empty');
    ctx.save();
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 9);
    ctx.fillStyle = busy ? '#d8c9b0' : '#fff3d6';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#8a6a42';
    ctx.stroke();
    drawToppingIcon(ctx, rect.x + rect.w / 2, rect.y + 17, 10, rect.id);
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText(t.name, rect.x + rect.w / 2, rect.y + 42);
    ctx.font = '11px Georgia, serif';
    ctx.fillStyle = '#6b4a2a';
    ctx.fillText(`siap ${t.prep} dtk`, rect.x + rect.w / 2, rect.y + 57);
    ctx.restore();
  });
  // Ruang kanan bawah: persediaan + identitas kedai (noren + lampion).
  drawTrayDecor(ctx);
  ctx.fillStyle = '#3a1a08';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.fillText('KALDU — klik untuk tuang ke mangkuk aktif:', 16, BROTH_BAR_Y - 8);
  rects.brothButtons.forEach((rect) => {
    // Wadah kaldu di atas baki: panci stainless kecil berisi kaldu berwarna.
    const b = brothById(rect.id);
    const active = state.selectedBroth === rect.id;
    ctx.save();
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 9);
    ctx.fillStyle = active ? '#ffe9b0' : '#e8ebee';
    ctx.fill();
    ctx.lineWidth = active ? 3 : 2;
    ctx.strokeStyle = active ? '#8a4b1f' : '#5a5e63';
    ctx.stroke();
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.ellipse(rect.x + rect.w / 2, rect.y + 13, 58, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.ellipse(rect.x + rect.w / 2 - 18, rect.y + 11, 20, 3, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText(b.name, rect.x + rect.w / 2, rect.y + 34);
    ctx.restore();
  });
  ctx.fillStyle = '#3a1a08';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText('Klik mangkuk untuk memilih  •  1 / 2 pilih mangkuk  •  M bisu  •  P jeda  •  R ulang', 1264, BROTH_BAR_Y + 30);
  ctx.textAlign = 'left';
}

// Dekorasi baki: mangkuk cadangan + sumpit, tirai noren, dan lampion merah.
function drawTrayDecor(ctx) {
  // Mangkuk cadangan bertumpuk.
  ctx.fillStyle = '#b8322a';
  ctx.beginPath(); ctx.ellipse(890, 628, 42, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath(); ctx.ellipse(890, 620, 42, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f7e8c8';
  ctx.beginPath(); ctx.ellipse(890, 620, 34, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#b8322a';
  ctx.beginPath(); ctx.ellipse(890, 606, 42, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f7e8c8';
  ctx.beginPath(); ctx.ellipse(890, 606, 34, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Sumpit.
  ctx.strokeStyle = '#6b3a1a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(950, 592); ctx.lineTo(990, 632); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(962, 588); ctx.lineTo(1002, 628); ctx.stroke();
  // Tirai noren biru gelap dengan tulisan kedai.
  ctx.fillStyle = '#2a3a5e';
  for (let i = 0; i < 3; i += 1) ctx.fillRect(1040 + i * 40, 574, 36, 62);
  ctx.fillStyle = '#fff6e6';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('RAMEN', 1098, 596);
  ctx.fillText('RUSH', 1098, 612);
  // Lampion merah.
  ctx.fillStyle = '#d94f3d';
  ctx.beginPath(); ctx.ellipse(1224, 606, 20, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd94a';
  ctx.fillRect(1216, 576, 16, 5);
  ctx.fillRect(1216, 628, 16, 5);
  ctx.fillStyle = '#fff6e6';
  ctx.beginPath(); ctx.arc(1224, 606, 7, 0, Math.PI * 2); ctx.fill();
  ctx.textAlign = 'left';
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(20,10,2,0.72)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#fff6e6';
  ctx.textAlign = 'center';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('RAMEN RUSH', 640, 220);
  // Tirai noren di layar judul.
  ctx.fillStyle = '#2a3a5e';
  for (let i = 0; i < 3; i += 1) ctx.fillRect(520 + i * 84, 96, 76, 56);
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath(); ctx.arc(640, 124, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff6e6';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Rebus mi di dua keranjang, panggang topping, rakit mangkuk, sajikan sebelum pelanggan pergi.', 640, 320);
  ctx.fillText('Sajian benar beruntun menaikkan kombo sampai x4. Capai 1000 poin untuk menang!', 640, 350);
  ctx.fillStyle = '#ffd94a';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText('Klik di mana saja untuk mulai memasak', 640, 420);
  ctx.fillStyle = '#e8c98a';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('Mouse: klik stasiun  •  1/2: pilih mangkuk  •  M: bisu  •  P: jeda', 640, 460);
  ctx.textAlign = 'left';
}

function drawEndPanel(ctx, title, subtitle) {
  ctx.fillStyle = 'rgba(20,10,2,0.78)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#fff6e6';
  ctx.textAlign = 'center';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillText(title, 640, 320);
  ctx.font = '20px Georgia, serif';
  ctx.fillText(subtitle, 640, 370);
  ctx.textAlign = 'left';
}
