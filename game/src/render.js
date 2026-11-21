// Everything the player sees: the header bar (title, level, timer, score, hints),
// the two panels with their markers, the footer strip, and the title / level-clear
// / win / game-over / paused screens. The panels themselves are prerendered by the
// world; this file only frames them and paints what the game has done to them.
import {
  CANVAS_H,
  CANVAS_W,
  FOOTER_H,
  HEADER_H,
  LEFT_X,
  MAX_HINTS,
  PANEL_GAP,
  PANEL_H,
  PANEL_W,
  PANEL_Y,
  RIGHT_X,
} from './config.js';
import { LEVELS } from './levels.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';
export const SCREEN_PAUSED = 'paused';

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  function drawHeader(state, level) {
    ctx.fillStyle = '#14101f';
    ctx.fillRect(0, 0, CANVAS_W, HEADER_H);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏮 LANTERN ROW', 24, HEADER_H / 2 + 1);
    ctx.fillStyle = '#cfc4de';
    ctx.font = '15px sans-serif';
    ctx.fillText(`Level ${state.levelIndex + 1}/3 · ${level.name}`, 268, HEADER_H / 2 + 1);

    // Timer bar with the time left as text.
    const barX = 560;
    const barW = 220;
    const fraction = Math.max(0, state.timeLeft / level.time);
    ctx.fillStyle = '#2c2140';
    ctx.fillRect(barX, 16, barW, 20);
    ctx.fillStyle = fraction > 0.33 ? '#2ec4b6' : fraction > 0.15 ? '#ffd166' : '#e4572e';
    ctx.fillRect(barX, 16, barW * fraction, 20);
    ctx.strokeStyle = '#4a3a63';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX, 16, barW, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⏱ ${formatTime(state.timeLeft)}`, barX + barW / 2, 27);

    // Remaining counter — the number the brief asks to see.
    const remaining = level.differences.length - state.found.size;
    ctx.fillStyle = remaining === 0 ? '#2ec4b6' : '#ff6fb5';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(`${remaining} LEFT`, 850, HEADER_H / 2 + 1);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(`★ ${state.score}`, 950, HEADER_H / 2 + 1);

    ctx.fillStyle = '#cfc4de';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`💡 ${state.hintsLeft}/${MAX_HINTS} hints (H)`, 1060, HEADER_H / 2 + 1);
  }

  function drawFoundRing(x, y, number, pulse) {
    const radius = 24 + (pulse ? Math.sin(performance.now() / 120) * 2.5 : 0);
    ctx.strokeStyle = '#2ec4b6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(46,196,182,0.45)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#2ec4b6';
    ctx.beginPath();
    ctx.arc(x, y - radius - 4, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0e2a26';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(number), x, y - radius - 3);
  }

  function drawPanels(state) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#000000';
    ctx.fillRect(LEFT_X, PANEL_Y, PANEL_W, PANEL_H);
    ctx.fillRect(RIGHT_X, PANEL_Y, PANEL_W, PANEL_H);
    ctx.restore();
    ctx.drawImage(state.panels.left, LEFT_X, PANEL_Y);
    ctx.drawImage(state.panels.right, RIGHT_X, PANEL_Y);
    ctx.strokeStyle = '#4a3a63';
    ctx.lineWidth = 3;
    ctx.strokeRect(LEFT_X, PANEL_Y, PANEL_W, PANEL_H);
    ctx.strokeRect(RIGHT_X, PANEL_Y, PANEL_W, PANEL_H);

    // Panel labels.
    ctx.fillStyle = 'rgba(20,16,31,0.85)';
    ctx.fillRect(LEFT_X + 10, PANEL_Y + 10, 92, 26);
    ctx.fillRect(RIGHT_X + 10, PANEL_Y + 10, 92, 26);
    ctx.fillStyle = '#f2e3c6';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('ORIGINAL', LEFT_X + 20, PANEL_Y + 24);
    ctx.fillText('CHANGED', RIGHT_X + 20, PANEL_Y + 24);

    // The "spot it" divider between the panels.
    ctx.fillStyle = '#14101f';
    ctx.beginPath();
    ctx.arc(LEFT_X + PANEL_W + PANEL_GAP / 2, PANEL_Y + PANEL_H / 2, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VS', LEFT_X + PANEL_W + PANEL_GAP / 2, PANEL_Y + PANEL_H / 2 + 1);

    // Found markers on both panels, numbered in find order.
    const level = LEVELS[state.levelIndex];
    state.marks.forEach((mark, order) => {
      const diff = level.differences[mark.id];
      drawFoundRing(LEFT_X + diff.x, PANEL_Y + diff.y, order + 1, false);
      drawFoundRing(RIGHT_X + diff.x, PANEL_Y + diff.y, order + 1, false);
    });

    // A hint pulses its difference on both panels.
    if (state.hintId >= 0) {
      const diff = level.differences[state.hintId];
      drawFoundRing(LEFT_X + diff.x, PANEL_Y + diff.y, '?', true);
      drawFoundRing(RIGHT_X + diff.x, PANEL_Y + diff.y, '?', true);
    }

    // Wrong clicks flash a red cross where they landed.
    for (const mark of state.wrongMarks) {
      ctx.strokeStyle = '#e4572e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(mark.x - 10, mark.y - 10);
      ctx.lineTo(mark.x + 10, mark.y + 10);
      ctx.moveTo(mark.x + 10, mark.y - 10);
      ctx.lineTo(mark.x - 10, mark.y + 10);
      ctx.stroke();
    }
  }

  function drawFooter(state, level, crosshair) {
    ctx.fillStyle = '#14101f';
    ctx.fillRect(0, CANVAS_H - FOOTER_H, CANVAS_W, FOOTER_H);
    // Found dots: one per difference, filled as they are found.
    const dotY = CANVAS_H - FOOTER_H / 2;
    ctx.fillStyle = '#cfc4de';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Found:', 24, dotY);
    level.differences.forEach((diff, index) => {
      const x = 92 + index * 26;
      ctx.beginPath();
      ctx.arc(x, dotY, 8, 0, Math.PI * 2);
      ctx.fillStyle = state.found.has(index) ? '#2ec4b6' : '#2c2140';
      ctx.fill();
      ctx.strokeStyle = '#4a3a63';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    ctx.fillStyle = '#cfc4de';
    ctx.font = '14px sans-serif';
    ctx.fillText('Click a difference on either picture · Arrows + Enter work too · H hint · P pause · R restart · M sound', 340, dotY);
    if (crosshair) {
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(crosshair.x, crosshair.y, 12, 0, Math.PI * 2);
      ctx.moveTo(crosshair.x - 18, crosshair.y);
      ctx.lineTo(crosshair.x + 18, crosshair.y);
      ctx.moveTo(crosshair.x, crosshair.y - 18);
      ctx.lineTo(crosshair.x, crosshair.y + 18);
      ctx.stroke();
    }
  }

  function overlay(title, lines, accent) {
    ctx.fillStyle = 'rgba(10, 8, 18, 0.72)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#14101f';
    const boxW = 620;
    const boxH = 96 + lines.length * 30;
    ctx.fillRect((CANVAS_W - boxW) / 2, (CANVAS_H - boxH) / 2, boxW, boxH);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect((CANVAS_W - boxW) / 2, (CANVAS_H - boxH) / 2, boxW, boxH);
    ctx.fillStyle = accent;
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, CANVAS_W / 2, (CANVAS_H - boxH) / 2 + 46);
    ctx.fillStyle = '#f2e3c6';
    ctx.font = '16px sans-serif';
    lines.forEach((line, index) => {
      ctx.fillText(line, CANVAS_W / 2, (CANVAS_H - boxH) / 2 + 92 + index * 30);
    });
  }

  function drawTitle(state, best) {
    drawPanels(state);
    ctx.fillStyle = 'rgba(10, 8, 18, 0.66)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏮 LANTERN ROW', CANVAS_W / 2, 108);
    ctx.fillStyle = '#f2e3c6';
    ctx.font = '21px sans-serif';
    ctx.fillText('Spot the difference — two pictures, one of them lies.', CANVAS_W / 2, 152);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#cfc4de';
    ctx.fillText('Click a difference on either picture. Wrong clicks cost 3 seconds and 25 points.', CANVAS_W / 2, 182);
    LEVELS.forEach((level, index) => {
      const x = 240 + index * 280;
      const y = 240;
      ctx.fillStyle = '#1d1428';
      ctx.fillRect(x, y, 240, 96);
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 240, 96);
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`${index + 1} · ${level.name}`, x + 120, y + 30);
      ctx.fillStyle = '#f2e3c6';
      ctx.font = '14px sans-serif';
      ctx.fillText(level.subtitle, x + 120, y + 58);
      ctx.fillStyle = '#2ec4b6';
      ctx.fillText('Press 1, 2 or 3 — or click to play', x + 120, y + 80);
    });
    ctx.fillStyle = '#cfc4de';
    ctx.font = '15px sans-serif';
    ctx.fillText(`Best score: ${best} · 21 differences across 3 scenes · Hints cost 50 points`, CANVAS_W / 2, 380);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('Press Enter or click anywhere to start', CANVAS_W / 2, 416);
  }

  return {
    draw(state, screen, best, crosshair) {
      const level = LEVELS[state.levelIndex];
      ctx.fillStyle = '#0e0a18';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      if (screen === SCREEN_TITLE) {
        drawTitle(state, best);
        return;
      }
      drawHeader(state, level);
      drawPanels(state);
      drawFooter(state, level, screen === SCREEN_PLAY ? crosshair : null);
      if (screen === SCREEN_CLEAR) {
        overlay('Level clear!', [
          `${level.name} — all ${level.differences.length} differences found`,
          `Time bonus banked · Score ${state.score}`,
          'Press Enter for the next level',
        ], '#2ec4b6');
      } else if (screen === SCREEN_WIN) {
        overlay('🏮 You found them all!', [
          `All 21 differences across 3 scenes · Score ${state.score} · Best ${Math.max(best, state.score)}`,
          `Wrong clicks: ${state.mistakes}`,
          'Press Enter to play again',
        ], '#ffd166');
      } else if (screen === SCREEN_OVER) {
        overlay('Out of time!', [
          `${level.name} — ${state.found.size} of ${level.differences.length} found`,
          `Score ${state.score}`,
          'Press R to retry this level',
        ], '#e4572e');
      } else if (screen === SCREEN_PAUSED) {
        overlay('Paused', ['Take a breath — the pictures will wait.', 'Press P to keep hunting'], '#cfc4de');
      }
    },
  };
}
