# best-spot-the-difference-game-20261121-0451

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Ryanefri10/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Ryanefri10/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Lantern Row — Spot the Difference**: a spot-the-difference game with 3 scenes and 21 differences — Lantern Row (5), Harbour Dusk (7), Festival Night (9). Procedural canvas art, no network, stdlib only.

## Entry

- `main.ts` — Node 22, standard library only. It copies `game/` and `screenshots/` to `$MAKEFUN_OUTPUT_DIR` (default `/output`) and writes `/output/dossier.json`, the summary the judge reads.
- `game/` — plain static files a desktop browser loads offline (`game/index.html` and its ES modules, no library, no network request).
- `screenshots/` — the 3–4 screenshots the gate requires.
- `serve.ts` — serve it locally with `node serve.ts`, then open http://localhost:8080.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=v0wjehd6&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
