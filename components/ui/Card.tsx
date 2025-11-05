import Colors from "@/constants/Colors"
import Color from "color"
import { Pressable, StyleSheet, View, ViewProps } from "react-native"
import Ripple from "react-native-material-ripple"
import Animated, { AnimatedProps } from "react-native-reanimated"

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

export default function Card<T extends boolean = false>({
    ref,

    animated = false as T,
    ripple = false,
    children,
    ...rest
}: CardProps<T>) {
    const Component = (
        animated ? (ripple ? AnimatedPressable : Animated.View) : ripple ? Ripple : View
    ) as React.ComponentType<CardProps<T>>

    return (
        <Component {...(rest as any)} style={[styles.container, rest.style as any]} ref={ref}>
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
        backgroundColor: Colors.primary_lighter,
        borderWidth: 1,
        borderColor: Color(Colors.primary_lighter).lighten(0.5).hex(),
    },
})
