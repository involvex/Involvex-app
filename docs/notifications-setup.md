# Notifications Setup Guide

## Overview

This guide explains how notifications are configured in the InvolveX app and how to handle the Expo Go limitation for push notifications with SDK 53.

## Expo Go Limitation

Starting with Expo SDK 53, push notifications functionality provided by `expo-notifications` was removed from Expo Go. This means that applications using push notifications will show warnings when running in Expo Go and may not function properly.

### Error Message

```
ERROR expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed from Expo Go with the release of SDK 53. Use a development build instead of Expo Go.
WARN `expo-notifications` functionality is not fully supported in Expo Go
```

## Complete Solution

### 1. Use Development Build

Instead of using Expo Go, create a development build:

```bash
# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

### 2. Comprehensive Configuration

The app now includes multiple layers of protection:

#### A. Notification Service (`services/notificationService.ts`)

- **Environment Detection**: Automatically detects Expo Go vs Development Build
- **Safe Configuration**: Only configures notifications in supported environments
- **Error Handling**: Graceful fallbacks for unsupported platforms
- **Status Reporting**: Real-time notification capability status

#### B. Updated Settings Screen

- **Visual Warnings**: Clear orange warning box about Expo Go limitations
- **Status Display**: Real-time notification status with emoji indicators
- **Documentation Links**: Direct links to Expo development build docs
- **User Guidance**: Clear explanation of what users should do

#### C. Safe Import System

- **Conditional Loading**: Only imports expo-notifications when safe to do so
- **Error Prevention**: Prevents the module-level warnings from appearing
- **Dynamic Imports**: Uses async imports to avoid early module loading

## Key Functions

### `getNotificationStatus()`

Returns comprehensive status:

```typescript
{
  isSupported: boolean;        // Full notification support available
  isExpoGo: boolean;           // Running in Expo Go
  isConfigured: boolean;       // Successfully configured
  canRegisterTokens: boolean;  // Can register for push tokens
  message: string;             // Status description
  recommendation?: string;     // What user should do
}
```

### `configureNotifications()`

Safely configures notifications only in supported environments:

- Skips configuration in Expo Go
- Only imports expo-notifications when safe
- Provides clear success/failure status

### `getNotificationStatusMessage()`

Returns user-friendly status messages:

- "⚠️ Limited: Running in Expo Go - notifications require development build"
- "✅ Configured: Full notification functionality available"
- "❌ Not supported: Notifications not available on this platform"

## Usage Example

```typescript
import { getNotificationStatus, configureNotifications } from '@/services/notificationService';

function MyComponent() {
  const [status, setStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkStatus = async () => {
      const notificationStatus = await getNotificationStatus();
      setStatus(getNotificationStatusMessage(notificationStatus));
    };

    checkStatus();
  }, []);

  return (
    <View>
      <Text>Notifications: {status}</Text>
    </View>
  );
}
```

## Implementation Architecture

### 1. Settings Screen Integration

- Real-time notification status checking
- Visual indicators for different states
- Clear warnings and guidance

### 2. Safe Service Layer

- Environment detection at runtime
- Conditional expo-notifications import
- Graceful degradation for all unsupported environments

### 3. Babel Configuration

- Custom babel config for environment-specific processing
- Transform plugins for conditional compilation

## Benefits

1. **Zero Warnings**: The expo-notifications warning no longer appears
2. **Clear User Communication**: Users understand exactly what's happening
3. **Graceful Degradation**: App works perfectly in Expo Go, excellently in dev builds
4. **Developer Experience**: Clear guidance on how to enable full functionality
5. **Error Prevention**: No crashes or unexpected behavior

## Status Display

### Expo Go

- 🔔 Notifications: ⚠️ Limited: Running in Expo Go - notifications require development build
- Orange warning box with explanation
- Link to development build documentation

### Development Build

- 🔔 Notifications: ✅ Configured: Full notification functionality available
- No warnings or limitations
- Complete notification feature set

### Web Platform

- 🔔 Notifications: ❌ Not supported: Notifications not available on this platform
- Clear indication that web doesn't support push notifications

## Testing Strategy

### Expo Go Testing

1. App loads without notification warnings
2. Settings screen shows clear limitation warning
3. All other app functionality works normally
4. User gets clear guidance on using development builds

### Development Build Testing

1. No warnings or errors
2. Full notification functionality available
3. Settings shows "Configured" status
4. Push token registration works

## Additional Resources

- [Expo Development Builds Documentation](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Go Limitations](https://docs.expo.dev/develop/development-builds/introduction/#limitations)

## Files Modified/Created

- ✅ `app/(tabs)/settings.tsx` - Updated with notification status display
- ✅ `services/notificationService.ts` - New comprehensive notification service
- ✅ `utils/notificationConfig.ts` - Utility functions for safe notification handling
- ✅ `babel.config.js` - Babel configuration for environment-specific processing
- ✅ `docs/notifications-setup.md` - This comprehensive documentation
