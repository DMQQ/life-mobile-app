import Colors from "@/constants/Colors"
import Color from "color"
import { Pressable, PressableProps, StyleSheet, View, ViewProps } from "react-native"
import Animated, {
    AnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type CardProps<T extends boolean = false> = {
    animated?: T
    children?: React.ReactNode
    ripple?: boolean
    onPress?: () => void
    onLongPress?: () => void
    disabled?: boolean
    ref?: React.RefObject<View | null>
} & (T extends true ? AnimatedProps<ViewProps> : ViewProps)

const Clickable = (props: PressableProps) => {
    return <AnimatedPressable {...props} style={[props.style]} />
}

export default function Card<T extends boolean = false>({
    ref,
    animated = false as T,
    ripple = false,
    children,
    ...rest
}: CardProps<T>) {
    const scale = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    const handlePressIn = () => {
        scale.value = withSequence(withSpring(0.97, { duration: 200 }), withSpring(1, { duration: 200 }))
    }

    const isPressable = ripple || rest?.onPress !== undefined
    const Component = (
        animated ? (ripple ? Clickable : Animated.View) : isPressable ? Clickable : Animated.View
    ) as React.ComponentType<CardProps<T>>

    return (
        <Component
            {...(rest as any)}
            style={[styles.container, rest.style as any, animatedStyle]}
            ref={ref}
            onPressIn={isPressable ? handlePressIn : undefined}
        >
            {children}
        </Component>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        paddingHorizontal: 15,
        borderRadius: 25,
        width: "100%",
        borderWidth: 1,
        borderColor: Colors.borderColor + "50",
        backgroundColor: Color(Colors.primary_lighter).alpha(0.5).string(),
    },
})
