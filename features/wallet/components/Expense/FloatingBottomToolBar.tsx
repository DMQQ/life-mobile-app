import { IconButton } from "@/components"
import GlassView from "@/components/ui/GlassView"
import Colors from "@/constants/Colors"
import { SFSymbols6_0 } from "sf-symbols-typescript"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import ContextMenu from "react-native-context-menu-view"

export type ContextMenuOption = {
    label: string
    icon: string
    onPress: () => void
    destructive?: boolean
}

interface Props {
    onRefund: () => void
    refundLoading?: boolean
    isRefunded?: boolean
    onTakePhoto: () => void
    onPickImage: () => void
    subscriptionMenuOptions: ContextMenuOption[]
    subscriptionOptions: Array<{ id: string | null; description: string }>
    onAssignSubscription: (subscriptionId: string | null) => Promise<void>
    isSubscriptionLoading?: boolean
    hasSubscription?: boolean
    isSubscriptionActive?: boolean
    onSetLocation: () => void
}

export default function FloatingBottomToolBar({
    onRefund,
    refundLoading,
    isRefunded,
    onTakePhoto,
    onPickImage,
    subscriptionMenuOptions,
    subscriptionOptions,
    onAssignSubscription,
    isSubscriptionLoading,
    hasSubscription,
    isSubscriptionActive,
    onSetLocation,
}: Props) {
    const subscriptionIcon: SFSymbols6_0 = hasSubscription
        ? isSubscriptionActive
            ? "repeat.circle.fill"
            : "repeat.circle"
        : "repeat"

    return (
        <View style={styles.toolbar} pointerEvents="box-none">
            <GlassView style={styles.toolbarInner}>
                <ToolbarButton
                    icon="arrow.counterclockwise"
                    label="Refund"
                    onPress={onRefund}
                    disabled={isRefunded || refundLoading}
                    loading={refundLoading}
                    dimmed={isRefunded}
                />

                <ContextMenu
                    style={{ flex: 1 }}
                    dropdownMenuMode
                    actions={[
                        ...subscriptionMenuOptions.map((o) => ({
                            title: o.label,
                            systemIcon: o.icon,
                            destructive: o.destructive,
                        })),
                        {
                            systemIcon: "arrow-triangle.swap",
                            icon: "arrow.triangle.swap",
                            title: "Assign",
                            actions: [
                                ...subscriptionOptions.map((o) => ({
                                    title: o.description,
                                    systemIcon: "arrow.triangle.swap" as string,
                                })),
                            ],
                        },
                    ]}
                    onPress={(e) => {
                        const index = e.nativeEvent.index
                        const subMenuCount = subscriptionMenuOptions.length
                        if (index < subMenuCount) {
                            subscriptionMenuOptions[index]?.onPress()
                        } else {
                            const subIndex = index - subMenuCount
                            onAssignSubscription(subscriptionOptions[subIndex]?.id)
                        }
                    }}
                >
                    <ToolbarButton
                        icon={subscriptionIcon}
                        label="Subscription"
                        loading={isSubscriptionLoading}
                        hasBadge={!!(hasSubscription && isSubscriptionActive)}
                    />
                </ContextMenu>

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
                    <ToolbarButton icon="photo.badge.plus" label="Upload" />
                </ContextMenu>

                <ToolbarButton icon="location.fill" label="Location" onPress={onSetLocation} />
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
}: {
    icon: SFSymbols6_0
    label: string
    onPress?: () => void
    disabled?: boolean
    loading?: boolean
    dimmed?: boolean
    hasBadge?: boolean
}) {
    return (
        <View style={styles.toolbarItem}>
            <View>
                <IconButton
                    icon={
                        loading ? (
                            <ActivityIndicator
                                size={26}
                                color={Colors.secondary}
                                style={{ marginTop: 3, height: 13 }}
                            />
                        ) : (
                            icon
                        )
                    }
                    onPress={onPress ?? (() => {})}
                    disabled={disabled}
                    size={26}
                    style={[styles.iconBtn, (dimmed || disabled) && styles.iconBtnDisabled]}
                />
                {hasBadge && <View style={styles.badge} />}
            </View>

            <Text size={9} weight="500" letterSpacing={0.1} color={Colors.foreground_secondary} opacity={(dimmed || disabled) ? 0.35 : undefined}>{label}</Text>
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
