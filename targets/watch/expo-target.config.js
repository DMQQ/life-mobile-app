/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
    type: "watch",
    icon: "https://raw.githubusercontent.com/DMQQ/life-mobile-app/refs/heads/master/assets/images/icon.png",
    colors: { $accent: "darkcyan" },
    deploymentTarget: "10.0",
    entitlements: {
        "com.apple.security.application-groups": ["group.com.dmq.mylifemobile"],
    },
    bundleIdentifier: ".watch",
})
