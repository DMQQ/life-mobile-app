import Colors from "@/constants/Colors"
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import { Ionicons } from "@expo/vector-icons"

export function ActionRow({
    status,
    onSave,
    onEdit,
}: {
    status: "idle" | "loading" | "done" | "error"
    onSave: () => void
    onEdit: () => void
}) {
    return (
        <View style={sb.row}>
            <GlassView style={sb.editBtn}>
                <Pressable style={sb.btnInner} onPress={onEdit}>
                    <Ionicons name="create-outline" size={15} color={Colors.foreground} />
                    <Text style={sb.editBtnText}>Edit</Text>
                </Pressable>
            </GlassView>
            {status === "done" ? (
                <View style={sb.doneRow}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
                    <Text style={sb.doneText}>Saved</Text>
                </View>
            ) : (
                <GlassView
                    tintColor={status === "error" ? Colors.danger : Colors.secondary}
                    style={[sb.saveBtn, status === "loading" && { opacity: 0.6 }]}
                >
                    <Pressable style={sb.btnInner} onPress={onSave} disabled={status === "loading"}>
                        {status === "loading" ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={sb.btnText}>{status === "error" ? "Retry" : "Save"}</Text>
                        )}
                    </Pressable>
                </GlassView>
            )}
        </View>
    )
}

const sb = StyleSheet.create({
    row: { flexDirection: "row", justifyContent: "flex-end", gap: 8, alignItems: "center" },
    saveBtn: { borderRadius: 20, height: 36, overflow: "hidden", minWidth: 90 },
    editBtn: { borderRadius: 20, height: 36, overflow: "hidden", minWidth: 72 },
    btnInner: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 14,
    },
    btnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
    editBtnText: { color: Colors.foreground, fontSize: 13, fontWeight: "600" },
    doneRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
    doneText: { color: Colors.secondary, fontSize: 13, fontWeight: "600" },
})
