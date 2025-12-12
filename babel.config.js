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
      // Plugin to handle conditional imports for expo-notifications
      [
        "transform-define",
        {
          "process.env.EXPO_NOTIFICATIONS_DISABLED": JSON.stringify(
            process.env.EXPO_NOTIFICATIONS_DISABLED || "false",
          ),
          "process.env.EXPO_DEV_CLIENT": JSON.stringify(
            process.env.EXPO_DEV_CLIENT || "true",
          ),
        },
      ],
      // Suppress expo-notifications warnings in development
    ],
  };
}
