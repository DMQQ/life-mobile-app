import Colors from "@/constants/Colors"
import { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import WalletItem from "@/features/wallet/components/Wallet/WalletItem"
import SubscriptionItem from "@/features/wallet/components/Subscription/SubscriptionItem"
import TimelineItem from "@/features/timeline/components/TimelineItem"
import GoalCategory from "@/features/goals/components/GoalCategory"
import FlashCardGroup from "@/features/flashcards/components/FlashCardGroup"
import { navigationRef } from "@/navigation/ref"
import { AiChatMessageItem } from "../../pages/AiStatsChat"
import { SkillWidget } from "./SkillWidget"
import { TimelineWidget } from "./widgets/TimelineWidget"
import { FormExpenseNew, FormExpenseEdit } from "./widgets/ExpenseForms"
import { FormEventNew, FormEventEdit } from "./widgets/EventForms"
import { parseJson } from "./widgets/ChartViews"

const NOOP = () => {}

interface SkillCardProps {
    skill: AiChatMessageItem
    startDate: string
    endDate: string
    onNavigate?: () => void
}

export default function SkillCard({ skill, startDate, endDate, onNavigate }: SkillCardProps) {
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
                    animatedStyle={{}}
                />
            </View>
        )
    }
    if (skill.type === "subscription") {
        return (
            <View style={[]}>
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
                />
            </View>
        )
    }

    if (skill.type === "event") {
        return (
            <View style={{ minHeight: 120, overflow: "hidden", width: "100%" }}>
                <TimelineItem styles={{ minHeight: 120 }} {...data} onPress={onNavigate} />
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
            <View style={{ marginBottom: 15, maxHeight: 400, overflow: "hidden", alignSelf: "stretch" }}>
                <SkillWidget skill={skill} startDate={startDate} endDate={endDate} />
            </View>
        )
    }

    return (
        <GlassView tintColor={Colors.danger}>
            <Text style={{ color: "#fff", padding: 12 }}>Unsupported skill type: {skill?.type ?? "UNDEFINED"}</Text>
            <Text style={{ color: "#fff", padding: 12 }}>Data: {JSON.stringify(skill?.data ?? {})}</Text>
        </GlassView>
    )
}

const s = StyleSheet.create({
    stretch: { alignSelf: "stretch" },
})
