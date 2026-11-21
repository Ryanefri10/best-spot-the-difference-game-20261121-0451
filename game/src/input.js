// Mouse and keyboard input. Mouse: click either panel to mark a difference.
// Keyboard: arrow keys move a crosshair, Enter or Space clicks where it stands,
// H asks for a hint, P pauses, R restarts the level, M mutes, 1–3 pick a level on
// the title screen, Enter starts. All actions are queued and read once per frame.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RESTART = 8;
export const ACTION_MUTE = 16;

export function createInput(canvas) {
  let actions = 0;
  let click = null;
  let crosshair = null;
  const keys = new Set();

  function queue(action) {
    actions |= action;
  }

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    click = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  });

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    crosshair = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'enter' || key === ' ') {
      queue(ACTION_CONFIRM);
      event.preventDefault();
    } else if (key === 'p' || key === 'escape') {
      queue(ACTION_PAUSE);
    } else if (key === 'h') {
      queue(ACTION_HINT);
    } else if (key === 'r') {
      queue(ACTION_RESTART);
    } else if (key === 'm') {
      queue(ACTION_MUTE);
    } else if (key === 'arrowleft' || key === 'arrowright' || key === 'arrowup' || key === 'arrowdown') {
      keys.add(key);
      event.preventDefault();
    } else if (key === '1' || key === '2' || key === '3') {
      keys.add(`level${key}`);
    }
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.key.toLowerCase());
  });

  return {
    /** The click since the last read, or null. */
    takeClick() {
      const taken = click;
      click = null;
      return taken;
    },
    /** The action bits queued since the last read. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** Level number pressed (1–3) since the last read, or 0. */
    takeLevelPick() {
      for (let n = 1; n <= 3; n += 1) {
        if (keys.has(`level${n}`)) {
          keys.delete(`level${n}`);
          return n;
        }
      }
      return 0;
    },
    /** Move the keyboard crosshair by the held arrow keys. */
    moveCrosshair(position, step) {
      if (keys.has('arrowleft')) position.x -= step;
      if (keys.has('arrowright')) position.x += step;
      if (keys.has('arrowup')) position.y -= step;
      if (keys.has('arrowdown')) position.y += step;
      return position;
    },
    /** The mouse position over the canvas, or null when it never moved. */
    get pointer() {
      return crosshair;
    },
  };
}
