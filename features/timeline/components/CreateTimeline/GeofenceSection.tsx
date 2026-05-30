import Text from "@/components/ui/Text/Text"
import Section from "@/components/ui/Section"
import Input from "@/components/ui/TextInput/TextInput"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { Feather } from "@expo/vector-icons"
import Color from "color"
import { Menu, Button, Host } from "@expo/ui/swift-ui"
import * as Location from "expo-location"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, StyleSheet, Switch, View } from "react-native"
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from "react-native-maps"
import { getGeofence } from "../../utils/geofenceStorage"

export type GeofenceConfig = {
    latitude: number
    longitude: number
    radius: number
    address: string
}

type Props = {
    value: GeofenceConfig | null
    onChange: (v: GeofenceConfig | null) => void
    occurrenceId?: string
}

const RADIUS_OPTIONS = [
    { label: "100 m", value: 100 },
    { label: "250 m", value: 250 },
    { label: "500 m", value: 500 },
    { label: "1 km", value: 1000 },
]

const DELTA = { latitudeDelta: 0.008, longitudeDelta: 0.008 }

function formatRadius(r: number) {
    return r >= 1000 ? `${r / 1000} km` : `${r} m`
}

export default function GeofenceSection({ value, onChange, occurrenceId }: Props) {
    const [enabled, setEnabled] = useState(false)
    const [query, setQuery] = useState("")
    const [searching, setSearching] = useState(false)
    const mapRef = useRef<MapView>(null)
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (!occurrenceId) return
        getGeofence(occurrenceId).then((stored) => {
            if (!stored) return
            const cfg: GeofenceConfig = {
                latitude: stored.latitude,
                longitude: stored.longitude,
                radius: stored.radius,
                address: stored.address,
            }
            onChange(cfg)
            setEnabled(true)
            setQuery(stored.address)
        })
    }, [occurrenceId])

    const toggle = (on: boolean) => {
        setEnabled(on)
        if (!on) {
            onChange(null)
            return
        }
        Location.requestForegroundPermissionsAsync().then(({ status }) => {
            if (status !== "granted") return
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then((pos) => {
                const { latitude, longitude } = pos.coords
                const cfg: GeofenceConfig = { latitude, longitude, radius: 250, address: "" }
                onChange(cfg)
                mapRef.current?.animateToRegion({ ...cfg, ...DELTA }, 600)
                Location.reverseGeocodeAsync({ latitude, longitude }).then(([place]) => {
                    if (!place) return
                    const label = [place.name, place.city].filter(Boolean).join(", ")
                    setQuery(label)
                    onChange({ ...cfg, address: label })
                })
            })
        })
    }

    const search = (text: string) => {
        setQuery(text)
        if (searchTimer.current) clearTimeout(searchTimer.current)
        if (!text.trim()) return
        searchTimer.current = setTimeout(async () => {
            setSearching(true)
            try {
                const results = await Location.geocodeAsync(text)
                if (!results.length) return
                const { latitude, longitude } = results[0]
                const cfg: GeofenceConfig = { latitude, longitude, radius: value?.radius ?? 250, address: text }
                onChange(cfg)
                mapRef.current?.animateToRegion({ latitude, longitude, ...DELTA }, 600)
            } finally {
                setSearching(false)
            }
        }, 700)
    }

    const onMarkerDrag = (e: any) => {
        const { latitude, longitude } = e.nativeEvent.coordinate
        onChange({ latitude, longitude, radius: value?.radius ?? 250, address: query })
        Location.reverseGeocodeAsync({ latitude, longitude }).then(([place]) => {
            if (!place) return
            const label = [place.name, place.city].filter(Boolean).join(", ")
            setQuery(label)
            onChange({ latitude, longitude, radius: value?.radius ?? 250, address: label })
        })
    }

    return (
        <Section title="Geofence">
            <View style={styles.toggleRow}>
                <View style={styles.toggleLeft}>
                    <Feather
                        name="map-pin"
                        size={16}
                        color={enabled ? Colors.secondary : Colors.foreground_secondary}
                    />
                    <Text variant="subtitle" style={enabled ? styles.activeLabel : undefined}>
                        Notify when nearby
                    </Text>
                </View>
                <Switch
                    value={enabled}
                    onValueChange={toggle}
                    trackColor={{ false: Colors.primary_lighter, true: Colors.secondary }}
                    thumbColor={Colors.foreground}
                />
            </View>

            {enabled && (
                <>
                    <View style={styles.divider} />

                    <View style={styles.searchRow}>
                        <Input
                            value={query}
                            onChangeText={search}
                            placeholder="Search address..."
                            flat
                            containerStyle={styles.searchInput}
                            style={{ marginBottom: 0 }}
                        />

                        <View style={styles.menuHost}>
                            <Host style={{ height: 35 }}>
                                <Menu label={value ? formatRadius(value.radius) : "Radius"}>
                                    {RADIUS_OPTIONS.map((opt) => (
                                        <Button
                                            key={opt.value}
                                            label={opt.label}
                                            onPress={() => value && onChange({ ...value, radius: opt.value })}
                                        />
                                    ))}
                                </Menu>
                            </Host>
                        </View>
                    </View>

                    {value && (
                        <View style={styles.mapContainer}>
                            <MapView
                                ref={mapRef}
                                provider={PROVIDER_DEFAULT}
                                style={styles.map}
                                initialRegion={{ ...value, ...DELTA }}
                            >
                                <Marker
                                    coordinate={{ latitude: value.latitude, longitude: value.longitude }}
                                    draggable
                                    onDragEnd={onMarkerDrag}
                                    pinColor={Colors.secondary}
                                />
                                <Circle
                                    center={{ latitude: value.latitude, longitude: value.longitude }}
                                    radius={value.radius}
                                    strokeColor={Colors.secondary}
                                    fillColor={Color(Colors.secondary).alpha(0.15).string()}
                                    strokeWidth={1.5}
                                />
                            </MapView>
                        </View>
                    )}
                </>
            )}
        </Section>
    )
}

const styles = StyleSheet.create({
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    toggleLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    activeLabel: {
        color: Colors.secondary,
    },
    divider: {
        borderWidth: 0.5,
        borderColor: Colors.borderColor,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 0.5,
        borderColor: Colors.borderColor,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
    },
    menuHost: {
        width: 90,
    },
    mapContainer: {
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    map: {
        width: Layout.screen.width - 50,
        height: 260,
        borderRadius: 16,
        overflow: "hidden",
    },
})
