# Neon Siege TD: Tower Defense Mini Game

A small incremental tower defense game that sits in the bottom-right corner of your screen like a desktop widget. The whole game is one file, `index.html`, with HTML, CSS, JavaScript and Web Audio sound effects inside. It has no dependencies.

![screenshot](docs/screenshot.png)

## Play

Open `index.html` in any modern browser. Your progress saves to `localStorage` automatically.

## Controls

| Action | How |
| --- | --- |
| Pick a tower | Click it in the hotbar, or press `1`–`9`, `0` |
| Place a tower | Click an empty tile |
| Inspect, upgrade or sell | Click a placed tower |
| Cancel | Right-click or `Esc` |
| Start the next wave | `▶` or `Space` |
| Speed / Auto-wave / Sound | `1x·2x·3x`, `AUTO`, `♪` |
| New Map / Prestige | `⟳` (click twice to confirm) |
| Minimize to a status bar | `–` |

## Features

- **Random maps:** every run gets a new winding 12×7 path, built from a saved seed, from the spawn portal to the core.
- **10 towers:** Bolt ($25), Frost ($75), Flak ($200), Tesla ($550), Venom ($1.4k), Railgun ($3.5k), Prism ($9k), Hellfire ($22k), Chrono ($55k) and Singularity ($150k).
- **Mutations:** at every 5th level a tower mutates. It gains orbit rings, extra barrels, a pulsing aura and a tier badge. You also pick one of 3 traits: Split, Execute, Gold Siphon, Overclock, Shockwave Crit or Range. Every trait also gives ×1.5 damage. Turn on Auto-mutate for idle play, or spend boss Catalysts (◆) to reroll the choices.
- **Enemies:** Runners, Brutes (armored), Swarms, Shielded (shields that regenerate), and a Boss every 10 waves. Bosses drop bonus gold and Catalysts.
- **Prestige:** start a new map to earn 1 ★ for every 10 waves you reached. Each ★ gives +10% damage and gold for good.
