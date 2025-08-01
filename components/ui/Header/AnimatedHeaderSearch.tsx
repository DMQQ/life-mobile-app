import { IconButton } from "@/components"
import Colors from "@/constants/Colors"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { memo, useEffect, useState } from "react"
import { TextInput, View } from "react-native"
import Haptics from "react-native-haptic-feedback"
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated"

interface AnimatedSearchInputProps {
    scrollY?: SharedValue<number>

    setFilterValue: (value: string) => void

    filterValue: string

    onFiltersPress?: () => void
}

const AnimatedSearchInput = ({ scrollY, setFilterValue, filterValue, onFiltersPress }: AnimatedSearchInputProps) => {
    const navigation = useNavigation<any>()
    const [value, setValue] = useState("")

    const [isFocused, setIsFocused] = useState(false)

    const handleFocus = () => {
        setIsFocused((p) => !p)
    }

    useEffect(() => {
        if (filterValue) {
            setValue(filterValue)
        }
    }, [filterValue])

    const animatedStyle = useAnimatedStyle(() => {
        const scrollValue = scrollY?.value ?? 0

        return {
            opacity: interpolate(scrollValue, [0, 130, 150, 160], [0, 0, 0.75, 1], Extrapolation.CLAMP),
            transform: [
                {
                    translateY: interpolate(scrollValue, [0, 160], [-25, 0], Extrapolation.CLAMP),
                },
                { scale: interpolate(scrollValue, [0, 160], [0.5, 1], Extrapolation.CLAMP) },
            ],
        }
    }, [scrollY])

    const onSubmit = () => {
        Haptics.trigger("impactLight")
        if (value.trim() === "") return
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
                },
                animatedStyle,
            ]}
        >
            <View
                style={{
                    flex: 1,
                    position: "relative",
                    flexDirection: "row",
                    backgroundColor: `rgba(0,0,0,0.${isFocused ? 15 : 1})`,
                    padding: 5,
                    borderRadius: 15,
                    borderWidth: 1,
                    borderColor: `rgba(255,255,255,0.${isFocused ? 15 : 2})`,
                }}
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
                    onFocus={handleFocus}
                    onBlur={handleFocus}
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
                        icon={<AntDesign name="search1" size={20} color={Colors.foreground} />}
                        onPress={onSubmit}
                    />
                )}
            </View>
        </Animated.View>
    )
}

export default memo(AnimatedSearchInput)
