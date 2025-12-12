import { ExternalLink } from "@/components/external-link"
import ParallaxScrollView from "@/components/parallax-scroll-view"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { IconSymbol } from "@/components/ui/icon-symbol"
import { Image } from "expo-image"
import { styles } from "../../css/styles"
import LoginScreen from "../login"
import PermissionsScreen from "../permissions"

// Helper function to get environment variable safely
function getEnvVar(key: string): string | undefined {
	return process.env[key]
}

export default function SettingsScreen() {
	// Get environment variables for display (without exposing actual values)
	const discordClientId = getEnvVar("DISCORD_CLIENT_ID")
	const hasDiscordConfig = Boolean(discordClientId)
	const data = [
		{ key: "Notifications", data: [{ key: "Push Notifications" }] },
	]
	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: "#000000ff", dark: "#000000ff" }}
			headerImage={
				<Image
					source={require("@/assets/images/logo.png")}
					style={styles.logo}
				/>
			}>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type="title">Settings</ThemedText>
			</ThemedView>

			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">General Settings</ThemedText>
			</ThemedView>

			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Account Settings</ThemedText>
				<LoginScreen />
				<ThemedText type="default">
					Discord Integration:{" "}
					{hasDiscordConfig ? "Configured" : "Not Configured"}
				</ThemedText>
			</ThemedView>

			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Notifications</ThemedText>
			</ThemedView>

			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Push Notifications</ThemedText>
				<PermissionsScreen />

				{/* if (!Platform.OS === 'android'){ } */}
				<select title="Notifications">
					<option value="enabled">Enable Notifications</option>
					<option value="disabled" selected={true}>
						Disable Notifications
					</option>
				</select>
				{/*} else { */}
				{/* <SectionList
					sections={data}
					data={[{ key: "Push Notifications" }]}
					renderItem={({ item }) => (
						<ThemedText>{item.key}</ThemedText>
					)} */}
				{/* /> */}
				{/*} */}
			</ThemedView>

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
					}}>
					<IconSymbol
						name="info"
						style={{ color: "#007AFF" }}
						color="#007AFF"
					/>{" "}
					Github Portfolio
				</ExternalLink>
			</ThemedView>
		</ParallaxScrollView>
	)
}
