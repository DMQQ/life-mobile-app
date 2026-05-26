import GlassView from "@/components/ui/GlassView"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { useEffect } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import Animated, {
    Easing,
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated"

const BRACKET = 22
const BRACKET_W = 2.5

const STEPS = [
    { label: "Uploading receipt", icon: "upload-cloud" as const },
    { label: "Analyzing content", icon: "eye" as const },
    { label: "Extracting data", icon: "cpu" as const },
]

export default function ProcessingOverlay({ step }: { step: number }) {
    const glowOpacity = useSharedValue(0.15)

    useEffect(() => {
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.45, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.15, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            false,
        )
    }, [])

    const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }))

    return (
        <View style={styles.processingOverlay}>
            <Animated.View style={[styles.processingBorder, glowStyle]} />

            <View style={[styles.bracket, styles.bracketTL]} />
            <View style={[styles.bracket, styles.bracketTR]} />
            <View style={[styles.bracket, styles.bracketBL]} />
            <View style={[styles.bracket, styles.bracketBR]} />

            <View style={styles.processingBottom}>
                <GlassView style={styles.processingIndicator}>
                    <ActivityIndicator color={Colors.secondary} size="small" />
                    <Text style={styles.processingLabel}>Analyzing receipt...</Text>
                </GlassView>

                <View style={styles.steps}>
                    {STEPS.map((s, i) => {
                        const done = i < step
                        const active = i === step
                        return (
                            <Animated.View
                                key={s.label}
                                entering={FadeIn.delay(i * 200)}
                                style={[styles.stepRow, active && styles.stepRowActive]}
                            >
                                <View
                                    style={[
                                        styles.stepIcon,
                                        done && styles.stepIconDone,
                                        active && styles.stepIconActive,
                                    ]}
                                >
                                    {done ? (
                                        <Feather name="check" size={12} color={Colors.secondary} />
                                    ) : (
                                        <Feather
                                            name={s.icon}
                                            size={12}
                                            color={active ? Colors.secondary : Colors.foreground_disabled}
                                        />
                                    )}
                                </View>
                                <Text
                                    style={[
                                        styles.stepLabel,
                                        active && styles.stepLabelActive,
                                        done && styles.stepLabelDone,
                                    ]}
                                >
                                    {s.label}
                                </Text>
                            </Animated.View>
                        )
                    })}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    processingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Color(Colors.primary).alpha(0.72).string(),
    },
    processingBorder: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: Colors.secondary,
    },
    bracket: {
        position: "absolute",
        width: BRACKET,
        height: BRACKET,
        borderColor: Colors.secondary,
    },
    bracketTL: {
        top: 16,
        left: 16,
        borderTopWidth: BRACKET_W,
        borderLeftWidth: BRACKET_W,
        borderTopLeftRadius: 6,
    },
    bracketTR: {
        top: 16,
        right: 16,
        borderTopWidth: BRACKET_W,
        borderRightWidth: BRACKET_W,
        borderTopRightRadius: 6,
    },
    bracketBL: {
        bottom: 16,
        left: 16,
        borderBottomWidth: BRACKET_W,
        borderLeftWidth: BRACKET_W,
        borderBottomLeftRadius: 6,
    },
    bracketBR: {
        bottom: 16,
        right: 16,
        borderBottomWidth: BRACKET_W,
        borderRightWidth: BRACKET_W,
        borderBottomRightRadius: 6,
    },
    processingBottom: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        gap: 10,
    },
    processingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 100,
        alignSelf: "center",
    },
    processingLabel: {
        color: Colors.foreground,
        fontSize: 14,
        fontWeight: "600",
    },
    steps: {
        gap: 6,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.5).string(),
        opacity: 0.45,
    },
    stepRowActive: {
        opacity: 1,
        backgroundColor: Color(Colors.secondary).alpha(0.1).string(),
        borderWidth: 1,
        borderColor: Color(Colors.secondary).alpha(0.22).string(),
    },
    stepIcon: {
        width: 26,
        height: 26,
        borderRadius: 8,
        backgroundColor: Color(Colors.primary_lighter).alpha(0.9).string(),
        justifyContent: "center",
        alignItems: "center",
    },
    stepIconActive: {
        backgroundColor: Color(Colors.secondary).alpha(0.18).string(),
    },
    stepIconDone: {
        backgroundColor: Color(Colors.secondary).alpha(0.12).string(),
    },
    stepLabel: {
        fontSize: 13,
        color: Colors.foreground_disabled,
        fontWeight: "500",
    },
    stepLabelActive: {
        color: Colors.foreground,
    },
    stepLabelDone: {
        color: Colors.foreground_secondary,
    },
})
