import { HelloWave } from "@/components/hello-wave"
import ParallaxScrollView from "@/components/parallax-scroll-view"
import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { Image } from "expo-image"
import { Platform } from "react-native"
import { styles } from "../../css/styles"

export default function HomeScreen() {
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
				<ThemedText type="title">Welcome!</ThemedText>
				<HelloWave />
			</ThemedView>
			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Step 1: Try it</ThemedText>
				<ThemedText>
					Edit{" "}
					<ThemedText type="defaultSemiBold">
						app/(tabs)/index.tsx
					</ThemedText>{" "}
					to see changes. Press{" "}
					<ThemedText type="defaultSemiBold">
						{Platform.select({
							ios: "cmd + d",
							android: "cmd + m",
							web: "F12",
						})}
					</ThemedText>{" "}
					to open developer tools.
				</ThemedText>
			</ThemedView>
			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Step 2: Explore</ThemedText>
				<ThemedText>Tap the tabs below to explore this app.</ThemedText>
			</ThemedView>
		</ParallaxScrollView>
	)
}

// const styles = StyleSheet.create({
// 	titleContainer: {
// 		flexDirection: "row",
// 		alignItems: "center",
// 		gap: 8,
// 	},
// 	stepContainer: {
// 		gap: 8,
// 		marginBottom: 8,
// 	},
// 	reactLogo: {
// 		height: 178,
// 		width: 290,
// 		bottom: 0,
// 		left: 0,
// 		position: "absolute",
// 	},
// })
