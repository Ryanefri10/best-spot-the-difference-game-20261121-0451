// The three levels: name, painter, seed, and every difference with its panel
// coordinates, hint text and how hard it is to spot (1 obvious … 5 well hidden).
// Coordinates are panel-local (564x360); the same spot is checked on both panels.
import { paintFestivalNight, paintHarbourDusk, paintLanternRow } from './scenes.js';

export const LEVELS = [
  {
    name: 'Lantern Row',
    subtitle: 'A night market street · 5 differences',
    seed: 20261121,
    paint: paintLanternRow,
    time: 150,
    differences: [
      { x: 340, y: 52, label: 'Lantern turned teal', hint: 'Look along the lantern string', hard: 2 },
      { x: 470, y: 268, label: 'The cat slipped away', hint: 'Something sat on the garden wall', hard: 3 },
      { x: 282, y: 150, label: 'The sign changed its mark', hint: 'Read the middle shop sign', hard: 3 },
      { x: 125, y: 235, label: 'A window went dark', hint: 'Check the lit windows', hard: 2 },
      { x: 528, y: 112, label: 'One flag too many', hint: 'Count the bunting flags', hard: 4 },
    ],
  },
  {
    name: 'Harbour Dusk',
    subtitle: 'Boats, a lighthouse and gulls · 7 differences',
    seed: 20261122,
    paint: paintHarbourDusk,
    time: 150,
    differences: [
      { x: 170, y: 86, label: 'The lighthouse beam went out', hint: 'Follow the light from the tower', hard: 2 },
      { x: 300, y: 70, label: 'A gull flew off', hint: 'Count the birds in the sky', hard: 4 },
      { x: 352, y: 204, label: 'The boat flag changed colour', hint: 'Look at the mast tops', hard: 3 },
      { x: 482, y: 273, label: 'A crate went missing', hint: 'Check the stack on the dock', hard: 3 },
      { x: 200, y: 294, label: 'The anchor is gone', hint: 'Something leaned on the dock', hard: 3 },
      { x: 322, y: 248, label: 'A cabin window went dark', hint: 'Look into the boat cabin', hard: 4 },
      { x: 520, y: 290, label: 'The buoy changed colour', hint: 'Something bobs by the right edge', hard: 2 },
    ],
  },
  {
    name: 'Festival Night',
    subtitle: 'Fireworks, stalls and a kite · 9 differences',
    seed: 20261123,
    paint: paintFestivalNight,
    time: 180,
    differences: [
      { x: 280, y: 80, label: 'The firework burst changed colour', hint: 'The biggest burst in the sky', hard: 2 },
      { x: 140, y: 300, label: 'The drum disappeared', hint: 'Something stood by the left stall', hard: 3 },
      { x: 448, y: 228, label: 'A stall lantern is missing', hint: 'Count the lanterns under the green canopy', hard: 4 },
      { x: 500, y: 50, label: 'A star went out', hint: 'Look high on the right', hard: 5 },
      { x: 282, y: 120, label: 'The banner changed its mark', hint: 'Read the festival banner', hard: 3 },
      { x: 90, y: 90, label: 'The kite flew away', hint: 'Something drifted in the top-left sky', hard: 4 },
      { x: 350, y: 250, label: 'The steam stopped rising', hint: 'The food stall should smell of cooking', hard: 4 },
      { x: 480, y: 320, label: 'The little dog ran off', hint: 'Someone watched the stalls', hard: 4 },
      { x: 250, y: 230, label: 'The paper crane flew off', hint: 'Something perched on the left counter', hard: 5 },
    ],
  },
];
