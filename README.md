# Tragic Life - MTG Commander Life Counter

A mobile life counter app for Magic: The Gathering Commander format, built with React Native and Expo.

## Features

- **Menu Screen**: Select number of players (2-6)
- **Life Counter**: Starting life of 40, adjustable up/down
- **Commander Damage**: Toggle to show/hide commander damage (starts at 21)
- **Sync Mode**: Toggle to change both main life and commander damage simultaneously
- **Player Customization**: Edit player names and select colors (White, Blue, Red, Black, Green, Grey)
- **Landscape Orientation**: Optimized for landscape mode
- **Full Screen**: Full screen rendering on mobile devices
- **End Game Summary**: Pie charts showing total damage taken from main life and commander damage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on Android:
```bash
npm run android
```

4. Run on iOS:
```bash
npm run ios
```

## Building for Production

### Android

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
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

1. Follow the same steps as Android, then:
```bash
eas build --platform ios
```

## Project Structure

- `App.js` - Main app component with navigation
- `screens/MenuScreen.js` - Menu screen for player selection
- `screens/GameScreen.js` - Main game screen with life counters
- `screens/EndGameScreen.js` - End game screen with statistics and pie charts

## Requirements

- Node.js 16+ 
- npm or yarn
- Expo CLI
- For Android: Android Studio and Android SDK
- For iOS: Xcode (macOS only)

