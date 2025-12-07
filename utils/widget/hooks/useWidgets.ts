import useWidgetAnalyticsData from "./useWidgetAnalyticsData"
import useWidgetTimelineData from "./useWidgetTimelineData"
import useWidgetWalletData from "./useWidgetWalletData"
import useWidgetExpensesData from "./useWidgetExpensesData"

export default function useWidgets() {
    useWidgetWalletData()
    useWidgetTimelineData()
    useWidgetAnalyticsData()
    useWidgetExpensesData()
}
