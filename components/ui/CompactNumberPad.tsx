import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Entypo } from "@expo/vector-icons"
import { useRef } from "react"
import { Pressable, View } from "react-native"
import Feedback from "react-native-haptic-feedback"

interface CompactNumberPadProps {
    onKeyPress: (key: string) => void
    onBackPress?: () => void
    backgroundColor?: string
    foregroundColor?: string
    fontVariant?: "title" | "subtitle" | "body" | "caption"
    fontWeight?: "normal" | "bold"
}

const KEYS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "C"],
]

const CompactNumberPad = ({
    onKeyPress,
    onBackPress,
    backgroundColor = Colors.primary_light,
    foregroundColor = Colors.foreground,
    fontVariant = "body",
    fontWeight = "bold",
}: CompactNumberPadProps) => (
    <View style={{ gap: 5 }}>
        {KEYS.map((row) => (
            <View style={{ flexDirection: "row", gap: 5 }} key={row.join("")}>
                {row.map((key) => (
                    <NumberKey
                        key={key}
                        label={key}
                        onPress={() => onKeyPress(key)}
                        isBack={key === "C" && !!onBackPress}
                        onBackPress={onBackPress}
                        backgroundColor={backgroundColor}
                        foregroundColor={foregroundColor}
                        fontVariant={fontVariant}
                        fontWeight={fontWeight}
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
    backgroundColor,
    foregroundColor,
    fontVariant,
    fontWeight,
}: {
    label: string
    onPress: VoidFunction
    isBack: boolean
    onBackPress?: () => void
    backgroundColor: string
    foregroundColor: string
    fontVariant: "title" | "subtitle" | "body" | "caption"
    fontWeight: "normal" | "bold"
}) => {
    const interval = useRef<number | null>(null)

    const handlePress = () => {
        Feedback.trigger("impactLight")
        isBack ? onBackPress?.() : onPress()
    }

    return (
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
                flex: 1,
                height: 60,
                borderRadius: 15,
                backgroundColor,
                opacity: pressed ? 0.5 : 1,
                transform: [{ scale: pressed ? 0.88 : 1 }, { rotate: isBack ? "-90deg" : "0deg" }],
            })}
        >
            {isBack ? (
                <Entypo name="chevron-left" size={24} color={foregroundColor} />
            ) : (
                <Text variant={fontVariant} style={{ color: foregroundColor, fontWeight }}>
                    {label}
                </Text>
            )}
        </Pressable>
    )
}

export default CompactNumberPad
