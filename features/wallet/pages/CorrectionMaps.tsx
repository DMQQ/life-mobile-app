import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import IconButton from "@/components/ui/IconButton/IconButton"
import { AntDesign } from "@expo/vector-icons"
import { useCallback, useEffect } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Feedback from "react-native-haptic-feedback"
import lowOpacity from "@/utils/functions/lowOpacity"
import GlassView from "@/components/ui/GlassView"
import CorrectionMapItem from "../components/CorrectionMap/CorrectionMapItem"
import { useCorrectionMaps, type CorrectionMap } from "../hooks/useCorrectionMaps"
import { WalletScreens } from "../Main"

export type CorrectionMapsParams = {
    prefill?: {
        shop?: string
        description?: string
        category?: string
        amount?: number
    }
}

export default function CorrectionMapsScreen({ navigation, route }: WalletScreens<"CorrectionMaps">) {
    const { maps, loading, deleteCorrectionMap, toggleActive } = useCorrectionMaps()

    const prefill = (route as any)?.params?.prefill as CorrectionMapsParams["prefill"] | undefined

    const openAdd = useCallback(() => {
        Feedback.trigger("impactLight")
        navigation.navigate("CorrectionMapForm", { prefill })
    }, [prefill])

    const openEdit = useCallback((item: CorrectionMap) => {
        Feedback.trigger("impactLight")
        navigation.navigate("CorrectionMapForm", { editingItem: item })
    }, [])

    const handleDelete = useCallback(async (id: string) => {
        Feedback.trigger("impactMedium")
        await deleteCorrectionMap(id)
    }, [])

    useEffect(() => {
        if (prefill) {
            openAdd()
        }
    }, [prefill, openAdd])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <GlassView style={{ borderRadius: 100, padding: 7.5 }}>
                    <IconButton
                        icon={<AntDesign name="close" size={22} color={Colors.foreground} />}
                        onPress={() => navigation.goBack()}
                    />
                </GlassView>
                <Text variant="title" style={styles.title}>
                    Correction Rules
                </Text>
                <GlassView style={{ borderRadius: 100, padding: 7.5 }}>
                    <IconButton icon={<AntDesign name="plus" size={22} color={Colors.secondary} />} onPress={openAdd} />
                </GlassView>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.subtitle}>
                    Auto-correct shop names and categories on card-tap expenses. First matching rule wins.
                </Text>

                {loading ? (
                    <ActivityIndicator color={Colors.secondary} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {maps.map((item) => (
                            <CorrectionMapItem
                                key={item.id}
                                item={item}
                                onEdit={openEdit}
                                onDelete={handleDelete}
                                onToggle={toggleActive}
                            />
                        ))}

                        {maps.length === 0 && (
                            <View style={styles.empty}>
                                <Text style={styles.emptyText}>No rules yet</Text>
                                <Text style={styles.emptySubtext}>e.g. "Mariola Iwanska Firma" → Lewiatan</Text>
                                <Pressable onPress={openAdd} style={styles.emptyBtn}>
                                    <Text style={styles.emptyBtnText}>Add first rule</Text>
                                </Pressable>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
    },
    scroll: { flex: 1 },
    scrollContent: {
        padding: 15,
        paddingBottom: 50,
    },
    subtitle: {
        color: Colors.foreground_secondary,
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 18,
    },
    empty: {
        alignItems: "center",
        paddingVertical: 52,
        gap: 10,
    },
    emptyText: {
        color: Colors.foreground,
        fontSize: 17,
        fontWeight: "600",
    },
    emptySubtext: {
        color: Colors.foreground_secondary,
        fontSize: 13,
        textAlign: "center",
    },
    emptyBtn: {
        marginTop: 4,
        paddingHorizontal: 20,
        paddingVertical: 9,
        borderRadius: 100,
        backgroundColor: lowOpacity(Colors.secondary, 0.15),
        borderWidth: 1,
        borderColor: lowOpacity(Colors.secondary, 0.35),
    },
    emptyBtnText: {
        color: Colors.secondary,
        fontSize: 14,
        fontWeight: "500",
    },
})
