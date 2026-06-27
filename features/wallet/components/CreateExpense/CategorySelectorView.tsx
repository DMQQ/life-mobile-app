import { CategoryUtils, Icons } from "../Expense/ExpenseIcon"
import { cloneElement, useState } from "react"
import Colors from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import { View, StyleSheet, ScrollView, TextInput } from "react-native"
import Ripple from "react-native-material-ripple"
import { Feather } from "@expo/vector-icons"
import Text from "@/components/ui/Text/Text"
import Feedback from "react-native-haptic-feedback"
import Color from "color"
import { CreateExpenseContext } from "@/features/wallet/context/CreateExpenseContext"
import { useContext } from "react"
import useTopCategories from "@/features/wallet/hooks/useTopCategories"

const EXCLUDED = ["edit", "none", "income", "refunded", "bell"]

const CategorySelector = (props?: { current?: string; onPress?: (item: string) => void; dismiss?: VoidFunction }) => {
    const ctx = useContext(CreateExpenseContext)

    const current = props?.current ?? ctx?.state.category ?? "none"
    const dismiss =
        props?.dismiss ??
        (() => {
            ctx?.methods.setView("main")
            ctx?.methods.setCategory("none")
        })
    const onPress =
        props?.onPress ??
        ((item: string) => {
            ctx?.methods.setIsSubscription(item === "subscription")
            ctx?.methods.setType("expense")
            ctx?.methods.setCategory(item as keyof typeof Icons)
            ctx?.methods.setView("main")
        })

    const [query, setQuery] = useState("")

    const { data: topData } = useTopCategories(10)
    const topCategories = (topData?.topCategories ?? []).filter(
        (t) => !EXCLUDED.includes(t.category) && Icons[t.category as keyof typeof Icons],
    )

    const allData = Object.entries(Icons).filter(([key]) => !EXCLUDED.includes(key))
    const filtered = query ? allData.filter(([key]) => key.toLowerCase().includes(query.toLowerCase())) : allData

    return (
        <View style={styles.container}>
            <View style={styles.searchRow}>
                <Feather name="search" size={15} color="rgba(255,255,255,0.4)" />
                <TextInput
                    placeholder="Search category..."
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    value={query}
                    onChangeText={setQuery}
                    style={styles.searchInput}
                    autoFocus
                />
                <Ripple onPress={dismiss} style={styles.closeBtn}>
                    <Feather name="x" size={15} color="rgba(255,255,255,0.5)" />
                </Ripple>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardDismissMode="on-drag">
                {!query && topCategories.length > 0 && (
                    <>
                        <Text style={styles.sectionLabel}>Most used</Text>
                        {topCategories.map((t) => (
                            <CategoryTile
                                key={t.category}
                                categoryKey={t.category}
                                current={current}
                                onPress={onPress}
                            />
                        ))}
                        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>All</Text>
                    </>
                )}

                {filtered.map(([key]) => (
                    <CategoryTile key={key} categoryKey={key} current={current} onPress={onPress} />
                ))}

                {filtered.length === 0 && (
                    <View style={styles.empty}>
                        <Text size={14} color="rgba(255,255,255,0.5)">No categories found</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

function CategoryTile({
    categoryKey,
    current,
    onPress,
}: {
    categoryKey: string
    current: string
    onPress: (key: string) => void
}) {
    const meta = Icons[categoryKey as keyof typeof Icons]
    if (!meta) return null
    const selected = categoryKey === current
    const labelColor = selected ? Color(meta.backgroundColor).lighten(0.5).hex() : "rgba(255,255,255,0.85)"

    return (
        <Ripple
            onPress={() => {
                Feedback.trigger("impactLight")
                onPress(categoryKey)
            }}
            style={[styles.tile, { backgroundColor: selected ? lowOpacity(meta.backgroundColor, 0.25) : Colors.primary_lighter }]}
        >
            <View style={styles.iconWrap}>
                {meta.icon &&
                    cloneElement(meta.icon as React.ReactElement<{ size: number; color: string }>, {
                        size: 20,
                        color: meta.backgroundColor,
                    })}
            </View>
            <Text flex={1} size={14} weight="500" color={labelColor} numberOfLines={1}>
                {categoryKey.includes(":")
                    ? `${CategoryUtils.getCategoryParent(categoryKey)} · ${CategoryUtils.getCategoryName(categoryKey)}`
                    : CategoryUtils.getCategoryName(categoryKey)}
            </Text>
            {selected && <Feather name="check" size={16} color={meta.backgroundColor} />}
        </Ripple>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 10,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary_lighter,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#fff",
        padding: 0,
    },
    closeBtn: {
        padding: 4,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.foreground_secondary,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    tile: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 16,
        borderRadius: 14,
        gap: 12,
        marginBottom: 8,
    },
    iconWrap: {
        width: 24,
        alignItems: "center",
    },
    empty: {
        padding: 20,
        alignItems: "center",
    },
})

export default CategorySelector
