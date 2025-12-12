import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { login } from "@/css/styles";
import { accountService } from "@/services/accountService";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert, Button, Text, View } from "react-native";

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Discord OAuth configuration
const DISCORD_CLIENT_ID =
  process.env.DISCORD_CLIENT_ID || "1438575785228242994";
const DISCORD_CLIENT_SECRET =
  process.env.DISCORD_CLIENT_SECRET || process.env.DISCORD_CLIENT_SECRET;

const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "http://involvex.myfritz.link:8081/callback";
const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${DISCORD_REDIRECT_URI}&response_type=token&scope=identify%20email`;

interface DiscordUser {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
}

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithDiscord = async () => {
    try {
      setIsLoading(true);

      // Create the OAuth request with manual discovery
      const discovery = {
        authorizationEndpoint: "https://discord.com/api/oauth2/authorize",
        tokenEndpoint: "https://discord.com/api/oauth2/token",
        Proxy: "https://auth.expo.dev/@involvex/involvex",
        userInfoEndpoint: "https://discord.com/api/users/@me",
      };

      // Create the OAuth request
      const request = new AuthSession.AuthRequest({
        clientId: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        scopes: ["identify", "email"],
        redirectUri: DISCORD_REDIRECT_URI,
        responseType: AuthSession.ResponseType.Token,
      });
      console.log("Starting Discord OAuth flow:", request);

      // Make the request
      const result = await request.promptAsync(discovery);

      if (result.type === "success") {
        try {
          // Extract the access token from the URL hash
          const accessToken = result.params.access_token;

          if (!accessToken) {
            throw new Error("No access token received from Discord");
          }

          // Fetch user information from Discord API
          const response = await fetch("https://discord.com/api/users/@me", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              Accept: "application/json",
              "User-Agent": "Chrome/91.0 Desktop",
            },
          });

          if (!response.ok) {
            console.error("Discord API error:", response.status, await response.text());
            throw new Error(`Discord API error: ${response.status}`);
          }

          const discordUserData = await response.json();

          const discordUser: DiscordUser = {
            id: discordUserData.id,
            username: discordUserData.username,
            email: discordUserData.email,
            avatar: discordUserData.avatar
              ? `https://cdn.discordapp.com/avatars/${discordUserData.id}/${discordUserData.avatar}.png`
              : undefined,
          };

          // Login to our app
          await accountService.loginWithDiscord(discordUser);
          console.log("Logged in with Discord:", discordUser);

          Alert.alert(
            "Success!",
            `Welcome, ${discordUser.username}! You've been logged in with Discord.`,
            [{ text: "OK" }],
          );
        } catch (error) {
          console.error("Discord login error:", error);
          Alert.alert(
            "Login Error",
            "Failed to login with Discord. Please check your internet connection and try again.",
          );
        }
      } else {
        // User cancelled or there was an error
        console.log("OAuth cancelled or failed:", result.type);
      }
    } catch (error) {
      console.error("Discord login error:", error);
      Alert.alert(
        "Login Error",
        "Failed to login with Discord. Please check your internet connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async () => {
    try {
      setIsLoading(true);

      // For demo purposes, create a guest account
      const guestAccount = await accountService.updateUserAccount({
        username: "Guest User",
        isLoggedIn: true,
        loginMethod: "anonymous",
      });

      Alert.alert(
        "Welcome!",
        "You're now logged in as a guest. You can browse repositories and packages, but won't be able to save subscriptions.",
        [{ text: "OK" }],
      );
    } catch (error) {
      console.error("Guest login error:", error);
      Alert.alert("Error", "Failed to login as guest. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={login.container}>
      <ThemedText
        type="title"
        style={{ marginBottom: 24, textAlign: "center" }}
      >
        Welcome to InvolveX
      </ThemedText>

      <ThemedText
        style={{ marginBottom: 32, textAlign: "center", opacity: 0.8 }}
      >
        Sign in to save your favorite repositories and packages, get
        personalized recommendations, and sync across devices.
      </ThemedText>

      <View style={{ gap: 16 }}>
        {/* Discord Login Button */}
        <ThemedView
          style={{
            backgroundColor: "#5865F2",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <Button
            title={isLoading ? "Connecting..." : "Continue with Discord"}
            onPress={loginWithDiscord}
            color="#5865F2"
            disabled={isLoading}
          />
        </ThemedView>

        {/* Guest Login Option */}
        <ThemedView
          style={{
            backgroundColor: "rgba(0,0,0,0.05)",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.1)",
          }}
        >
          <Button
            title={isLoading ? "Signing in..." : "Continue as Guest"}
            onPress={loginAsGuest}
            color="#007AFF"
            disabled={isLoading}
          />
          <ThemedText
            style={{
              marginTop: 8,
              fontSize: 12,
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            Browse without an account (limited features)
          </ThemedText>
        </ThemedView>
      </View>

      {/* Features Section */}
      <ThemedView style={{ marginTop: 40 }}>
        <ThemedText
          type="subtitle"
          style={{ marginBottom: 16, textAlign: "center" }}
        >
          Why sign in?
        </ThemedText>

        <ThemedView style={{ gap: 12 }}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 20 }}>❤️</Text>
            <ThemedText>
              Save your favorite repositories and packages
            </ThemedText>
          </ThemedView>

          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <ThemedText>
              Get notified about updates and trending content
            </ThemedText>
          </ThemedView>

          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 20 }}>⭐</Text>
            <ThemedText>
              Personalized recommendations based on your interests
            </ThemedText>
          </ThemedView>

          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 20 }}>☁️</Text>
            <ThemedText>Sync your data across all your devices</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Terms and Privacy */}
      <ThemedText
        style={{
          marginTop: 24,
          fontSize: 11,
          textAlign: "center",
          opacity: 0.6,
          lineHeight: 16,
        }}
      >
        By continuing, you agree to our Terms of Service and Privacy Policy. We
        only access your basic Discord profile information.
      </ThemedText>
    </ThemedView>
  );
}
