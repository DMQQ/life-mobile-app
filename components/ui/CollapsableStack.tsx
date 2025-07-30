import Colors from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import { AntDesign } from "@expo/vector-icons"
import React, { useState } from "react"
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"

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
        duration: number
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

const CollapsibleStack = <T,>({
    items,
    title,
    onDeleteItem,
    renderItem,
    animation = {
        maxVisibleItems: 3,
        duration: 300,
    },
    styles: customStyles = {},
    expandText = "Expand",
    collapseText = "Collapse",
    iconColor = Colors.secondary_light_1,
    getItemKey,
}: CollapsibleStackProps<T>) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false)

    const toggleExpand = (): void => {
        setIsExpanded((prev) => !prev)
    }

    const getVisibleItems = () => {
        return isExpanded ? items : items.slice(0, animation.maxVisibleItems)
    }

    const getHiddenItems = () => {
        return isExpanded ? [] : items.slice(animation.maxVisibleItems)
    }

    const visibleItems = getVisibleItems()
    const hiddenItems = getHiddenItems()

    if (items.length === 0) {
        return null
    }

    return (
        <View style={[defaultStyles.container, customStyles.container]}>
            <View style={[defaultStyles.header, customStyles.header]}>
                <Text style={[defaultStyles.title, customStyles.title]}>
                    {title} ({items.length})
                </Text>

                {items.length > animation.maxVisibleItems && (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={toggleExpand}
                        style={[defaultStyles.expandButton, customStyles.expandButton]}
                    >
                        <Text style={[defaultStyles.expandButtonText, customStyles.expandButtonText]}>
                            {isExpanded ? collapseText : expandText}
                        </Text>
                        <AntDesign name={isExpanded ? "up" : "down"} size={12} color={iconColor} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={defaultStyles.listContainer}>
                {visibleItems.map((item, index) => (
                    <View
                        key={getItemKey(item, index)}
                        style={[defaultStyles.itemContainer, customStyles.itemContainer]}
                    >
                        {renderItem({
                            item,
                            index,
                            isExpanded,
                            totalCount: items.length,
                            onDelete: () => onDeleteItem(item, index),
                            expand: toggleExpand,
                        })}
                    </View>
                ))}

                {isExpanded &&
                    hiddenItems.map((item, index) => {
                        const actualIndex = animation.maxVisibleItems + index
                        return (
                            <Animated.View
                                key={getItemKey(item, actualIndex)}
                                entering={FadeIn.duration(animation.duration)}
                                exiting={FadeOut.duration(animation.duration)}
                                style={[defaultStyles.itemContainer, customStyles.itemContainer]}
                            >
                                {renderItem({
                                    item,
                                    index: actualIndex,
                                    isExpanded,
                                    totalCount: items.length,
                                    onDelete: () => onDeleteItem(item, actualIndex),
                                    expand: toggleExpand,
                                })}
                            </Animated.View>
                        )
                    })}
            </View>
        </View>
    )
}

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
    listContainer: {},
    itemContainer: {
        width: "100%",
    },
})

export default CollapsibleStack
