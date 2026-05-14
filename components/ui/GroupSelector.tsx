import { useEffect, useRef, useState } from "react"
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, withTiming, withSpring } from "react-native-reanimated"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import theme from "@/constants/Colors"
import GlassView from "./GlassView"

export interface GroupSelectorOption<V = string> {
    label: string
    value: V
}

interface GroupSelectorProps<V> {
    options: GroupSelectorOption<V>[]
    value: V
    onChange: (value: V) => void

    size?: "xs" | "small" | "medium" | "large"
}

const GAP = 5
const SNAP_SPRING = { damping: 20, stiffness: 300 }
const LIQUID_SPRING = { damping: 10, stiffness: 150, mass: 0.5 }

const SIZE_CONFIG = {
    xs: { height: 24, padding: 2.5, fontSize: 10, pillRadius: 10, containerRadius: 14 },
    small: { height: 36, padding: 6, fontSize: 11, pillRadius: 10, containerRadius: 18 },
    medium: { height: 45, padding: 8, fontSize: 12, pillRadius: 12, containerRadius: 22 },
    large: { height: 55, padding: 10, fontSize: 13, pillRadius: 15, containerRadius: 25 },
}

export default function GroupSelector<V>({ options, value, onChange, size = "large" }: GroupSelectorProps<V>) {
    const { height, padding, fontSize, pillRadius, containerRadius } = SIZE_CONFIG[size]
    const PADDING = padding
    const [containerWidth, setContainerWidth] = useState(0)
    const isFirstLayout = useRef(true)

    const segmentWidth =
        containerWidth > 0 ? (containerWidth - PADDING * 2 - (options.length - 1) * GAP) / options.length : 0
    const step = segmentWidth + GAP

    const selectedIndex = options.findIndex((o) => o.value === value)

    const translateX = useSharedValue(0)
    const scaleX = useSharedValue(1)
    const scaleY = useSharedValue(1)
    const opacity = useSharedValue(1)

    useEffect(() => {
        if (segmentWidth > 0 && selectedIndex >= 0) {
            if (isFirstLayout.current) {
                translateX.value = selectedIndex * step
                isFirstLayout.current = false
            } else {
                translateX.value = withTiming(selectedIndex * step, { duration: 150 })
            }
        }
    }, [selectedIndex, step, segmentWidth])

    const fireChange = (newValue: V) => {
        if (newValue !== value) {
            onChange(newValue)
        }
    }

    const panGesture = Gesture.Pan()
        .onStart(() => {
            translateX.value = selectedIndex * step
            scaleX.value = withSpring(0.97, SNAP_SPRING)
            scaleY.value = withSpring(0.97, SNAP_SPRING)
            opacity.value = withSpring(0.72, SNAP_SPRING)
        })
        .onUpdate((e) => {
            const maxX = (options.length - 1) * step
            translateX.value = Math.max(0, Math.min(maxX, selectedIndex * step + e.translationX))
            const vf = Math.min(Math.abs(e.velocityX) / 1200, 0.08)
            if (e.velocityX > 0) {
                scaleX.value = withSpring(1 + vf, LIQUID_SPRING)
                scaleY.value = withSpring(1 - vf, LIQUID_SPRING)
            } else if (e.velocityX < 0) {
                scaleX.value = withSpring(1 - vf, LIQUID_SPRING)
                scaleY.value = withSpring(1 + vf, LIQUID_SPRING)
            }
        })
        .onEnd(() => {
            const rawIndex = translateX.value / step
            const clampedIndex = Math.max(0, Math.min(options.length - 1, Math.round(rawIndex)))
            translateX.value = withSpring(clampedIndex * step, SNAP_SPRING)
            scaleX.value = withSpring(1, LIQUID_SPRING)
            scaleY.value = withSpring(1, LIQUID_SPRING)
            opacity.value = withSpring(1, LIQUID_SPRING)
            runOnJS(fireChange)(options[clampedIndex].value)
        })

    const pillStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }, { scaleX: scaleX.value }, { scaleY: scaleY.value }],
        width: segmentWidth,
    }))

    const onLayout = (e: LayoutChangeEvent) => {
        setContainerWidth(e.nativeEvent.layout.width)
    }

    const dynamicStyles = {
        container: { borderRadius: containerRadius, padding: PADDING, height },
        pill: { top: PADDING, left: PADDING, height: height - PADDING * 2, borderRadius: pillRadius },
        label: { fontSize },
    }

    return (
        <GlassView style={[styles.container, dynamicStyles.container]} onLayout={onLayout}>
            {segmentWidth > 0 && (
                <Animated.View style={[styles.pill, dynamicStyles.pill, pillStyle]}>
                    <GlassView interactive style={StyleSheet.absoluteFill} tintColor={theme.secondary} />
                </Animated.View>
            )}
            {segmentWidth > 0 && (
                <GestureDetector gesture={panGesture}>
                    <View style={styles.optionsRow}>
                        {options.map((option, i) => {
                            const selected = option.value === value
                            return (
                                <Pressable
                                    key={String(option.value)}
                                    onPress={() => onChange(option.value)}
                                    style={styles.segment}
                                >
                                    <Text style={[styles.label, dynamicStyles.label, selected && styles.labelSelected]}>
                                        {option.label}
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </View>
                </GestureDetector>
            )}
        </GlassView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.primary_lighter,
    },
    pill: {
        position: "absolute",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    optionsRow: {
        flexDirection: "row",
        gap: GAP,
        flex: 1,
    },
    segment: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 9,
    },
    label: {
        fontWeight: "500",
        color: theme.foreground_secondary,
        letterSpacing: -0.1,
    },
    labelSelected: {
        color: theme.foreground,
        fontWeight: "600",
    },
})
