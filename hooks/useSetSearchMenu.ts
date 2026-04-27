import { useEffect } from "react"
import { useSearchMenu, type SearchMenuItem } from "@/contexts/SearchMenuContext"
import { useIsFocused } from "@react-navigation/native"

export const useSetSearchMenu = (items: SearchMenuItem[]) => {
    const { setMenuItems, clearMenuItems } = useSearchMenu()
    const isFocused = useIsFocused()

    useEffect(() => {
        if (isFocused) {
            setMenuItems(items)
        }

        return () => {
            clearMenuItems()
        }
    }, [items, isFocused])
}
