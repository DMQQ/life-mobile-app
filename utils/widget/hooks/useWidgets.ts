import useWidgetAnalyticsData from "./useWidgetAnalyticsData"
import useWidgetGoalsData from "./useWidgetGoalsData"
import useWidgetTimelineData from "./useWidgetTimelineData"
import useWidgetWalletData from "./useWidgetWalletData"
import useWidgetExpensesData from "./useWidgetExpensesData"
import { useApolloClient } from "@apollo/client"
import useAppBackground from "@/utils/hooks/useAppBackground"
import { useEffect } from "react"
import { registerWidgetBackgroundFetch } from "../widgetBackgroundFetch"

export default function useWidgets() {
    const client = useApolloClient()

    useEffect(() => {
        registerWidgetBackgroundFetch()
    }, [])

    useAppBackground({
        onForeground: () => {
            client.refetchQueries({ include: "active" })
        },
    })

    useWidgetWalletData()
    useWidgetTimelineData()
    useWidgetAnalyticsData()
    useWidgetGoalsData()
    useWidgetExpensesData()
}
