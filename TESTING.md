# Testing the App Locally

## Prerequisites
- Node.js installed (you have v22.4.1 ✓)
- npm installed (you have 10.8.1 ✓)

## Step 1: Install Dependencies

First, install all the required packages:

```bash
npm install
```

## Step 2: Choose Your Testing Method

### Option A: Test on Physical Device (Easiest - Recommended)

1. **Install Expo Go app** on your phone:
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Start the development server**:
   ```bash
   npm start
   ```
   This will open Expo DevTools in your browser.

3. **Connect your phone**:
   - **Android**: Scan the QR code with the Expo Go app, or use the "a" key in the terminal
   - **iOS**: Scan the QR code with your Camera app (iOS 11+), or use the "i" key in the terminal
   
   **Note**: Your phone and computer must be on the same WiFi network.

4. The app will load on your device. Rotate your phone to landscape mode to see the app properly.

### Option B: Test on Android Emulator

1. **Install Android Studio**:
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK and create an Android Virtual Device (AVD)

2. **Start the emulator** from Android Studio

3. **Start Expo with Android**:
   ```bash
   npm run android
   ```
   This will automatically open the app in your emulator.

### Option C: Test on iOS Simulator (macOS only)

1. **Install Xcode** from the App Store

2. **Start the iOS Simulator**:
   ```bash
   open -a Simulator
   ```

3. **Start Expo with iOS**:
   ```bash
   npm run ios
   ```
   This will automatically open the app in the simulator.

### Option D: Test in Web Browser (Limited)

```bash
npm run web
```

**Note**: The app is designed for landscape mobile, so web testing won't give you the full experience. Use this mainly for quick debugging.

## Troubleshooting

### "Cannot connect to Metro bundler"
- Make sure your phone and computer are on the same WiFi network
- Try restarting the development server: `npm start`
- For Android emulator, use `npm run android` instead

### "Module not found" errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### App won't rotate to landscape
- The app is configured to lock to landscape in `App.js`
- Make sure your device's rotation lock is off
- On iOS Simulator: Device → Rotate Left/Right

### Victory Pie Chart not showing
- Victory Native requires native modules. Make sure you're testing on a device/emulator, not just web.

## Quick Start Commands

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm start

# Then press:
#   'a' for Android
#   'i' for iOS  
#   'w' for web
#   Scan QR code for physical device
```

