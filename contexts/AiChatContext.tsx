import { router, useSegments } from "expo-router"
import React, { createContext, useContext, ReactNode, useRef, useEffect } from "react"

interface AiChatContextType {
    isOpen: boolean
    open: () => void
    close: () => void
}

const AiChatContext = createContext<AiChatContextType>({
    isOpen: false,
    open: () => {},
    close: () => {},
})

export const useAiChat = () => useContext(AiChatContext)

export const AiChatProvider = ({ children }: { children: ReactNode }) => {
    const segments = useSegments()
    const isOpen = segments.includes("chat" as any)
    const prevTabRef = useRef<"/(tabs)/home" | "/(tabs)/goals" | "/(tabs)/wallet" | "/(tabs)/timeline">("/(tabs)/home")

    useEffect(() => {
        if (!isOpen) {
            const tab = (segments as string[])[1]
            if (tab && tab !== "chat") {
                prevTabRef.current = `/(tabs)/${tab}` as typeof prevTabRef.current
            }
        }
    }, [segments, isOpen])

    return (
        <AiChatContext.Provider
            value={{
                isOpen,
                open: () => router.navigate("/(tabs)/chat/ai" as any),
                close: () => router.navigate(prevTabRef.current as any),
            }}
        >
            {children}
        </AiChatContext.Provider>
    )
}
