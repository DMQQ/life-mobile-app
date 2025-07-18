import { IconButton } from "@/components"
import { AntDesign, Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { memo, useEffect, useState } from "react"
import { TextInput, View } from "react-native"
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated"
import { useWalletContext } from "../WalletContext"

interface AnimatedSearchInputProps {
    scrollY?: SharedValue<number>
}

const AnimatedSearchInput = ({ scrollY }: AnimatedSearchInputProps) => {
    const navigation = useNavigation<any>()
    const wallet = useWalletContext()
    const [value, setValue] = useState("")

    useEffect(() => {
        setValue(wallet.filters.query)
    }, [wallet.filters.query])

    const animatedStyle = useAnimatedStyle(() => {
        const scrollValue = scrollY?.value ?? 0

        return {
            opacity: interpolate(scrollValue, [0, 150, 175, 200], [0, 0.1, 0.85, 1], Extrapolation.CLAMP),
            transform: [
                {
                    translateY: interpolate(scrollValue, [0, 200], [-25, 0], Extrapolation.CLAMP),
                },
                { scale: interpolate(scrollValue, [0, 200], [0.5, 1], Extrapolation.CLAMP) },
            ],
        }
    }, [scrollY])

    const onSubmit = () => {
        if (value.trim() === "") return
        wallet.dispatch({ type: "SET_QUERY", payload: value })
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
            <View style={{ flex: 1, position: "relative", flexDirection: "row" }}>
                <TextInput
                    value={value}
                    onChangeText={setValue}
                    style={{
                        backgroundColor: "rgba(0,0,0,0.1)",
                        padding: 12.5,
                        borderRadius: 15,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.2)",
                        fontSize: 15,
                        color: "#fff",
                        flex: 1,
                    }}
                    onEndEditing={onSubmit}
                    onSubmitEditing={onSubmit}
                />
                <IconButton
                    style={{ position: "absolute", right: 10, top: 7.5 }}
                    icon={<AntDesign name="search1" size={20} color="#fff" />}
                    onPress={onSubmit}
                />
            </View>
            <IconButton
                icon={<Ionicons name="options" size={24} color="#fff" />}
                onPress={() => {
                    navigation.navigate("Filters")
                }}
            />
        </Animated.View>
    )
}

export default memo(AnimatedSearchInput)
