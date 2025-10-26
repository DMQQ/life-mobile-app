import { TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

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
            <Ionicons name="attach" size={24} color={"#fff"} />
        </TouchableOpacity>
    )
}