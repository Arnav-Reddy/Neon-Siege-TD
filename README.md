# Neon Siege TD: Tower Defense Mini Game

A small incremental tower defense game set on a Formula 1-style circuit. It floats on top of whatever you're working on, including apps in full screen, and you can drag it anywhere and resize it. It plays silently, with no sound or music.

![screenshot](docs/screenshot.png)

## Download

Go to [**Releases**](https://github.com/Arnav-Reddy/tower-defense-mini-game-/releases/latest) and, under **Assets**, download the file for your system. Don't use the "Source code (zip)" links: those contain the project files, not the app.

| System | File | First launch |
| --- | --- | --- |
| Windows | `Neon-Siege-TD-Setup-x.y.z.exe` (installer) or `Neon-Siege-TD-x.y.z.exe` (portable, no install) | If SmartScreen appears, click **More info → Run anyway**. The app isn't code-signed. |
| macOS | `Neon-Siege-TD-x.y.z-arm64.dmg` for Apple Silicon (M1 and newer), `Neon-Siege-TD-x.y.z.dmg` for Intel | Open the `.dmg` and drag the app to Applications. The first time, right-click it and choose **Open** (or go to **System Settings → Privacy & Security → Open Anyway**). The app isn't notarized. |
| Linux | `Neon-Siege-TD-x.y.z.AppImage` | `chmod +x` the file, then run it. |

## Using the overlay

- The game opens as a borderless widget in the bottom-right corner. There's no taskbar or Dock entry.
- **Move it:** drag the stat bar (or the ⋮⋮ grip) to put it anywhere. It snaps to the nearest screen corner, and minimizing or resizing keeps that corner fixed.
- **Resize it:** drag the corner grip (opposite the corner it's anchored to) to scale it from 60% to 250%. Double-click the grip to reset to 100%. Size and position are remembered.
- **Show or hide:** press `Ctrl+Shift+T` (`Cmd+Shift+T` on macOS) from any app, or click the tray / menu-bar icon.
- **Quit:** right-click the tray icon and choose **Quit**.
- **Shrink:** the `⌄` button shrinks the widget to a small pill. The window shrinks with it, so it covers nothing else.

It floats over full-screen browsers, videos and apps that use borderless or windowed full screen. On macOS it appears in full-screen Spaces too. Games running in *exclusive* full-screen mode take over the display, so no normal window can draw on top of them. Switch those games to **borderless / windowed full screen** to see the overlay.

## Play in a browser instead

Play it live at **https://arnav-reddy.github.io/Tower-Defense-Mini-Game-/**, or open `index.html` in any modern browser. The whole game is that one file.

## Updates

The desktop app (v1.0.2 and later) loads the game live from that page. Every update pushed to `main` reaches your installed app the next time you open it, with no new download. You only need to download a new release when the desktop shell itself changes. The app needs an internet connection to start.

## Controls

| Action | How |
| --- | --- |
| Pick a tower | Click it in the dock, or press `1`–`9`, `0`, `-` |
| Place a tower | Click an empty tile |
| Inspect, upgrade or sell | Click a placed tower |
| Cancel | Right-click or `Esc` |
| Start the next wave | `▶` or `Space` |
| Speed / Auto-wave | `1x·2x·3x`, `AUTO` |
| Prestige | `🏆 Prestige` (a red dot appears when you can prestige) |

## Features

- **Random circuits:** every run gets a new winding 12×7 Grand Prix layout. It has asphalt with a rubbered racing line, red-and-white apex kerbs, gravel traps, open grass to build on, a starting grid under a five-light gantry, and a chequered finish line.
- **11 trackside towers**, drawn in 3D: Wheel Gun, Marshal Post, Tyre Launcher, **Sponsor Billboard** (economy), ERS Battery, Fuel Sprayer, Radar Gun, Timing Beam, Fire Mortar, Race Control and Wind Tunnel. Each tier costs about 2.7× the last but hits harder per dollar, and every extra copy of the same tower costs 20% more (Sponsors 40%). Upgrades give +18% damage per level for +32% cost.
- **Sponsor Billboard:** earns gold every second (+25% per level) plus a payout worth 25 seconds of income at the end of each lap. An adjacent Race Control tower speeds it up.
- **Mutations:** every 5 levels a tower mutates. You choose one of **its own three themed mutations** (for example Wheel Gun: Impact Wrench, Twin Guns, Loose Wheel Nut; Marshal Post: Red Flag, Double Yellows, Penalty Points). Picks stack, and every pick also gives ×1.45 damage or income. Auto-mutate spreads picks evenly.
- **Race cars:** top-down open-wheelers that bank smoothly through corners, with bigger bounties for bigger cars:
  - **Formula Junior:** small, enters in packs.
  - **Midfield Spec Racer:** the standard car.
  - **Papaya Aero Racer:** DRS speed burst on straights.
  - **Silver-Teal Hybrid:** regenerating ERS shield.
  - **Racing Green GT:** armoured, and shrugs off half of any slow.
  - **Rosso / Midnight Prototypes:** slipstream that tows cars behind them.
  - **Hypercar boss (every 10 waves):** Overdrive surges, shield phases, and big gold, Championship Point and Catalyst drops.
- **Seasons and prestige:** each season has targets (reach a lap, beat Hypercars, mutate a tower, earn gold) that rise every season. Finish a season for **Championship Points**: 3 base, plus 1 per 5 laps beyond the target, plus CP dropped by Hypercars. A season summary shows what you earned, then you spend CP at **Team HQ** on permanent upgrades: Aero Package (damage), Sponsorship Deal (gold), Pit Crew Training (attack speed), Starting Budget, Reinforced Barriers (lives) and Data Telemetry (cheaper upgrades).
- **Lives:** you start with 10. A car that reaches the finish costs lives by type and remaining health, from 1 for a Spec car up to 10 for a Hypercar.
- **Laps:** each lap starts with a quick five-light sequence. A progress bar shows the cars left, and between laps you see a preview of the next grid.
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

## Credits

The UI font is [Titillium Web](https://fonts.google.com/specimen/Titillium+Web) (SIL Open Font License 1.1). It's embedded in `index.html` so the game works offline.
