import React, { createContext, useContext, ReactNode } from "react"
import { useAnimatedScrollHandler, useSharedValue, SharedValue } from "react-native-reanimated"

interface ScrollYContextType {
    scrollY: SharedValue<number>
    onScroll: ReturnType<typeof useAnimatedScrollHandler>
    resetScrollY: () => void
    activeScreen: SharedValue<string>
    setActiveScreen: (screen: string) => void
}

const ScrollYContext = createContext<ScrollYContextType | undefined>(undefined)

interface ScrollYContextProviderProps {
    children: ReactNode
}

export const ScrollYContextProvider: React.FC<ScrollYContextProviderProps> = ({ children }) => {
    const scrollY = useSharedValue(0)
    const activeScreen = useSharedValue("Root")

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y
        },
    })

    const resetScrollY = () => {
        scrollY.value = 0
    }

    const setActiveScreen = (screen: string) => {
        activeScreen.value = screen
    }

    const value: ScrollYContextType = {
        scrollY,
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

// Hook for easier access to just the scroll handler
export const useGlobalScrollHandler = () => {
    const { onScroll } = useScrollYContext()
    return onScroll
}

// Hook for easier access to just the scroll value
export const useGlobalScrollY = () => {
    const { scrollY } = useScrollYContext()
    return scrollY
}