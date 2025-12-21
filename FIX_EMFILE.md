# Fixing "EMFILE: too many open files" Error

This error occurs on macOS when the system runs out of file watchers. Here are solutions:

## Solution 1: Install Watchman (Recommended)

Watchman is a file watching service that handles this much better:

```bash
# Install Watchman using Homebrew
brew install watchman

# If already installed, reinstall it
brew reinstall watchman

# Clear Watchman's watch list
watchman watch-del-all
watchman shutdown-server
```

After installing Watchman, restart your Expo server:
```bash
npm start
```

## Solution 2: Increase File Descriptor Limit

### Temporary (current terminal session only):
```bash
ulimit -n 8192
npm start
```

### Permanent (requires restart):
```bash
# Check current limit
ulimit -n

# Create/edit launchd config
sudo nano /etc/launchd.conf
```

Add this line:
```
limit maxfiles 65536 200000
```

Save and restart your Mac.

## Solution 3: Clear Metro Cache

```bash
# Clear Metro cache
rm -rf $TMPDIR/metro-*
npx expo start --clear
```

## Solution 4: Clean Reinstall

If nothing else works:
```bash
# Remove node_modules and lock files
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Start with cleared cache
npx expo start --clear
```

## Quick Fix (Try This First)

Run these commands in order:
```bash
# 1. Install Watchman
brew install watchman

# 2. Clear Watchman
watchman watch-del-all

# 3. Increase limit for this session
ulimit -n 8192

# 4. Clear Metro cache and start
rm -rf $TMPDIR/metro-*
npx expo start --clear
```

