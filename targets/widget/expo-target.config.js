/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
    type: "widget",
    bundleIdentifier: ".lifewidget",
    entitlements: {
        "com.apple.security.application-groups": ["group.com.dmq.mylifemobile"],
    },
    frameworks: ["SwiftUI"],
})
