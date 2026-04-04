import Colors from "@/constants/Colors"
import { Entypo } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { memo, useRef } from "react"
import { Pressable, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Feedback from "react-native-haptic-feedback"
import Animated, { FadeInDown } from "react-native-reanimated"
import { LiquidGlassView } from "@callstack/liquid-glass"

const NumbersPad = memo(
    ({
        handleAmountChange,
        rotateBackButton,
    }: {
        handleAmountChange: (val: string) => void
        rotateBackButton: boolean
    }) => {
        const navigation = useNavigation()

        const onPress = (num: string | number) => {
            return () => {
                Feedback.trigger("impactLight")
                handleAmountChange(num.toString())
            }
        }

        return (
            <Animated.View entering={FadeInDown} style={{ gap: 15, flex: 1, justifyContent: "center" }}>
                {[
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9],
                    [".", 0, "C"],
                ].map((row) => (
                    <View
                        style={{ flexDirection: "row", gap: 15, justifyContent: "space-around" }}
                        key={row.toString()}
                    >
                        {row.map((num) => (
                            <NumpadNumber
                                navigation={navigation}
                                rotateBackButton={rotateBackButton}
                                num={num}
                                key={num.toString()}
                                onPress={onPress(num)}
                            />
                        ))}
                    </View>
                ))}
            </Animated.View>
        )
    },
)

const NumpadNumber = (props: {
    onPress: VoidFunction
    num: string | number
    rotateBackButton: boolean
    navigation: any
}) => {
    const interval = useRef<NodeJS.Timeout | null>(null)

    const isBackButton = props.num === "C"
    const shouldGoBack = isBackButton && props.rotateBackButton

    const onPress = () => {
        Feedback.trigger("impactLight")
        shouldGoBack ? props.navigation.goBack() : props.onPress()
    }

    return (
        <LiquidGlassView
            interactive
            tintColor={Colors.primary_light}
            style={{ width: "25%", height: 80, overflow: "hidden", borderRadius: 100 }}
        >
            <Pressable
                onPress={onPress}
                onLongPress={() => {
                    if (interval.current) clearInterval(interval.current!)
                    interval.current = setInterval(() => {
                        onPress()
                    }, 50)
                }}
                onPressOut={() => {
                    if (interval.current) clearInterval(interval.current!)
                }}
                style={({ pressed }) => ({
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    height: "100%",
                    opacity: pressed ? 0.5 : 1,
                    transform: [
                        { scale: pressed ? 0.88 : 1 },
                        { rotate: shouldGoBack ? "-90deg" : "0deg" },
                    ],
                })}
            >
                {isBackButton ? (
                    <Entypo name="chevron-left" size={40} color={Colors.foreground} />
                ) : (
                    <Text variant="title" style={{ color: Colors.foreground, fontWeight: "bold" }}>
                        {props.num}
                    </Text>
                )}
            </Pressable>
        </LiquidGlassView>
    )
}

export default NumbersPad
