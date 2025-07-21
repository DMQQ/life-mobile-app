import moment from "moment"
import { StyleSheet, Text, View } from "react-native"
import Animated, { interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated"
import Colors from "@/constants/Colors"

interface AmountDisplayProps {
    amount: string
    subExpensesLength: number

    date: string

    calculateSubExpensesTotal: () => number

    transformX: SharedValue<number>

    type: string
}

export default function AmountDisplay({
    amount,
    subExpensesLength,
    date,
    calculateSubExpensesTotal,
    transformX,
    type,
}: AmountDisplayProps) {
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
                    <Text style={{ fontSize: 20 }}>zł</Text>
                </Animated.Text>

                {subExpensesLength > 0 && (
                    <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, textAlign: "center" }}>
                        {subExpensesLength} item for ~{calculateSubExpensesTotal().toFixed(2)}zł
                    </Text>
                )}
            </View>

            {moment(date).isAfter(moment()) && type && amount != "0" && (
                <View style={styles.scheduledContainer}>
                    <Text style={styles.scheduledText}>scheduled for {moment(date).format("DD MMMM YYYY")}</Text>
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
        fontSize: 12,
        textAlign: "center",
    },
})
