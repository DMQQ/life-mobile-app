import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { FONTS } from "@/constants/Fonts"
import { Feather } from "@expo/vector-icons"
import Text from "./Text/Text"
import GlassButton from "./GlassButton"
import Colors from "@/constants/Colors"

type FeatherName = React.ComponentProps<typeof Feather>["name"]

interface EmptyStateProps {
    icon: FeatherName
    title: string
    description?: string
    actionLabel?: string
    actionIcon?: FeatherName
    onAction?: () => void
    style?: StyleProp<ViewStyle>
}

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionIcon,
    onAction,
    style,
}: EmptyStateProps) {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.iconContainer}>
                <Feather name={icon} size={36} color={Colors.text_dark} />
            </View>
            <Text variant="subtitle" style={styles.title}>
                {title}
            </Text>
            {description && (
                <Text variant="caption" style={styles.description}>
                    {description}
                </Text>
            )}
            {actionLabel && onAction && (
                <GlassButton
                    label={actionLabel}
                    icon={actionIcon}
                    onPress={onAction}
                    variant="accent"
                    style={styles.action}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
        gap: 10,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.primary_lighter,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    title: {
        textAlign: "center",
        fontFamily: FONTS.semibold,
        color: Colors.foreground,
        opacity: 1,
    },
    description: {
        textAlign: "center",
        color: Colors.text_dark,
        lineHeight: 20,
    },
    action: {
        marginTop: 6,
    },
})
