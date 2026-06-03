import { formatAmount } from "@/utils/functions/formatCurrency"
import { Rounded } from "@/constants/Layout"
import { FONTS } from "@/constants/Fonts"
import { Pressable, StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Color from "color"
import { CategoryIcon, CategoryUtils, Icons } from "../Expense/ExpenseIcon"
import { useEffect, useMemo, useState } from "react"
import { Feather } from "@expo/vector-icons"

interface ICategory {
    category: string
    percentage: number
    total: number
    count: string
}

interface LegendProps {
    totalSum: number
    onPress: (item: ICategory) => void
    selected: string
    onLongPress?: (item: ICategory) => void
    excluded?: string[]
    startDate: string
    endDate: string
    detailed: string
    toggleMode: () => void
    statisticsLegendData: {
        statisticsLegend: ICategory[]
    }
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

interface TileProps {
    item: ICategory
    isSelected: boolean
    isExcluded: boolean
    percentage: number
    isLastOdd: boolean
    onPress: () => void
    onLongPress?: () => void
}

function LegendTile({ item, isSelected, isExcluded, percentage, isLastOdd, onPress, onLongPress }: TileProps) {
    const accentColor = Icons[item.category as keyof typeof Icons]?.backgroundColor ?? Colors.secondary

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
                s.tile,
                isLastOdd && s.tileFullWidth,
                isSelected && s.tileSelected,
                isExcluded && s.tileExcluded,
                pressed && { opacity: 0.7 },
            ]}
        >
            <View style={s.amountRow}>
                <Text style={s.amount}>{formatAmount(item.total, 0)}zł</Text>
                <Text style={s.pct}>{percentage.toFixed(1)}%</Text>
            </View>

            <View style={s.categoryRow}>
                <View style={[s.iconWrap, { backgroundColor: Color(accentColor).alpha(0.15).string() }]}>
                    <CategoryIcon size={20} category={item.category as any} type="expense" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={s.categoryName} numberOfLines={1}>
                        {capitalize(CategoryUtils.getCategoryName(item.category ?? "None"))}
                    </Text>
                    <Text style={s.txnCount}>{item.count} Transactions</Text>
                </View>
            </View>

            <View style={s.track}>
                <View style={[s.fill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: accentColor }]} />
            </View>
        </Pressable>
    )
}

export default function Legend(props: LegendProps) {
    const [data, setData] = useState<ICategory[]>(props.statisticsLegendData?.statisticsLegend ?? [])
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        if (props.statisticsLegendData?.statisticsLegend?.length > 0) {
            setData(props.statisticsLegendData.statisticsLegend)
        }
    }, [props.statisticsLegendData])

    const tiles = useMemo(
        () =>
            data.slice(0, showAll ? data.length : 8).map((item, index) => {
                const isExcluded = props.excluded?.includes(item.category) ?? false
                const percentage =
                    (props.excluded?.length ?? 0) > 0
                        ? (item.total / props.totalSum) * 100
                        : item.percentage
                const isLastOdd = data.length - 1 === index && data.length % 2 === 1

                return (
                    <LegendTile
                        key={item.category}
                        item={item}
                        isSelected={props.selected === item.category}
                        isExcluded={isExcluded}
                        percentage={percentage}
                        isLastOdd={isLastOdd}
                        onPress={() => props.onPress(item)}
                        onLongPress={props.onLongPress ? () => props.onLongPress!(item) : undefined}
                    />
                )
            }),
        [data, props.selected, props.excluded, props.totalSum, showAll],
    )

    if (data.length === 0) return null

    return (
        <View style={s.container}>
            <View style={s.header}>
                <View>
                    <Text style={s.headerTitle}>Chart legend</Text>
                    <Text style={s.headerSub}>Spending breakdown by category</Text>
                </View>
                <Pressable onPress={props.toggleMode} style={s.toggleBtn}>
                    <Feather name="repeat" size={13} color={Colors.secondary} />
                    <Text style={s.toggleBtnText}>{props.detailed}</Text>
                </Pressable>
            </View>

            <View style={s.grid}>{tiles}</View>

            {data.length > 8 && (
                <Pressable onPress={() => setShowAll((p) => !p)} style={s.showMore}>
                    <Text style={s.showMoreText}>{showAll ? "Show less" : `Show all (${data.length})`}</Text>
                    <Feather name={showAll ? "chevron-up" : "chevron-down"} size={13} color={Colors.secondary} />
                </Pressable>
            )}
        </View>
    )
}

const s = StyleSheet.create({
    container: { marginTop: 15, gap: 16 },

    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerTitle: { fontFamily: FONTS.bold, fontSize: 20, color: Colors.foreground },
    headerSub: { fontSize: 13, color: Colors.foreground_secondary, marginTop: 3 },
    toggleBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: Rounded.full,
        backgroundColor: Color(Colors.secondary).alpha(0.1).string(),
        borderWidth: 1,
        borderColor: Color(Colors.secondary).alpha(0.25).string(),
    },
    toggleBtnText: { fontSize: 12, fontWeight: "500", color: Colors.secondary },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 12,
    },

    tile: {
        width: "48.5%",
        backgroundColor: Colors.primary_lighter,
        borderRadius: Rounded.xxl,
        padding: 18,
        paddingBottom: 26,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },
    tileFullWidth: { width: "100%" },
    tileSelected: {
        borderColor: Color(Colors.secondary).alpha(0.4).string(),
        backgroundColor: Color(Colors.secondary).alpha(0.07).string(),
    },
    tileExcluded: { opacity: 0.4 },

    amountRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    amount: { fontFamily: FONTS.bold, fontSize: 22, color: Colors.foreground },
    pct: { fontSize: 13, color: Colors.foreground_secondary, paddingBottom: 2 },

    categoryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    categoryName: { fontFamily: FONTS.semibold, fontSize: 13, color: Colors.foreground },
    txnCount: { fontSize: 11, color: Colors.foreground_secondary, marginTop: 2 },

    track: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: "rgba(255,255,255,0.06)",
    },
    fill: { height: 4, borderRadius: 2 },

    showMore: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
    },
    showMoreText: { fontFamily: FONTS.semibold, fontSize: 13, color: Colors.secondary },
})
