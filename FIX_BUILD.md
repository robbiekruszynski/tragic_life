# Fixing Android Build Errors

## Issue
Gradle build failing with `expo-modules-core` plugin errors related to `expo-screen-orientation`.

## Solution Steps

### 1. Update Dependencies Using Expo Install

Run this command to ensure all Expo packages are compatible with SDK 50:

```bash
npx expo install --fix
```

This will automatically update all Expo packages to versions compatible with your current Expo SDK.

### 2. Clean and Reinstall

```bash
rm -rf node_modules package-lock.json
npm install
```

### 3. Try Building Again

```bash
npx eas-cli build --platform android --profile preview
```

## Alternative: Remove Manual SDK Versions

If the issue persists, the manual SDK version settings in `app.json` have been removed. Expo will handle these automatically.

## If Still Failing

The error suggests a Gradle plugin compatibility issue. You may need to:

1. Check that `expo-screen-orientation` version matches Expo SDK 50
2. Ensure `expo-modules-core` is properly installed (it's a dependency of expo)
3. Try removing `expo-screen-orientation` temporarily to see if the build works without it

