import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import { Feather } from "@expo/vector-icons"
import { Pressable, StyleSheet, View } from "react-native"
import dayjs from "dayjs"
import { Conversation } from "../types"

interface Props {
    conversation: Conversation
    onPress: () => void
}

export default function ConversationListItem({ conversation, onPress }: Props) {
    return (
        <Pressable onPress={onPress}>
            <GlassView style={s.container}>
                <View style={s.iconWrap}>
                    <Feather name="message-circle" size={14} color={Colors.secondary} />
                </View>
                <View style={s.content}>
                    <Text style={s.title} numberOfLines={1}>
                        {conversation.title ?? "New conversation"}
                    </Text>

                    {conversation.description && (
                        <Text style={s.description} numberOfLines={5}>
                            {conversation.description}
                        </Text>
                    )}

                    <Text style={s.sub}>{dayjs(conversation.updatedAt).format("MMM D, HH:mm")}</Text>
                </View>

                <Feather name="chevron-right" size={16} color={Colors.foreground_secondary} />
            </GlassView>
        </Pressable>
    )
}

const s = StyleSheet.create({
    container: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 16 },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: 100,
        backgroundColor: `${Colors.secondary}22`,
        alignItems: "center",
        justifyContent: "center",
    },
    content: { flex: 1, gap: 5 },
    title: { fontSize: 14, color: Colors.foreground, lineHeight: 18 },
    sub: { fontSize: 12, color: Colors.text_dark, marginTop: 2 },
    description: { fontSize: 12, color: Colors.foreground_secondary, marginTop: 2 },
})
