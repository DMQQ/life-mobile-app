import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Entypo } from "@expo/vector-icons"
import { useRef } from "react"
import { Pressable, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import { LiquidGlassView } from "@callstack/liquid-glass"

interface NumberPadProps {
    onKeyPress: (key: string) => void
    onBackPress?: () => void
}

const KEYS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "C"],
]

const NumberPad = ({ onKeyPress, onBackPress }: NumberPadProps) => (
    <View style={{ gap: 15, flex: 1, justifyContent: "center" }}>
        {KEYS.map((row) => (
            <View style={{ flexDirection: "row", gap: 15, justifyContent: "space-around" }} key={row.join("")}>
                {row.map((key) => (
                    <NumberKey
                        key={key}
                        label={key}
                        onPress={() => onKeyPress(key)}
                        isBack={key === "C" && !!onBackPress}
                        onBackPress={onBackPress}
                    />
                ))}
            </View>
        ))}
    </View>
)

const NumberKey = ({
    label,
    onPress,
    isBack,
    onBackPress,
}: {
    label: string
    onPress: VoidFunction
    isBack: boolean
    onBackPress?: () => void
}) => {
    const interval = useRef<NodeJS.Timeout | null>(null)

    const handlePress = () => {
        Feedback.trigger("impactLight")
        isBack ? onBackPress?.() : onPress()
    }

    return (
        <LiquidGlassView
            interactive
            tintColor={Colors.primary_light}
            style={{ width: "25%", height: 80, overflow: "hidden", borderRadius: 100 }}
        >
            <Pressable
                onPress={handlePress}
                onLongPress={() => {
                    if (interval.current || isBack) return
                    interval.current = setInterval(handlePress, 50)
                }}
                onPressOut={() => {
                    if (interval.current) {
                        clearInterval(interval.current)
                        interval.current = null
                    }
                }}
                style={({ pressed }) => ({
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                    opacity: pressed ? 0.5 : 1,
                    transform: [{ scale: pressed ? 0.88 : 1 }, { rotate: isBack ? "-90deg" : "0deg" }],
                })}
            >
                {isBack ? (
                    <Entypo name="chevron-left" size={40} color={Colors.foreground} />
                ) : (
                    <Text variant="title" style={{ color: Colors.foreground, fontWeight: "bold" }}>
                        {label}
                    </Text>
                )}
            </Pressable>
        </LiquidGlassView>
    )
}

export default NumberPad
