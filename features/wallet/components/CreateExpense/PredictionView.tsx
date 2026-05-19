import { View, StyleSheet, Pressable } from "react-native"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated"
import { useState } from "react"
import { CategoryIcon, CategoryUtils, Icons } from "../Expense/ExpenseIcon"
import Color from "color"
import { useCreateExpenseContext } from "@/features/wallet/context/CreateExpenseContext"

export default function PredictionView() {
    const { state, methods } = useCreateExpenseContext()
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) return null

    const item = state.prediction!
    const isBalanceEdit = item.description.includes("Balance edited") || item.amount === 0
    const amountColor =
        item.type === "expense" ? "#F07070" : item.type === "income" ? "#66E875" : Colors.secondary_light_2
    const sign = item.type === "expense" ? "-" : "+"
    const iconBg = Icons[item.category as keyof typeof Icons]?.backgroundColor ?? Colors.secondary
    const tint = Color(iconBg).alpha(0.15).string()

    const handleApply = () => {
        methods.applyPrediction()
        setDismissed(true)
    }

    return (
        <Animated.View entering={FadeInDown.duration(280)} exiting={FadeOutDown.duration(200)}>
            <View
                style={[
                    styles.tinted,
                    { backgroundColor: tint, borderWidth: 1, borderColor: Color(iconBg).alpha(0.5).string() },
                ]}
            >
                <Pressable onPress={handleApply} style={styles.body}>
                    <CategoryIcon
                        type={item.type as "income" | "expense" | "refunded"}
                        category={item.category as any}
                        size={16}
                        style={{ padding: 0 }}
                        containerStyle={{ width: 36, height: 36, borderRadius: 11 }}
                    />
                    <View style={styles.info}>
                        <Text style={styles.description} numberOfLines={1}>
                            {item.description}
                        </Text>
                        <Text style={styles.meta}>
                            {CategoryUtils.getCategoryName(item.category)}
                            {item.confidence ? ` · ${Math.round(item.confidence * 100)}%` : ""}
                        </Text>
                    </View>
                    {!isBalanceEdit && (
                        <Text style={[styles.amount, { color: amountColor }]}>
                            {sign}
                            {item.amount.toFixed(2)}
                            <Text style={[styles.currency, { color: amountColor }]}>zł</Text>
                        </Text>
                    )}
                </Pressable>

                <View style={styles.footer}>
                    <View style={styles.aiBadge}>
                        <Feather name="zap" size={10} color={Colors.foreground_disabled} />
                        <Text style={styles.aiBadgeText}>Smart prediction</Text>
                    </View>
                    <Pressable
                        onPress={handleApply}
                        hitSlop={8}
                        style={[styles.applyBtn, { backgroundColor: Color(iconBg).alpha(0.14).string() }]}
                    >
                        <Text style={[styles.applyBtnText, { color: Color(iconBg).lighten(0.25).string() }]}>
                            Apply
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    tinted: {
        overflow: "hidden",
        borderRadius: 20,
    },
    body: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    info: {
        flex: 1,
        gap: 2,
    },
    description: {
        color: Colors.foreground,
        fontSize: 15,
        fontWeight: "600",
    },
    meta: {
        color: Colors.foreground_secondary,
        fontSize: 12,
    },
    amount: {
        fontSize: 16,
        fontWeight: "700",
    },
    currency: {
        fontSize: 12,
        fontWeight: "500",
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        paddingBottom: 4,
    },
    aiBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    aiBadgeText: {
        color: Colors.foreground_disabled,
        fontSize: 11,
        fontWeight: "500",
    },
    applyBtn: {
        paddingVertical: 5,
        paddingHorizontal: 14,
        borderRadius: 100,
    },
    applyBtnText: {
        fontSize: 12,
        fontWeight: "700",
    },
})
