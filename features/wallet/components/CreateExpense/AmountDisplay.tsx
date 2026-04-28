import moment from "moment"
import { StyleSheet, View } from "react-native"
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated"
import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import { useCreateExpenseContext } from "@/features/wallet/context/CreateExpenseContext"

export default function AmountDisplay() {
    const { state, methods, animated } = useCreateExpenseContext()
    const { amount, SubExpenses, date, type } = state
    const { transformX } = animated

    const animatedAmount = useAnimatedStyle(
        () => ({
            transform: [{ translateX: transformX.value }],

            fontSize: interpolate(amount.length, [0, 10, 15], [90, 60, 35], "clamp"),
        }),
        [amount],
    )

    return (
        <View style={styles.container}>
            <View>
                <Animated.Text style={[{ color: Colors.foreground, fontWeight: "bold", textAlign: "center" }, animatedAmount]}>
                    {amount}
                    <Text variant="body" style={{ fontSize: 20 }}>zł</Text>
                </Animated.Text>

                {SubExpenses.length > 0 && (
                    <Text variant="body" style={{ color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
                        {SubExpenses.length} item for ~{methods.calculateSubExpensesTotal().toFixed(2)}zł
                    </Text>
                )}
            </View>

            {moment(date).isAfter(moment()) && type && amount != "0" && (
                <View style={styles.scheduledContainer}>
                    <Text variant="caption" style={styles.scheduledText}>scheduled for {moment(date).format("DD MMMM YYYY")}</Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 250,
        justifyContent: "center",
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        paddingTop: 45,
        paddingHorizontal: 15,
    },
    scheduledContainer: { position: "absolute", justifyContent: "center", alignItems: "center", bottom: 25 },

    scheduledText: {
        color: "rgba(255,255,255,0.7)",
        textAlign: "center",
    },
})
