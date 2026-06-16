import Colors from "@/constants/Colors"
import Input from "@/components/ui/TextInput/TextInput"
import GlassView from "@/components/ui/GlassView"
import { Feather } from "@expo/vector-icons"
import { useState, useLayoutEffect } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Feedback from "react-native-haptic-feedback"
import { ConfirmDialog, Body, Caption } from "@/components"
import { SymbolView } from "expo-symbols"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller"
import lowOpacity from "@/utils/functions/lowOpacity"
import useShops, { ShopItem } from "../../hooks/useShops"
import useDeleteShop from "../../hooks/useDeleteShop"
import ShopCard from "../../components/Shops/ShopCard"

export default function ShopsIndex({ navigation }: any) {
    const [search, setSearch] = useState("")
    const { data, loading, refetch } = useShops(search || undefined)
    const [deleteShop] = useDeleteShop()
    const [deleteTarget, setDeleteTarget] = useState<ShopItem | null>(null)

    const { height } = useReanimatedKeyboardAnimation()
    const barAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateY: height.value }] }))

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    onPress={() => {
                        Feedback.trigger("impactLight")
                        navigation.navigate("Create")
                    }}
                    hitSlop={12}
                >
                    <Feather name="plus" size={20} color={Colors.secondary} />
                </Pressable>
            ),
            headerLeft: () => (
                <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
                    <Feather name="x" size={20} color={Colors.foreground} />
                </Pressable>
            ),
        })
    }, [navigation])

    const shops = data?.shops ?? []

    const handleDelete = async () => {
        if (!deleteTarget) return
        await deleteShop({ variables: { id: deleteTarget.id } })
        setDeleteTarget(null)
        refetch()
    }

    return (
        <SafeAreaView style={styles.safe} edges={[]}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="on-drag"
            >
                {loading && shops.length === 0 ? (
                    <ActivityIndicator color={Colors.secondary} style={styles.loader} />
                ) : shops.length === 0 ? (
                    <EmptyState onCreatePress={() => navigation.navigate("Create")} />
                ) : (
                    <View style={styles.list}>
                        {shops.map((shop) => (
                            <ShopCard
                                key={shop.id}
                                shop={shop}
                                onPress={() => navigation.navigate("Details", { shop })}
                                onEdit={() => {
                                    Feedback.trigger("impactLight")
                                    navigation.navigate("Create", { shop })
                                }}
                                onDelete={() => {
                                    Feedback.trigger("impactMedium")
                                    setDeleteTarget(shop)
                                }}
                            />
                        ))}
                    </View>
                )}

                <View style={styles.bottomSpacer} />
            </ScrollView>

            <Animated.View style={[styles.searchBar, barAnimStyle]}>
                <GlassView style={styles.searchGlass}>
                    <Feather name="search" size={16} color={Colors.foreground_secondary} style={styles.searchIcon} />
                    <Input
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search shops..."
                        flat
                        containerStyle={styles.searchInput}
                    />
                    {search.length > 0 && (
                        <Pressable onPress={() => setSearch("")} hitSlop={8}>
                            <Feather name="x" size={16} color={Colors.foreground_secondary} />
                        </Pressable>
                    )}
                </GlassView>
            </Animated.View>

            <ConfirmDialog
                isVisible={!!deleteTarget}
                title={`Delete "${deleteTarget?.name}"?`}
                description="Expenses linked to this shop will keep the shop name but lose the entity link."
                onConfirm={handleDelete}
                onDismiss={() => setDeleteTarget(null)}
                destructive
            />
        </SafeAreaView>
    )
}

function EmptyState({ onCreatePress }: { onCreatePress: () => void }) {
    return (
        <View style={styles.empty}>
            <SymbolView name="storefront" size={44} tintColor={Colors.foreground_secondary} />
            <Body style={styles.emptyTitle}>No shops yet</Body>
            <Caption style={styles.emptySubtext}>
                Shops are auto-created when you add an expense with a shop name
            </Caption>
            <Pressable onPress={onCreatePress} style={styles.emptyBtn}>
                <Body style={styles.emptyBtnText}>Create manually</Body>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    content: {
        paddingTop: 8,
        paddingBottom: 50,
    },
    loader: {
        marginTop: 40,
    },
    list: {
        paddingHorizontal: 15,
        gap: 8,
    },
    bottomSpacer: {
        height: 100,
    },
    empty: {
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 30,
        gap: 10,
    },
    emptyTitle: {
        fontWeight: "600",
    },
    emptySubtext: {
        color: Colors.foreground_secondary,
        textAlign: "center",
        lineHeight: 20,
    },
    emptyBtn: {
        marginTop: 6,
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
    },
    searchBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 15,
        paddingBottom: 30,
    },
    searchGlass: {
        borderRadius: 100,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        gap: 8,
    },
    searchIcon: {
        flexShrink: 0,
    },
    searchInput: {
        flex: 1,
        borderRadius: 0,
        backgroundColor: "transparent",
        borderWidth: 0,
    },
})
