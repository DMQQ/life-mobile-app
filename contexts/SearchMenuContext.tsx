import React, { createContext, useContext, useState, ReactNode } from "react"

export interface SearchMenuItem {
    title: string
    systemImage?: string
    checked?: boolean
    destructive?: boolean
    onPress?: () => void
    children?: SearchMenuItem[]
}

interface SearchMenuContextType {
    menuItems: SearchMenuItem[]
    setMenuItems: (items: SearchMenuItem[]) => void
    clearMenuItems: () => void
}

const SearchMenuContext = createContext<SearchMenuContextType>({
    menuItems: [],
    setMenuItems: () => {},
    clearMenuItems: () => {},
})

export const useSearchMenu = () => useContext(SearchMenuContext)

export const SearchMenuProvider = ({ children }: { children: ReactNode }) => {
    const [menuItems, setMenuItems] = useState<SearchMenuItem[]>([])

    const clearMenuItems = () => setMenuItems([])

    return (
        <SearchMenuContext.Provider value={{ menuItems, setMenuItems, clearMenuItems }}>
            {children}
        </SearchMenuContext.Provider>
    )
}
