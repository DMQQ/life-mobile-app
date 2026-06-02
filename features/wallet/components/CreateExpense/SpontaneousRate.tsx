import Colors from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import Color from "color"
import { ScrollView, StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import { useCreateExpenseContext } from "@/features/wallet/context/CreateExpenseContext"

const spontaneousOptions = [
    {
        label: "Budgeted for",
        value: 0,
        icon: "📅",
    },
    {
        label: "Planned purchase",
        value: 20,
        icon: "📝",
    },
    {
        label: "Sale opportunity",
        value: 40,
        icon: "🏷️",
    },
    {
        label: "Quick decision",
        value: 60,
        icon: "⏱️",
    },
    {
        label: "Spontaneous treat",
        value: 80,
        icon: "🍦",
    },
    {
        label: "Complete impulse",
        value: 100,
        icon: "🛍️",
    },
]

export const getRateColor = (rate: number): string => {
    if (rate <= 20) return "#66E875"
    if (rate <= 60) return "#FFA726"
    return "#F07070"
}

export const SpontaneousRateChip = ({ value, onPress }: { value: number; onPress: () => void }) => {
    const selectedOption = spontaneousOptions.find((option) => option.value === value) || spontaneousOptions[0]
    const color = getRateColor(value)

    return (
        <Ripple
            onPress={onPress}
            style={[
                styles.chip,
                {
                    backgroundColor: value === 0 ? Colors.primary_lighter : `${color}30`,
                    borderColor: value === 0 ? Color(Colors.primary_lighter).lighten(0.25).hex() : `${color}30`,
                    borderWidth: 2,
                    borderRadius: 15,
                },
            ]}
        >
            <Text size={15}>{selectedOption.icon}</Text>
            <Text size={14} weight="500" color={value === 0 ? "rgba(255,255,255,0.7)" : color}>
                Spontaneous
            </Text>
        </Ripple>
    )
}

export const SpontaneousRateSelector = ({ onDismiss }: { onDismiss?: () => void } = {}) => {
    const { state, methods } = useCreateExpenseContext()
    const value = state.spontaneousRate
    const setValue = methods.setSpontaneousRate
    const dismiss = onDismiss ?? (() => methods.setView("main"))

    return (
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {spontaneousOptions.map((option) => {
                const color = getRateColor(option.value)
                const selected = option.value === value
                return (
                    <Ripple
                        key={option.value}
                        style={[
                            styles.tile,
                            { backgroundColor: selected ? lowOpacity(color, 0.25) : Colors.primary_lighter },
                        ]}
                        onPress={() => {
                            Feedback.trigger("impactLight")
                            setValue(option.value)
                            setTimeout(() => dismiss(), 300)
                        }}
                    >
                        <Text size={20} align="center" style={{ width: 24 }}>{option.icon}</Text>
                        <Text flex={1} size={14} weight="500" color={selected ? color : "rgba(255,255,255,0.85)"}>
                            {option.label}
                        </Text>
                        <View style={[styles.badge, { backgroundColor: color, opacity: selected ? 1 : 0.3 }]}>
                            <Text size={12} weight="bold" color="#fff">{option.value}%</Text>
                        </View>
                    </Ripple>
                )
            })}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    chip: {
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 15,
        flex: 1,
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
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
})
