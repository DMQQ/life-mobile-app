import { useAnimatedScrollHandler, useSharedValue, useDerivedValue, runOnJS } from "react-native-reanimated"
import { useScrollYContext } from "@/utils/context/ScrollYContext"
import { useFocusEffect, useIsFocused } from "@react-navigation/native"
import { useCallback, useEffect } from "react"

interface UseTrackScrollOptions {
    useGlobal?: boolean
    screenName?: string
}

/**
 * @deprecated options
 */
export default function useTrackScroll(options: UseTrackScrollOptions = {}) {
    const localScrollY = useSharedValue(0)
    const localOnScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            localScrollY.value = event.contentOffset.y
        },
    })

    return [localScrollY, localOnScroll] as const
}
