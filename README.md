# Neon Siege TD: Tower Defense Mini Game

A small incremental tower defense game set on a Formula 1-style circuit. It floats on top of whatever you're working on, including apps in full screen, and you can drag it anywhere and resize it. It plays silently, with no sound or music.

![screenshot](docs/screenshot.png)

## Download

Go to [**Releases**](https://github.com/Arnav-Reddy/tower-defense-mini-game-/releases/latest) and download the file for your system:

| System | File | First launch |
| --- | --- | --- |
| Windows | `Neon Siege TD Setup x.y.z.exe` (installer) or `Neon Siege TD x.y.z.exe` (portable) | If SmartScreen appears, click **More info → Run anyway**. The app isn't code-signed. |
| macOS (Apple Silicon or Intel) | `Neon Siege TD-x.y.z-arm64.dmg` or `…-x64.dmg` | Drag the app to Applications. The first time, right-click it and choose **Open** (or go to **System Settings → Privacy & Security → Open Anyway**). The app isn't notarized. |
| Linux | `Neon Siege TD-x.y.z.AppImage` | `chmod +x` the file, then run it. |

## Using the overlay

- The game opens as a borderless widget in the bottom-right corner. There's no taskbar or Dock entry.
- **Move it:** drag the stat bar (or the ⋮⋮ grip) to put it anywhere. It snaps to the nearest screen corner, and minimizing or resizing keeps that corner fixed.
- **Resize it:** drag the corner grip (opposite the corner it's anchored to) to scale it from 60% to 250%. Double-click the grip to reset to 100%. Size and position are remembered.
- **Show or hide:** press `Ctrl+Shift+T` (`Cmd+Shift+T` on macOS) from any app, or click the tray / menu-bar icon.
- **Quit:** right-click the tray icon and choose **Quit**.
- **Shrink:** the `⌄` button shrinks the widget to a small pill. The window shrinks with it, so it covers nothing else.

It floats over full-screen browsers, videos and apps that use borderless or windowed full screen. On macOS it appears in full-screen Spaces too. Games running in *exclusive* full-screen mode take over the display, so no normal window can draw on top of them. Switch those games to **borderless / windowed full screen** to see the overlay.

## Play in a browser instead

Open `index.html` in any modern browser. The whole game is that one file.

## Controls

| Action | How |
| --- | --- |
| Pick a tower | Click it in the dock, or press `1`–`9`, `0`, `-` |
| Place a tower | Click an empty tile |
| Inspect, upgrade or sell | Click a placed tower |
| Cancel | Right-click or `Esc` |
| Start the next wave | `▶` or `Space` |
| Speed / Auto-wave | `1x·2x·3x`, `⟲` |
| Prestige | `🏆 Prestige` (a red dot appears when you can prestige) |

## Features

- **Random circuits:** every run gets a new winding 12×7 Grand Prix layout. It has asphalt with a rubbered racing line, red-and-white apex kerbs, gravel traps, pit-pad build slots, a starting grid under a five-light gantry, and a chequered finish line.
- **11 towers:** Bolt, Frost, Flak, **Aether Mint** (economy), Tesla, Venom, Railgun, Prism, Hellfire, Chrono and Singularity.
- **Aether Mint:** makes gold every second plus a payout at the end of each wave. Adjacent Chrono Obelisks speed it up. Its mutations are Compound Interest, Midas Aura, Bounty Harvester and Quantum Overclock.
- **Mutations:** at every 5th level a tower evolves visually and you pick one of 3 traits. Turn on Auto-mutate for idle play, or spend boss Catalysts (◆) to reroll the choices.
- **Race cars:** top-down open-wheelers that bank smoothly through corners, with bigger bounties for bigger cars:
  - **Formula Junior:** small, enters in packs.
  - **Midfield Spec Racer:** the standard car.
  - **Papaya Aero Racer:** DRS speed burst on straights.
  - **Silver-Teal Hybrid:** regenerating ERS shield.
  - **Racing Green GT:** armoured, and shrugs off half of any slow.
  - **Rosso / Midnight Prototypes:** slipstream that tows cars behind them.
  - **Hypercar boss (every 10 waves):** Overdrive surges, shield phases, and big gold, Championship Point and Catalyst drops.
- **Prestige:** click **🏆 Prestige** to see how many **Championship Points** you'd earn: 1 per 10 waves, plus 1 per ×10 gold earned beyond 1k, plus any CP dropped by Hypercar bosses. Once every requirement card is met (reach a wave, beat bosses, mutate a tower, earn gold), prestiging resets your run onto a fresh circuit. Each CP gives +5% tower damage and gold for good. The requirements get harder each time you prestige.
- **Saves:** progress saves to `localStorage`. Saves from the original 10-tower version migrate automatically.

## Build it yourself

```bash
npm install
```

```bash
npm start
```

```bash
npm run dist
```

`npm start` runs the overlay, and `npm run dist` builds an installer for your OS into `dist/`.

**Publish a release:** go to **Actions → Release → Run workflow**. GitHub builds Windows, macOS and Linux and publishes them as release `v<version>`, using the version in `package.json`. Bump that version before publishing the next release.
