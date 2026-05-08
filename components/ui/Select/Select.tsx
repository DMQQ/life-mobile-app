import {
    View,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
    Pressable,
    LayoutChangeEvent,
} from "react-native"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import Layout from "../../../constants/Layout"
import Colors from "../../../constants/Colors"
import Color from "color"
import { useState, useCallback, ReactNode, useLayoutEffect } from "react"
import { AntDesign } from "@expo/vector-icons"
import { ScrollView } from "react-native-gesture-handler"

const RADIUS = 14

export interface Props<T> {
    options: T[]
    multiSelect?: boolean
    closeOnSelect?: boolean
    selected: T[]
    renderDefaultItem?: boolean
    singleTileHeight?: number
    containerStyle?: StyleProp<ViewStyle>
    maxSelectHeight?: number
    onClose?: () => void
    setSelected: (selected: T[]) => void
    keyExtractor?: (item: T, index: number) => string
    transparentOverlay?: boolean
    renderItem?: (props: { item: T; index: number }) => ReactNode
    placeholderText?: string
    renderCustomSelected?: ReactNode
    onFocusChange?: (focus: boolean) => void
    anchor?: "top" | "bottom"
}

export default function Select({
    options = [],
    multiSelect = false,
    selected,
    setSelected,
    keyExtractor,
    renderItem,
    renderDefaultItem = true,
    singleTileHeight = 50,
    onClose,
    containerStyle,
    maxSelectHeight,
    transparentOverlay = true,
    placeholderText = "Select option",
    closeOnSelect = false,
    ...rest
}: Props<any>) {
    const [isFocused, setIsFocused] = useState(false)
    const [btnHeight, setBtnHeight] = useState(0)
    const [btnWidth, setBtnWidth] = useState(0)

    const addSelectedItem = (item: (typeof options)[0]) => {
        if (multiSelect) {
            if (selected.includes(item)) {
                setSelected(selected.filter((i) => i !== item))
            } else {
                setSelected([...selected, item])
            }
            if (closeOnSelect) setIsFocused(false)
            return
        }
        setSelected([item])
        if (closeOnSelect) setIsFocused(false)
    }

    const listHeight = maxSelectHeight || singleTileHeight * options.length

    const separatorColor = Color(Colors.foreground).alpha(0.08).toString()
    const selectedBg = Color(Colors.secondary).alpha(0.15).toString()

    const DefaultRenderItem = useCallback(
        ({ item, index }: { item: string; index: number }) => {
            const isSelected = selected.includes(item)
            const isLast = index === options.length - 1
            return (
                <TouchableOpacity
                    onPress={() => addSelectedItem(item)}
                    activeOpacity={0.6}
                    style={{
                        height: singleTileHeight,
                        paddingHorizontal: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: separatorColor,
                        backgroundColor: isSelected ? selectedBg : "transparent",
                    }}
                >
                    <Text
                        variant="body"
                        style={{
                            color: isSelected ? Colors.secondary : Colors.foreground,
                            fontWeight: isSelected ? "600" : "400",
                        }}
                    >
                        {item}
                    </Text>
                    {isSelected && <AntDesign name="check" size={18} color={Colors.secondary} />}
                </TouchableOpacity>
            )
        },
        [selected, addSelectedItem, options.length, singleTileHeight],
    )

    const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
        setBtnHeight(nativeEvent.layout.height)
        setBtnWidth(nativeEvent.layout.width)
    }

    useLayoutEffect(() => {
        rest.onFocusChange?.(isFocused)
    }, [isFocused])

    const handleDismiss = () => {
        setIsFocused(false)
        onClose?.()
    }

    const hasSelection =
        selected.length > 0 && selected.some((v) => (typeof v === "string" ? v.trim().length > 0 : true))

    const dropdownPosition = rest.anchor === "top" ? { bottom: btnHeight } : { top: btnHeight }

    return (
        <>
            {isFocused && (
                <Pressable
                    onPress={handleDismiss}
                    style={{
                        position: "absolute",
                        width: Layout.screen.width,
                        height: Layout.screen.height,
                        top: -100,
                        left: -20,
                        zIndex: 10,
                        backgroundColor: transparentOverlay ? "transparent" : "rgba(0,0,0,0.5)",
                    }}
                />
            )}
            <View style={[{ zIndex: isFocused ? 100 : 1 }, containerStyle]}>
                <GlassView style={{ borderRadius: RADIUS, overflow: "hidden" }}>
                    <TouchableOpacity
                        onLayout={onLayout}
                        activeOpacity={0.8}
                        onPress={() => setIsFocused(!isFocused)}
                        style={{
                            padding: rest.renderCustomSelected ? 0 : 14,
                            paddingRight: 14,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        {rest.renderCustomSelected ? (
                            rest.renderCustomSelected
                        ) : (
                            <Text
                                variant="body"
                                numberOfLines={1}
                                style={{
                                    color: hasSelection ? Colors.foreground : Colors.foreground_disabled,
                                    flex: 1,
                                }}
                            >
                                {hasSelection ? selected.join(", ") : placeholderText}
                            </Text>
                        )}
                        <AntDesign
                            name={isFocused ? "up" : "down"}
                            size={16}
                            color={isFocused ? Colors.secondary : Colors.foreground_secondary}
                            style={{ marginLeft: 8 }}
                        />
                    </TouchableOpacity>
                </GlassView>

                {isFocused && (
                    <View
                        style={[
                            {
                                position: "absolute",
                                left: 0,
                                zIndex: -1,
                                borderRadius: RADIUS,
                                overflow: "hidden",
                                width: btnWidth,
                            },
                            dropdownPosition,
                        ]}
                    >
                        <GlassView tintColor={Color(Colors.primary_light).alpha(0.9).toString()}>
                            <ScrollView
                                style={{ maxHeight: listHeight }}
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                            >
                                {options.map((item: any, index: number) =>
                                    renderDefaultItem ? (
                                        <DefaultRenderItem
                                            key={keyExtractor?.(item, index) ?? index.toString()}
                                            item={item}
                                            index={index}
                                        />
                                    ) : (
                                        <TouchableOpacity
                                            key={keyExtractor?.(item, index) ?? index.toString()}
                                            activeOpacity={0.6}
                                            onPress={() => addSelectedItem(item)}
                                        >
                                            {renderItem?.({ item, index })}
                                        </TouchableOpacity>
                                    ),
                                )}
                            </ScrollView>
                        </GlassView>
                    </View>
                )}
            </View>
        </>
    )
}
