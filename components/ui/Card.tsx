import Colors from "@/constants/Colors"
import Color from "color"
import { StyleSheet, View, ViewProps } from "react-native"
import Animated, { AnimatedProps } from "react-native-reanimated"
import Touch from "@/components/ui/Touch"

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
    const isPressable = ripple || rest?.onPress !== undefined

    if (isPressable) {
        return (
            <Touch
                {...(rest as any)}
                style={[styles.container, rest.style as any]}
                ref={ref}
            >
                {children}
            </Touch>
        )
    }

    return (
        <Animated.View
            {...(rest as any)}
            style={[styles.container, rest.style as any]}
            ref={ref}
        >
            {children}
        </Animated.View>
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
