import HomeExtras from "@/features/home/components/HomeExtras"
import CategoryBreakdown from "@/features/wallet/components/Wallet/CategoryBreakdown"
import Colors from "@/constants/Colors"
import React from "react"
import ChartSwitcher from "../components/ChartSwitcher"
import BalanceSummaryWidget from "./BalanceSummaryWidget"
import AiInsightWidget from "./AiInsightWidget"
import EventCompletionWidget from "./EventCompletionWidget"
import GoalsGridWidget from "./GoalsGridWidget"
import UpcomingBillsWidget from "./UpcomingBillsWidget"
import WeekLifeWidget from "./WeekLifeWidget"
import QuickStatsWidget from "./QuickStatsWidget"
import {
    AiInsightPreview,
    BalancePreview,
    CategoriesPreview,
    ChartPreview,
    EventCompletionPreview,
    ExtrasPreview,
    GoalsPreview,
    UpcomingBillsPreview,
    WeekLifePreview,
    QuickStatsPreview,
} from "./previews"

export interface WidgetDefinition {
    key: string
    label: string
    subtitle: string
    icon: string
    accentColor: string
    component: React.ComponentType
    Preview: React.ComponentType
}

export const WIDGETS: WidgetDefinition[] = [
    {
        key: "balance",
        label: "Balance Summary",
        subtitle: "Wallet balance & monthly spending",
        icon: "credit-card",
        accentColor: Colors.secondary,
        component: BalanceSummaryWidget,
        Preview: BalancePreview,
    },
    {
        key: "chart",
        label: "Overview Chart",
        subtitle: "Weekly spending & balance prediction",
        icon: "bar-chart-2",
        accentColor: Colors.ternary,
        component: ChartSwitcher,
        Preview: ChartPreview,
    },
    {
        key: "categories",
        label: "Category Breakdown",
        subtitle: "Spending grouped by category",
        icon: "pie-chart",
        accentColor: "#FF6B6B",
        component: CategoryBreakdown,
        Preview: CategoriesPreview,
    },
    {
        key: "goals",
        label: "Goals Grid",
        subtitle: "Weekly habit tracker for your goals",
        icon: "target",
        accentColor: "#FFE66D",
        component: GoalsGridWidget,
        Preview: GoalsPreview,
    },
    {
        key: "weeklife",
        label: "Week Life",
        subtitle: "Events, expenses & goals in one timeline",
        icon: "layers",
        accentColor: "#A29BFE",
        component: WeekLifeWidget,
        Preview: WeekLifePreview,
    },
    {
        key: "extras",
        label: "Limits & Calendar",
        subtitle: "Monthly limits & subscription calendar",
        icon: "sliders",
        accentColor: "#FF6B6B",
        component: HomeExtras,
        Preview: ExtrasPreview,
    },
    {
        key: "quick-stats",
        label: "Quick Stats",
        subtitle: "Weekly spend & subscription costs at a glance",
        icon: "activity",
        accentColor: Colors.ternary,
        component: QuickStatsWidget,
        Preview: QuickStatsPreview,
    },
    {
        key: "event-completion",
        label: "Event Completion",
        subtitle: "14-day timeline completion chart & streak",
        icon: "check-circle",
        accentColor: Colors.positive,
        component: EventCompletionWidget,
        Preview: EventCompletionPreview,
    },
    {
        key: "ai-insight",
        label: "AI Insight",
        subtitle: "Smart summaries of your spending & habits",
        icon: "cpu",
        accentColor: "#7C3AED",
        component: AiInsightWidget,
        Preview: AiInsightPreview,
    },
    {
        key: "upcoming-bills",
        label: "Upcoming Bills",
        subtitle: "Subscriptions due in the next 30 days",
        icon: "calendar",
        accentColor: Colors.warning,
        component: UpcomingBillsWidget,
        Preview: UpcomingBillsPreview,
    },
]
