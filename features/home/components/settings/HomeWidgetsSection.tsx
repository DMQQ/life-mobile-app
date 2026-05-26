import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { WIDGETS, WidgetDefinition } from "@/features/home/widgets/registry"
import { Feather } from "@expo/vector-icons"
import { useCallback, useEffect } from "react"
import { StyleSheet, Switch, View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Feedback from "react-native-haptic-feedback"
import Animated, {
    Easing,
    runOnJS,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { useHomeWidgets } from "../../hooks/useHomeWidgets"
import { CARD_BG, IconBox, SectionLabel } from "./SettingsComponents"
import Color from "color"

const ITEM_HEIGHT = 140
const ROW_H = 56
const PREVIEW_H = 72
const GAP = 8
const CARD_H = ITEM_HEIGHT - GAP

const SNAP: Parameters<typeof withTiming>[1] = { duration: 220, easing: Easing.out(Easing.cubic) }
const LIFT: Parameters<typeof withTiming>[1] = { duration: 150, easing: Easing.out(Easing.quad) }

const WRAPPER_BG = Color(CARD_BG).darken(0.15).string()

function haptic() {
    Feedback.trigger("impactMedium")
}

interface SortableWidgetRowProps {
    widget: WidgetDefinition
    enabled: boolean
    onToggle: (v: boolean) => void
    positions: SharedValue<Record<string, number>>
    commitOrder: () => void
}

function SortableWidgetRow({ widget, enabled, onToggle, positions, commitOrder }: SortableWidgetRowProps) {
    const isDragging = useSharedValue(false)
    const dragY = useSharedValue(0)

    const containerStyle = useAnimatedStyle(() => {
        const idx = positions.value[widget.key] ?? 0
        const y = isDragging.value ? dragY.value : withTiming(idx * ITEM_HEIGHT, SNAP)
        const scale = withTiming(isDragging.value ? 1.025 : 1, LIFT)
        return {
            transform: [{ translateY: y }, { scale }],
            shadowOpacity: withTiming(isDragging.value ? 0.35 : 0, LIFT),
            zIndex: isDragging.value ? 999 : 1,
            elevation: isDragging.value ? 10 : 0,
        }
    })

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withTiming(isDragging.value ? 1.18 : 1, LIFT) }],
    }))

    const gesture = Gesture.Pan()
        .activateAfterLongPress(220)
        .onBegin(() => {
            isDragging.value = true
            dragY.value = (positions.value[widget.key] ?? 0) * ITEM_HEIGHT
            runOnJS(haptic)()
        })
        .onChange(({ changeY }) => {
            dragY.value += changeY
            const clamped = Math.max(0, Math.min(WIDGETS.length - 1, Math.round(dragY.value / ITEM_HEIGHT)))
            if (clamped !== positions.value[widget.key]) {
                const swapKey = Object.keys(positions.value).find((k) => positions.value[k] === clamped)
                if (swapKey) {
                    positions.value = {
                        ...positions.value,
                        [swapKey]: positions.value[widget.key],
                        [widget.key]: clamped,
                    }
                }
            }
        })
        .onFinalize(() => {
            isDragging.value = false
            dragY.value = withTiming((positions.value[widget.key] ?? 0) * ITEM_HEIGHT, SNAP)
            runOnJS(commitOrder)()
        })

    const accentBg = enabled ? widget.accentColor : Colors.text_dark

    return (
        <Animated.View style={[s.itemContainer, containerStyle]}>
            <View style={[s.card, !enabled && s.cardDisabled]}>
                <View style={[s.accentStripe, { backgroundColor: widget.accentColor }]} />

                <View style={[s.topRow, { height: ROW_H }]}>
                    <GestureDetector gesture={gesture}>
                        <Animated.View style={iconStyle} hitSlop={10}>
                            <IconBox bg={accentBg}>
                                <Feather name={widget.icon as any} size={16} color="#fff" />
                            </IconBox>
                        </Animated.View>
                    </GestureDetector>

                    <View style={s.labels}>
                        <Text variant="body" style={!enabled && s.disabledText}>
                            {widget.label}
                        </Text>
                        <Text variant="caption" style={s.subtitle}>
                            {widget.subtitle}
                        </Text>
                    </View>

                    <Switch
                        value={enabled}
                        onValueChange={onToggle}
                        trackColor={{ false: "rgba(255,255,255,0.12)", true: widget.accentColor }}
                        thumbColor="#fff"
                    />
                </View>

                <View style={s.separator} />

                <View style={s.preview}>
                    <widget.Preview />
                </View>
            </View>
        </Animated.View>
    )
}

export default function HomeWidgetsSection() {
    const { enabled, order, toggleWidget, reorder } = useHomeWidgets()

    const positions = useSharedValue<Record<string, number>>(
        Object.fromEntries(order.map((k, i) => [k, i])),
    )

    useEffect(() => {
        positions.value = Object.fromEntries(order.map((k, i) => [k, i]))
    }, [order])

    const commitOrder = useCallback(() => {
        const pos = positions.value
        const newOrder = WIDGETS.map((w) => w.key).sort((a, b) => (pos[a] ?? 0) - (pos[b] ?? 0))
        reorder(newOrder)
    }, [positions, reorder])

    return (
        <View>
            <SectionLabel title="Widgets" />
            <View style={s.wrapper}>
                <View style={{ height: WIDGETS.length * ITEM_HEIGHT }}>
                    {WIDGETS.map((widget) => (
                        <SortableWidgetRow
                            key={widget.key}
                            widget={widget}
                            enabled={enabled[widget.key] ?? true}
                            onToggle={(v) => toggleWidget(widget.key, v)}
                            positions={positions}
                            commitOrder={commitOrder}
                        />
                    ))}
                </View>
            </View>
        </View>
    )
}

const s = StyleSheet.create({
    wrapper: {
        backgroundColor: WRAPPER_BG,
        borderRadius: 20,
        padding: 8,
        overflow: "hidden",
    },
    itemContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: CARD_H,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
    },
    card: {
        flex: 1,
        backgroundColor: CARD_BG,
        borderRadius: 14,
        overflow: "hidden",
    },
    cardDisabled: {
        opacity: 0.4,
    },
    accentStripe: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        gap: 12,
    },
    labels: {
        flex: 1,
        gap: 1,
    },
    subtitle: {
        color: Colors.text_dark,
    },
    disabledText: {
        opacity: 0.45,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(255,255,255,0.06)",
    },
    preview: {
        height: PREVIEW_H,
        backgroundColor: Color(CARD_BG).darken(0.1).string(),
        justifyContent: "center",
        overflow: "hidden",
    },
})
