import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useEffect, useState } from "react";
import { Alert, Button, Platform } from "react-native";

interface PermissionStatus {
  notifications: string;
  camera: string;
  location: string;
}

async function getPermissionsStatus(): Promise<PermissionStatus> {
  try {
    // Check if we're on web - notifications not fully supported
    if (Platform.OS === "web") {
      return {
        notifications: "denied",
        camera: "denied",
        location: "denied",
      };
    }

    // Dynamic import to avoid web issues
    const Notifications = await import("expo-notifications");
    const { status: notificationStatus } = await Notifications.getPermissionsAsync();

    return {
      notifications: notificationStatus === "granted" ? "granted" : "denied",
      camera: "denied", // Camera permission not implemented yet
      location: "denied", // Location permission not implemented yet
    };
  } catch (error) {
    console.error("Error checking permissions:", error);
    return {
      notifications: "denied",
      camera: "denied",
      location: "denied",
    };
  }
}

async function requestNotificationPermission(): Promise<boolean> {
  try {
    // Check if we're on web - notifications not fully supported
    if (Platform.OS === "web") {
      Alert.alert(
        "Not Supported",
        "Push notifications are not supported on web in this demo.",
      );
      return false;
    }

    // Dynamic import to avoid web issues
    const Notifications = await import("expo-notifications");
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

function PermissionItem({
  title,
  description,
  status,
  onRequest,
}: {
  title: string;
  description: string;
  status: string;
  onRequest: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "granted":
        return "#28a745";
      case "denied":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "granted":
        return "✅";
      case "denied":
        return "❌";
      default:
        return "⚠️";
    }
  };

  return (
    <ThemedView
      style={{
        padding: 16,
        marginVertical: 8,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.05)",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
      }}
    >
      <ThemedText
        type="defaultSemiBold"
        style={{ fontSize: 16, marginBottom: 4 }}
      >
        {title}
      </ThemedText>
      <ThemedText style={{ fontSize: 14, marginBottom: 12, opacity: 0.8 }}>
        {description}
      </ThemedText>
      <ThemedView
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <ThemedText
          style={{
            color: getStatusColor(status),
            fontWeight: "bold",
          }}
        >
          {getStatusIcon(status)} Status:{" "}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </ThemedText>
        {status !== "granted" && (
          <Button
            title="Request Permission"
            onPress={onRequest}
            color="#007AFF"
          />
        )}
      </ThemedView>
    </ThemedView>
  );
}

export default function PermissionsScreen() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    notifications: "undetermined",
    camera: "undetermined",
    location: "undetermined",
  });
  const [loading, setLoading] = useState(true);

  const loadPermissions = async () => {
    setLoading(true);
    const status = await getPermissionsStatus();
    setPermissions(status);
    setLoading(false);
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const requestNotification = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      Alert.alert("Success", "Notification permission granted!");
    } else {
      Alert.alert(
        "Denied",
        "Notification permission denied. You can enable it in system settings.",
      );
    }
    await loadPermissions();
  };

  if (loading) {
    return (
      <ThemedView style={{ padding: 20 }}>
        <ThemedText>Loading permissions...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ padding: 16 }}>
      <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
        App Permissions
      </ThemedText>

      <PermissionItem
        title="Push Notifications"
        description="Allow the app to send you notifications about repository updates, trending packages, and account activity."
        status={permissions.notifications}
        onRequest={requestNotification}
      />

      <PermissionItem
        title="Camera Access"
        description="Enable camera access for scanning QR codes and taking photos of repositories."
        status={permissions.camera}
        onRequest={() =>
          Alert.alert(
            "Coming Soon",
            "Camera permission will be available in a future update.",
          )
        }
      />

      <PermissionItem
        title="Location Access"
        description="Use location for discovering repositories and packages based on your region."
        status={permissions.location}
        onRequest={() =>
          Alert.alert(
            "Coming Soon",
            "Location permission will be available in a future update.",
          )
        }
      />

      <ThemedView
        style={{
          marginTop: 20,
          padding: 16,
          backgroundColor: "rgba(0,122,255,0.1)",
          borderRadius: 8,
        }}
      >
        <ThemedText style={{ fontSize: 12, opacity: 0.8 }}>
          💡 Tip: You can change these permissions anytime in your devices
          system settings.
        </ThemedText>
        {Platform.OS === "web" && (
          <ThemedText style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
            📱 Note: Some features are limited on web. For full functionality,
            use the mobile app.
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}
