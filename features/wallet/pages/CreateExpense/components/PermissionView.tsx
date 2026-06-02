import { FONTS } from "@/constants/Fonts"
import GlassView from "@/components/ui/GlassView"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import { Feather } from "@expo/vector-icons"
import { Pressable, StyleSheet, View } from "react-native"

export default function PermissionView({ onRequest }: { onRequest: () => void }) {
    return (
        <View style={styles.permissionView}>
            <GlassView style={styles.permissionIcon}>
                <Feather name="camera-off" size={28} color={Colors.foreground_secondary} />
            </GlassView>
            <Text variant="body" style={styles.permissionText}>
                Camera access required
            </Text>
            <Pressable onPress={onRequest}>
                <GlassView style={styles.permissionBtn}>
                    <Text style={styles.permissionBtnLabel}>Allow camera</Text>
                </GlassView>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    permissionView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 14,
    },
    permissionIcon: {
        width: 64,
        height: 64,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
    },
    permissionText: {
        color: Colors.foreground_secondary,
    },
    permissionBtn: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 100,
    },
    permissionBtnLabel: {
        color: Colors.secondary,
        fontSize: 15,
        fontFamily: FONTS.semibold,
    },
})
