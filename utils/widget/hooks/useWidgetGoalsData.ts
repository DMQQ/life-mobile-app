import { useEffect } from "react"
import { useQuery } from "@apollo/client"
import store from "../store"
import { WidgetGoalsData, WidgetGoalCategory, WidgetGoalEntry } from "../types"
import { ExtensionStorage } from "@bacons/apple-targets"
import { GET_GOALS } from "@/features/goals/hooks/hooks"
import { secondary_candidates } from "@/constants/Colors"

export const useWidgetGoalsData = () => {
    const { data } = useQuery(GET_GOALS)

    useEffect(() => {
        if (!data?.goals) return

        const categories: WidgetGoalCategory[] = data.goals.map((goal: any, index: number) => ({
            id: goal.id,
            name: goal.name,
            icon: goal.icon,
            target: goal.target,
            unit: goal.unit,
            color: secondary_candidates[index % secondary_candidates.length],
            entries: (goal.entries || []).map((entry: any) => ({
                id: entry.id,
                value: entry.value,
                date: typeof entry.date === "string" ? entry.date.split("T")[0] : entry.date,
            })),
        }))

        const widgetData: WidgetGoalsData = {
            categories,
            lastUpdated: new Date().toISOString(),
        }

        store.set("goals_data", JSON.stringify(widgetData))
        ExtensionStorage.reloadWidget()
    }, [data])
}

export default useWidgetGoalsData
