import { ExternalLink } from "@/components/external-link"
import ParallaxScrollView from "@/components/parallax-scroll-view"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { IconSymbol } from "@/components/ui/icon-symbol"
import { Image } from "expo-image"
// import { StyleSheet } from "react-native"
import { styles } from "../../css/styles"

export default function SettingsScreen() {
	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: "#000000ff", dark: "#000000ff" }}
			headerImage={
				<Image
					source={require("@/assets/images/logo.png")}
					// style={styles.reactLogo}
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
			</ThemedView>

			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Privacy Settings</ThemedText>
			</ThemedView>

			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Notifications</ThemedText>
			</ThemedView>

			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">About</ThemedText>
				<ExternalLink href="https://involvex.github.io/Involvex/">
					<IconSymbol name="info" color={"green"} /> Github Portfolio
				</ExternalLink>
			</ThemedView>

			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Help & Support</ThemedText>
				<ExternalLink href="https://involvex.github.io/Involvex/">
					<IconSymbol
						name="questionmark.circle.fill"
						color={"green"}
					/>{" "}
					Contact Support
				</ExternalLink>
			</ThemedView>
		</ParallaxScrollView>
	)
}
