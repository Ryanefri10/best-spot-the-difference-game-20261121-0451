// Lantern Row — Spot the Difference: shared constants. One canvas, 1280x480, two
// 564x360 panels side by side under a header bar and above a footer strip.
export const CANVAS_W = 1280;
export const CANVAS_H = 480;
export const HEADER_H = 52;
export const FOOTER_H = 52;
export const PANEL_W = 564;
export const PANEL_H = 360;
export const PANEL_Y = 60;
export const LEFT_X = 40;
export const RIGHT_X = 676;
export const PANEL_GAP = RIGHT_X - (LEFT_X + PANEL_W);

// One step of the fixed-step world, and the per-level clocks (seconds).
export const STEP = 1 / 60;
export const LEVEL_TIME = [150, 150, 180];
export const MAX_HINTS = 3;
export const HIT_RADIUS = 26;
export const WRONG_TIME_PENALTY = 3;
export const FIND_POINTS = 100;
export const HINT_COST = 50;
export const TIME_BONUS_PER_SECOND = 5;
export const WRONG_POINTS = 25;

export const BEST_KEY = 'lantern-row-best';
export const STORAGE_LEVEL_KEY = 'lantern-row-level';
