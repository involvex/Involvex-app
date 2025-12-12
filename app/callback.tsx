import { ThemedView } from "@/components/themed-view";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator } from "react-native";
import { useEffect } from "react";
export default function callbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { code } = params;

  
  function navigatehome() {
    router.navigate("/(tabs)");
  }

  useEffect(() => {
    if (code) {
      // Handle the code, e.g., send it to your backend for authentication
      console.log("Authorization code:", code);
    }
  }, [code]);
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#6dff29ff" style={{ marginBottom: 20, marginTop: 20, width: 100, height: 100, transform: [{ rotate: '45deg' }], }} />
    <br />
    <Link href="/" style={{color: '#6dff29ff', textDecorationLine: 'underline'}} onPress={navigatehome}>Home</Link>
    </ThemedView>
  )

};