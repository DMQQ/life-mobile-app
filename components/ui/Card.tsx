import Colors from "@/constants/Colors"
import { StyleSheet, View, ViewProps } from "react-native"
import Ripple from "react-native-material-ripple"
import Animated, { AnimatedProps } from "react-native-reanimated"

const AnimatedRipple = Animated.createAnimatedComponent(Ripple)

type CardProps<T extends boolean = false> = {
    animated?: T
    children?: React.ReactNode
    ripple?: boolean
    onPress?: () => void
    onLongPress?: () => void
    disabled?: boolean
} & (T extends true ? AnimatedProps<ViewProps> : ViewProps)

export default function Card<T extends boolean = false>({
    animated = false as T,
    ripple = false,
    children,
    ...rest
}: CardProps<T>) {
    const Component = (
        animated ? (ripple ? AnimatedRipple : Animated.View) : ripple ? Ripple : View
    ) as React.ComponentType<CardProps<T>>

    return (
        <Component {...(rest as any)} style={[styles.container, rest.style as any]}>
            {children}
        </Component>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderRadius: 20,
        width: "100%",
        backgroundColor: Colors.primary_lighter,
    },
})
