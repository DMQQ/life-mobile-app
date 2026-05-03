import { ActivityIndicator, Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native"
import GlassView from "../GlassView"
import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"

interface IconSaveButtonProps {
    onPress: () => void
    disabled?: boolean
    loading?: boolean
    tintColor?: string
    fontSize?: number
    style?: StyleProp<ViewStyle>
}

export default function IconSaveButton({
    onPress,
    disabled,
    loading,
    tintColor = Colors.secondary,
    fontSize = 20,
    style,
}: IconSaveButtonProps) {
    const tint = disabled ? tintColor + "80" : tintColor
    return (
        <Pressable disabled={disabled || loading} onPress={onPress} style={[styles.saveButton, style]}>
            <GlassView key={tint} tintColor={tint} style={styles.glass}>
                {loading ? (
                    <ActivityIndicator size={fontSize} color="#fff" />
                ) : (
                    <AntDesign name="check" size={fontSize} color="#fff" />
                )}
            </GlassView>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    saveButton: {
        position: "absolute",
        top: 15,
        right: 15,
        zIndex: 100,
        borderRadius: 100,
    },
    glass: {
        padding: 15,
        borderRadius: 100,
    },
})
