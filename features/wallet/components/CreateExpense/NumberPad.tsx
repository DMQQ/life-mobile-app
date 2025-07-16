import Colors from "@/constants/Colors"
import { Entypo } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { memo, useRef } from "react"
import { Text, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated"

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
                    <View style={{ flexDirection: "row", gap: 15 }} key={row.toString()}>
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

const AnimatedRipple = Animated.createAnimatedComponent(Ripple)

const NumpadNumber = (props: {
    onPress: VoidFunction
    num: string | number
    rotateBackButton: boolean
    navigation: any
}) => {
    const scale = useSharedValue(1)

    const onPress = () => {
        Feedback.trigger("impactLight")

        props.num === "C" && props.rotateBackButton ? props.navigation.goBack() : props.onPress()

        scale.value = withSequence(withSpring(1.5, { duration: 100 }), withSpring(1, { duration: 200 }))
    }

    const animatedScale = useAnimatedStyle(
        () => ({
            transform: [
                { scale: scale.value },
                {
                    rotate: withTiming(props.num === "C" && props.rotateBackButton ? "-90deg" : "0deg", {
                        duration: 150,
                    }),
                },
            ],
        }),
        [props.rotateBackButton],
    )

    const interval = useRef<NodeJS.Timeout | null>(null)

    return (
        <View style={{ width: "30%", height: 75, overflow: "hidden" }}>
            <AnimatedRipple
                rippleCentered
                rippleColor={Colors.secondary}
                rippleSize={50}
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
                style={[
                    { justifyContent: "center", alignItems: "center", width: "100%", height: "100%" },
                    animatedScale,
                ]}
            >
                {props.num === "C" ? (
                    <Entypo name="chevron-left" size={40} color="#fff" />
                ) : (
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 28 }}>{props.num}</Text>
                )}
            </AnimatedRipple>
        </View>
    )
}

export default NumbersPad
