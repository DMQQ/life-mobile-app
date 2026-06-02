import HomeExtras from "@/features/home/components/HomeExtras"
import CategoryBreakdown from "@/features/wallet/components/Wallet/CategoryBreakdown"
import Colors from "@/constants/Colors"
import React from "react"
import ChartSwitcher from "../components/ChartSwitcher"
import BalanceSummaryWidget from "./BalanceSummaryWidget"
import GoalsGridWidget from "./GoalsGridWidget"
import WeekLifeWidget from "./WeekLifeWidget"
import QuickStatsWidget from "./QuickStatsWidget"
import {
    BalancePreview,
    CategoriesPreview,
    ChartPreview,
    ExtrasPreview,
    GoalsPreview,
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
]
