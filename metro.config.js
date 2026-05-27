const { getDefaultConfig } = require("expo/metro-config")

const config = getDefaultConfig(__dirname)

config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg")
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"]

module.exports = config
