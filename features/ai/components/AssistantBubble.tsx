import Colors from "@/constants/Colors"
import { FONTS } from "@/constants/Fonts"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import SkillCard from "@/features/wallet/components/AiChat/SkillCard"
import Color from "color"
import { StyleSheet, View } from "react-native"
import { AiChatMessageItem } from "../types"

interface Props {
    aiMessages: AiChatMessageItem[]
    startDate: string
    endDate: string
}

type ItemGroup =
    | { kind: "single"; item: AiChatMessageItem; index: number }
    | { kind: "group"; type: string; items: { item: AiChatMessageItem; index: number }[] }

const TYPE_LABELS: Record<string, string> = {
    expense: "Expenses",
    subscription: "Subscriptions",
    event: "Events",
    goals: "Goals",
    flashcards: "Flashcards",
    chart: "Analysis",
    timelineWidget: "Timeline",
    data: "Results",
}

function groupItems(items: AiChatMessageItem[]): ItemGroup[] {
    const groups: ItemGroup[] = []
    let i = 0
    while (i < items.length) {
        const item = items[i]
        if (item.type === "text") {
            groups.push({ kind: "single", item, index: i })
            i++
            continue
        }
        const group: { item: AiChatMessageItem; index: number }[] = [{ item, index: i }]
        while (i + 1 < items.length && items[i + 1].type === item.type) {
            i++
            group.push({ item: items[i], index: i })
        }
        groups.push(
            group.length === 1
                ? { kind: "single", item, index: i }
                : { kind: "group", type: item.type, items: group },
        )
        i++
    }
    return groups
}

function GroupedSection({
    type,
    items,
    startDate,
    endDate,
}: {
    type: string
    items: { item: AiChatMessageItem; index: number }[]
    startDate: string
    endDate: string
}) {
    const label = TYPE_LABELS[type] ?? type
    return (
        <View style={s.section}>
            <View style={s.sectionHeader}>
                <Text style={s.sectionLabel}>{label}</Text>
                <View style={s.sectionBadge}>
                    <Text style={s.sectionBadgeText}>{items.length}</Text>
                </View>
            </View>
            <View style={s.sectionItems}>
                {items.map(({ item, index }, i) => (
                    <SkillCard
                        key={index}
                        skill={item}
                        startDate={startDate}
                        endDate={endDate}
                        animatedStyle={{
                            borderWidth: 0,
                            marginBottom: 0,
                            borderRadius: 0,
                            marginTop: 0,
                            borderBottomWidth: i < items.length - 1 ? StyleSheet.hairlineWidth : 0,
                            borderBottomColor: "rgba(255,255,255,0.08)",
                        }}
                    />
                ))}
            </View>
        </View>
    )
}

export default function AssistantBubble({ aiMessages, startDate, endDate }: Props) {
    const groups = groupItems(aiMessages)
    return (
        <View style={s.container}>
            {groups.map((group, gi) => {
                if (group.kind === "group") {
                    return (
                        <GroupedSection
                            key={gi}
                            type={group.type}
                            items={group.items}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    )
                }
                const { item, index } = group
                if (item.type === "text") {
                    const text = item.data?.trim()
                    if (!text) return null
                    return (
                        <View key={index} style={s.bubble}>
                            <Text selectable style={s.text}>
                                {text}
                            </Text>
                        </View>
                    )
                }
                return <SkillCard key={index} skill={item} startDate={startDate} endDate={endDate} />
            })}
        </View>
    )
}

const s = StyleSheet.create({
    container: { gap: 8, alignItems: "flex-start", marginBottom: 10 },
    bubble: {
        maxWidth: "90%",
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        padding: 12,
        backgroundColor: Colors.primary_lighter,
        borderWidth: 1,
        borderColor: Colors.foreground_hairline,
    },
    text: { fontSize: 14, lineHeight: 22, color: Colors.foreground },

    section: { alignSelf: "stretch", gap: 8 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
    sectionLabel: {
        fontSize: 11,
        fontFamily: FONTS.semibold,
        color: Colors.foreground_secondary,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    sectionBadge: {
        backgroundColor: Color(Colors.secondary).alpha(0.15).string(),
        borderRadius: 100,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    sectionBadgeText: { fontSize: 10, fontFamily: FONTS.semibold, color: Colors.secondary },
    sectionItems: {
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
    },
})
