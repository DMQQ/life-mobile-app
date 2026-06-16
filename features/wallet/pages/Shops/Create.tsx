import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Body, Caption } from "@/components"
import Input from "@/components/ui/TextInput/TextInput"
import Section from "@/components/ui/Section"
import GlassView from "@/components/ui/GlassView"
import { Feather } from "@expo/vector-icons"
import { SymbolView } from "expo-symbols"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import axios from "axios"
import Url from "@/constants/Url"
import Color from "color"
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps"
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useCallback, useLayoutEffect, useRef, useState } from "react"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"
import useCreateShop from "../../hooks/useCreateShop"
import useUpdateShop from "../../hooks/useUpdateShop"
import { ShopItem } from "../../hooks/useShops"

const DELTA = { latitudeDelta: 0.005, longitudeDelta: 0.005 }

type Coords = { latitude: number; longitude: number }

export default function ShopsCreate({ navigation, route }: any) {
    const shop: ShopItem | undefined = route.params?.shop
    const isEditing = !!shop

    const [name, setName] = useState(shop?.name ?? "")
    const [imageUri, setImageUri] = useState<string | null>(null)
    const existingImage = shop?.image ? Url.API + "/upload/images/" + shop.image : null

    const [addressQuery, setAddressQuery] = useState(shop?.location?.name ?? "")
    const [searching, setSearching] = useState(false)
    const [coords, setCoords] = useState<Coords | null>(
        shop?.location ? { latitude: shop.location.latitude, longitude: shop.location.longitude } : null,
    )
    const [detectedAddress, setDetectedAddress] = useState<string | null>(shop?.location?.name ?? null)

    const [saving, setSaving] = useState(false)
    const mapRef = useRef<MapView>(null)
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [createShop] = useCreateShop()
    const [updateShop] = useUpdateShop()

    const valid = name.trim().length > 0

    const pickImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!perm.granted) return
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })
        if (!result.canceled) {
            Feedback.trigger("impactLight")
            setImageUri(result.assets[0].uri)
        }
    }

    const handleAddressChange = (text: string) => {
        setAddressQuery(text)
        if (searchTimer.current) clearTimeout(searchTimer.current)
        if (!text.trim()) return
        searchTimer.current = setTimeout(async () => {
            setSearching(true)
            try {
                const results = await Location.geocodeAsync(text)
                if (!results.length) return
                const { latitude, longitude } = results[0]
                const newCoords = { latitude, longitude }
                setCoords(newCoords)
                mapRef.current?.animateToRegion({ ...newCoords, ...DELTA }, 500)
            } finally {
                setSearching(false)
            }
        }, 700)
    }

    const handleMarkerDrag = async (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate
        setCoords({ latitude, longitude })
        const places = await Location.reverseGeocodeAsync({ latitude, longitude })
        if (places?.[0]) {
            const label = [places[0].name, places[0].city].filter(Boolean).join(", ")
            setDetectedAddress(label)
            setAddressQuery(label)
        }
    }

    const useCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") return
        Feedback.trigger("impactLight")
        setSearching(true)
        try {
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
            const { latitude, longitude } = pos.coords
            const newCoords = { latitude, longitude }
            setCoords(newCoords)
            mapRef.current?.animateToRegion({ ...newCoords, ...DELTA }, 500)
            const places = await Location.reverseGeocodeAsync({ latitude, longitude })
            if (places?.[0]) {
                const label = [places[0].name, places[0].city].filter(Boolean).join(", ")
                setDetectedAddress(label)
                setAddressQuery(label)
            }
        } finally {
            setSearching(false)
        }
    }

    const handleSave = useCallback(async () => {
        if (!valid || saving) return
        setSaving(true)
        Feedback.trigger("impactMedium")
        try {
            if (isEditing) {
                await updateShop({ variables: { id: shop!.id, input: { name: name.trim() } } })
                if (imageUri) {
                    const fd = new FormData()
                    fd.append("file", { uri: imageUri, type: "image/jpeg", name: "shop.jpg" } as any)
                    await axios.post(Url.API + "/upload/shop/" + shop!.id, fd, {
                        headers: { "Content-Type": "multipart/form-data" },
                    })
                }
            } else {
                const { data } = await createShop({
                    variables: {
                        input: {
                            name: name.trim(),
                            latitude: coords?.latitude,
                            longitude: coords?.longitude,
                        },
                    },
                })
                const newId = data?.createShop?.id
                if (newId && imageUri) {
                    const fd = new FormData()
                    fd.append("file", { uri: imageUri, type: "image/jpeg", name: "shop.jpg" } as any)
                    await axios.post(Url.API + "/upload/shop/" + newId, fd, {
                        headers: { "Content-Type": "multipart/form-data" },
                    })
                }
            }
            navigation.goBack()
        } finally {
            setSaving(false)
        }
    }, [name, imageUri, coords, valid, saving, isEditing])

    useLayoutEffect(() => {
        navigation.setOptions({
            title: isEditing ? "Edit Shop" : "New Shop",
            headerRight: () => (
                <Pressable onPress={handleSave} disabled={!valid || saving} hitSlop={12}>
                    {saving ? (
                        <ActivityIndicator size={18} color={Colors.secondary} />
                    ) : (
                        <Body style={[styles.saveBtn, (!valid || saving) && styles.saveBtnDisabled]}>
                            {isEditing ? "Save" : "Add"}
                        </Body>
                    )}
                </Pressable>
            ),
        })
    }, [handleSave, valid, saving, isEditing])

    const displayImage = imageUri ?? existingImage

    return (
        <SafeAreaView style={styles.safe} edges={[]}>
            <View style={styles.headerDivider} />
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <Pressable onPress={pickImage} style={StyleSheet.absoluteFill}>
                        {displayImage ? (
                            <Image source={{ uri: displayImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                        ) : (
                            <View style={[StyleSheet.absoluteFill, styles.heroPlaceholder]}>
                                <SymbolView name="storefront.fill" size={52} tintColor={Colors.foreground_secondary} />
                                <Caption style={styles.heroPlaceholderLabel}>Tap to add photo</Caption>
                            </View>
                        )}
                    </Pressable>
                    <GlassView style={styles.heroBadge} pointerEvents="none">
                        <Feather name="camera" size={13} color={Colors.foreground} />
                        <Caption style={styles.heroBadgeText}>{displayImage ? "Change photo" : "Add photo"}</Caption>
                    </GlassView>
                    {imageUri && (
                        <Pressable onPress={() => setImageUri(null)} style={styles.heroRemove} hitSlop={8}>
                            <GlassView style={styles.heroRemoveInner}>
                                <Feather name="x" size={14} color={Colors.danger} />
                            </GlassView>
                        </Pressable>
                    )}
                </View>

                <Section title="Shop name" noGap>
                    <View style={styles.nameRow}>
                        <Input
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Lewiatan, Biedronka"
                            autoCapitalize="words"
                            autoFocus={!isEditing}
                            returnKeyType="next"
                            flat
                            containerStyle={{ flex: 1, borderRadius: 0, borderWidth: 0 }}
                            style={styles.nameInput}
                        />
                    </View>
                </Section>

                <Section title="Location">
                    <View style={styles.searchRow}>
                        <Feather
                            name="search"
                            size={16}
                            color={searching ? Colors.secondary : Colors.foreground_secondary}
                            style={{ flexShrink: 0 }}
                        />
                        <Input
                            value={addressQuery}
                            onChangeText={handleAddressChange}
                            placeholder="Search address..."
                            flat
                            containerStyle={styles.searchInput}
                        />
                        <Ripple
                            onPress={useCurrentLocation}
                            style={styles.locateBtn}
                            rippleColor={Color(Colors.secondary).alpha(0.15).string()}
                        >
                            {searching ? (
                                <ActivityIndicator size={16} color={Colors.secondary} />
                            ) : (
                                <SymbolView name="location.fill" size={16} tintColor={Colors.secondary} />
                            )}
                        </Ripple>
                    </View>

                    {coords ? (
                        <>
                            <View style={styles.mapDivider} />
                            <MapView
                                ref={mapRef}
                                provider={PROVIDER_DEFAULT}
                                style={styles.map}
                                initialRegion={{ ...coords, ...DELTA }}
                            >
                                <Marker
                                    coordinate={coords}
                                    draggable
                                    onDragEnd={handleMarkerDrag}
                                    pinColor={Colors.secondary}
                                />
                            </MapView>
                            {detectedAddress && (
                                <View style={styles.addressRow}>
                                    <Feather name="map-pin" size={12} color={Colors.foreground_secondary} />
                                    <Caption style={styles.addressText} numberOfLines={1}>
                                        {detectedAddress}
                                    </Caption>
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={styles.mapEmpty}>
                            <Feather name="map" size={22} color={Colors.foreground_secondary} />
                            <Caption style={styles.mapEmptyText}>Search an address or use your location</Caption>
                        </View>
                    )}
                </Section>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    headerDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    content: {
        padding: 15,
        paddingBottom: 60,
        gap: 20,
    },
    hero: {
        width: "100%",
        height: 200,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: Colors.primary_lighter,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.borderColor,
    },
    heroPlaceholder: {
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    heroPlaceholderLabel: {
        color: Colors.foreground_secondary,
    },
    heroBadge: {
        position: "absolute",
        bottom: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 100,
    },
    heroBadgeText: {
        color: Colors.foreground,
    },
    heroRemove: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    heroRemoveInner: {
        width: 28,
        height: 28,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    nameInput: {
        fontSize: 17,
        fontWeight: "500",
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.borderColor,
    },
    searchInput: {
        flex: 1,
        borderWidth: 0,
        borderRadius: 0,
        backgroundColor: "transparent",
    },
    locateBtn: {
        width: 36,
        height: 36,
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    mapDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.borderColor,
    },
    map: {
        width: Layout.screen.width - 32,
        height: 220,
        alignSelf: "center",
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.borderColor,
    },
    addressText: {
        color: Colors.foreground_secondary,
        flex: 1,
    },
    mapEmpty: {
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 28,
    },
    mapEmptyText: {
        color: Colors.foreground_secondary,
        textAlign: "center",
        paddingHorizontal: 20,
    },
    saveBtn: {
        fontWeight: "600",
        color: Colors.secondary,
        fontSize: 16,
    },
    saveBtnDisabled: {
        opacity: 0.35,
    },
})
