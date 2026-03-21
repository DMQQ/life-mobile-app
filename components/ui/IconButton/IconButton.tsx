import { SFSymbol } from "expo-symbols"
import Ripple, { RippleProps } from "react-native-material-ripple"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { SymbolView } from "expo-symbols"
import { SFSymbols6_0 } from "sf-symbols-typescript"

const AnimatedRipple = Animated.createAnimatedComponent(Ripple)

export default function IconButton(
    props: RippleProps & {
        icon: React.ReactNode | SFSymbols6_0
        size?: number
    },
) {
    const animatedPress = useSharedValue(1)

    const onPress = (ev: unknown) => {
        animatedPress.value = withTiming(0.8, { duration: 200 })

        if (props.onPress) {
            props.onPress(ev as any)
        }

        setTimeout(() => {
            animatedPress.value = withTiming(1, { duration: 100 })
        }, 100)
    }

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: animatedPress.value,
            },
        ],
    }))

    return (
        <AnimatedRipple
            {...props}
            style={[
                {
                    borderRadius: 100,
                    padding: 5,
                    justifyContent: "center",
                    alignItems: "center",
                },
                props.style,
                animatedStyle,
            ]}
            onPress={onPress}
        >
            {typeof props.icon === "string" ? (
                <SymbolView tintColor={"#fff"} name={props.icon as SFSymbols6_0} size={props.size ?? 20} />
            ) : (
                props.icon
            )}
        </AnimatedRipple>
    )
}
