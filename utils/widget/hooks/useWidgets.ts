import useWidgetAnalyticsData from "./useWidgetAnalyticsData"
import useWidgetTimelineData from "./useWidgetTimelineData"
import useWidgetWalletData from "./useWidgetWalletData"

export default function useWidgets() {
    useWidgetWalletData()
    useWidgetTimelineData()
    useWidgetAnalyticsData()
}
