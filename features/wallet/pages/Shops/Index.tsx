import { FONTS } from "@/constants/Fonts"
import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import Input from "@/components/ui/TextInput/TextInput"
import GlassView from "@/components/ui/GlassView"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { useLayoutEffect, useState } from "react"
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Ripple from "react-native-material-ripple"
import Feedback from "react-native-haptic-feedback"
import ContextMenu from "react-native-context-menu-view"
import { ConfirmDialog } from "@/components"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller"
import useShops, { ShopItem } from "../../hooks/useShops"
import useDeleteShop from "../../hooks/useDeleteShop"
import { SymbolView } from "expo-symbols"
import lowOpacity from "@/utils/functions/lowOpacity"

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
                    <ActivityIndicator color={Colors.secondary} style={{ marginTop: 40 }} />
                ) : shops.length === 0 ? (
                    <View style={styles.empty}>
                        <SymbolView name="storefront" size={40} tintColor={Colors.foreground_secondary} />
                        <Text style={styles.emptyText}>No shops yet</Text>
                        <Text style={styles.emptySubtext}>
                            Shops are auto-created when you add an expense with a shop name
                        </Text>
                        <Pressable
                            onPress={() => {
                                Feedback.trigger("impactLight")
                                navigation.navigate("Create")
                            }}
                            style={styles.emptyBtn}
                        >
                            <Text style={styles.emptyBtnText}>Create manually</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {shops.map((shop, i) => (
                            <ContextMenu
                                key={shop.id}
                                actions={[
                                    { title: "Edit", systemIcon: "pencil" },
                                    { title: "View Details", systemIcon: "info.circle" },
                                    { title: "Delete", systemIcon: "trash", destructive: true },
                                ]}
                                onPress={(e) => {
                                    const idx = e.nativeEvent.index
                                    if (idx === 0) {
                                        Feedback.trigger("impactLight")
                                        navigation.navigate("Create", { shop })
                                    } else if (idx === 1) {
                                        navigation.navigate("Details", { shop })
                                    } else if (idx === 2) {
                                        Feedback.trigger("impactMedium")
                                        setDeleteTarget(shop)
                                    }
                                }}
                                previewBackgroundColor="transparent"
                            >
                                <Ripple
                                    onPress={() => navigation.navigate("Details", { shop })}
                                    style={[styles.row, i < shops.length - 1 && styles.rowBorder]}
                                    rippleColor={Color(Colors.secondary).alpha(0.08).string()}
                                >
                                    <View style={styles.imageWrap}>
                                        {shop.image ? (
                                            <Image
                                                source={{ uri: shop.image }}
                                                style={styles.image}
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <GlassView style={styles.imagePlaceholder}>
                                                <SymbolView
                                                    name="storefront.fill"
                                                    size={16}
                                                    tintColor={Colors.foreground_secondary}
                                                />
                                            </GlassView>
                                        )}
                                    </View>

                                    <View style={styles.info}>
                                        <Text style={styles.name}>{shop.name}</Text>
                                        {shop.location?.name && (
                                            <Text style={styles.location} numberOfLines={1}>
                                                {shop.location.name}
                                            </Text>
                                        )}
                                    </View>

                                    <Feather name="chevron-right" size={16} color={Colors.foreground_secondary} />
                                </Ripple>
                            </ContextMenu>
                        ))}
                    </View>
                )}

                <View style={{ height: 100 }} />
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

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    content: {
        paddingTop: 8,
        paddingBottom: 50,
    },
    list: {
        paddingHorizontal: 15,
    },
    empty: {
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 30,
        gap: 10,
    },
    emptyText: {
        color: Colors.foreground,
        fontSize: 17,
        fontFamily: FONTS.semibold,
    },
    emptySubtext: {
        color: Colors.foreground_secondary,
        fontSize: 13,
        textAlign: "center",
        lineHeight: 18,
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
        fontFamily: FONTS.medium,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 13,
        gap: 12,
    },
    rowBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderColor,
    },
    imageWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
    },
    info: {
        flex: 1,
    },
    name: {
        color: Colors.foreground,
        fontSize: 15,
        fontFamily: FONTS.semibold,
    },
    location: {
        color: Colors.foreground_secondary,
        fontSize: 12,
        marginTop: 2,
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
