import ParallaxScrollView from "@/components/parallax-scroll-view"
import { ThemedText } from "@/components/themed-text"
import { Image } from "expo-image"
import { styles } from "../../css/styles"

export default function DiscoverScreen() {
	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: "#000000ff", dark: "#000000ff" }}
			headerImage={
				<Image
					source={require("@/assets/images/logo.png")}
					style={styles.logo}
				/>
			}>
			<ThemedText>Discover</ThemedText>
		</ParallaxScrollView>
	)
}
