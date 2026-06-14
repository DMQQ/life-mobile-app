import { FONTS } from "@/constants/Fonts"
import Colors from "@/constants/Colors"
import Text from "@/components/ui/Text/Text"
import GlassView from "@/components/ui/GlassView"
import { ConfirmDialog } from "@/components"
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
                <Pressable
                    onPress={() => navigation.navigate("Create", { shop })}
                    hitSlop={12}
                >
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
                        <Image source={{ uri: shop.image }} style={styles.image} resizeMode="contain" />
                    ) : (
                        <GlassView style={styles.imagePlaceholder}>
                            <SymbolView name="storefront.fill" size={44} tintColor={Colors.foreground_secondary} />
                        </GlassView>
                    )}
                    <GlassView style={styles.imageOverlay}>
                        {uploading ? (
                            <ActivityIndicator size={16} color={Colors.foreground} />
                        ) : (
                            <Feather name="camera" size={16} color={Colors.foreground} />
                        )}
                        <Text style={styles.imageOverlayText}>{shop.image ? "Change" : "Add image"}</Text>
                    </GlassView>
                </Pressable>

                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <SymbolView name="storefront.fill" size={14} tintColor={Colors.foreground_secondary} />
                        <Text style={styles.cardLabel}>Name</Text>
                        <Text style={styles.cardValue}>{shop.name}</Text>
                    </View>

                    {shop.osmId && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.cardRow}>
                                <SymbolView name="map.fill" size={14} tintColor={Colors.foreground_secondary} />
                                <Text style={styles.cardLabel}>OSM ID</Text>
                                <Text style={styles.cardValue}>{shop.osmId}</Text>
                            </View>
                        </>
                    )}

                    {shop.location && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.cardRow}>
                                <Feather name="map-pin" size={14} color={Colors.foreground_secondary} />
                                <Text style={styles.cardLabel}>Location</Text>
                                <Text style={styles.cardValue} numberOfLines={2}>{shop.location.name}</Text>
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
                        <Text style={[styles.actionText, { color: Colors.secondary }]}>Edit shop name</Text>
                        <Feather name="chevron-right" size={15} color={Colors.foreground_secondary} />
                    </Ripple>

                    <View style={styles.divider} />

                    <Ripple
                        onPress={handleSetImage}
                        style={styles.actionRow}
                        rippleColor={Color(Colors.secondary).alpha(0.1).string()}
                    >
                        <Feather name="camera" size={16} color={Colors.foreground_secondary} />
                        <Text style={styles.actionText}>{shop.image ? "Update image" : "Set image"}</Text>
                        <Feather name="chevron-right" size={15} color={Colors.foreground_secondary} />
                    </Ripple>

                    <View style={styles.divider} />

                    <Ripple
                        onPress={() => {
                            Feedback.trigger("impactLight")
                            setShowDelete(true)
                        }}
                        style={styles.actionRow}
                        rippleColor="rgba(240,112,112,0.1)"
                    >
                        <Feather name="trash-2" size={16} color="#F07070" />
                        <Text style={[styles.actionText, { color: "#F07070" }]}>Delete shop</Text>
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
    image: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    imageOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderRadius: 0,
    },
    imageOverlayText: {
        color: Colors.foreground,
        fontSize: 13,
        fontFamily: FONTS.medium,
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
        fontSize: 14,
        flex: 1,
    },
    cardValue: {
        color: Colors.foreground,
        fontSize: 14,
        fontFamily: FONTS.medium,
        textAlign: "right",
        flexShrink: 1,
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
        color: Colors.foreground,
        fontSize: 15,
        fontFamily: FONTS.medium,
    },
})
