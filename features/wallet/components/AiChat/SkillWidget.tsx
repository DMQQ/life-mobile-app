import Colors from "@/constants/Colors"
import { useMemo } from "react"
import { View } from "react-native"
import Text from "@/components/ui/Text/Text"
import { AiChatMessageItem } from "../../pages/AiStatsChat"
import { LimitsComparisonComponent } from "../WalletChart/LimitsComparison"
import {
    parseJson,
    LegendView,
    DayOfWeekView,
    DailySpendingsView,
    DailyBreakdownView,
    ZeroExpenseDaysView,
    BalancePredictionView,
    RecentExpensesView,
} from "./widgets/ChartViews"

export interface SkillCardProps {
    skill: AiChatMessageItem
    startDate: string
    endDate: string
    onNavigate?: () => void
}

const s_stretch = { alignSelf: "stretch" as const }

export function SkillWidget({ skill, startDate, endDate }: SkillCardProps) {
    const data = useMemo(() => parseJson(skill?.data || ""), [skill?.data])

    if (!data) return null

    switch (skill.subtype) {
        case "legend":
            return <LegendView data={data} startDate={startDate} endDate={endDate} />
        case "dayOfWeek":
            return <DayOfWeekView data={data} />
        case "dailySpendings":
            return <DailySpendingsView data={data} />
        case "dailyBreakdown":
            return <DailyBreakdownView data={data} />
        case "zeroExpenseDays":
            return <ZeroExpenseDaysView data={data} />
        case "spendingsLimits":
            return (
                <View style={s_stretch}>
                    <LimitsComparisonComponent dateRange={[startDate, endDate]} />
                </View>
            )
        case "balancePrediction":
            return <BalancePredictionView data={data} />
        case "recentExpenses":
            return <RecentExpensesView data={data} />
        default:
            return null
    }
}
