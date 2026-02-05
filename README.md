# Tragic Life – MTG Life Counter

A mobile life counter for Magic: The Gathering, built with React Native and Expo. Supports Commander and other constructed formats (Standard, Modern, Pioneer, Legacy, Vintage).

## Features

- **Menu**: Choose 2–4 players and game mode (Commander, Legacy, Modern, Pioneer, Standard, Vintage) via a scrollable wheel.
- **Player Setup**: Enter player names and assign colors (White, Blue, Red, Black, Green, Grey) before starting.
- **Life & damage**:
  - **Commander**: 40 life, 21 commander damage. Tap commander damage to toggle duel mode (adjust life and commander together). Long-press (2s) for commander-only mode (red; adjust only commander damage).
  - **Other formats**: 20 life, no commander damage.
- **Poison counters**: Optional in Settings (gear). When enabled, per-player poison toggle and 0–10 poison counters.
- **Game screen**: +/- life (and commander/poison when applicable), animated gradient cards, haptic feedback on life loss, screen kept awake in landscape.
- **Timer**: Game duration with optional pause/resume in Settings.
- **Tools**: Settings (gear) – Flip coin, Roll dice (D4–D100 with presets and custom sides), Pause/Resume timer, Enable/disable poison counters.
- **End game**: Game duration, pie charts (main life damage; commander damage in Commander mode; poison if enabled), per-player stats, Share summary, Rematch, New Game.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on a device or simulator:
```bash
npm run android
```
or
```bash
npm run ios
```

## Building for Production

### Android

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Log in to Expo:
```bash
eas login
```

3. Configure the build:
```bash
eas build:configure
```

4. Build for Android:
```bash
eas build --platform android
```

### iOS

Use the same EAS steps, then:
```bash
eas build --platform ios
```

## Project Structure

- `App.js` – Root component and stack navigation (Menu → PlayerSetup → Game → EndGame).
- `screens/MenuScreen.js` – Player count and game mode selection.
- `screens/PlayerSetupScreen.js` – Player names and color selection.
- `screens/GameScreen.js` – In-game life, commander/poison, timer, settings, dice/coin.
- `screens/EndGameScreen.js` – Summary, pie charts, share, rematch, new game.

## Requirements

- Node.js 16+
- npm or yarn
- Expo (included via project dependencies)
- For Android: Android Studio and Android SDK
- For iOS: Xcode (macOS only)
