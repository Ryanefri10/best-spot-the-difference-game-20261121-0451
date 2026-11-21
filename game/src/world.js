// The game state and its rules. A world holds one level at a time: which
// differences are found, the clock, the score, hints left, and the marks left on
// the panels (rings on found differences, red crosses on wrong clicks, a pulsing
// ring while a hint is showing). Clicking either panel counts — the difference is
// the same spot on both pictures.
import { createRandom } from './random.js';
import {
  FIND_POINTS,
  HIT_RADIUS,
  HINT_COST,
  LEFT_X,
  LEVEL_TIME,
  MAX_HINTS,
  PANEL_H,
  PANEL_W,
  PANEL_Y,
  RIGHT_X,
  TIME_BONUS_PER_SECOND,
  WRONG_POINTS,
  WRONG_TIME_PENALTY,
} from './config.js';
import { LEVELS } from './levels.js';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_HINT = 4;
export const EVENT_LEVEL_CLEAR = 8;
export const EVENT_TIME_UP = 16;
export const EVENT_WIN = 32;

export function createWorld() {
  const state = {
    levelIndex: 0,
    screen: 'title',
    found: new Set(),
    marks: [],
    wrongMarks: [],
    hintId: -1,
    hintUntil: 0,
    hintsLeft: MAX_HINTS,
    timeLeft: LEVEL_TIME[0],
    score: 0,
    streak: 0,
    mistakes: 0,
    totalFound: 0,
    totalDifferences: 0,
    elapsed: 0,
    levelCleared: false,
    panels: { left: null, right: null },
    lastTickSecond: -1,
  };

  /** Paint both panels of a level onto offscreen canvases. */
  function renderPanels(levelIndex) {
    const level = LEVELS[levelIndex];
    const left = document.createElement('canvas');
    const right = document.createElement('canvas');
    left.width = PANEL_W;
    left.height = PANEL_H;
    right.width = PANEL_W;
    right.height = PANEL_H;
    level.paint(left.getContext('2d'), false, createRandom(level.seed));
    level.paint(right.getContext('2d'), true, createRandom(level.seed));
    state.panels = { left, right };
  }

  function level() {
    return LEVELS[state.levelIndex];
  }

  function resetLevel(levelIndex) {
    state.levelIndex = levelIndex;
    state.found = new Set();
    state.marks = [];
    state.wrongMarks = [];
    state.hintId = -1;
    state.hintUntil = 0;
    state.hintsLeft = MAX_HINTS;
    state.timeLeft = LEVEL_TIME[levelIndex];
    state.streak = 0;
    state.levelCleared = false;
    state.lastTickSecond = -1;
    renderPanels(levelIndex);
  }

  function panelAt(point) {
    if (point.y >= PANEL_Y && point.y < PANEL_Y + PANEL_H) {
      if (point.x >= LEFT_X && point.x < LEFT_X + PANEL_W) {
        return { side: 'left', x: point.x - LEFT_X, y: point.y - PANEL_Y };
      }
      if (point.x >= RIGHT_X && point.x < RIGHT_X + PANEL_W) {
        return { side: 'right', x: point.x - RIGHT_X, y: point.y - PANEL_Y };
      }
    }
    return null;
  }

  function nearestDifference(local) {
    const list = level().differences;
    let best = -1;
    let bestDistance = Infinity;
    for (let i = 0; i < list.length; i += 1) {
      if (state.found.has(i)) continue;
      const dx = local.x - list[i].x;
      const dy = local.y - list[i].y;
      const distance = Math.hypot(dx, dy);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }
    return bestDistance <= HIT_RADIUS ? best : -1;
  }

  return {
    state,
    level,

    /** Start the title screen (all three levels on show). */
    toTitle() {
      state.screen = 'title';
      state.totalFound = 0;
      state.totalDifferences = LEVELS.reduce((sum, item) => sum + item.differences.length, 0);
      resetLevel(0);
    },

    /** Begin a level, fresh. */
    startLevel(levelIndex) {
      resetLevel(levelIndex);
      state.screen = 'play';
    },

    /** A click at canvas coordinates; returns the event bits it caused. */
    click(point) {
      if (state.screen !== 'play') return EVENT_NONE;
      const local = panelAt(point);
      if (local === null) return EVENT_NONE;
      const id = nearestDifference(local);
      if (id >= 0) {
        state.found.add(id);
        state.totalFound += 1;
        state.streak += 1;
        state.score += FIND_POINTS + Math.min(state.streak - 1, 5) * 10;
        state.marks.push({ id, at: state.elapsed });
        state.hintId = -1;
        if (state.found.size === level().differences.length) {
          state.levelCleared = true;
          state.score += Math.ceil(state.timeLeft) * TIME_BONUS_PER_SECOND;
          if (state.levelIndex === LEVELS.length - 1) {
            state.screen = 'win';
            return EVENT_FOUND | EVENT_LEVEL_CLEAR | EVENT_WIN;
          }
          state.screen = 'clear';
          return EVENT_FOUND | EVENT_LEVEL_CLEAR;
        }
        return EVENT_FOUND;
      }
      state.streak = 0;
      state.mistakes += 1;
      state.score = Math.max(0, state.score - WRONG_POINTS);
      state.timeLeft = Math.max(0, state.timeLeft - WRONG_TIME_PENALTY);
      state.wrongMarks.push({ x: point.x, y: point.y, at: state.elapsed });
      return EVENT_WRONG;
    },

    /** Spend a hint: pulse the hardest unfound difference for a few seconds. */
    useHint() {
      if (state.screen !== 'play' || state.hintsLeft <= 0) return EVENT_NONE;
      let pick = -1;
      let hardest = -1;
      for (let i = 0; i < level().differences.length; i += 1) {
        if (state.found.has(i)) continue;
        if (level().differences[i].hard > hardest) {
          hardest = level().differences[i].hard;
          pick = i;
        }
      }
      if (pick < 0) return EVENT_NONE;
      state.hintsLeft -= 1;
      state.score = Math.max(0, state.score - HINT_COST);
      state.hintId = pick;
      state.hintUntil = state.elapsed + 2.5;
      return EVENT_HINT;
    },

    /** Advance the clock; returns EVENT_TIME_UP when the level runs out. */
    step(seconds) {
      state.elapsed += seconds;
      if (state.screen !== 'play') return EVENT_NONE;
      state.timeLeft -= seconds;
      const whole = Math.ceil(state.timeLeft);
      if (whole <= 10 && whole !== state.lastTickSecond && whole > 0) {
        state.lastTickSecond = whole;
      }
      if (state.hintId >= 0 && state.elapsed >= state.hintUntil) state.hintId = -1;
      state.wrongMarks = state.wrongMarks.filter((mark) => state.elapsed - mark.at < 0.9);
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.screen = 'over';
        return EVENT_TIME_UP;
      }
      return EVENT_NONE;
    },

    /** Move on after a cleared level. */
    nextLevel() {
      this.startLevel(state.levelIndex + 1);
    },

    /** The hint text for the hardest difference still unfound. */
    hintText() {
      let pick = -1;
      let hardest = -1;
      for (let i = 0; i < level().differences.length; i += 1) {
        if (state.found.has(i)) continue;
        if (level().differences[i].hard > hardest) {
          hardest = level().differences[i].hard;
          pick = i;
        }
      }
      return pick < 0 ? '' : level().differences[pick].hint;
    },
  };
}
