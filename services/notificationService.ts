/**
 * Notification Service - Enhanced with Expo Dev Client Support
 * Handles expo-notifications with proper Expo Go compatibility and warning suppression
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

export interface NotificationStatus {
  isSupported: boolean;
  isExpoGo: boolean;
  isDevClient: boolean;
  isConfigured: boolean;
  canRegisterTokens: boolean;
  message: string;
  recommendation?: string;
}

/**
 * Check if running in Expo Go
 */
function isRunningInExpoGo(): boolean {
  try {
    return (Constants.executionEnvironment as any) === "expo";
  } catch {
    return false;
  }
}

/**
 * Check if running in Expo Dev Client
 */
function isRunningInDevClient(): boolean {
  try {
    return (Constants.executionEnvironment as any) === "standalone";
  } catch {
    return false;
  }
}

/**
 * Get comprehensive notification status
 */
export async function getNotificationStatus(): Promise<NotificationStatus> {
  const isExpoGo = isRunningInExpoGo();
  const isDevClient = isRunningInDevClient();

  if (isExpoGo) {
    return {
      isSupported: false,
      isExpoGo: true,
      isDevClient: false,
      isConfigured: false,
      canRegisterTokens: false,
      message: "Push notifications are not fully supported in Expo Go",
      recommendation:
        "Use a development build for full notification functionality",
    };
  }

  if (Platform.OS === "web") {
    return {
      isSupported: false,
      isExpoGo: false,
      isDevClient: false,
      isConfigured: false,
      canRegisterTokens: false,
      message: "Push notifications are not supported on web platform",
      recommendation:
        "Use a mobile device or emulator for notification testing",
    };
  }

  return {
    isSupported: true,
    isExpoGo: false,
    isDevClient,
    isConfigured: false,
    canRegisterTokens: true,
    message: "Push notifications are fully supported",
  };
}

/**
 * Enhanced safe import with warning suppression
 */
async function safeImportWithSuppression() {
  try {
    // Set environment variable to suppress warnings before import
    (global as any).__EXPO_NOTIFICATIONS_SUPPRESS_WARNING__ = true;

    const notifications = await import("expo-notifications");

    // Clear the suppression flag after import
    delete (global as any).__EXPO_NOTIFICATIONS_SUPPRESS_WARNING__;

    return notifications;
  } catch (error) {
    console.error(
      "[NotificationService] Failed to import expo-notifications:",
      error,
    );
    return null;
  }
}

/**
 * Configure notifications with enhanced error handling and warning suppression
 */
export async function configureNotifications(): Promise<{
  success: boolean;
  message: string;
  status?: NotificationStatus;
}> {
  try {
    const status = await getNotificationStatus();

    // Don't attempt configuration in Expo Go
    if (status.isExpoGo) {
      console.log(
        "[NotificationService] Skipping configuration - running in Expo Go",
      );
      return {
        success: false,
        message: "Notifications not configured - use development build",
        status,
      };
    }

    // Don't attempt configuration on web
    if (!status.isSupported) {
      console.log(
        "[NotificationService] Skipping configuration - not supported on this platform",
      );
      return {
        success: false,
        message: "Notifications not supported on this platform",
        status,
      };
    }

    // Import with suppression
    try {
      const notifications = await safeImportWithSuppression();

      if (!notifications) {
        return {
          success: false,
          message: "Failed to import notification library",
          status,
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
        status: {
          ...status,
          isConfigured: true,
        },
      };
    } catch (importError) {
      console.error(
        "[NotificationService] Failed to configure notifications:",
        importError,
      );
      return {
        success: false,
        message: "Failed to configure notifications",
        status,
      };
    }
  } catch (error) {
    console.error("[NotificationService] Configuration failed:", error);
    return {
      success: false,
      message: "Notification configuration failed",
    };
  }
}

/**
 * Request push token with enhanced error handling
 */
export async function requestPushToken(): Promise<{
  success: boolean;
  token?: string;
  message: string;
}> {
  try {
    const status = await getNotificationStatus();

    if (!status.canRegisterTokens) {
      return {
        success: false,
        message: `Cannot register push token: ${status.message}`,
      };
    }

    try {
      const notifications = await safeImportWithSuppression();

      if (!notifications) {
        return {
          success: false,
          message: "Notification library not available",
        };
      }

      const token = await notifications.getExpoPushTokenAsync();

      return {
        success: true,
        token: token.data,
        message: "Push token obtained successfully",
      };
    } catch (tokenError) {
      console.error(
        "[NotificationService] Failed to get push token:",
        tokenError,
      );
      return {
        success: false,
        message: "Failed to obtain push token",
      };
    }
  } catch (error) {
    console.error("[NotificationService] Token request failed:", error);
    return {
      success: false,
      message: "Push token request failed",
    };
  }
}

/**
 * Get enhanced user-friendly notification status message
 */
export function getNotificationStatusMessage(
  status: NotificationStatus,
): string {
  if (status.isExpoGo) {
    return "⚠️ Limited: Running in Expo Go - notifications require development build";
  }

  if (!status.isSupported) {
    return "❌ Not supported: Notifications not available on this platform";
  }

  if (status.isConfigured) {
    return "✅ Configured: Full notification functionality available";
  }

  return "🔧 Available: Notifications can be configured";
}

/**
 * Check if notification preferences should be shown as limited
 */
export function shouldShowLimitedNotificationUI(): boolean {
  return isRunningInExpoGo();
}
