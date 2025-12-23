import { useEffect } from "react"
import { useAppSelector } from "../redux"
import { setSearchHandler } from "../redux/search/search"

/**
 * Hook for screens that need to handle search functionality
 * @param searchHandler Function to handle search value changes
 * @returns Object with search state and control functions
 */
export const useScreenSearch = (searchHandler: (value: string) => void) => {
    const { isActive, value } = useAppSelector((state) => state.search)

    useEffect(() => {
        searchHandler(value)
    }, [searchHandler, value])

    return {
        isSearchActive: isActive,
        searchValue: value,
    }
}
