import React, { createContext, useState, ReactNode } from "react"

interface SearchContextType {
    query: string
    setQuery: (query: string) => void
    loading: boolean
    setLoading: (loading: boolean) => void
}

export const SearchContext = createContext<SearchContextType>({
    query: "",
    setQuery: () => {},
    loading: false,
    setLoading: () => {},
})

interface SearchProviderProps {
    children: ReactNode
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    
    const value = {
        query,
        setQuery,
        loading,
        setLoading,
    }
    
    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    )
}