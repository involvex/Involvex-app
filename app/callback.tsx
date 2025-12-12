import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { accountService } from "@/services/accountService";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";

interface DiscordUser {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
}

export default function CallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      console.log("Callback screen - processing OAuth response...");
      console.log("URL params:", params);

      // Extract access token from URL parameters or hash
      let accessToken = "";

      // Check for token in URL hash (most common for OAuth)
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        accessToken = hashParams.get("access_token") || "";
        console.log("Found access token in hash:", !!accessToken);
      }

      // Check for token in query params (fallback)
      if (!accessToken && params.access_token) {
        accessToken = params.access_token as string;
        console.log("Found access token in params:", !!accessToken);
      }

      // Check for token in URL search params
      if (!accessToken && typeof window !== "undefined" && window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        accessToken = searchParams.get("access_token") || "";
        console.log("Found access token in search:", !!accessToken);
      }

      console.log("OAuth Callback - Access token found:", !!accessToken);

      if (!accessToken) {
        throw new Error("No access token found in callback URL");
      }

      setStatus("Fetching user information...");

      // Fetch user information from Discord API
      const response = await fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "InvolveX/1.0.0",
        },
      });

      if (!response.ok) {
        console.error(
          "Discord API error:",
          response.status,
          await response.text(),
        );
        throw new Error(`Discord API error: ${response.status}`);
      }

      const discordUserData = await response.json();
      console.log("Discord user data:", discordUserData);

      const discordUser: DiscordUser = {
        id: discordUserData.id,
        username: discordUserData.username,
        email: discordUserData.email,
        avatar: discordUserData.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUserData.id}/${discordUserData.avatar}.png`
          : undefined,
      };

      setStatus("Saving account information...");

      // Login to our app
      await accountService.loginWithDiscord(discordUser);

      console.log("Successfully logged in with Discord:", discordUser);

      setStatus("Login successful! Redirecting...");
      
      // Show success message and redirect
      Alert.alert(
        "Success!",
        `Welcome, ${discordUser.username}! You've been logged in with Discord.`,
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace("/(tabs)/settings");
            },
          },
        ],
      );

      // Auto redirect after a short delay if user doesn't click
      setTimeout(() => {
        router.replace("/(tabs)/settings");
      }, 3000);

    } catch (error) {
      console.error("Discord OAuth callback error:", error);
      setStatus("Authentication failed");
      
      Alert.alert(
        "Login Error",
        "Failed to complete Discord authentication. Please try again.",
        [
          {
            text: "Back to Login",
            onPress: () => {
              router.replace("/login");
            },
          },
        ],
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.replace("/login");
  };

  return (
    <ThemedView
      style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        padding: 20 
      }}
    >
      <ActivityIndicator
        size="large"
        color="#6dff29ff"
        style={{
          marginBottom: 20,
          width: 100,
          height: 100,
          transform: [{ rotate: "45deg" }],
        }}
      />
      
      <ThemedText 
        type="subtitle" 
        style={{ 
          textAlign: "center", 
          marginBottom: 20 
        }}
      >
        {status}
      </ThemedText>

      {isProcessing && (
        <ThemedText 
          style={{ 
            textAlign: "center", 
            opacity: 0.7,
            marginBottom: 30 
          }}
        >
          Please wait while we complete your authentication...
        </ThemedText>
      )}

      {!isProcessing && (
        <ThemedText 
          style={{ 
            textAlign: "center", 
            opacity: 0.7,
            marginBottom: 30 
          }}
        >
          You can now close this window or youll be redirected automatically.
        </ThemedText>
      )}

      <Link
        href="/login"
        style={{ 
          color: "#6dff29ff", 
          textDecorationLine: "underline",
          textAlign: "center"
        }}
        onPress={handleCancel}
      >
        Back to Login
      </Link>
    </ThemedView>
  );
}
