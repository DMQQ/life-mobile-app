import Colors from "@/constants/Colors"
import { StyleSheet, View, ViewProps } from "react-native"
import Animated, { AnimatedProps } from "react-native-reanimated"

type CardProps<T extends boolean = false> = {
    animated?: T
    children?: React.ReactNode
} & (T extends true ? AnimatedProps<ViewProps> : ViewProps)

export default function Card<T extends boolean = false>({ animated = false as T, children, ...rest }: CardProps<T>) {
    const Component = animated ? Animated.View : View

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
