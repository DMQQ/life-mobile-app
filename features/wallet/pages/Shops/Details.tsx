import Colors from "@/constants/Colors"
import { ConfirmDialog, Body, Caption } from "@/components"
import { Feather } from "@expo/vector-icons"
import { SymbolView } from "expo-symbols"
import * as ImagePicker from "expo-image-picker"
import axios from "axios"
import Url from "@/constants/Url"
import Color from "color"
import { useLayoutEffect, useState } from "react"
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Ripple from "react-native-material-ripple"
import Feedback from "react-native-haptic-feedback"
import GlassView from "@/components/ui/GlassView"
import useDeleteShop from "../../hooks/useDeleteShop"
import useShops, { ShopItem } from "../../hooks/useShops"

export default function ShopDetails({ navigation, route }: any) {
    const initialShop: ShopItem = route.params.shop
    const [shop, setShop] = useState<ShopItem>(initialShop)
    const [uploading, setUploading] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const [deleteShop] = useDeleteShop()
    const { refetch } = useShops()

    useLayoutEffect(() => {
        navigation.setOptions({
            title: shop.name,
            headerRight: () => (
                <Pressable onPress={() => navigation.navigate("Create", { shop })} hitSlop={12}>
                    <Feather name="edit-2" size={18} color={Colors.secondary} />
                </Pressable>
            ),
        })
    }, [shop, navigation])

    const handleSetImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!perm.granted) return

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })
        if (result.canceled) return

        const asset = result.assets[0]
        const formData = new FormData()
        formData.append("file", { uri: asset.uri, type: "image/jpeg", name: "shop.jpg" } as any)

        setUploading(true)
        try {
            const { data } = await axios.post<ShopItem>(Url.API + "/upload/shop/" + shop.id, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            setShop((prev) => ({ ...prev, image: data.image }))
            Feedback.trigger("impactMedium")
            refetch()
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async () => {
        await deleteShop({ variables: { id: shop.id } })
        Feedback.trigger("impactMedium")
        refetch()
        navigation.navigate("Index")
    }

    return (
        <SafeAreaView style={styles.safe} edges={[]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Pressable onPress={handleSetImage} style={styles.imageTouchable}>
                    {shop.image ? (
                        <Image
                            source={{ uri: Url.API + "/upload/images/" + shop.image }}
                            style={StyleSheet.absoluteFill}
                            resizeMode="cover"
                        />
                    ) : (
                        <GlassView style={[StyleSheet.absoluteFill, styles.imagePlaceholder]}>
                            <SymbolView name="storefront.fill" size={44} tintColor={Colors.foreground_secondary} />
                        </GlassView>
                    )}
                    <GlassView style={styles.imageOverlay}>
                        {uploading ? (
                            <ActivityIndicator size={16} color={Colors.foreground} />
                        ) : (
                            <Feather name="camera" size={14} color={Colors.foreground} />
                        )}
                        <Caption style={styles.overlayText}>{shop.image ? "Change" : "Add image"}</Caption>
                    </GlassView>
                </Pressable>

                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <SymbolView name="storefront.fill" size={14} tintColor={Colors.foreground_secondary} />
                        <Caption style={styles.cardLabel}>Name</Caption>
                        <Body style={styles.cardValue}>{shop.name}</Body>
                    </View>

                    {shop.osmId && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.cardRow}>
                                <SymbolView name="map.fill" size={14} tintColor={Colors.foreground_secondary} />
                                <Caption style={styles.cardLabel}>OSM ID</Caption>
                                <Body style={styles.cardValue}>{shop.osmId}</Body>
                            </View>
                        </>
                    )}

                    {shop.location && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.cardRow}>
                                <Feather name="map-pin" size={14} color={Colors.foreground_secondary} />
                                <Caption style={styles.cardLabel}>Location</Caption>
                                <Body style={styles.cardValue} numberOfLines={2}>
                                    {shop.location.name}
                                </Body>
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.actionsCard}>
                    <Ripple
                        onPress={() => {
                            Feedback.trigger("impactLight")
                            navigation.navigate("Create", { shop })
                        }}
                        style={styles.actionRow}
                        rippleColor={Color(Colors.secondary).alpha(0.1).string()}
                    >
                        <Feather name="edit-2" size={16} color={Colors.secondary} />
                        <Body style={[styles.actionText, { color: Colors.secondary }]}>Edit shop name</Body>
                        <Feather name="chevron-right" size={15} color={Colors.foreground_secondary} />
                    </Ripple>

                    <View style={styles.divider} />

                    <Ripple
                        onPress={handleSetImage}
                        style={styles.actionRow}
                        rippleColor={Color(Colors.secondary).alpha(0.1).string()}
                    >
                        <Feather name="camera" size={16} color={Colors.foreground_secondary} />
                        <Body style={styles.actionText}>{shop.image ? "Update image" : "Set image"}</Body>
                        <Feather name="chevron-right" size={15} color={Colors.foreground_secondary} />
                    </Ripple>

                    <View style={styles.divider} />

                    <Ripple
                        onPress={() => {
                            Feedback.trigger("impactLight")
                            setShowDelete(true)
                        }}
                        style={styles.actionRow}
                        rippleColor={Color(Colors.danger).alpha(0.1).string()}
                    >
                        <Feather name="trash-2" size={16} color={Colors.danger} />
                        <Body style={[styles.actionText, { color: Colors.danger }]}>Delete shop</Body>
                    </Ripple>
                </View>
            </ScrollView>

            <ConfirmDialog
                isVisible={showDelete}
                title={`Delete "${shop.name}"?`}
                description="Expenses linked to this shop will keep the shop name but lose the entity link."
                onConfirm={handleDelete}
                onDismiss={() => setShowDelete(false)}
                destructive
            />
        </SafeAreaView>
    )
}

const cardBg = Color(Colors.primary).lighten(0.12).hex()
const cardBorder = Color(Colors.primary).lighten(0.22).hex()

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    content: {
        padding: 16,
        paddingBottom: 60,
        gap: 16,
        alignItems: "center",
    },
    imageTouchable: {
        width: 140,
        height: 140,
        borderRadius: 24,
        overflow: "hidden",
        marginTop: 8,
        marginBottom: 4,
    },
    imagePlaceholder: {
        justifyContent: "center",
        alignItems: "center",
    },
    imageOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 38,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderRadius: 0,
    },
    overlayText: {
        color: Colors.foreground,
    },
    card: {
        width: "100%",
        backgroundColor: cardBg,
        borderRadius: 18,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: cardBorder,
        overflow: "hidden",
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    cardLabel: {
        color: Colors.foreground_secondary,
        flex: 1,
    },
    cardValue: {
        color: Colors.foreground,
        fontWeight: "500",
        textAlign: "right",
        flexShrink: 1,
        fontSize: 14,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: cardBorder,
    },
    actionsCard: {
        width: "100%",
        backgroundColor: cardBg,
        borderRadius: 18,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: cardBorder,
        overflow: "hidden",
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 15,
    },
    actionText: {
        flex: 1,
        fontWeight: "500",
        fontSize: 15,
    },
})
