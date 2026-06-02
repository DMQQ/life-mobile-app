import { IconButton } from "@/components"
import GlassView from "@/components/ui/GlassView"
import Colors from "@/constants/Colors"
import { SFSymbols6_0 } from "sf-symbols-typescript"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import ContextMenu from "react-native-context-menu-view"

interface Props {
    onAddTodo: () => void
    onTakePhoto: () => void
    onPickImage: () => void
    uploadLoading?: boolean
    onStartActivity: () => void
    activityPending?: boolean
    onDo?: () => void
    isCompleted?: boolean
}

export default function FloatingBottomToolBar({
    onAddTodo,
    onTakePhoto,
    onPickImage,
    uploadLoading,
    onStartActivity,
    activityPending,
    onDo,
    isCompleted,
}: Props) {
    return (
        <View style={styles.toolbar} pointerEvents="box-none">
            <GlassView style={styles.toolbarInner}>
                <ToolbarButton icon="checklist" label="Add Todo" onPress={onAddTodo} />

                <ContextMenu
                    style={{ flex: 1 }}
                    dropdownMenuMode
                    actions={[
                        { title: "Take Photo", systemIcon: "camera.fill" },
                        { title: "Choose from Library", systemIcon: "photo.on.rectangle.angled" },
                    ]}
                    onPress={(e) => {
                        if (e.nativeEvent.index === 0) onTakePhoto()
                        else onPickImage()
                    }}
                >
                    <ToolbarButton icon="photo.badge.plus" label="Upload" loading={uploadLoading} />
                </ContextMenu>

                <ToolbarButton
                    icon="play.circle"
                    label="Activity"
                    onPress={onStartActivity}
                    disabled={activityPending}
                    dimmed={activityPending}
                />

                {!isCompleted && onDo && <ToolbarButton icon="bolt.fill" label="Work on it" onPress={onDo} />}
            </GlassView>
        </View>
    )
}

function ToolbarButton({
    icon,
    label,
    onPress,
    disabled,
    loading,
    dimmed,
    hasBadge,
    accent,
}: {
    icon: SFSymbols6_0
    label: string
    onPress?: () => void
    disabled?: boolean
    loading?: boolean
    dimmed?: boolean
    hasBadge?: boolean
    accent?: boolean
}) {
    return (
        <View style={styles.toolbarItem}>
            <View>
                <IconButton
                    icon={icon}
                    onPress={onPress ?? (() => {})}
                    disabled={disabled}
                    size={26}
                    style={[
                        styles.iconBtn,
                        (dimmed || disabled) && styles.iconBtnDisabled,
                        accent && styles.iconBtnAccent,
                    ]}
                />
                {hasBadge && <View style={styles.badge} />}
            </View>
            {loading ? (
                <ActivityIndicator size="small" color={Colors.secondary} style={{ marginTop: 3, height: 13 }} />
            ) : (
                <Text
                    size={9}
                    weight="500"
                    letterSpacing={0.1}
                    color={accent ? Colors.secondary : Colors.foreground_secondary}
                    opacity={(dimmed || disabled) ? 0.35 : undefined}
                >
                    {label}
                </Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    toolbar: {
        position: "absolute",
        left: 15,
        right: 15,
        bottom: 15,
    },
    toolbarInner: {
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderRadius: 100,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    toolbarItem: {
        flex: 1,
        alignItems: "center",
        gap: 2,
    },
    iconBtn: {
        padding: 9,
        borderRadius: 100,
    },
    iconBtnDisabled: {
        opacity: 0.3,
    },
    iconBtnAccent: {
        backgroundColor: Colors.secondary + "22",
    },
    badge: {
        position: "absolute",
        top: 7,
        right: 7,
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: Colors.secondary,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
})
