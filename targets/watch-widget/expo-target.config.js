/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
    type: "watch-widget",
    colors: { $accent: "darkcyan" },
    deploymentTarget: "10",
    bundleIdentifier: ".watch.widget",
    entitlements: {
        "com.apple.security.application-groups": ["group.com.dmq.mylifemobile"],
    },
    displayName: "Life Timeline Widget",
})
