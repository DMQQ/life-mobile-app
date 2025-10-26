import { useAnimatedScrollHandler, useSharedValue, useDerivedValue } from "react-native-reanimated"
import { useScrollYContext } from "@/utils/context/ScrollYContext"
import { useFocusEffect, useIsFocused } from "@react-navigation/native"

interface UseTrackScrollOptions {
    useGlobal?: boolean
    screenName?: string
}

export default function useTrackScroll(options: UseTrackScrollOptions = {}) {
    const { useGlobal = true, screenName } = options

    const localScrollY = useSharedValue(0)
    const localOnScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            localScrollY.value = event.contentOffset.y
        },
    })

    if (useGlobal) {
        try {
            const { scrollYValues, onScroll, setActiveScreen } = useScrollYContext()

            useFocusEffect(() => {
                if (screenName) setActiveScreen(screenName)
            })

            const screenScrollY = useDerivedValue(() => {
                return screenName ? scrollYValues.value[screenName] || 0 : 0
            })

            return [screenScrollY, onScroll] as const
        } catch (error) {
            console.warn("ScrollYContext not available, falling back to local scroll tracking")
            return [localScrollY, localOnScroll] as const
        }
    }

    return [localScrollY, localOnScroll] as const
}
