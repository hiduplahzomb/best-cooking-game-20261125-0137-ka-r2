// stations.js — mesin status stasiun dapur: keranjang mi, panggangan, dan mangkuk.
// Setiap stasiun punya status yang jelas; klik hanya berlaku pada status yang tepat.
import {
  NOODLE_COOK_SECONDS,
  NOODLE_READY_SECONDS,
  GRILL_SECONDS,
} from './config.js';
import { toppingById } from './recipes.js';

export const BASKET_EMPTY = 'empty';
export const BASKET_COOKING = 'cooking';
export const BASKET_READY = 'ready';
export const BASKET_BURNT = 'burnt';

export const GRILL_EMPTY = 'empty';
export const GRILL_COOKING = 'cooking';
export const GRILL_DONE = 'done';

export function createBaskets() {
  return [
    { status: BASKET_EMPTY, timer: 0 },
    { status: BASKET_EMPTY, timer: 0 },
  ];
}

export function createGrillSlots() {
  return [
    { status: GRILL_EMPTY, topping: null, timer: 0 },
    { status: GRILL_EMPTY, topping: null, timer: 0 },
  ];
}

export function createBowls() {
  return [
    { broth: null, noodles: false, toppings: [] },
    { broth: null, noodles: false, toppings: [] },
  ];
}

export function startNoodles(basket) {
  if (basket.status !== BASKET_EMPTY) return false;
  basket.status = BASKET_COOKING;
  basket.timer = 0;
  return true;
}

export function updateBasket(basket, dt) {
  if (basket.status === BASKET_COOKING) {
    basket.timer += dt;
    if (basket.timer >= NOODLE_COOK_SECONDS) {
      basket.status = BASKET_READY;
      basket.timer = 0;
    }
  } else if (basket.status === BASKET_READY) {
    basket.timer += dt;
    if (basket.timer >= NOODLE_READY_SECONDS) {
      basket.status = BASKET_BURNT;
      basket.timer = 0;
    }
  }
}

export function basketProgress(basket) {
  if (basket.status === BASKET_COOKING) return basket.timer / NOODLE_COOK_SECONDS;
  if (basket.status === BASKET_READY) return 1 - basket.timer / NOODLE_READY_SECONDS;
  return 0;
}

export function clearBasket(basket) {
  basket.status = BASKET_EMPTY;
  basket.timer = 0;
}

export function startGrill(slot, toppingId) {
  if (slot.status !== GRILL_EMPTY) return false;
  const topping = toppingById(toppingId);
  slot.status = GRILL_COOKING;
  slot.topping = toppingId;
  slot.timer = 0;
  slot.cookSeconds = topping.prep > 0 ? topping.prep : GRILL_SECONDS;
  return true;
}

export function updateGrillSlot(slot, dt) {
  if (slot.status !== GRILL_COOKING) return;
  slot.timer += dt;
  if (slot.timer >= slot.cookSeconds) {
    slot.status = GRILL_DONE;
    slot.timer = 0;
  }
}

export function grillProgress(slot) {
  if (slot.status !== GRILL_COOKING) return 0;
  return Math.min(1, slot.timer / slot.cookSeconds);
}

export function takeGrillTopping(slot) {
  if (slot.status !== GRILL_DONE) return null;
  const topping = slot.topping;
  slot.status = GRILL_EMPTY;
  slot.topping = null;
  slot.timer = 0;
  return topping;
}

export function pourBrothIntoBowl(bowl, brothId) {
  if (bowl.broth) return false;
  bowl.broth = brothId;
  return true;
}

export function addNoodlesToBowl(bowl) {
  if (!bowl.broth || bowl.noodles) return false;
  bowl.noodles = true;
  return true;
}

export function addToppingToBowl(bowl, toppingId) {
  if (!bowl.broth || !bowl.noodles) return false;
  if (bowl.toppings.includes(toppingId)) return false;
  bowl.toppings.push(toppingId);
  return true;
}

export function bowlIsReadyToServe(bowl) {
  return Boolean(bowl.broth) && bowl.noodles;
}

export function emptyBowl(bowl) {
  bowl.broth = null;
  bowl.noodles = false;
  bowl.toppings = [];
}

export function bowlDescription(bowl) {
  const parts = [];
  if (bowl.broth) parts.push(bowl.broth);
  if (bowl.noodles) parts.push('mi');
  parts.push(...bowl.toppings);
  return parts.join(' + ') || 'kosong';
}
