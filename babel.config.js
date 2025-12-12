import env from "react-native-dotenv";

export default function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Add any additional plugins here
      [
        "module-resolver",
        {
          alias: {
            "@": "./",
          },
        },
      ],
      [
        "module:react-native-dotenv",
        {
          path: ".env",
          moduleName: "@env",
          env: env,
          envName: "APP_ENV",
          safe: false,
          allowUndefined: true,
          verbose: true,
        },
      ],
      // Plugin to handle conditional imports for expo-notifications
      [
        "transform-define",
        {
          "process.env.EXPO_NOTIFICATIONS_DISABLED": JSON.stringify(
            process.env.EXPO_NOTIFICATIONS_DISABLED ||env.EXPO_NOTIFICATIONS_DISABLED || "false",
          ),
          "process.env.EXPO_DEV_CLIENT": JSON.stringify(
            process.env.EXPO_DEV_CLIENT || env.EXPO_DEV_CLIENT || "true",
          ),
          "process.env.DISCORD_CLIENT_SECRET": JSON.stringify(
            process.env.DISCORD_CLIENT_SECRET || env.DISCORD_CLIENT_SECRET,
          ),
          "process.env.EXPO_PUBLIC_DISCORD_CLIENT_ID": JSON.stringify(
            process.env.EXPO_PUBLIC_DISCORD_CLIENT_ID ||
              env.EXPO_PUBLIC_DISCORD_CLIENT_ID,
          ),
          "process.env.DISCORD_REDIRECT_URI": JSON.stringify(
            process.env.DISCORD_REDIRECT_URI ||
              env.DISCORD_REDIRECT_URI ||
              "https://involvex.expo.app/callback",
          ),
        },
      ],
      // Suppress expo-notifications warnings in development
    ],
  };
}
