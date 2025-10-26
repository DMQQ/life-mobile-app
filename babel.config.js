module.exports = function (api) {
    api.cache(true)
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            "react-native-worklets/plugin",
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
                    },
                },
            ],
        ],
    }
}
