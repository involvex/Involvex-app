import { StyleSheet } from "react-native";

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
});

export const tabBarStyles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    backgroundColor: "transparent",
  },
});

export const tabStyles = StyleSheet.create({
  tabItem: {
    paddingVertical: 6,
  },
});

export const tabLabelStyles = StyleSheet.create({
  tabLabel: {
    fontSize: 12,
    marginTop: -4,
  },
});

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
});

export const login = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    alignContent: "flex-start",
    justifyContent: "flex-start",
    padding: 20,
    marginLeft: 0,
  },
  button: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    maxWidth: 50,
    alignSelf: "auto",
    width: 20,
    marginLeft: 0,
  },
  pressed: {
    backgroundColor: "rgba(0,122,255,0.1)",
    borderColor: "#007AFF",
    transform: [{ scale: 0.98 }],
  },
  onclick: {
    width: 100,
    backgroundColor: "#007AFF",
    transform: [{ scale: 1 }],
  },
});
