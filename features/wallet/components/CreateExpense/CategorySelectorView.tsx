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

    const data = Object.entries(Icons).filter(([key]) => !["edit", "none", "income", "refunded", "bell"].includes(key))

    const filtered = query ? data.filter(([key]) => key.toLowerCase().includes(query.toLowerCase())) : data

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
                {filtered.map(([key, meta]) => {
                    const selected = key === current
                    const labelColor = selected
                        ? Color(meta.backgroundColor).lighten(0.5).hex()
                        : "rgba(255,255,255,0.85)"
                    return (
                        <Ripple
                            key={key}
                            onPress={() => {
                                Feedback.trigger("impactLight")
                                onPress(key)
                            }}
                            style={[
                                styles.tile,
                                {
                                    backgroundColor: selected
                                        ? lowOpacity(meta.backgroundColor, 0.25)
                                        : Colors.primary_lighter,
                                },
                            ]}
                        >
                            <View style={styles.iconWrap}>
                                {Icons[key as keyof typeof Icons]?.icon &&
                                    cloneElement(
                                        Icons[key as keyof typeof Icons].icon as React.ReactElement<{
                                            size: number
                                            color: string
                                        }>,
                                        { size: 20, color: meta.backgroundColor },
                                    )}
                            </View>
                            <Text flex={1} size={14} weight="500" color={labelColor} numberOfLines={1}>
                                {key.includes(":")
                                    ? `${CategoryUtils.getCategoryParent(key)} · ${CategoryUtils.getCategoryName(key)}`
                                    : CategoryUtils.getCategoryName(key)}
                            </Text>
                            {selected && <Feather name="check" size={16} color={meta.backgroundColor} />}
                        </Ripple>
                    )
                })}
                {filtered.length === 0 && (
                    <View style={styles.empty}>
                        <Text size={14} color="rgba(255,255,255,0.5)">No categories found</Text>
                    </View>
                )}
            </ScrollView>
        </View>
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
