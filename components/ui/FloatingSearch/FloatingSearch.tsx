import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import { memo, useEffect, useState } from "react"
import { Keyboard, TextInput } from "react-native"
import Haptics from "react-native-haptic-feedback"
import Animated, {
    Extrapolation,
    interpolate,
    interpolateColor,
    SharedValue,
    useAnimatedKeyboard,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useGlobalScrollY } from "@/utils/context/ScrollYContext"
import GlassView from "../GlassView"
import IconButton from "../IconButton/IconButton"

interface FloatingSearchProps {
    setFilterValue: (value: string) => void
    filterValue: string
    onFiltersPress?: () => void
    isVisible?: boolean
}

const FloatingSearch = ({ setFilterValue, filterValue, onFiltersPress, isVisible = true }: FloatingSearchProps) => {
    const [value, setValue] = useState("")
    const [isFocused, setIsFocused] = useState(false)
    const insets = useSafeAreaInsets()
    const scrollY = useGlobalScrollY()

    useEffect(() => {
        const sub = Keyboard.addListener("keyboardDidHide", () => {
            setIsFocused(false)
        })

        return () => {
            sub.remove()
        }
    }, [])

    useEffect(() => {
        if (filterValue) {
            setValue(filterValue)
        }
    }, [filterValue])

    const keyboard = useAnimatedKeyboard()

    const animatedStyle = useAnimatedStyle(() => {
        const scrollValue = scrollY?.value ?? 0

        return {
            opacity: isVisible
                ? withTiming(interpolate(scrollValue, [0, 100], [0, 1], Extrapolation.CLAMP))
                : withTiming(0),
            transform: [
                {
                    translateY:
                        keyboard.height.value > 0
                            ? -keyboard.height.value
                            : isVisible
                              ? withTiming(interpolate(scrollValue, [0, 100], [85, 0], Extrapolation.CLAMP)) // Start from BottomTab position
                              : withTiming(85),
                },
                {
                    scale: isVisible
                        ? withTiming(interpolate(scrollValue, [0, 100], [0.9, 1], Extrapolation.CLAMP))
                        : withTiming(0.9),
                },
            ],
        }
    }, [scrollY, isFocused, isVisible])

    const backgroundStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: isFocused
                ? "rgba(0,0,0,0.2)"
                : interpolateColor(scrollY?.value ?? 0, [0, 100], ["rgba(0,0,0,0.1)", "rgba(0,0,0,0.2)"], "RGB"),
            borderColor: isFocused
                ? "rgba(255,255,255,0.2)"
                : interpolateColor(
                      scrollY?.value ?? 0,
                      [0, 100],
                      ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.2)"],
                      "RGB",
                  ),
        }
    })

    const onSubmit = () => {
        Haptics.trigger("impactLight")
        if (value.trim() === "") {
            setIsFocused(true)
            return
        }
        setFilterValue(value.trim())
    }

    if (!isVisible) return null

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    bottom: 15,
                    left: 15,
                    right: 15,
                    zIndex: 99,
                    height: 70, // Same height as BottomTab
                    justifyContent: "center",
                },
                animatedStyle,
            ]}
        >
            <Animated.View
                style={[
                    {
                        flexDirection: "row",
                        borderRadius: 25,
                        overflow: "hidden",
                        gap: 15,
                    },
                    backgroundStyle,
                ]}
            >
                <GlassView
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        padding: 15,
                        alignItems: "center",
                        gap: 8,
                        borderRadius: 100,
                        height: 60,
                    }}
                >
                    {onFiltersPress && (
                        <IconButton
                            icon={<Ionicons name="options" size={20} color={Colors.foreground} />}
                            onPress={onFiltersPress}
                        />
                    )}
                    <TextInput
                        value={value}
                        onChangeText={setValue}
                        placeholder="Search..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        style={{
                            fontSize: 15,
                            flex: 1,
                            color: Colors.foreground,
                            paddingVertical: 4,
                        }}
                        onEndEditing={onSubmit}
                        onSubmitEditing={onSubmit}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                    {filterValue === value && (filterValue.trim() !== "" || value !== "") ? (
                        <IconButton
                            icon={<AntDesign name="close" size={18} color={Colors.foreground} />}
                            onPress={() => {
                                Haptics.trigger("impactLight")
                                setValue("")
                                setFilterValue("")
                            }}
                        />
                    ) : (
                        <IconButton
                            icon={<AntDesign name="search" size={18} color={Colors.foreground} />}
                            onPress={onSubmit}
                        />
                    )}
                </GlassView>
                <GlassView
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 100,
                        padding: 10,
                        width: 60,
                        height: 60,
                    }}
                >
                    <IconButton icon={<AntDesign name="close" size={24} color={Colors.foreground} />} />
                </GlassView>
            </Animated.View>
        </Animated.View>
    )
}

export default memo(FloatingSearch)
