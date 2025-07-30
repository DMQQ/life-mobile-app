import Colors from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import { Feather } from "@expo/vector-icons"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated"
import ChipButton from "./Button/ChipButton"

const springConfig = {
    damping: 13,
    mass: 0.8,
    stiffness: 100,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
}

type RenderItem<T> = (props: {
    item: T
    index: number
    isExpanded: boolean
    totalCount: number
    onDelete: () => void
    expand: () => void
}) => React.ReactNode

interface CollapsibleStackProps<T> {
    items: T[]
    title: string
    onDeleteItem: (item: T, index: number) => void
    renderItem: RenderItem<T>
    animation?: {
        maxVisibleItems: number
        stackSpacing: number
    }
    styles?: {
        container?: ViewStyle
        header?: ViewStyle
        title?: TextStyle
        expandButton?: ViewStyle
        expandButtonText?: TextStyle
        itemContainer?: ViewStyle
    }
    expandText?: string
    collapseText?: string
    iconColor?: string
    getItemKey: (item: T, index: number) => string
}

interface CollapsibleItemProps<T> {
    item: T
    index: number
    isExpanded: boolean
    totalCount: number
    onDelete: () => void
    expand: () => void
    renderItem: RenderItem<T>
    customStyles: any
    maxVisible: number
    stackSpacing: number
    onLayout: (index: number, height: number) => void
    calculatedPosition: number
}

const CollapsibleItem = React.memo(
    <T,>({
        item,
        index,
        isExpanded,
        totalCount,
        onDelete,
        expand,
        renderItem,
        customStyles,
        maxVisible,
        onLayout,
        calculatedPosition,
    }: CollapsibleItemProps<T>) => {
        const translateY = useSharedValue<number>(calculatedPosition)
        const scale = useSharedValue<number>(isExpanded ? 1 : 1 - index * 0.075)
        const opacity = useSharedValue<number>(isExpanded ? 1 : Math.max(0.7, 1 - index * 0.1))

        const zIndex = useMemo(() => totalCount - index, [totalCount, index])

        useEffect(() => {
            translateY.value = withSpring(calculatedPosition, springConfig)
            scale.value = withSpring(isExpanded ? 1 : 1 - index * 0.075, springConfig)
            // opacity.value = withSpring(isExpanded ? 1 : Math.max(0.7, 1 - index * 0.1), springConfig)
        }, [isExpanded, index, calculatedPosition])

        const animatedStyle = useAnimatedStyle(() => {
            if (!isExpanded && index >= maxVisible) {
                return {
                    opacity: 0,
                    position: "absolute" as const,
                    width: "100%",
                    top: 0,
                    transform: [{ translateY: translateY.value }],
                    zIndex,
                    pointerEvents: "none" as const,
                }
            }

            return {
                position: "absolute" as const,
                width: "100%",
                top: 0,
                transform: [{ translateY: translateY.value }, { scale: scale.value }],
                opacity: opacity.value,
                zIndex,
                shadowColor: Colors.primary_darker,
                shadowOffset: {
                    width: 0,
                    height: 5,
                },
                shadowOpacity: isExpanded ? 0 : 0.36,
                shadowRadius: 6.68,
            }
        }, [isExpanded, index, maxVisible, zIndex])

        const handleLayout = useCallback(
            (event: any) => {
                const { height } = event.nativeEvent.layout
                onLayout(index, height)
            },
            [index, onLayout],
        )

        const memoizedRenderItem = useMemo(
            () =>
                renderItem({
                    item,
                    index,
                    isExpanded,
                    totalCount,
                    onDelete: isExpanded ? onDelete : expand,
                    expand,
                }),
            [item, index, isExpanded, totalCount, onDelete, expand, renderItem],
        )

        return (
            <Animated.View style={[customStyles.itemContainer, animatedStyle]} onLayout={handleLayout}>
                {memoizedRenderItem}
            </Animated.View>
        )
    },
) as <T>(props: CollapsibleItemProps<T>) => JSX.Element

