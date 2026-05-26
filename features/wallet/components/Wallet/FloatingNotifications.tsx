import CollapsibleStack from "@/components/ui/CollapsableStack"
import GlassView from "@/components/ui/GlassView"
import Colors from "@/constants/Colors"
import { LinearGradient } from "expo-linear-gradient"
import { useCallback, useEffect, useRef, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { formatTimeAgo, Notification, useGetNotifications, useReadNotification } from "./useNotifications"

export function FloatingNotificationItem({
    notification,
    onDismiss,
    index,
    isExpanded,
}: {
    notification: Notification
    onDismiss: (id: string) => void
    index: number
    isExpanded?: boolean
}) {
    const { handlePress } = useReadNotification(notification, onDismiss)

    return (
        <Pressable onPress={handlePress}>
            <Animated.View style={[styles.notificationCard, { zIndex: isExpanded ? 9999 : index }]}>
                <GlassView style={styles.blurContainer}>
                    <View style={[styles.notificationContent, { paddingRight: 15 }]}>
                        <View
                            style={[
                                styles.contentContainer,
                                { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
                            ]}
                        >
                            <Text style={[styles.title, { fontSize: 14 }]} numberOfLines={2}>
                                {notification.message.title}
                            </Text>
                            <Text style={{ fontSize: 12, color: Colors.secondary, fontWeight: "bold" }}>
                                {formatTimeAgo(notification.sendAt)}
                            </Text>
                        </View>

                        <Text
                            style={[styles.body, { marginTop: 2.5, marginBottom: 0, fontSize: 12 }]}
                            numberOfLines={3}
                        >
                            {notification.message.body}
                        </Text>
                    </View>
                </GlassView>
            </Animated.View>
        </Pressable>
    )
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

export function FloatingNotifications() {
    const { data, loading, error } = useGetNotifications()
    const insets = useSafeAreaInsets()
    const [showNotifications, setShowNotifications] = useState(true)
    const [autoHideDisabled, setAutoHideDisabled] = useState(false)
    const [stackExpanded, setStackExpanded] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (stackExpanded) {
            setAutoHideDisabled(true)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [stackExpanded])

    useEffect(() => {
        if (((data?.notifications || []) as Notification[]).filter((n) => !n.read).length > 0) {
            setShowNotifications(true)
            setAutoHideDisabled(false)

            if (!autoHideDisabled) {
                timeoutRef.current = setTimeout(() => {
                    setShowNotifications(false)
                }, 5000)
            }

            return () => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
            }
        }
    }, [data, autoHideDisabled])

    const notifications = ((data?.notifications || []) as Notification[]).filter((n) => !n.read)

    const renderItem = useCallback(
        ({ item, index, isExpanded }: { item: Notification; index: number; isExpanded: boolean }) => (
            <FloatingNotificationItem notification={item} index={index} onDismiss={() => {}} isExpanded={isExpanded} />
        ),
        [],
    )

    if (loading || error || notifications.length === 0 || !showNotifications) {
        return null
    }

    return (
        <AnimatedLinearGradient
            colors={["rgba(0, 0, 0, 0.5)", "transparent"]}
            entering={FadeInDown}
            exiting={FadeOutUp}
            style={{
                position: "absolute",
                zIndex: 1000,
                top: 0,
                left: 0,
                right: 0,
                paddingTop: insets.top - 15,
                paddingHorizontal: 15,
                paddingBottom: 50,
            }}
        >
            <CollapsibleStack
                items={notifications.slice(0, 4)}
                renderItem={renderItem}
                getItemKey={(item: Notification) => item.id}
                showHeader={false}
                animation={{
                    stackSpacing: 15,
                    maxVisibleItems: 3,
                }}
                expandOnPress
                onChange={setStackExpanded}
            />
        </AnimatedLinearGradient>
    )
}

const styles = StyleSheet.create({
    notificationCard: {
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    blurContainer: {
        flex: 1,
        borderRadius: 20,
    },
    notificationContent: {
        padding: 20,
        paddingRight: 50,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    contentContainer: {
        flex: 1,
        minHeight: 0,
    },
    title: {
        color: Colors.text_light,
        fontSize: 16,
        fontWeight: "600",
        lineHeight: 20,
        marginBottom: 4,
    },
    body: {
        color: Colors.text_light,
        fontSize: 14,
        lineHeight: 18,
        opacity: 0.85,
        marginBottom: 10,
    },
})
