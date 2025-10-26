import { Button } from "@/components"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import WalletNotifications, { useGetNotifications } from "../../wallet/components/Wallet/WalletNotifications"
import useReadAllNotifications from "../../wallet/hooks/useReadAllNotifications"
import GlassView from "@/components/ui/GlassView"

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    blurBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        paddingTop: 60,
    },
    modalTitle: {
        color: Colors.text_light,
        fontWeight: "bold",
    },
    closeButton: {},
    notificationsContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    badgeText: {
        color: Colors.foreground,
        alignItems: "center",
        transform: [{ translateY: -1 }],
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderRadius: 100,
        padding: 10,
    },
})

interface NotificationsModalProps {
    visible: boolean
    onClose: () => void
}

export default function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
    const { unreadCount, refetch: refetchNotifications, ...notification } = useGetNotifications()
    const { readAllNotifications } = useReadAllNotifications()

    const closeNotifications = () => {
        Feedback.trigger("impactLight")
        onClose()
    }

    const handleClearAll = async () => {
        await readAllNotifications()
        await refetchNotifications()
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="overFullScreen"
            transparent={true}
            onRequestClose={closeNotifications}
        >
            <View style={styles.modalContainer}>
                <BlurView intensity={20} tint="dark" style={styles.blurBackground} />
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text variant="body" style={styles.modalTitle}>
                            Notifications
                        </Text>
                        <GlassView style={styles.headerActions}>
                            {unreadCount > 0 && (
                                <Button
                                    type="text"
                                    onPress={handleClearAll}
                                    fontStyle={{ fontSize: 13, color: "#fff", textTransform: "none" }}
                                    style={{ padding: 5 }}
                                >
                                    Clear all ({unreadCount})
                                </Button>
                            )}
                            <TouchableOpacity onPress={closeNotifications}>
                                <AntDesign name="close" size={20} color={Colors.text_light} />
                            </TouchableOpacity>
                        </GlassView>
                    </View>
                    <View style={styles.notificationsContainer}>
                        <WalletNotifications {...notification} />
                    </View>
                </View>
            </View>
        </Modal>
    )
}
