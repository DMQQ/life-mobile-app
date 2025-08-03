import Ripple, { RippleProps } from "react-native-material-ripple"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

const AnimatedRipple = Animated.createAnimatedComponent(Ripple)

export default function IconButton(
    props: RippleProps & {
        icon: React.ReactNode
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
            {props.icon}
        </AnimatedRipple>
    )
}
