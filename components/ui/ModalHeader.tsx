import { StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import GlassIconButton from "./GlassIconButton"
import GlassButton from "./GlassButton"
import Text from "./Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"

type FeatherName = React.ComponentProps<typeof Feather>["name"]

interface ModalHeaderProps {
    onClose?: () => void
    closeIcon?: FeatherName
    onSave?: () => void
    saveLabel?: string
    saveIcon?: FeatherName
    saveDisabled?: boolean
    saveLoading?: boolean
    title?: string
    padTop?: boolean
}

export default function ModalHeader({
    onClose,
    closeIcon = "x",
    onSave,
    saveLabel = "Save",
    saveIcon,
    saveDisabled = false,
    saveLoading = false,
    title,
    padTop = true,
}: ModalHeaderProps) {
    const insets = useSafeAreaInsets()

    return (
        <View style={[styles.container, padTop && { paddingTop: 15 }]}>
            <View style={styles.side}>
                {onClose && <GlassIconButton name={closeIcon} onPress={onClose} size={18} padding={12} />}
            </View>

            {title ? (
                <Text variant="subtitle" style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
            ) : (
                <View style={styles.titlePlaceholder} />
            )}

            <View style={[styles.side, styles.sideRight]}>
                {onSave && (
                    <GlassButton
                        label={saveLabel}
                        icon={saveIcon}
                        onPress={onSave}
                        disabled={saveDisabled}
                        loading={saveLoading}
                        variant="accent"
                    />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingBottom: 10,
        zIndex: 100,
    },
    side: {
        flex: 1,
        alignItems: "flex-start",
    },
    sideRight: {
        alignItems: "flex-end",
    },
    title: {
        flex: 2,
        textAlign: "center",
        fontWeight: "600",
        color: Colors.foreground,
        fontSize: 15,
    },
    titlePlaceholder: {
        flex: 2,
    },
})
