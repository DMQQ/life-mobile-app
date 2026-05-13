import { Button, ModalHeader } from "@/components"
import IconCloseButton from "@/components/ui/Button/IconCloseButton"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { BlurView } from "expo-blur"
import { StyleSheet, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import WalletNotifications, { useGetNotifications } from "../../wallet/components/Wallet/WalletNotifications"
import useReadAllNotifications from "../../wallet/hooks/useReadAllNotifications"
import { HomeScreenProps } from "../Main"

const styles = StyleSheet.create({
    container: { flex: 1 },
    blur: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    content: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255,255,255,0.1)",
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    title: { color: Colors.text_light, fontWeight: "bold" },
    body: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
})

export default function NotificationsScreen({ navigation }: HomeScreenProps<"HomeNotifications">) {
    const { unreadCount, refetch: refetchNotifications, data, error, loading } = useGetNotifications()
    const { readAllNotifications } = useReadAllNotifications()

    const handleClose = () => {
        Feedback.trigger("impactLight")
        navigation.goBack()
    }

    const handleClearAll = async () => {
        await readAllNotifications()
        await refetchNotifications()
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* <View style={styles.header}>
                    <Text variant="body" style={styles.title}>
                        Notifications
                    </Text>
                    <View style={styles.headerLeft}>
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
                        <IconCloseButton onPress={handleClose} />
                    </View>
                </View> */}

                <ModalHeader
                    onClose={handleClose}
                    onSave={handleClearAll}
                    saveLabel="Clear all"
                    saveDisabled={unreadCount === 0}
                    saveLoading={loading}
                    title={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                />
                <View style={styles.body}>
                    <WalletNotifications data={data} error={error} loading={loading} />
                </View>
            </View>
        </View>
    )
}
