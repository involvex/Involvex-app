import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	logo: {
		height: "100%",
		width: "100%",
		resizeMode: "contain",
        backgroundColor: "transparent",
	},
})

export const tabBarStyles = StyleSheet.create({
	tabBar: {
		borderTopWidth: 0,
		backgroundColor: "transparent",
	},
})

export const tabStyles = StyleSheet.create({
	tabItem: {
		paddingVertical: 6,
	},
})

export const tabLabelStyles = StyleSheet.create({
	tabLabel: {
		fontSize: 12,
		marginTop: -4,
	},
})

export const tabIconStyles = StyleSheet.create({
	tabIcon: {
		width: 24,
		height: 24,
		backgroundColor: "transparent",
		resizeMode: "contain",
		
	},
	focus: {
		opacity: 1,
	},

	
})