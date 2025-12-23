import { useEffect } from "react"
import { useSearchMenu, type SearchMenuItem } from "@/contexts/SearchMenuContext"

export const useSetSearchMenu = (items: SearchMenuItem[]) => {
    const { setMenuItems, clearMenuItems } = useSearchMenu()

    useEffect(() => {
        setMenuItems(items)

        return () => {
            clearMenuItems()
        }
    }, [items])
}
