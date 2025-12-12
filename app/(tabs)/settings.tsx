import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";
import { Button, Alert } from "react-native";
import { useEffect, useState } from "react";
import { styles } from "../../css/styles";
import LoginScreen from "../login";
import PermissionsScreen from "../permissions";
import accountService, { UserAccount } from "../../services/accountService";

// Helper function to get environment variable safely
function getEnvVar(key: string): string | undefined {
  return process.env[key];
}

export default function SettingsScreen() {
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [subscribedReposCount, setSubscribedReposCount] = useState(0);
  const [subscribedPackagesCount, setSubscribedPackagesCount] = useState(0);

  const loadUserData = async () => {
    try {
      const account = await accountService.getUserAccount();
      setUserAccount(account);

      const repos = await accountService.getSubscribedRepos();
      const packages = await accountService.getSubscribedPackages();

      setSubscribedReposCount(repos.length);
      setSubscribedPackagesCount(packages.length);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await accountService.logout();
      setUserAccount(null);
      setSubscribedReposCount(0);
      setSubscribedPackagesCount(0);
      Alert.alert("Logged Out", "You have been successfully logged out.");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const discordClientId = getEnvVar("DISCORD_CLIENT_ID");
  const hasDiscordConfig = Boolean(discordClientId);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#000000ff", dark: "#000000ff" }}
      headerImage={
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>

      {/* Account Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Account</ThemedText>

        {userAccount?.isLoggedIn ? (
          <ThemedView
            style={{
              padding: 16,
              backgroundColor: "rgba(0,122,255,0.1)",
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <ThemedText
              type="defaultSemiBold"
              style={{ fontSize: 18, marginBottom: 8 }}
            >
              {userAccount.username}
            </ThemedText>

            {userAccount.email && (
              <ThemedText style={{ marginBottom: 8, opacity: 0.8 }}>
                {userAccount.email}
              </ThemedText>
            )}

            <ThemedText style={{ marginBottom: 8 }}>
              Login Method:{" "}
              {userAccount.loginMethod === "discord" ? "Discord" : "Guest"}
            </ThemedText>

            <ThemedView
              style={{ flexDirection: "row", gap: 16, marginBottom: 12 }}
            >
              <ThemedText>📚 {subscribedReposCount} Repos</ThemedText>
              <ThemedText>📦 {subscribedPackagesCount} Packages</ThemedText>
            </ThemedView>

            <Button title="Log Out" onPress={handleLogout} color="#dc3545" />
          </ThemedView>
        ) : (
          <LoginScreen />
        )}
      </ThemedView>

      {/* Subscriptions Section */}
      {userAccount?.isLoggedIn && (
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">My Subscriptions</ThemedText>

          <ThemedView
            style={{
              padding: 16,
              backgroundColor: "rgba(0,0,0,0.05)",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
              Repositories ({subscribedReposCount})
            </ThemedText>
            {subscribedReposCount === 0 ? (
              <ThemedText style={{ opacity: 0.7, fontStyle: "italic" }}>
                No subscribed repositories yet. Browse the Explore tab to find
                repos to follow!
              </ThemedText>
            ) : (
              <ThemedText>
                You are following {subscribedReposCount} repositories. Check the
                Explore tab to manage your subscriptions.
              </ThemedText>
            )}
          </ThemedView>

          <ThemedView
            style={{
              padding: 16,
              backgroundColor: "rgba(0,0,0,0.05)",
              borderRadius: 8,
            }}
          >
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
              NPM Packages ({subscribedPackagesCount})
            </ThemedText>
            {subscribedPackagesCount === 0 ? (
              <ThemedText style={{ opacity: 0.7, fontStyle: "italic" }}>
                No subscribed packages yet. Check the Discover tab for trending
                npm packages!
              </ThemedText>
            ) : (
              <ThemedText>
                You are following {subscribedPackagesCount} npm packages. Check
                the Discover tab to manage your package subscriptions.
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      )}

      {/* Permissions Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Permissions</ThemedText>
        <PermissionsScreen />
      </ThemedView>

      {/* Preferences Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Preferences</ThemedText>

        <ThemedView
          style={{
            padding: 16,
            backgroundColor: "rgba(0,0,0,0.05)",
            borderRadius: 8,
          }}
        >
          <ThemedText style={{ marginBottom: 12 }}>
            🔔 Notifications:{" "}
            {userAccount?.preferences?.notifications?.repoUpdates
              ? "Enabled"
              : "Disabled"}
          </ThemedText>

          <ThemedText style={{ marginBottom: 12 }}>
            ⭐ Default Sort: {userAccount?.preferences?.defaultSort || "Stars"}
          </ThemedText>

          <ThemedText>
            🎨 Theme: {userAccount?.preferences?.theme || "System"}
          </ThemedText>

          <ThemedText style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            More preferences coming soon!
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* About Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">About</ThemedText>
        <ExternalLink
          href="https://involvex.github.io/Involvex/"
          style={{
            color: "white",
            borderStyle: "solid",
            borderColor: "green",
            borderRadius: 8,
            borderWidth: 1,
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginTop: 10,
          }}
        >
          <IconSymbol
            name="info"
            style={{ color: "#007AFF" }}
            color="#007AFF"
          />{" "}
          Github Portfolio
        </ExternalLink>

        <ThemedView style={{ marginTop: 16 }}>
          <ThemedText
            style={{ fontSize: 12, opacity: 0.7, textAlign: "center" }}
          >
            InvolveX v1.0.0
          </ThemedText>
          <ThemedText
            style={{ fontSize: 12, opacity: 0.7, textAlign: "center" }}
          >
            Built with ❤️ for developers
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}
