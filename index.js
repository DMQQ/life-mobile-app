import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated"
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev"

if (__DEV__) {
    loadErrorMessages()
    loadDevMessages()
}

configureReanimatedLogger({
    level: ReanimatedLogLevel.error,
    strict: false,
})

import "expo-router/entry"
