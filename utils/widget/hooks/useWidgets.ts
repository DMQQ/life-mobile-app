import useWidgetAnalyticsData from "./useWidgetAnalyticsData"
import useWidgetTimelineData from "./useWidgetTimelineData"
import useWidgetWalletData from "./useWidgetWalletData"
import useWidgetExpensesData from "./useWidgetExpensesData"
import { useApolloClient } from "@apollo/client"
import useAppBackground from "@/utils/hooks/useAppBackground"

export default function useWidgets() {
    const client = useApolloClient()

    useAppBackground({
        onForeground: () => {
            client.refetchQueries({ include: "active" })
        },
    })

    useWidgetWalletData()
    useWidgetTimelineData()
    useWidgetAnalyticsData()
    useWidgetExpensesData()
}
