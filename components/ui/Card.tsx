import Layout from "@/constants/Layout"
import { StyleSheet, View, ViewProps } from "react-native"
import Animated, { AnimatedProps } from "react-native-reanimated"

type ContainerProps<T = boolean> = T extends AnimatedProps<ViewProps> ? AnimatedProps<ViewProps> : ViewProps

type CardProps<K = boolean> = ContainerProps<K> & {
    animated?: K
    children?: React.ReactNode
}

export default function Card({ animated = false, ...rest }: CardProps) {
    const Component = animated ? Animated.View : View

    return <Component {...rest} style={[styles.container, rest.style]}></Component>
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderRadius: 15,
        width: Layout.screen.width - 30,
    },
})
