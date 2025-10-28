/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
    type: "app-intent",
    entitlements: {
        "com.apple.security.application-groups": ["group.com.dmq.mylifemobile"],
    },
    bundleIdentifier: ".create-expense",
})
