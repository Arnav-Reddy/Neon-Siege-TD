# Neon Siege TD: Tower Defense Mini Game

A small incremental tower defense game that floats in the bottom-right corner of your screen. It stays on top of your browser and other apps, including apps in full screen.

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
- **Move it:** drag the stat pills (wave, gold, lives) in the top bar.
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
| Speed / Auto-wave / Sound | `1x·2x·3x`, `⟲`, speaker |
| Prestige / Reroll map | `★` (glows gold when you can ascend) |

## Features

- **Random maps:** every run gets a new winding 12×7 path, built from a saved seed, from the spawn portal to the core.
- **11 towers:** Bolt, Frost, Flak, **Aether Mint** (economy), Tesla, Venom, Railgun, Prism, Hellfire, Chrono and Singularity.
- **Aether Mint:** makes gold every second plus a payout at the end of each wave. Adjacent Chrono Obelisks speed it up. Its mutations are Compound Interest, Midas Aura, Bounty Harvester and Quantum Overclock.
- **Mutations:** at every 5th level a tower evolves visually and you pick one of 3 traits. Turn on Auto-mutate for idle play, or spend boss Catalysts (◆) to reroll the choices.
- **Enemies:** Runners, Brutes, Swarms, Shielded, and a Boss every 10 waves.
- **Prestige:** click the ★ button to see your requirements. You must reach a wave, slay bosses, mutate a tower and earn gold, and each target gets harder as you collect stars. Once every card turns green, **Ascend** to earn 1 ★ for every 10 waves cleared. Each ★ gives +10% damage and gold for good. **Reroll map** starts a fresh run without stars.
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
