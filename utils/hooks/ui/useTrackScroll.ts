import { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { useScrollYContext } from "@/utils/context/ScrollYContext"

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
            const { scrollY, onScroll, setActiveScreen } = useScrollYContext()

            if (screenName) {
                setActiveScreen(screenName)
            }

            return [scrollY, onScroll] as const
        } catch (error) {
            console.warn("ScrollYContext not available, falling back to local scroll tracking")
            return [localScrollY, localOnScroll] as const
        }
    }

    return [localScrollY, localOnScroll] as const
}
