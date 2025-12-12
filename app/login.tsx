import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { login } from "@/css/styles"
import { Button, TextInput } from "react-native"

export default function LoginScreen() {
	return (
		<ThemedView style={login.container}>
			<ThemedText type="title">Login Screen</ThemedText>
			{/* Add your login form components here */}
			<TextInput placeholder="Discorduser" />
			<Button title="Login" onPress={() => {}} />
		</ThemedView>
	)
}
