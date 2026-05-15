import { useAnimatedScrollHandler, useSharedValue, makeMutable } from "react-native-reanimated"
import { useFocusEffect } from "expo-router"
import { useCallback } from "react"

interface UseTrackScrollOptions {
    useGlobal?: boolean
    screenName?: string
    resetOnFocus?: boolean
}

const scrollStore: Record<string, any> = {}

export function getGlobalScrollY(key: string) {
    if (!scrollStore[key]) {
        scrollStore[key] = makeMutable(0)
    }
    return scrollStore[key]
}

export default function useTrackScroll(options: UseTrackScrollOptions = {}) {
    const { useGlobal = false, screenName = "default", resetOnFocus = false } = options

    const localScrollY = useSharedValue(0)

    const scrollY = useGlobal ? getGlobalScrollY(screenName) : localScrollY

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y
        },
    })

    useFocusEffect(
        useCallback(() => {
            if (resetOnFocus) {
                scrollY.value = 0
            }
        }, [scrollY, resetOnFocus]),
    )

    return [scrollY, onScroll] as const
}
