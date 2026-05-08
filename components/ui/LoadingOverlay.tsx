import { ActivityIndicator, StyleSheet, View } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import Text from "./Text/Text"
import Colors from "@/constants/Colors"

interface LoadingOverlayProps {
    visible: boolean
    label?: string
}

export default function LoadingOverlay({ visible, label }: LoadingOverlayProps) {
    if (!visible) return null

    return (
        <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(250)}
            style={styles.overlay}
        >
            <View style={styles.content}>
                <ActivityIndicator size="large" color={Colors.secondary} />
                {label && (
                    <Text variant="caption" style={styles.label}>
                        {label}
                    </Text>
                )}
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.primary + "CC",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
    },
    content: {
        alignItems: "center",
        gap: 12,
    },
    label: {
        color: Colors.foreground_secondary,
    },
})
