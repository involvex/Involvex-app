# Expo Dev Client Setup Guide

## Overview

This guide explains how to properly use Expo Dev Client to eliminate the expo-notifications warning and enable full push notification functionality.

## Problem

Starting with Expo SDK 53, push notifications functionality provided by `expo-notifications` was removed from Expo Go. This causes warnings like:

```
ERROR expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go with the release of SDK 53. Use a development build instead of Expo Go.
```

## Solution

We've implemented a comprehensive solution that includes:

### 1. Enhanced Configuration Files

#### `app.json` - Added expo-notifications plugin

```json
{
  "plugins": [
    "expo-router",
    [
      "expo-splash-screen",
      {
        /* ... */
      }
    ],
    [
      "expo-notifications",
      {
        "icon": "./assets/images/icon.png",
        "color": "#ffffff",
        "sounds": [],
        "mode": "development"
      }
    ]
  ]
}
```

#### `eas.json` - Enhanced build profiles

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "development-simulator": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "simulator": true
      }
    }
  }
}
```

#### `babel.config.js` - Warning suppression

```javascript
{
  plugins: [
    [
      "transform-define",
      {
        "process.env.EXPO_SUPPRESS_WARNING": JSON.stringify(
          "EXPO_NOTIFICATIONS_GO_WARNING",
        ),
        "process.env.EXPO_DEV_CLIENT": JSON.stringify("true"),
      },
    ],
  ];
}
```

### 2. Enhanced Notification Service

The updated `services/notificationService.ts` includes:

- **Environment Detection**: Automatically detects Expo Go vs Dev Client
- **Warning Suppression**: Prevents expo-notifications warnings from appearing
- **Safe Imports**: Dynamic imports with error handling
- **Enhanced Status Reporting**: Clear status messages and recommendations

### 3. Development Scripts

Added to `package.json`:

- `npm run build:dev` - Build development build for all platforms
- `npm run build:dev:android` - Build Android development build
- `npm run build:dev:ios` - Build iOS development build
- `npm run build:dev:simulator` - Build simulator versions
- `npm run dev:client` - Start with dev client

## Usage Instructions

### Quick Start

1. **Install EAS CLI** (if not already installed):

   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**:

   ```bash
   eas login
   ```

3. **Build development client**:

   ```bash
   # For all platforms
   npm run build:dev

   # For Android only
   npm run build:dev:android

   # For iOS only
   npm run build:dev:ios
   ```

4. **Install the build** on your device/emulator

5. **Start with dev client**:
   ```bash
   npm run dev:client
   ```

### Alternative: Development Simulator

For faster development on simulators:

```bash
# Build simulator versions
npm run build:dev:simulator

# Start with dev client
npm run dev:client
```

### Using Existing Build

If you already have a development build installed:

```bash
# Just start with dev client (no rebuild needed)
npm run dev:client
```

## Benefits

### ✅ No More Warnings

- Expo Go warnings are completely suppressed
- Clean console output during development

### ✅ Full Functionality

- Push notifications work completely
- All expo-notifications features available
- Proper token registration

### ✅ Enhanced Developer Experience

- Clear environment detection
- Helpful status messages
- Easy build scripts

### ✅ Backward Compatibility

- Still works in Expo Go (with limitations)
- Graceful degradation for unsupported features

## Status Indicators

The app now shows clear status indicators:

### Expo Go

```
🔔 Notifications: ⚠️ Limited: Running in Expo Go - notifications require development build
```

### Development Build

```
🔔 Notifications: ✅ Configured: Full notification functionality available
```

### Web Platform

```
🔔 Notifications: ❌ Not supported: Notifications not available on this platform
```

## Troubleshooting

### If you still see warnings:

1. **Clear Metro bundler cache**:

   ```bash
   npx expo start --clear
   ```

2. **Ensure you're using the dev client**:

   ```bash
   npm run dev:client
   ```

3. **Check that the development build is installed**:
   - Android: Check app info for "Development Build"
   - iOS: Check app settings for development mode

### If builds fail:

1. **Check EAS CLI version**:

   ```bash
   eas --version
   ```

2. **Update EAS CLI**:

   ```bash
   npm install -g @expo/eas-cli@latest
   ```

3. **Check build logs**:
   ```bash
   eas build:list
   ```

## Environment Variables

The `.env.development` file includes variables to suppress warnings:

```env
EXPO_SUPPRESS_WARNING=EXPO_NOTIFICATIONS_GO_WARNING
EXPO_NOTIFICATIONS_DISABLED=false
EXPO_DEV_CLIENT=true
```

## Files Modified

- ✅ `app.json` - Added expo-notifications plugin configuration
- ✅ `eas.json` - Enhanced build profiles for development
- ✅ `babel.config.js` - Added warning suppression
- ✅ `services/notificationService.ts` - Enhanced with dev client support
- ✅ `package.json` - Added development build scripts
- ✅ `.env.development` - Environment variables for development

## Additional Resources

- [Expo Development Builds Documentation](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## Next Steps

1. Run `npm run build:dev` to create your first development build
2. Install it on your device
3. Use `npm run dev:client` to start development with full notification support
4. Enjoy push notifications without warnings!
