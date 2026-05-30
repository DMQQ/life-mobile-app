import { TouchableOpacity, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import Colors from "@/constants/Colors"

const styles = StyleSheet.create({
    uploadButton: {
        padding: 4,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
})

interface UploadButtonProps {
    onPress: () => void
    disabled: boolean
}

export const UploadButton = ({ onPress, disabled }: UploadButtonProps) => {
    return (
        <TouchableOpacity style={styles.uploadButton} onPress={onPress} disabled={disabled}>
            <Feather name="paperclip" size={22} color={Colors.foreground_secondary} />
        </TouchableOpacity>
    )
}
