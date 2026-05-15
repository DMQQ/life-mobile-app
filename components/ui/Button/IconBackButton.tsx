import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native"
import GlassView from "../GlassView"
import { AntDesign } from "@expo/vector-icons"
import { useCallback } from "react"
import { router } from "expo-router"

interface IconBackButtonProps {
    disabled?: boolean
    onPress?: () => void
    style?: StyleProp<ViewStyle>
}

export default function IconBackButton({ disabled = false, onPress, style }: IconBackButtonProps) {
    const handlePress = useCallback(() => {
        if (onPress) {
            onPress()
            return
        }

        if (router.canGoBack()) {
            router.back()
        }
    }, [onPress])

    return (
        <Pressable disabled={disabled} onPress={handlePress} style={style}>
            <GlassView style={styles.container}>
                <AntDesign name="close" size={20} color="#fff" />
            </GlassView>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
    },
})
