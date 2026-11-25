// recipes.js — kaldu, topping, sifat pelanggan, dan pembuat pesanan.
// Pesanan selalu bervariasi bentuknya; pelanggan yang sama tidak pernah muncul
// dua kali bersamaan di papan pesanan (dicegah oleh pickCustomerNames).
export const BROTHS = [
  { id: 'shoyu', name: 'Shoyu', color: '#8a4b1f', light: '#c98a4b', desc: 'Kecap asin gurih' },
  { id: 'tonkotsu', name: 'Tonkotsu', color: '#f2e3c2', light: '#fff3d6', desc: 'Kaldu tulang creamy' },
  { id: 'miso', name: 'Miso', color: '#a8542a', light: '#d98a4e', desc: 'Pasta kedelai pekat' },
];

export const TOPPINGS = [
  { id: 'chashu', name: 'Chashu', color: '#e8a0a0', prep: 5, price: 20 },
  { id: 'egg', name: 'Telur Ajitama', color: '#fff2c8', prep: 4, price: 15 },
  { id: 'nori', name: 'Nori', color: '#2e4d2e', prep: 2, price: 10 },
  { id: 'negi', name: 'Daun Bawang', color: '#7ec850', prep: 3, price: 10 },
  { id: 'corn', name: 'Jagung', color: '#ffd94a', prep: 3, price: 10 },
  { id: 'shiitake', name: 'Shiitake', color: '#8a5a33', prep: 4, price: 15 },
];

export function brothById(id) {
  return BROTHS.find((b) => b.id === id) || BROTHS[0];
}

export function toppingById(id) {
  return TOPPINGS.find((t) => t.id === id) || TOPPINGS[0];
}

// Sifat pelanggan memengaruhi pesanannya: jumlah topping, kesabaran, dan tip.
export const ARCHETYPES = [
  { id: 'cepat', label: 'Buru-buru', patience: 0.62, toppings: [1, 2], tip: 10 },
  { id: 'biasa', label: 'Biasa', patience: 1.0, toppings: [2, 3], tip: 20 },
  { id: 'rakus', label: 'Lapar Berat', patience: 1.15, toppings: [3, 4], tip: 30 },
  { id: 'kritikus', label: 'Kritikus', patience: 0.85, toppings: [3, 5], tip: 50 },
  { id: 'anak', label: 'Anak Kecil', patience: 1.25, toppings: [1, 2], tip: 15 },
  { id: 'pedas', label: 'Pecinta Topping', patience: 0.9, toppings: [4, 5], tip: 40 },
];

export const CUSTOMER_NAMES = [
  'Sari', 'Budi', 'Maya', 'Agus', 'Rina', 'Dedi',
  'Lina', 'Joko', 'Nina', 'Fajar', 'Tika', 'Rudi',
];

export const CUSTOMER_FACES = [
  { skin: '#f2c89b', hair: '#3a2a1a', hairStyle: 'bun' },
  { skin: '#e8b88a', hair: '#1a1a1a', hairStyle: 'short' },
  { skin: '#f7d7a8', hair: '#6b3a1a', hairStyle: 'long' },
  { skin: '#d9a06b', hair: '#222222', hairStyle: 'cap' },
  { skin: '#f2c89b', hair: '#8a2a2a', hairStyle: 'bob' },
  { skin: '#e8b88a', hair: '#4a4a4a', hairStyle: 'short' },
  { skin: '#f7d7a8', hair: '#2a1a3a', hairStyle: 'bun' },
  { skin: '#d9a06b', hair: '#3a2a1a', hairStyle: 'cap' },
  { skin: '#f2c89b', hair: '#1a1a1a', hairStyle: 'long' },
  { skin: '#e8b88a', hair: '#6b3a1a', hairStyle: 'short' },
  { skin: '#f7d7a8', hair: '#8a2a2a', hairStyle: 'bob' },
  { skin: '#d9a06b', hair: '#4a4a4a', hairStyle: 'bun' },
];

let orderCounter = 0;

export function pickCustomerNames(usedNames, count) {
  const free = CUSTOMER_NAMES.filter((n) => !usedNames.includes(n));
  const picked = [];
  while (picked.length < count && free.length > 0) {
    const i = Math.floor(Math.random() * free.length);
    picked.push(free.splice(i, 1)[0]);
  }
  return picked;
}

export function randomOrder(patienceSeconds, usedNames) {
  const freeNames = CUSTOMER_NAMES.filter((n) => !usedNames.includes(n));
  if (freeNames.length === 0) return null;
  const name = freeNames[Math.floor(Math.random() * freeNames.length)];
  const face = CUSTOMER_FACES[CUSTOMER_NAMES.indexOf(name)];
  const arch = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
  const broth = BROTHS[Math.floor(Math.random() * BROTHS.length)];
  const [minT, maxT] = arch.toppings;
  const want = minT + Math.floor(Math.random() * (maxT - minT + 1));
  const pool = TOPPINGS.slice();
  const toppings = [];
  while (toppings.length < want && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    toppings.push(pool.splice(i, 1)[0].id);
  }
  const patienceMax = Math.round(patienceSeconds * arch.patience);
  orderCounter += 1;
  return {
    id: orderCounter,
    name,
    face,
    archetype: arch,
    broth: broth.id,
    toppings,
    patience: patienceMax,
    patienceMax,
    tip: arch.tip,
  };
}

export function toppingsMatch(want, have) {
  if (want.length !== have.length) return false;
  return want.every((t) => have.includes(t));
}
