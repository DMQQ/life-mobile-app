import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import { Feather } from "@expo/vector-icons"
import { Pressable, StyleSheet, TextInput, View } from "react-native"

interface Props {
    value: string
    onChangeText: (text: string) => void
    onSend: () => void
    onStartVoice: () => void
    onStopVoice: () => void
    isRecording: boolean
    partialText: string
    busy: boolean
}

export default function ChatInput({
    value,
    onChangeText,
    onSend,
    onStartVoice,
    onStopVoice,
    isRecording,
    partialText,
    busy,
}: Props) {
    const canSend = value.trim().length > 0 && !busy

    return (
        <GlassView style={s.container}>
            {isRecording ? (
                <GlassView tintColor={Colors.danger} style={s.voiceRow}>
                    <Pressable style={s.voiceInner} onPress={onStopVoice}>
                        <Feather name="square" size={18} color="#fff" />
                        <Text style={s.voiceText}>{partialText || "Listening… tap to stop"}</Text>
                    </Pressable>
                </GlassView>
            ) : (
                <>
                    <GlassView style={s.iconBtn}>
                        <Pressable style={s.iconBtnInner} onPress={onStartVoice} disabled={busy}>
                            <Feather name="mic" size={18} color={Colors.foreground_secondary} />
                        </Pressable>
                    </GlassView>
                    <View style={s.textInput}>
                        <TextInput
                            style={s.textInputInner}
                            value={value}
                            onChangeText={onChangeText}
                            placeholder="Ask anything…"
                            placeholderTextColor={Colors.foreground_disabled}
                            onSubmitEditing={onSend}
                            returnKeyType="send"
                            editable={!busy}
                            multiline
                        />
                    </View>
                    <GlassView
                        tintColor={canSend ? Colors.secondary : undefined}
                        style={[s.iconBtn, !canSend && s.dimmed]}
                    >
                        <Pressable style={s.iconBtnInner} disabled={!canSend} onPress={onSend}>
                            <Feather name="send" size={18} color="#fff" />
                        </Pressable>
                    </GlassView>
                </>
            )}
        </GlassView>
    )
}

const s = StyleSheet.create({
    container: { borderRadius: 30, flexDirection: "row", alignItems: "center", padding: 10, gap: 8 },
    textInput: { flex: 1 },
    textInputInner: { color: "#fff", paddingHorizontal: 16, paddingVertical: 10, minHeight: 44 },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 100,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    iconBtnInner: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center" },
    voiceRow: { borderRadius: 100, height: 50, overflow: "hidden", flex: 1 },
    voiceInner: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 15 },
    voiceText: { flex: 1, color: "#fff", fontSize: 13, opacity: 0.9 },
    dimmed: { opacity: 0.4 },
})
