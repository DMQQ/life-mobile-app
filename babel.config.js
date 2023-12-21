module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      //  "module:metro-react-native-babel-preset"
    ],
    plugins: [
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          extensions: [
            ".ios.js",
            ".android.js",
            ".ios.jsx",
            ".android.jsx",
            ".js",
            ".jsx",
            ".json",
            ".ts",
            ".tsx",
          ],
          root: ["."],
          alias: {
            "@": "./",

            // "@components":"./components" etc
          },
        },
      ],
    ],
  };
};
