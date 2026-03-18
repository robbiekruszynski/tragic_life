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

## Screenshots


## Testing without building

You can try the app without doing a full native build in two ways:

### Option 1: Expo Go on your phone (recommended)

Runs the real app on your device with no build step.

1. Install **Expo Go** on your phone: [iOS App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. On your computer, from the project folder:
   ```bash
   npm install
   npm start
   ```
3. When the dev server starts, a **QR code** appears in the terminal (and often in the browser).
4. **Android**: Open Expo Go and tap “Scan QR code,” then scan the code.  
   **iOS**: Open the Camera app, point it at the QR code, and tap the banner to open in Expo Go.
5. The app loads on your phone. Keep the computer and phone on the same Wi‑Fi network.

Best for: testing on a real device with touch, orientation, and haptics as intended.

### Option 2: Run in the browser (web)

No app install; runs in Chrome or another browser.

1. From the project folder:
   ```bash
   npm install
   npm run web
   ```
2. When the bundler is ready, open the URL it prints (e.g. `http://localhost:8081`) in your browser.

Note: On web, orientation lock and haptics don’t apply; the layout may differ from the native app. Use this for quick UI checks. For full behavior (landscape, haptics, etc.), use Expo Go or a simulator.

---

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
