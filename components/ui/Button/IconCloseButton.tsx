import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native"
import GlassView from "../GlassView"
import { AntDesign } from "@expo/vector-icons"

interface IconCloseButtonProps {
    onPress: () => void
    style?: StyleProp<ViewStyle>
}

export default function IconCloseButton({ onPress, style }: IconCloseButtonProps) {
    return (
        <Pressable onPress={onPress} style={style} hitSlop={8}>
            <GlassView style={styles.container}>
                <AntDesign name="close" size={16} color="#fff" />
            </GlassView>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 32,
        height: 32,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
    },
})
