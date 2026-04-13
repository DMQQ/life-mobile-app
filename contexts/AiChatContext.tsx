import React, { createContext, useContext, useState, ReactNode } from "react"

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
    const [isOpen, setIsOpen] = useState(false)

    return (
        <AiChatContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
            {children}
        </AiChatContext.Provider>
    )
}
