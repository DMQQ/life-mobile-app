import { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import WalletItem from "@/features/wallet/components/Wallet/WalletItem"
import SubscriptionItem from "@/features/wallet/components/Subscription/SubscriptionItem"
import TimelineItem from "@/features/timeline/components/TimelineItem"
import GoalCategory from "@/features/goals/components/GoalCategory"
import FlashCardGroup from "@/features/flashcards/components/FlashCardGroup"
import { navigationRef } from "@/navigation/ref"
import { AiChatMessageItem } from "@/features/ai/types"
import { SkillWidget } from "./SkillWidget"
import { TimelineWidget } from "./widgets/TimelineWidget"
import { FormExpenseNew, FormExpenseEdit } from "./widgets/ExpenseForms"
import { FormEventNew, FormEventEdit } from "./widgets/EventForms"
import { parseJson } from "./widgets/ChartViews"

interface SkillCardProps {
    skill: AiChatMessageItem
    startDate: string
    endDate: string
    onNavigate?: () => void
    animatedStyle?: object
}

export default function SkillCard({ skill, startDate, endDate, onNavigate, animatedStyle }: SkillCardProps) {
    const data = useMemo(() => {
        return parseJson(skill.data || "")
    }, [skill.data])

    if (skill.type === "expense") {
        return (
            <View style={s.stretch}>
                <WalletItem
                    {...data}
                    handlePress={() => {
                        onNavigate?.()
                        navigationRef.current?.navigate("WalletScreens", {
                            screen: "Expense",
                            params: { expense: data },
                        } as any)
                    }}
                />
            </View>
        )
    }
    if (skill.type === "subscription") {
        return (
            <SubscriptionItem
                index={0}
                onPress={() => {
                    onNavigate?.()
                    navigationRef.current?.navigate("WalletScreens", {
                        screen: "Subscription",
                        params: { ...data },
                    } as any)
                }}
                subscription={data}
                style={animatedStyle}
            />
        )
    }

    if (skill.type === "event") {
        return (
            <View style={s.event}>
                <TimelineItem styles={s.eventInner} {...data} onPress={onNavigate} />
            </View>
        )
    }
    if (skill.type === "goals") return <GoalCategory {...data} />
    if (skill.type === "flashcards") return <FlashCardGroup {...data} />

    if (skill.type === "timelineWidget") return <TimelineWidget data={data} />

    if (skill.type === "form_expense_new") return <FormExpenseNew data={data} onNavigate={onNavigate} />
    if (skill.type === "form_expense_edit") return <FormExpenseEdit data={data} onNavigate={onNavigate} />
    if (skill.type === "form_event_new") return <FormEventNew data={data} onNavigate={onNavigate} />
    if (skill.type === "form_event_edit") return <FormEventEdit data={data} onNavigate={onNavigate} />

    if (skill.type === "chart" && skill.data) {
        return (
            <View style={s.chart}>
                <SkillWidget skill={skill} startDate={startDate} endDate={endDate} />
            </View>
        )
    }

    return null
}

const s = StyleSheet.create({
    stretch: { alignSelf: "stretch" },
    event: { minHeight: 120, overflow: "hidden", width: "100%" },
    eventInner: { minHeight: 120 },
    chart: { alignSelf: "stretch", overflow: "hidden" },
})
