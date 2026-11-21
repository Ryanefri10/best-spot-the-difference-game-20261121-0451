// Boot and the one loop: input is read every frame, the world advances in fixed
// 1/60 s steps, and the renderer paints what is there. The game moves between six
// screens: title, play, level-clear, win, game-over and paused.
//
// ?seed=N fixes the decorative random stream. ?shot=cover|play|title|win|clear
// (with &seed=N) stages that scene instead of running the loop, paints it twice
// and sets window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { LEVELS } from './levels.js';
import { createWorld, EVENT_FOUND, EVENT_HINT, EVENT_LEVEL_CLEAR, EVENT_TIME_UP, EVENT_WIN, EVENT_WRONG } from './world.js';
import {
  ACTION_CONFIRM,
  ACTION_HINT,
  ACTION_MUTE,
  ACTION_PAUSE,
  ACTION_RESTART,
  createInput,
} from './input.js';
import { createRenderer, SCREEN_CLEAR, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { createSounds } from './sounds.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);
void seed;

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas);
const sounds = createSounds();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, null);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  const crosshair = { x: 640, y: 240 };
  let crosshairShown = false;

  world.toTitle();

  function announce(message) {
    status.textContent = message;
  }

  function startLevel(levelIndex) {
    world.startLevel(levelIndex);
    screen = SCREEN_PLAY;
    const level = LEVELS[levelIndex];
    announce(`Playing ${level.name}. Find ${level.differences.length} differences.`);
  }

  function handleClick(point) {
    if (screen === SCREEN_TITLE) {
      startLevel(0);
      return;
    }
    if (screen === SCREEN_CLEAR) {
      world.nextLevel();
      screen = SCREEN_PLAY;
      return;
    }
    if (screen === SCREEN_WIN || screen === SCREEN_OVER) {
      world.toTitle();
      screen = SCREEN_TITLE;
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    sounds.unlock();
    const events = world.click(point);
    if (events & EVENT_FOUND) {
      sounds.found(world.state.streak);
      const level = LEVELS[world.state.levelIndex];
      const remaining = level.differences.length - world.state.found.size;
      announce(`Found one! ${remaining} left.`);
    }
    if (events & EVENT_WRONG) {
      sounds.wrong();
      announce('Not a difference. 3 seconds lost.');
    }
    if (events & EVENT_LEVEL_CLEAR) sounds.cleared();
    if (events & EVENT_WIN) {
      sounds.win();
      if (world.state.score > best) {
        best = world.state.score;
        saveBest(best);
      }
      announce(`You found them all! Score ${world.state.score}.`);
    }
    if (events & EVENT_TIME_UP) announce('Out of time.');
    if (world.state.screen === 'clear') screen = SCREEN_CLEAR;
    else if (world.state.screen === 'win') screen = SCREEN_WIN;
    else if (world.state.screen === 'over') screen = SCREEN_OVER;
  }

  function handleActions() {
    const actions = input.takeActions();
    const pick = input.takeLevelPick();
    if (actions & ACTION_MUTE) {
      const muted = sounds.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    if (pick > 0 && screen === SCREEN_TITLE) {
      startLevel(pick - 1);
      return;
    }
    if (actions & ACTION_RESTART && (screen === SCREEN_PLAY || screen === SCREEN_OVER || screen === SCREEN_PAUSED)) {
      startLevel(world.state.levelIndex);
      return;
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      const events = world.useHint();
      if (events & EVENT_HINT) {
        sounds.hint();
        announce(`Hint: ${world.hintText()}`);
      } else {
        announce('No hints left.');
      }
    }
    if (actions & ACTION_CONFIRM) {
      if (screen === SCREEN_TITLE) startLevel(0);
      else if (screen === SCREEN_CLEAR) {
        world.nextLevel();
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_WIN || screen === SCREEN_OVER) {
        world.toTitle();
        screen = SCREEN_TITLE;
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      } else if (screen === SCREEN_PLAY && crosshairShown) {
        handleClick({ x: crosshair.x, y: crosshair.y });
      }
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    const click = input.takeClick();
    if (click !== null) handleClick(click);
    if (input.pointer) {
      crosshair.x = input.pointer.x;
      crosshair.y = input.pointer.y;
      crosshairShown = false;
    } else {
      input.moveCrosshair(crosshair, 8);
      crosshairShown = true;
    }
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP) {
        const events = world.step(STEP);
        if (events & EVENT_TIME_UP) {
          screen = SCREEN_OVER;
          announce('Out of time.');
        }
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, crosshairShown ? crosshair : input.pointer);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Lantern Row. Press Enter or click to start. Find every difference between the two pictures.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
