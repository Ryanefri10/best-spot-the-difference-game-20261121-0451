// The three scenes, each painted twice: once as the original panel and once with its
// differences applied. Every painter takes (ctx, altered, random) and draws only with
// canvas shapes, so the game needs no image files at all. All coordinates are panel
// local: each panel is 564x360. A difference is a small branch on `altered` — the two
// panels agree everywhere else, so a careful player can trust their eyes.
import { PANEL_H, PANEL_W } from './config.js';

/** Rounded rectangle path. */
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A field of tiny stars from the seeded stream. */
function paintStars(ctx, random, count, top, bottom) {
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < count; i += 1) {
    const x = random() * PANEL_W;
    const y = top + random() * (bottom - top);
    const r = 0.8 + random() * 1.4;
    ctx.globalAlpha = 0.35 + random() * 0.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** A paper lantern: glowing body, dark caps, a tassel. */
function paintLantern(ctx, x, y, colour, glow) {
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 14;
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(x, y, 15, 19, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#2a1a12';
  ctx.fillRect(x - 6, y - 22, 12, 5);
  ctx.fillRect(x - 6, y + 17, 12, 5);
  ctx.strokeStyle = '#f7c873';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y + 22);
  ctx.lineTo(x, y + 30);
  ctx.stroke();
}

/** A sagging string of lanterns across the top of a scene. */
function paintLanternString(ctx, altered, tealIndex) {
  const positions = [60, 130, 200, 270, 340, 410, 480];
  ctx.strokeStyle = '#3a2b3f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 18);
  for (let i = 0; i < positions.length; i += 1) {
    ctx.quadraticCurveTo(positions[i] - 35, 44, positions[i], 34);
  }
  ctx.quadraticCurveTo(520, 44, 544, 18);
  ctx.stroke();
  for (let i = 0; i < positions.length; i += 1) {
    const teal = altered && i === tealIndex;
    paintLantern(ctx, positions[i], 52, teal ? '#2ec4b6' : '#e4572e', teal ? '#2ec4b6' : '#ff7a4d');
  }
}

// ---------------------------------------------------------------------------
// Level 1 — Lantern Row: a night market street.
// Differences (panel coords): 0 lantern colour (340,52) · 1 cat (470,268) ·
// 2 shop sign (282,150) · 3 window light (125,235) · 4 extra flag (528,112).
// ---------------------------------------------------------------------------
export function paintLanternRow(ctx, altered, random) {
  const sky = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  sky.addColorStop(0, '#1b1440');
  sky.addColorStop(0.55, '#3b2060');
  sky.addColorStop(1, '#6b2d5b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  paintStars(ctx, random, 42, 0, 120);

  // Moon, top right, with a soft halo.
  ctx.save();
  ctx.shadowColor = '#ffe9a8';
  ctx.shadowBlur = 26;
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(496, 46, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#e8c97e';
  ctx.beginPath();
  ctx.arc(488, 40, 4, 0, Math.PI * 2);
  ctx.arc(504, 54, 3, 0, Math.PI * 2);
  ctx.fill();

  // Rooftops and three shop fronts.
  ctx.fillStyle = '#241a33';
  ctx.fillRect(0, 250, PANEL_W, 110);
  const shops = [
    { x: 30, w: 150, awning: '#c94f6d', sign: 'TEA' },
    { x: 207, w: 150, awning: '#3f8f6b', sign: 'NOODLE' },
    { x: 384, w: 150, awning: '#4a6fa5', sign: 'TOYS' },
  ];
  for (const shop of shops) {
    ctx.fillStyle = '#31244a';
    ctx.fillRect(shop.x, 170, shop.w, 110);
    // Striped awning.
    for (let i = 0; i < 6; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? shop.awning : '#f2e3c6';
      ctx.fillRect(shop.x + i * (shop.w / 6), 170, shop.w / 6, 26);
    }
    // Door and window; the left shop's window goes dark in the changed panel.
    ctx.fillStyle = '#1d1428';
    ctx.fillRect(shop.x + 18, 225, 34, 55);
    const lit = !(shop.x === 30 && altered);
    ctx.fillStyle = lit ? '#ffd166' : '#3a2f52';
    ctx.fillRect(shop.x + 66, 215, 58, 40);
    ctx.strokeStyle = '#1d1428';
    ctx.lineWidth = 3;
    ctx.strokeRect(shop.x + 66, 215, 58, 40);
    ctx.beginPath();
    ctx.moveTo(shop.x + 95, 215);
    ctx.lineTo(shop.x + 95, 255);
    ctx.moveTo(shop.x + 66, 235);
    ctx.lineTo(shop.x + 124, 235);
    ctx.stroke();
    // Round hanging sign; the middle shop's glyph changes.
    ctx.fillStyle = '#f2e3c6';
    ctx.beginPath();
    ctx.arc(shop.x + shop.w / 2, 150, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8c2f39';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (shop.x === 207) {
      if (altered) {
        ctx.fillText('★', shop.x + shop.w / 2, 151);
      } else {
        ctx.fillText('☾', shop.x + shop.w / 2, 151);
      }
    } else {
      ctx.fillText(shop.sign, shop.x + shop.w / 2, 151);
    }
  }

  paintLanternString(ctx, altered, 4);

  // Bunting flags on the right shop; the altered panel hangs one extra flag.
  ctx.strokeStyle = '#3a2b3f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(384, 108);
  ctx.quadraticCurveTo(460, 132, 534, 108);
  ctx.stroke();
  const flagColours = ['#e4572e', '#ffd166', '#2ec4b6', '#c94f6d'];
  const flagCount = altered ? 6 : 5;
  for (let i = 0; i < flagCount; i += 1) {
    const x = 398 + i * 26;
    const y = 108 + Math.sin((i / 5) * Math.PI) * 12;
    ctx.fillStyle = flagColours[i % flagColours.length];
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.lineTo(x + 9, y);
    ctx.lineTo(x, y + 16);
    ctx.closePath();
    ctx.fill();
  }

  // The cat on the garden wall — present only in the original.
  if (!altered) {
    ctx.fillStyle = '#161022';
    ctx.beginPath();
    ctx.ellipse(470, 272, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(486, 256, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(480, 249);
    ctx.lineTo(482, 240);
    ctx.lineTo(486, 248);
    ctx.moveTo(490, 248);
    ctx.lineTo(493, 240);
    ctx.lineTo(495, 249);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(489, 255, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cobblestones and a puddle catching a lantern's glow.
  ctx.fillStyle = '#1a1226';
  ctx.fillRect(0, 300, PANEL_W, 60);
  ctx.fillStyle = '#2c2140';
  for (let i = 0; i < 14; i += 1) {
    ctx.fillRect(12 + i * 40, 318 + (i % 3) * 12, 26, 6);
  }
  ctx.fillStyle = '#7a5ba6';
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.ellipse(120, 330, 52, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ff7a4d';
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(120, 330, 22, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Level 2 — Harbour Dusk: boats, a lighthouse and gulls.
// Differences: 0 lighthouse beam (170,86) · 1 gull (300,70) · 2 boat flag
// (352,204) · 3 crate stack (482,273) · 4 anchor (200,294) · 5 cabin window
// (322,248) · 6 buoy colour (520,290).
// ---------------------------------------------------------------------------
export function paintHarbourDusk(ctx, altered, random) {
  const sky = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  sky.addColorStop(0, '#2b2350');
  sky.addColorStop(0.45, '#b45a6b');
  sky.addColorStop(0.62, '#e08a4e');
  sky.addColorStop(1, '#274060');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  // Low sun and its path on the water.
  ctx.save();
  ctx.shadowColor = '#ffb347';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#ffb347';
  ctx.beginPath();
  ctx.arc(430, 205, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ffb347';
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 5; i += 1) {
    ctx.fillRect(400 - i * 6, 232 + i * 22, 60 + i * 14, 4);
  }
  ctx.globalAlpha = 1;

  // Gulls; one is missing in the altered panel.
  ctx.strokeStyle = '#241a33';
  ctx.lineWidth = 2;
  const gulls = [
    [180, 60],
    [300, 70],
    [360, 46],
  ];
  for (const [gx, gy] of gulls) {
    if (altered && gx === 300) continue;
    ctx.beginPath();
    ctx.moveTo(gx - 10, gy);
    ctx.quadraticCurveTo(gx - 4, gy - 7, gx, gy);
    ctx.quadraticCurveTo(gx + 4, gy - 7, gx + 10, gy);
    ctx.stroke();
  }

  // Lighthouse on the left headland, with a beam the altered panel loses.
  ctx.fillStyle = '#3a2b3f';
  ctx.beginPath();
  ctx.moveTo(60, 240);
  ctx.lineTo(84, 96);
  ctx.lineTo(116, 96);
  ctx.lineTo(140, 240);
  ctx.fill();
  ctx.fillStyle = '#f2e3c6';
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(74 + i * 2, 130 + i * 34, 52 - i * 4, 18);
  }
  ctx.fillStyle = '#2a1a12';
  ctx.fillRect(82, 76, 36, 22);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(88, 81, 24, 12);
  if (!altered) {
    ctx.fillStyle = '#ffe9a8';
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(112, 87);
    ctx.lineTo(250, 40);
    ctx.lineTo(250, 130);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Sea and the wooden dock.
  ctx.fillStyle = '#1d3a52';
  ctx.fillRect(0, 240, PANEL_W, 120);
  ctx.strokeStyle = '#2f5a78';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 258 + i * 18);
    ctx.bezierCurveTo(140, 252 + i * 18, 380, 264 + i * 18, PANEL_W, 256 + i * 18);
    ctx.stroke();
  }
  ctx.fillStyle = '#5a3d28';
  ctx.fillRect(150, 300, 260, 14);
  ctx.fillStyle = '#6e4c31';
  for (let x = 150; x < 410; x += 26) ctx.fillRect(x, 300, 22, 14);
  ctx.fillStyle = '#3a2b1f';
  ctx.fillRect(160, 314, 8, 26);
  ctx.fillRect(392, 314, 8, 26);

  // Anchor leaning on the dock — gone in the altered panel.
  if (!altered) {
    ctx.strokeStyle = '#c9c2b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(200, 292, 10, 0, Math.PI, false);
    ctx.moveTo(200, 282);
    ctx.lineTo(200, 306);
    ctx.moveTo(188, 290);
    ctx.lineTo(212, 290);
    ctx.stroke();
    ctx.fillStyle = '#c9c2b8';
    ctx.beginPath();
    ctx.arc(200, 282, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Two boats with a cabin, a mast and a flag; the flag changes colour.
  function paintBoat(bx, by, scale, flagColour, cabinLit) {
    ctx.fillStyle = '#7a3b2e';
    ctx.beginPath();
    ctx.moveTo(bx - 52 * scale, by);
    ctx.lineTo(bx + 52 * scale, by);
    ctx.lineTo(bx + 38 * scale, by + 18 * scale);
    ctx.lineTo(bx - 38 * scale, by + 18 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f2e3c6';
    ctx.fillRect(bx - 22 * scale, by - 26 * scale, 44 * scale, 26 * scale);
    ctx.fillStyle = cabinLit ? '#ffd166' : '#3a2f52';
    ctx.fillRect(bx - 14 * scale, by - 20 * scale, 12 * scale, 12 * scale);
    ctx.strokeStyle = '#3a2b1f';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(bx + 14 * scale, by - 26 * scale);
    ctx.lineTo(bx + 14 * scale, by - 66 * scale);
    ctx.stroke();
    ctx.fillStyle = flagColour;
    ctx.beginPath();
    ctx.moveTo(bx + 14 * scale, by - 66 * scale);
    ctx.lineTo(bx + 38 * scale, by - 58 * scale);
    ctx.lineTo(bx + 14 * scale, by - 50 * scale);
    ctx.closePath();
    ctx.fill();
  }
  paintBoat(330, 262, 1, altered ? '#ffd166' : '#e4572e', !altered);
  paintBoat(480, 282, 0.7, '#2ec4b6', true);

  // Crate stack on the dock; the altered panel has one crate fewer.
  ctx.fillStyle = '#8a6a3b';
  ctx.fillRect(452, 282, 30, 18);
  ctx.fillRect(482, 282, 30, 18);
  if (!altered) ctx.fillRect(467, 264, 30, 18);
  ctx.strokeStyle = '#5a3d28';
  ctx.lineWidth = 2;
  ctx.strokeRect(452, 282, 30, 18);
  ctx.strokeRect(482, 282, 30, 18);
  if (!altered) ctx.strokeRect(467, 264, 30, 18);

  // Buoy bobbing near the right edge; its colour changes.
  ctx.fillStyle = altered ? '#2ec4b6' : '#e4572e';
  ctx.beginPath();
  ctx.arc(520, 292, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2e3c6';
  ctx.fillRect(517, 272, 6, 10);
  ctx.fillStyle = '#1d3a52';
  ctx.beginPath();
  ctx.ellipse(520, 304, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  void random;
}

// ---------------------------------------------------------------------------
// Level 3 — Festival Night: fireworks, stalls and a kite.
// Differences: 0 firework colour (280,80) · 1 drum (140,300) · 2 stall lanterns
// (448,228) · 3 star (500,50) · 4 banner glyph (282,120) · 5 kite (90,90) ·
// 6 steam (350,250) · 7 dog (480,320) · 8 paper crane (250,230).
// ---------------------------------------------------------------------------
export function paintFestivalNight(ctx, altered, random) {
  const sky = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  sky.addColorStop(0, '#0e1030');
  sky.addColorStop(0.6, '#241a4d');
  sky.addColorStop(1, '#4a2560');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  paintStars(ctx, random, 55, 0, 150);
  // One bright star hangs high on the right — it is missing in the altered sky,
  // so it is drawn only on the original panel, never painted over.
  if (!altered) {
    ctx.fillStyle = '#ffffff';
    ctx.save();
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(500, 50, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(500, 42);
    ctx.lineTo(500, 58);
    ctx.moveTo(492, 50);
    ctx.lineTo(508, 50);
    ctx.stroke();
  }

  // Kite drifting top left — gone in the altered panel.
  if (!altered) {
    ctx.strokeStyle = '#f2e3c6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(90, 90);
    ctx.quadraticCurveTo(70, 130, 52, 168);
    ctx.stroke();
    ctx.fillStyle = '#e4572e';
    ctx.beginPath();
    ctx.moveTo(90, 78);
    ctx.lineTo(104, 92);
    ctx.lineTo(90, 104);
    ctx.lineTo(76, 90);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(90, 78);
    ctx.lineTo(97, 92);
    ctx.lineTo(90, 104);
    ctx.lineTo(83, 90);
    ctx.closePath();
    ctx.fill();
  }

  // Fireworks: the big burst changes colour.
  function paintBurst(cx, cy, colour, rays) {
    ctx.save();
    ctx.strokeStyle = colour;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < rays; i += 1) {
      const a = (i / rays) * Math.PI * 2;
      const len = 26 + ((i * 7) % 14);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
      ctx.stroke();
    }
    ctx.restore();
  }
  paintBurst(280, 80, altered ? '#ff6fb5' : '#ffd166', 12);
  paintBurst(430, 60, '#2ec4b6', 10);
  paintBurst(140, 60, '#c94f6d', 9);

  // Festival banner strung between two poles; its glyph changes.
  ctx.fillStyle = '#5a3d28';
  ctx.fillRect(150, 108, 6, 60);
  ctx.fillRect(408, 108, 6, 60);
  ctx.fillStyle = '#c94f6d';
  rr(ctx, 156, 112, 252, 30, 6);
  ctx.fill();
  ctx.fillStyle = '#f2e3c6';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(altered ? '★ FESTA ★' : '♪ FESTA ♪', 282, 128);

  // Ground and two stalls with striped canopies.
  ctx.fillStyle = '#1a1226';
  ctx.fillRect(0, 250, PANEL_W, 110);
  const stalls = [
    { x: 40, w: 170, canopy: '#e4572e' },
    { x: 330, w: 170, canopy: '#3f8f6b' },
  ];
  for (const stall of stalls) {
    for (let i = 0; i < 6; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? stall.canopy : '#f2e3c6';
      ctx.beginPath();
      ctx.moveTo(stall.x + i * (stall.w / 6), 190);
      ctx.lineTo(stall.x + (i + 1) * (stall.w / 6), 190);
      ctx.lineTo(stall.x + (i + 1) * (stall.w / 6) - 4, 208);
      ctx.lineTo(stall.x + i * (stall.w / 6) + 4, 208);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#31244a';
    ctx.fillRect(stall.x + 8, 208, stall.w - 16, 62);
    ctx.fillStyle = '#5a3d28';
    ctx.fillRect(stall.x, 252, stall.w, 10);
  }

  // Stall lanterns under the right canopy; the altered stall hangs one fewer.
  const lanternCount = altered ? 2 : 3;
  for (let i = 0; i < lanternCount; i += 1) {
    paintLantern(ctx, 360 + i * 44, 228, '#e4572e', '#ff7a4d');
  }

  // Paper crane perched on the left stall counter — gone when altered.
  if (!altered) {
    ctx.fillStyle = '#f2e3c6';
    ctx.beginPath();
    ctx.moveTo(250, 230);
    ctx.lineTo(266, 222);
    ctx.lineTo(262, 236);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(250, 230);
    ctx.lineTo(238, 224);
    ctx.lineTo(244, 238);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(266, 222);
    ctx.lineTo(274, 218);
    ctx.lineTo(268, 226);
    ctx.closePath();
    ctx.fill();
  }

  // Steam curling from the food stall — gone when altered.
  if (!altered) {
    ctx.strokeStyle = '#cfc4de';
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(340 + i * 12, 252);
      ctx.bezierCurveTo(334 + i * 12, 238, 346 + i * 12, 230, 340 + i * 12, 218);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Drum on the ground by the left stall — gone when altered.
  if (!altered) {
    ctx.fillStyle = '#8c2f39';
    ctx.beginPath();
    ctx.ellipse(140, 306, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2e3c6';
    ctx.beginPath();
    ctx.ellipse(140, 298, 26, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a3d28';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(126, 298);
    ctx.lineTo(154, 298);
    ctx.moveTo(140, 288);
    ctx.lineTo(140, 308);
    ctx.stroke();
  }

  // The little dog watching the stalls — gone when altered.
  if (!altered) {
    ctx.fillStyle = '#c98f4e';
    ctx.beginPath();
    ctx.ellipse(480, 326, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(496, 314, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(490, 308);
    ctx.lineTo(492, 300);
    ctx.lineTo(495, 307);
    ctx.moveTo(498, 307);
    ctx.lineTo(501, 300);
    ctx.lineTo(502, 308);
    ctx.fill();
    ctx.fillStyle = '#2a1a12';
    ctx.beginPath();
    ctx.arc(499, 313, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // String lights along the ground line.
  ctx.strokeStyle = '#3a2b3f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 258);
  ctx.quadraticCurveTo(282, 276, PANEL_W, 258);
  ctx.stroke();
  const bulbColours = ['#ffd166', '#ff6fb5', '#2ec4b6'];
  for (let i = 0; i < 12; i += 1) {
    const x = 24 + i * 46;
    const y = 258 + Math.sin((i / 11) * Math.PI) * 10;
    ctx.fillStyle = bulbColours[i % 3];
    ctx.beginPath();
    ctx.arc(x, y + 6, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
