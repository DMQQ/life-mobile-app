import { useLocalSearchParams, useNavigation } from "expo-router"
import { useEffect } from "react"
import Timeline from "@/features/timeline/pages/Timeline"

export default function TimelineIndex() {
    const params = useLocalSearchParams<{ timelineId?: string; selectedDate?: string }>()
    const navigation = useNavigation()

    useEffect(() => {
        if (params.timelineId) {
            ;(navigation as any).navigate("[id]", { timelineId: params.timelineId })
        } else if (params.selectedDate !== undefined) {
            ;(navigation as any).navigate("create", { selectedDate: params.selectedDate, mode: "create" })
        }
    }, [params.timelineId, params.selectedDate])

    return <Timeline />
}
