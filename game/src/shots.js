// The screenshot scenes behind ?shot=cover|play|title|win. Each one stages a real
// game state — actual finds recorded through the world's own state, never a painted
// overlay — so the frame is what a player really sees mid-hunt: markers on the
// differences found, several still unfound, and the counter of how many remain.
// The same seed and the same staged finds always give the same frame.
import { SCREEN_CLEAR, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

/** Record `ids` as found, in order, with the score a real player would hold. */
function stageFinds(world, ids, timeLeft, score) {
  const state = world.state;
  state.found = new Set(ids);
  state.marks = ids.map((id, order) => ({ id, at: order }));
  state.totalFound = ids.length;
  state.score = score;
  state.timeLeft = timeLeft;
  state.screen = SCREEN_PLAY;
  state.hintsLeft = 3;
  state.mistakes = 0;
}

/**
 * Set `world` to the named scene and return the screen to draw over it and the
 * best score to show. Unknown names stage the cover.
 */
export function stageShot(name, world) {
  if (name === 'play') {
    world.startLevel(1);
    stageFinds(world, [0, 1, 3, 5], 74, 430);
    world.state.totalFound = 5 + 4;
    world.state.mistakes = 1;
    return { screen: SCREEN_PLAY, best: 1240 };
  }
  if (name === 'title') {
    world.toTitle();
    return { screen: SCREEN_TITLE, best: 1860 };
  }
  if (name === 'win') {
    world.startLevel(2);
    stageFinds(world, [0, 1, 2, 3, 4, 5, 6, 7, 8], 41, 2340);
    world.state.totalFound = 21;
    world.state.mistakes = 2;
    world.state.screen = SCREEN_WIN;
    return { screen: SCREEN_WIN, best: 1860 };
  }
  if (name === 'clear') {
    world.startLevel(0);
    stageFinds(world, [0, 1, 2, 3, 4], 96, 860);
    world.state.totalFound = 5;
    world.state.screen = SCREEN_CLEAR;
    return { screen: SCREEN_CLEAR, best: 1240 };
  }
  world.startLevel(0);
  stageFinds(world, [0, 2, 3], 96, 310);
  world.state.mistakes = 1;
  return { screen: SCREEN_PLAY, best: 1240 };
}
