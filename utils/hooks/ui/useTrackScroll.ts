import { useAnimatedScrollHandler, useSharedValue, useDerivedValue, runOnJS } from "react-native-reanimated"
import { useScrollYContext } from "@/utils/context/ScrollYContext"
import { useFocusEffect, useIsFocused } from "@react-navigation/native"
import { useCallback, useEffect } from "react"

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
            const { scrollYValues, onScroll, setActiveScreen, resetScrollY } = useScrollYContext()

            useEffect(() => {
                if (screenName) {
                    if (scrollYValues.value[screenName] === undefined) {
                        resetScrollY(screenName)
                    }

                    return () => {
                        resetScrollY(screenName)
                    }
                }
            }, [screenName])

            useFocusEffect(
                useCallback(() => {
                    if (screenName) {
                        setActiveScreen(screenName)
                    }
                }, [screenName]),
            )

            const screenScrollY = useDerivedValue(() => {
                const currentValue = screenName ? scrollYValues.value[screenName] : undefined
                return currentValue !== undefined ? currentValue : 0
            }, [screenName])

            return [screenScrollY, onScroll] as const
        } catch (error) {
            console.warn("ScrollYContext not available, falling back to local scroll tracking")
            return [localScrollY, localOnScroll] as const
        }
    }

    return [localScrollY, localOnScroll] as const
}
