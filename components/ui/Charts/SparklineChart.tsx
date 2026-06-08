import { useEffect, useId, useMemo, useRef, useState } from "react"
import { formatAmount } from "@/utils/functions/formatCurrency"
import { StyleSheet, TextInput, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Color from "color"
import Svg, { Defs, Line, LinearGradient as SvgGrad, Path, Stop, Text as SvgText } from "react-native-svg"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
    Easing,
    runOnJS,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import Feedback from "react-native-haptic-feedback"

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

const PAD_X = 10
const PAD_TOP = 12
const PAD_BOTTOM = 8

type Point = { x: number; y: number }

function smoothPath(pts: Point[]): string {
    if (pts.length < 2) return ""
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
        const p0 = pts[Math.max(i - 2, 0)]
        const p1 = pts[i - 1]
        const p2 = pts[i]
        const p3 = pts[Math.min(i + 1, pts.length - 1)]
        const cp1x = p1.x + (p2.x - p0.x) / 6
        const cp1y = p1.y + (p2.y - p0.y) / 6
        const cp2x = p2.x - (p3.x - p1.x) / 6
        const cp2y = p2.y - (p3.y - p1.y) / 6
        d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`
    }
    return d
}

function smoothAreaPath(pts: Point[], H: number): string {
    const line = smoothPath(pts)
    return `${line} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`
}

function fmtShort(v: number): string {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
    return `${Math.round(v)}`
}

const triggerHaptic = () => Feedback.trigger("selection", { enableVibrateFallback: true })

export interface SparklineChartProps {
    data: number[]
    prevData?: number[]
    labels: string[]
    chartHeight?: number
    currency?: string
    referenceValue?: number
    selectedIndex?: number
    onPointSelect?: (index: number) => void
    initialWidth?: number
    lineColor?: string
}

export default function SparklineChart({
    data,
    prevData,
    labels,
    chartHeight = 160,
    currency = "zł",
    referenceValue,
    selectedIndex,
    onPointSelect,
    initialWidth = 0,
    lineColor = Colors.secondary,
}: SparklineChartProps) {
    const uid = useId()
    const gradientId = `sc${uid.replace(/[^a-z0-9]/gi, "")}`
    const [chartW, setChartW] = useState(initialWidth)
    const [displayW, setDisplayW] = useState(100)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    const isFirstPositionRef = useRef(true)
    const displayValueSv = useSharedValue(0)

    // UI-thread shared values
    const lineX = useSharedValue(0)
    const lineVisible = useSharedValue(false)
    const isDragActiveSv = useSharedValue(false)
    const lastHapticIdx = useSharedValue(-1)
    const chartWsv = useSharedValue(0)
    const displayWsv = useSharedValue(100)
    // dataLenSv lets onEnd worklet compute the correct static x without JS round-trip
    const dataLenSv = useSharedValue(Math.max(data.length - 1, 1))
    // single source of truth for value-display x — set in worklet (instant) or effect (animated)
    const displayXSv = useSharedValue(0)
    const selectedStaticX = useSharedValue(-1)

    const H = chartHeight

    useEffect(() => {
        dataLenSv.value = Math.max(data.length - 1, 1)
    }, [data.length])

    const maxValue = useMemo(() => {
        const allVals = [...data, ...(prevData ?? [])].filter((v) => v > 0)
        return allVals.length > 0 ? Math.max(...allVals) * 1.2 : 100
    }, [data, prevData])

    const sy = (v: number) => PAD_TOP + (1 - Math.max(v, 0) / maxValue) * (H - PAD_TOP - PAD_BOTTOM)

    const currentPts = useMemo(
        () =>
            data.map((v, i) => ({
                x: PAD_X + (i / Math.max(data.length - 1, 1)) * (chartW - PAD_X * 2),
                y: PAD_TOP + (1 - Math.max(v, 0) / maxValue) * (H - PAD_TOP - PAD_BOTTOM),
            })),
        [data, maxValue, chartW, H],
    )

    const prevPts = useMemo(
        () =>
            prevData?.map((v, i) => ({
                x: PAD_X + (i / Math.max(data.length - 1, 1)) * (chartW - PAD_X * 2),
                y: PAD_TOP + (1 - Math.max(v, 0) / maxValue) * (H - PAD_TOP - PAD_BOTTOM),
            })),
        [prevData, data.length, maxValue, chartW, H],
    )

    const gridY = useMemo(() => [0.35, 0.7].map((p) => PAD_TOP + (1 - p) * (H - PAD_TOP - PAD_BOTTOM)), [H])

    const refY = referenceValue !== undefined ? sy(referenceValue) : null
    const hasCurrent = currentPts.some((p) => p.y < H - PAD_BOTTOM)
    const hasPrev = prevPts?.some((p) => p.y < H - PAD_BOTTOM) ?? false

    // Sync static position from props. First render: instant. Subsequent: animated.
    useEffect(() => {
        if (selectedIndex === undefined || chartW === 0) {
            selectedStaticX.value = -1
            return
        }
        const rawX = PAD_X + (selectedIndex / Math.max(data.length - 1, 1)) * (chartW - PAD_X * 2)
        const targetX = Math.max(PAD_X, Math.min(rawX - displayW / 2, chartW - displayW - PAD_X))
        selectedStaticX.value = targetX

        if (isFirstPositionRef.current) {
            displayXSv.value = targetX
            isFirstPositionRef.current = false
        } else {
            displayXSv.value = withTiming(targetX, { duration: 180 })
        }
    }, [selectedIndex, chartW, data.length, displayW])

    const tooltipIdx = activeIndex ?? selectedIndex ?? null
    const tooltipValue = tooltipIdx !== null ? data[tooltipIdx] : null
    const tooltipPrevValue = tooltipIdx !== null && prevData ? prevData[tooltipIdx] : null
    const tooltipLabel = tooltipIdx !== null ? labels[tooltipIdx] : null
    const tooltipPt = tooltipIdx !== null ? currentPts[tooltipIdx] : null
    const tooltipPrevPt = tooltipIdx !== null && prevPts ? prevPts[tooltipIdx] : null

    useEffect(() => {
        const target = tooltipValue ?? 0
        const isDrag = activeIndex !== null
        displayValueSv.value = withTiming(target, {
            duration: isDrag ? 120 : 650,
            easing: isDrag ? Easing.linear : Easing.out(Easing.cubic),
        })
    }, [tooltipValue, activeIndex !== null ? 1 : 0])

    const animatedValueProps = useAnimatedProps(() => {
        const n = Math.round(displayValueSv.value)
        const text = `${n}${currency}`
        return { text, defaultValue: text } as any
    })

    const handleDrag = (x: number) => {
        "worklet"
        if (currentPts.length === 0) return
        let closestIdx = 0
        let minDist = Infinity
        for (let i = 0; i < currentPts.length; i++) {
            const d = Math.abs(currentPts[i].x - x)
            if (d < minDist) {
                minDist = d
                closestIdx = i
            }
        }
        if (lastHapticIdx.value !== closestIdx) {
            lastHapticIdx.value = closestIdx
            runOnJS(triggerHaptic)()
        }
        runOnJS(setActiveIndex)(closestIdx)
    }

    const clampDisplayX = (cx: number): number => {
        "worklet"
        return Math.max(PAD_X, Math.min(cx - displayWsv.value / 2, chartWsv.value - displayWsv.value - PAD_X))
    }

    const pan = Gesture.Pan()
        .maxPointers(1)
        .onStart((e) => {
            const cx = Math.max(0, Math.min(e.x, chartWsv.value))
            lineX.value = cx
            displayXSv.value = clampDisplayX(cx)
            lineVisible.value = true
            isDragActiveSv.value = true
            handleDrag(cx)
        })
        .onUpdate((e) => {
            const cx = Math.max(0, Math.min(e.x, chartWsv.value))
            lineX.value = cx
            displayXSv.value = clampDisplayX(cx)
            handleDrag(cx)
        })
        .onEnd(() => {
            const idx = lastHapticIdx.value
            if (idx >= 0 && onPointSelect) {
                // Pre-set the exact static position synchronously so there is no jump
                // when isDragActiveSv flips to false on the same frame.
                const rawX = PAD_X + (idx / dataLenSv.value) * (chartWsv.value - PAD_X * 2)
                const targetX = Math.max(
                    PAD_X,
                    Math.min(rawX - displayWsv.value / 2, chartWsv.value - displayWsv.value - PAD_X),
                )
                selectedStaticX.value = targetX
                displayXSv.value = targetX
                runOnJS(onPointSelect)(idx)
            } else {
                selectedStaticX.value = -1
            }
            lineVisible.value = false
            isDragActiveSv.value = false
            lastHapticIdx.value = -1
            runOnJS(setActiveIndex)(null)
        })

    const verticalLineStyle = useAnimatedStyle(() => ({
        opacity: withTiming(lineVisible.value ? 1 : 0, { duration: 150 }),
        transform: [{ translateX: lineX.value }],
    }))

    const valueDisplayStyle = useAnimatedStyle(() => {
        const visible = isDragActiveSv.value || selectedStaticX.value >= 0
        return {
            opacity: withTiming(visible ? 1 : 0, { duration: 150 }),
            transform: [{ translateX: displayXSv.value }],
        }
    })

    return (
        <View>
            <GestureDetector gesture={pan}>
                <View
                    style={{ height: H }}
                    onLayout={(e) => {
                        const w = e.nativeEvent.layout.width
                        setChartW(w)
                        chartWsv.value = w
                    }}
                >
                    {chartW > 0 && (
                        <Svg width={chartW} height={H}>
                            <Defs>
                                <SvgGrad id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="0" stopColor={lineColor} stopOpacity="0.25" />
                                    <Stop offset="1" stopColor={lineColor} stopOpacity="0.02" />
                                </SvgGrad>
                            </Defs>

                            {gridY.map((y, i) => (
                                <Line
                                    key={i}
                                    x1={PAD_X}
                                    y1={y}
                                    x2={chartW - PAD_X}
                                    y2={y}
                                    stroke={Color(lineColor).alpha(0.07).string()}
                                    strokeWidth={1}
                                />
                            ))}

                            {refY !== null && (
                                <>
                                    <Line
                                        x1={PAD_X}
                                        y1={refY}
                                        x2={chartW - PAD_X}
                                        y2={refY}
                                        stroke={Colors.foreground}
                                        strokeWidth={1}
                                        strokeOpacity={0.18}
                                        strokeDasharray="4 5"
                                    />
                                    <SvgText
                                        x={chartW - PAD_X}
                                        y={refY - 4}
                                        textAnchor="end"
                                        fill={Colors.foreground}
                                        fontSize={8}
                                        fontWeight="600"
                                        fillOpacity={0.4}
                                    >
                                        {fmtShort(referenceValue!)}
                                    </SvgText>
                                </>
                            )}

                            {hasPrev && prevPts && (
                                <Path
                                    d={smoothPath(prevPts)}
                                    fill="none"
                                    stroke={lineColor}
                                    strokeWidth={1.5}
                                    strokeOpacity={0.3}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeDasharray="5 5"
                                />
                            )}

                            {hasCurrent && (
                                <>
                                    <Path d={smoothAreaPath(currentPts, H)} fill={`url(#${gradientId})`} />
                                    <Path
                                        d={smoothPath(currentPts)}
                                        fill="none"
                                        stroke={lineColor}
                                        strokeWidth={2.5}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </>
                            )}
                        </Svg>
                    )}

                    <Animated.View
                        style={[
                            styles.verticalLine,
                            { backgroundColor: Color(lineColor).alpha(0.5).string() },
                            verticalLineStyle,
                            { height: H },
                        ]}
                    />

                    {tooltipPt && (tooltipValue ?? 0) > 0 && (
                        <View
                            style={[
                                styles.dot,
                                styles.currentDot,
                                { backgroundColor: lineColor, left: tooltipPt.x - 4, top: tooltipPt.y - 4 },
                            ]}
                            pointerEvents="none"
                        />
                    )}
                    {tooltipPrevPt && (tooltipPrevValue ?? 0) > 0 && (
                        <View
                            style={[
                                styles.dot,
                                styles.prevDot,
                                {
                                    backgroundColor: Color(lineColor).alpha(0.4).string(),
                                    left: tooltipPrevPt.x - 3,
                                    top: tooltipPrevPt.y - 3,
                                },
                            ]}
                            pointerEvents="none"
                        />
                    )}

                    <Animated.View
                        style={[styles.valueDisplay, valueDisplayStyle]}
                        pointerEvents="none"
                        onLayout={(e) => {
                            const w = e.nativeEvent.layout.width
                            if (w > 0) {
                                setDisplayW(w)
                                displayWsv.value = w
                            }
                        }}
                    >
                        <Text size={9} weight="600" color={Colors.text_dark} letterSpacing={0.8} uppercase>
                            {tooltipLabel ?? ""}
                        </Text>
                        <AnimatedTextInput
                            style={[styles.animatedValue, { color: lineColor }]}
                            animatedProps={animatedValueProps}
                            editable={false}
                            caretHidden
                            pointerEvents="none"
                        />
                        {(tooltipPrevValue ?? 0) > 0 && (
                            <Text size={10} weight="500" color={Colors.text_light} opacity={0.4}>
                                {formatAmount(tooltipPrevValue ?? 0, 0)}
                                {currency} prev
                            </Text>
                        )}
                    </Animated.View>
                </View>
            </GestureDetector>

            <View style={styles.xAxis}>
                {labels.map((l, i) => (
                    <Text key={i} size={10} weight="500" opacity={tooltipIdx === i ? 1 : 0.45} style={styles.xLabel}>
                        {l}
                    </Text>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    verticalLine: {
        position: "absolute",
        top: 0,
        left: -0.75,
        width: 1.5,
        borderRadius: 2,
    },
    dot: {
        position: "absolute",
        borderRadius: 100,
    },
    currentDot: {
        width: 8,
        height: 8,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    prevDot: {
        width: 6,
        height: 6,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    valueDisplay: {
        position: "absolute",
        top: 2,
        left: 0,
        gap: 1,
    },
    animatedValue: {
        fontSize: 22,
        fontWeight: "700",
        padding: 0,
        margin: 0,
        minWidth: 60,
    },
    xAxis: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: PAD_X,
        marginTop: 4,
    },
    xLabel: {
        textAlign: "center",
    },
})