const CollapsibleStack = React.memo(
    <T,>({
        items,
        title,
        onDeleteItem,
        renderItem,
        animation = {
            maxVisibleItems: 3,
            stackSpacing: 5,
        },
        styles: customStyles = {},
        expandText = "Expand",
        collapseText = "Collapse",
        iconColor = Colors.secondary_light_1,
        getItemKey,
    }: CollapsibleStackProps<T>) => {
        const [isExpanded, setIsExpanded] = useState<boolean>(false)
        const itemHeightsRef = useRef<{ [key: number]: number }>({})
        const measuredItemsRef = useRef<Set<number>>(new Set())
        const containerHeight = useSharedValue<number>(200)
        const positionsCalculatedRef = useRef<boolean>(false)

        const handleItemLayout = useCallback(
            (index: number, height: number) => {
                if (!measuredItemsRef.current.has(index)) {
                    measuredItemsRef.current.add(index)
                    itemHeightsRef.current[index] = height

                    // Only trigger animation update when all items are measured
                    const allMeasured = items.every((_, i) => measuredItemsRef.current.has(i))
                    if (allMeasured && !positionsCalculatedRef.current) {
                        positionsCalculatedRef.current = true
                        // Force a single re-render to update positions
                        setIsExpanded((prev) => prev)
                    }
                }
            },
            [items],
        )

        const { positions, totalHeight } = useMemo(() => {
            const positions: number[] = []
            let totalHeight = 0

            for (let i = 0; i < items.length; i++) {
                positions[i] = isExpanded ? totalHeight : i * animation.stackSpacing

                if (isExpanded && itemHeightsRef.current[i]) {
                    totalHeight += itemHeightsRef.current[i]
                }
            }

            return { positions, totalHeight }
        }, [items.length, isExpanded, animation.stackSpacing])

        useEffect(() => {
            const allItemsMeasured = items.every((_, index) => itemHeightsRef.current[index] > 0)

            if (allItemsMeasured || !isExpanded) {
                const newHeight = isExpanded
                    ? totalHeight
                    : Math.min(animation.maxVisibleItems, items.length) * animation.stackSpacing + 100

                containerHeight.value = withTiming(newHeight)
            }
        }, [isExpanded, totalHeight, items.length, animation.maxVisibleItems, animation.stackSpacing])

        const toggleExpand = useCallback((): void => {
            setIsExpanded((prev) => !prev)
        }, [])

        const containerStyle = useAnimatedStyle(
            () => ({
                height: containerHeight.value,
                overflow: "visible" as const,
                zIndex: 1,
            }),
            [],
        )

        const memoizedDeleteHandlers = useMemo(
            () => items.map((item, index) => () => onDeleteItem(item, index)),
            [items, onDeleteItem],
        )

        const shouldShowExpandButton = useMemo(
            () => items.length > animation.maxVisibleItems,
            [items.length, animation.maxVisibleItems],
        )

        const titleText = useMemo(() => `${title} (${items.length})`, [title, items.length])

        if (items.length === 0) {
            return null
        }

        return (
            <View style={[defaultStyles.container, customStyles.container]}>
                <View style={[defaultStyles.header, customStyles.header]}>
                    <Text style={[defaultStyles.title, customStyles.title]}>{titleText}</Text>

                    {shouldShowExpandButton && (
                        <ChipButton
                            onPress={toggleExpand}
                            icon={
                                isExpanded ? (
                                    <Feather name="chevron-up" size={15} color={iconColor} />
                                ) : (
                                    <Feather name="chevron-down" size={15} color={iconColor} />
                                )
                            }
                        >
                            {isExpanded ? collapseText : expandText}
                        </ChipButton>
                    )}
                </View>

                <Animated.View style={containerStyle}>
                    {items.map((item, index) => (
                        <CollapsibleItem
                            key={getItemKey(item, index)}
                            item={item}
                            index={index}
                            isExpanded={isExpanded}
                            totalCount={items.length}
                            onDelete={memoizedDeleteHandlers[index]}
                            expand={toggleExpand}
                            renderItem={renderItem}
                            customStyles={customStyles}
                            maxVisible={animation.maxVisibleItems}
                            stackSpacing={animation.stackSpacing}
                            onLayout={handleItemLayout}
                            calculatedPosition={positions[index] || 0}
                        />
                    ))}
                </Animated.View>
            </View>
        )
    },
) as <T>(props: CollapsibleStackProps<T>) => JSX.Element

const defaultStyles = StyleSheet.create({
    container: {
        marginTop: 15,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        zIndex: 2,
    },
    title: {
        color: Colors.foreground,
        fontSize: 16,
        fontWeight: "bold",
    },
    expandButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: lowOpacity(Colors.secondary, 0.2),
        borderWidth: 1,
        borderColor: Colors.secondary,
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
        zIndex: 5,
    },
    expandButtonText: {
        color: Colors.secondary_light_1,
        marginRight: 5,
    },
    listContainer: {
        minHeight: 100,
    },
    itemContainer: {
        width: "100%",
    },
})

export default CollapsibleStack
