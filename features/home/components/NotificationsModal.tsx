import Colors from "@/constants/Colors"
import { AntDesign } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import { Chip } from "react-native-paper"
import WalletNotifications, { useGetNotifications } from "../../wallet/components/Wallet/WalletNotifications"
import useReadAllNotifications from "../../wallet/hooks/useReadAllNotifications"

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
        fontSize: 18,
        fontWeight: "bold",
    },
    closeButton: {
        padding: 8,
    },
    notificationsContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    badgeText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
        alignItems: "center",
        transform: [{ translateY: -1 }],
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
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
                <BlurView intensity={80} tint="dark" style={styles.blurBackground} />
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Notifications</Text>
                        <View style={styles.headerActions}>
                            {unreadCount > 0 && (
                                <Chip mode="outlined" onPress={handleClearAll}>
                                    <Text style={styles.badgeText}>Clear all {unreadCount}</Text>
                                </Chip>
                            )}
                            <TouchableOpacity onPress={closeNotifications} style={styles.closeButton}>
                                <AntDesign name="close" size={24} color={Colors.text_light} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.notificationsContainer}>
                        <WalletNotifications {...notification} />
                    </View>
                </View>
            </View>
        </Modal>
    )
}