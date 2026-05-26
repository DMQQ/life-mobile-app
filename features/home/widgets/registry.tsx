import HomeExtras from "@/features/home/components/HomeExtras"
import TimelineWidget from "@/features/home/components/TimelineWidget"
import CategoryBreakdown from "@/features/wallet/components/Wallet/CategoryBreakdown"
import Colors from "@/constants/Colors"
import React from "react"
import ChartSwitcher from "../components/ChartSwitcher"
import BalanceSummaryWidget from "./BalanceSummaryWidget"
import EventsCalendarWidget from "./EventsCalendarWidget"
import GoalsGridWidget from "./GoalsGridWidget"
import {
    BalancePreview,
    CategoriesPreview,
    ChartPreview,
    EventsPreview,
    ExtrasPreview,
    GoalsPreview,
    TimelinePreview,
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
        key: "events",
        label: "Week Calendar",
        subtitle: "7-day strip with today's events",
        icon: "calendar",
        accentColor: "#4ECDC4",
        component: EventsCalendarWidget,
        Preview: EventsPreview,
    },
    {
        key: "timeline",
        label: "Today's Events",
        subtitle: "Upcoming timeline items for today",
        icon: "clock",
        accentColor: "#A29BFE",
        component: TimelineWidget,
        Preview: TimelinePreview,
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
        key: "extras",
        label: "Limits & Calendar",
        subtitle: "Monthly limits & subscription calendar",
        icon: "sliders",
        accentColor: "#FF6B6B",
        component: HomeExtras,
        Preview: ExtrasPreview,
    },
]
