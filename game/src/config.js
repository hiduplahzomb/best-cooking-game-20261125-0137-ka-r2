// config.js — semua angka konkret Ramen Rush di satu tempat.
// Canvas logis 1280x720; semua stasiun, waktu, dan skor memakai konstanta di sini.
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const WIN_SCORE = 1000;
export const START_LIVES = 3;
export const MAX_ORDERS = 4;
export const MAX_COMBO = 4;

export const NOODLE_COOK_SECONDS = 6;
export const NOODLE_READY_SECONDS = 5;
export const GRILL_SECONDS = 4;

export const ORDER_SPAWN_SECONDS = 12;
export const ORDER_PATIENCE_SECONDS = 45;
export const PATIENCE_RUSH_SECONDS = 28;

export const SERVE_BASE_POINTS = 100;
export const SERVE_PATIENCE_BONUS_MAX = 50;
export const WRONG_SERVE_PENALTY = 50;

export const LEVEL_UP_EVERY_POINTS = 250;
export const MAX_LEVEL = 5;

// Layout: papan pesanan di atas, dapur di tengah, tombol bahan di bawah.
export const ORDER_BOARD_Y = 82;
export const ORDER_CARD_WIDTH = 300;
export const ORDER_CARD_HEIGHT = 118;
export const ORDER_CARD_GAP = 16;

export const KITCHEN_TOP_Y = 212;
export const KITCHEN_BOTTOM_Y = 556;

export const POT_X = 56;
export const POT_Y = 300;
export const POT_WIDTH = 220;
export const POT_HEIGHT = 150;

export const BASKET_X = 316;
export const BASKET_Y = 300;
export const BASKET_WIDTH = 118;
export const BASKET_HEIGHT = 150;
export const BASKET_GAP = 24;

export const GRILL_X = 612;
export const GRILL_Y = 300;
export const GRILL_WIDTH = 248;
export const GRILL_HEIGHT = 150;
export const GRILL_SLOT_GAP = 16;

export const BOWL_X = 908;
export const BOWL_Y = 316;
export const BOWL_WIDTH = 150;
export const BOWL_HEIGHT = 150;
export const BOWL_GAP = 22;

export const TOPPING_BAR_Y = 570;
export const TOPPING_BUTTON_WIDTH = 118;
export const TOPPING_BUTTON_HEIGHT = 64;
export const TOPPING_BUTTON_GAP = 12;

export const BROTH_BAR_Y = 656;
export const BROTH_BUTTON_WIDTH = 150;
export const BROTH_BUTTON_HEIGHT = 44;

export const HUD_HEIGHT = 64;
export const STEAM_PARTICLES_MAX = 90;
export const FLOAT_TEXT_LIFETIME_MS = 3000;
