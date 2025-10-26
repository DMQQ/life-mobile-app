import React, { createContext, useContext, ReactNode } from "react"
import { useAnimatedScrollHandler, useSharedValue, SharedValue } from "react-native-reanimated"

interface ScrollYContextType {
    scrollYValues: SharedValue<Record<string, number>>
    onScroll: ReturnType<typeof useAnimatedScrollHandler>
    resetScrollY: (screen: string) => void
    activeScreen: SharedValue<string>
    setActiveScreen: (screen: string) => void
}

const ScrollYContext = createContext<ScrollYContextType | undefined>(undefined)

interface ScrollYContextProviderProps {
    children: ReactNode
}

export const ScrollYContextProvider: React.FC<ScrollYContextProviderProps> = ({ children }) => {
    const scrollYValues = useSharedValue({} as Record<string, number>)
    const activeScreen = useSharedValue("Root")

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollYValues.value = {
                ...scrollYValues.value,
                [activeScreen.value]: event.contentOffset.y,
            }
        },
    })

    const resetScrollY = (screen: string) => {
        scrollYValues.value = {
            ...scrollYValues.value,
            [screen]: 0,
        }
    }

    const setActiveScreen = (screen: string) => {
        activeScreen.value = screen
    }

    const value: ScrollYContextType = {
        scrollYValues,
        onScroll,
        resetScrollY,
        activeScreen,
        setActiveScreen,
    }

    return <ScrollYContext.Provider value={value}>{children}</ScrollYContext.Provider>
}

export const useScrollYContext = (): ScrollYContextType => {
    const context = useContext(ScrollYContext)
    if (context === undefined) {
        throw new Error("useScrollYContext must be used within a ScrollYContextProvider")
    }
    return context
}

// Hook for easier access to scroll handler
export const useGlobalScrollHandler = () => {
    const { onScroll } = useScrollYContext()
    return onScroll
}

// Hook for easier access to scroll value for a specific screen
export const useScreenScrollY = (screenName: string) => {
    const { scrollYValues } = useScrollYContext()
    return scrollYValues.value[screenName] || 0
}
