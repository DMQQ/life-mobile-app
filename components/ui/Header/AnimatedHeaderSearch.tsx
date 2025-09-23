import { IconButton } from "@/components"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import { GlassView } from "expo-glass-effect"
import { memo, useEffect, useState } from "react"
import { Keyboard, TextInput } from "react-native"
import Haptics from "react-native-haptic-feedback"
import Animated, {
    Extrapolation,
    interpolate,
    interpolateColor,
    SharedValue,
    useAnimatedStyle,
} from "react-native-reanimated"

interface AnimatedSearchInputProps {
    scrollY?: SharedValue<number>

    setFilterValue: (value: string) => void

    filterValue: string

    onFiltersPress?: () => void

    buttonsCount?: number
}

const AnimatedSearchInput = ({
    scrollY,
    setFilterValue,
    filterValue,
    onFiltersPress,
    buttonsCount = 0,
}: AnimatedSearchInputProps) => {
    const [value, setValue] = useState("")

    const [isFocused, setIsFocused] = useState(false)

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

    const animatedStyle = useAnimatedStyle(() => {
        const scrollValue = scrollY?.value ?? 0

        return {
            opacity: interpolate(scrollValue, [0, 160], [0, 1], Extrapolation.CLAMP),
            transform: [
                {
                    translateY: interpolate(scrollValue, [0, 160], [-55, 0], Extrapolation.CLAMP),
                },
            ],
            width: interpolate(
                scrollValue,
                [0, 160],
                [Layout.screen.width + 5 - buttonsCount * 40, Layout.screen.width],
                Extrapolation.CLAMP,
            ),
        }
    }, [scrollY])

    const AnimatedBackgroundStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: isFocused
                ? "rgba(0,0,0,0.15)"
                : interpolateColor(scrollY?.value ?? 0, [0, 160], ["rgba(0,0,0,0.0)", "rgba(0,0,0,0.15)"], "RGB"),
            borderColor: isFocused
                ? "rgba(255,255,255,0.15)"
                : interpolateColor(
                      scrollY?.value ?? 0,
                      [0, 160],
                      ["rgba(255,255,255,0.0)", "rgba(255,255,255,0.15)"],
                      "RGB",
                  ),
            borderRadius: 100,
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

    if (!scrollY) return null

    return (
        <Animated.View
            style={[
                {
                    paddingHorizontal: 15,
                    paddingTop: 10,
                    paddingBottom: 10,
                    flexDirection: "row",
                    gap: 10,
                    borderRadius: 100,
                },
                animatedStyle,
            ]}
        >
            <Animated.View
                style={[
                    {
                        flex: 1,
                        position: "relative",
                        flexDirection: "row",
                        borderRadius: 100,
                        overflow: "hidden",
                    },
                    AnimatedBackgroundStyle,
                ]}
            >
                <GlassView
                    isInteractive
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        borderRadius: 100,
                        padding: 10,
                    }}
                    glassEffectStyle="clear"
                >
                    {onFiltersPress && (
                        <IconButton
                            icon={<Ionicons name="options" size={24} color={Colors.foreground} />}
                            onPress={onFiltersPress}
                        />
                    )}
                    <TextInput
                        value={value}
                        onChangeText={setValue}
                        style={{ fontSize: 15, flex: 1, color: Colors.foreground, paddingHorizontal: 10 }}
                        onEndEditing={onSubmit}
                        onSubmitEditing={onSubmit}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                    {filterValue === value && (filterValue.trim() !== "" || value !== "") ? (
                        <IconButton
                            icon={<AntDesign name="close" size={20} color={Colors.foreground} />}
                            onPress={() => {
                                Haptics.trigger("impactLight")
                                setValue("")
                                setFilterValue("")
                            }}
                        />
                    ) : (
                        <IconButton
                            icon={<AntDesign name="search" size={20} color={Colors.foreground} />}
                            onPress={onSubmit}
                        />
                    )}
                </GlassView>
            </Animated.View>
        </Animated.View>
    )
}

export default memo(AnimatedSearchInput)
