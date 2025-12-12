/**
 * Notification Configuration Utility
 * Handles expo-notifications configuration with Expo Go compatibility
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

export interface NotificationConfig {
  isSupported: boolean;
  isExpoGo: boolean;
  message: string;
  recommendedAction?: string;
}

/**
 * Check if the app is running in Expo Go
 */
function isExpoGo(): boolean {
  return Constants.executionEnvironment === ("expo" as any);
}

/**
 * Check if expo-notifications is fully supported in the current environment
 */
export function getNotificationConfig(): NotificationConfig {
  const isRunningInExpoGo = isExpoGo();

  // If running in Expo Go, notifications are limited
  if (isRunningInExpoGo) {
    return {
      isSupported: false,
      isExpoGo: true,
      message:
        "Push notifications are not fully supported in Expo Go. Use a development build for full functionality.",
      recommendedAction:
        "Create a development build using: npx expo run:android or npx expo run:ios",
    };
  }

  // Check if we're on a platform that supports notifications
  if (Platform.OS === "web") {
    return {
      isSupported: false,
      isExpoGo: false,
      message: "Push notifications are not supported on web platform.",
      recommendedAction:
        "Use a mobile device or emulator for notification testing.",
    };
  }

  // Native platforms with development build should have full support
  return {
    isSupported: true,
    isExpoGo: false,
    message: "Push notifications are fully supported in this environment.",
  };
}

/**
 * Get a user-friendly message about notification support
 */
export function getNotificationSupportMessage(): string {
  const config = getNotificationConfig();

  if (config.isExpoGo) {
    return "⚠️ Limited: Running in Expo Go - notifications require development build";
  }

  if (!config.isSupported) {
    return "❌ Not supported: Notifications not available on this platform";
  }

  return "✅ Supported: Full notification functionality available";
}

/**
 * Check if push token registration should be attempted
 */
export function shouldAttemptPushTokenRegistration(): boolean {
  const config = getNotificationConfig();
  return config.isSupported && !config.isExpoGo;
}

/**
 * Safe import of expo-notifications with error handling
 * Only attempts import if NOT running in Expo Go
 */
export async function safeImportNotifications() {
  try {
    const config = getNotificationConfig();

    // Never import if running in Expo Go or if not supported
    if (config.isExpoGo || !config.isSupported) {
      console.log(`[Notifications] Skipping import - ${config.message}`);
      return null;
    }

    // Use dynamic import to prevent module loading at app startup
    const notifications = await import("expo-notifications");
    return notifications;
  } catch (error) {
    console.error(
      "[Notifications] Failed to import expo-notifications:",
      error,
    );
    return null;
  }
}

/**
 * Configure notifications with proper error handling
 */
export async function configureNotifications() {
  try {
    const config = getNotificationConfig();

    // Don't attempt configuration if in Expo Go
    if (config.isExpoGo) {
      console.log(
        "[Notifications] Skipping configuration - running in Expo Go",
      );
      return {
        success: false,
        message:
          "Notifications not configured - use development build for full functionality",
      };
    }

    const notifications = await safeImportNotifications();

    if (!notifications) {
      return {
        success: false,
        message: "Notifications not available in current environment",
      };
    }

    // Configure notification behavior
    await notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    return {
      success: true,
      message: "Notifications configured successfully",
    };
  } catch (error) {
    console.error("[Notifications] Configuration failed:", error);
    return {
      success: false,
      message: "Failed to configure notifications",
    };
  }
}

/**
 * Check if we should suppress the Expo Go warning
 * This prevents the automatic warning from appearing
 */
export function shouldSuppressExpoGoWarning(): boolean {
  const config = getNotificationConfig();
  return config.isExpoGo;
}
