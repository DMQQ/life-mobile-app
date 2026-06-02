import { StyleSheet, View } from "react-native"
import { FONTS } from "@/constants/Fonts"
import { Feather } from "@expo/vector-icons"
import Dialog from "./Dialog/Dialog"
import Colors from "@/constants/Colors"
import Color from "color"

interface ConfirmDialogProps {
    isVisible: boolean
    onDismiss: () => void
    onConfirm: () => void | Promise<void>
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    destructive?: boolean
    loading?: boolean
}

export default function ConfirmDialog({
    isVisible,
    onDismiss,
    onConfirm,
    title,
    description,
    confirmLabel,
    cancelLabel = "Cancel",
    destructive = false,
    loading = false,
}: ConfirmDialogProps) {
    const accentColor = destructive ? Colors.danger : Colors.secondary
    const resolvedConfirmLabel = confirmLabel ?? (destructive ? "Delete" : "Confirm")

    return (
        <Dialog
            isVisible={isVisible}
            onDismiss={onDismiss}
            title={title}
            description={description}
            showCloseButton={false}
            icon={
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: Color(accentColor).alpha(0.15).string() },
                    ]}
                >
                    <Feather
                        name={destructive ? "trash-2" : "check-circle"}
                        size={22}
                        color={accentColor}
                    />
                </View>
            }
            iconPosition="left"
            buttonsPosition="right"
            buttonsDirection="row"
            buttons={[
                {
                    children: cancelLabel,
                    onPress: onDismiss,
                    variant: "text",
                    fontStyle: { color: Colors.foreground_secondary },
                },
                {
                    children: resolvedConfirmLabel,
                    onPress: onConfirm,
                    variant: "text",
                    loading,
                    fontStyle: { color: accentColor, fontFamily: FONTS.bold },
                },
            ]}
        />
    )
}

const styles = StyleSheet.create({
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
    },
})
