import Button from "@/components/ui/Button/Button"
import Colors from "@/constants/Colors"
import useUser from "@/utils/hooks/useUser"
import { AntDesign } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { reloadAppAsync } from "expo"
import { BlurView } from "expo-blur"
import * as SecureStore from "expo-secure-store"
import { useState } from "react"
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"

interface ColorPalette {
    name: string
    primary: string
    secondary: string
    ternary: string
    category: string
}

const colorPalettes: ColorPalette[] = [
    // Popular Apps
    {
        name: "Discord",
        primary: "#2C2F33",
        secondary: "#7289DA",
        ternary: "#99AAB5",
        category: "Apps",
    },
    {
        name: "Spotify",
        primary: "#191414",
        secondary: "#1DB954",
        ternary: "#1ED760",
        category: "Apps",
    },
    {
        name: "GitHub",
        primary: "#0D1117",
        secondary: "#238636",
        ternary: "#F85149",
        category: "Apps",
    },
    {
        name: "Slack",
        primary: "#1A1D29",
        secondary: "#4A154B",
        ternary: "#ECB22E",
        category: "Apps",
    },
    {
        name: "VS Code",
        primary: "#1E1E1E",
        secondary: "#007ACC",
        ternary: "#FF6B35",
        category: "Apps",
    },
    {
        name: "Twitter X",
        primary: "#15202B",
        secondary: "#1DA1F2",
        ternary: "#657786",
        category: "Apps",
    },

    // Material Design
    {
        name: "Material Dark",
        primary: "#121212",
        secondary: "#BB86FC",
        ternary: "#03DAC6",
        category: "Material",
    },
    {
        name: "Material Blue",
        primary: "#1A1A1A",
        secondary: "#2196F3",
        ternary: "#FF5722",
        category: "Material",
    },
    {
        name: "Material Purple",
        primary: "#121212",
        secondary: "#9C27B0",
        ternary: "#4CAF50",
        category: "Material",
    },

    // Dark Themes
    {
        name: "Midnight Steel",
        primary: "#0d0f14",
        secondary: "#00C896",
        ternary: "#7B84FF",
        category: "Dark",
    },
    {
        name: "Obsidian Blue",
        primary: "#1C2128",
        secondary: "#00BFFF",
        ternary: "#8685EF",
        category: "Dark",
    },
    {
        name: "Charcoal Dreams",
        primary: "#1C1C1C",
        secondary: "#F6B161",
        ternary: "#DB56F9",
        category: "Dark",
    },
    {
        name: "Deep Sea",
        primary: "#001F3F",
        secondary: "#00B894",
        ternary: "#AEEEEE",
        category: "Dark",
    },
    {
        name: "Cyber Noir",
        primary: "#0B0D11",
        secondary: "#00FFA3",
        ternary: "#FF1A56",
        category: "Dark",
    },
    {
        name: "Raven Wing",
        primary: "#161A1F",
        secondary: "#34FA85",
        ternary: "#6056F9",
        category: "Dark",
    },
    {
        name: "Forest Dusk",
        primary: "#2E3A24",
        secondary: "#6B8E23",
        ternary: "#A9DFBF",
        category: "Dark",
    },
    {
        name: "Stormy Night",
        primary: "#2F3640",
        secondary: "#D63031",
        ternary: "#00BFFF",
        category: "Dark",
    },
    {
        name: "Violet Shadow",
        primary: "#1A1D24",
        secondary: "#BE15A8",
        ternary: "#F9F156",
        category: "Dark",
    },
    {
        name: "Arctic Steel",
        primary: "#12141A",
        secondary: "#56E4F9",
        ternary: "#C2E7FF",
        category: "Dark",
    },
    {
        name: "Ember Dark",
        primary: "#101217",
        secondary: "#FFA51A",
        ternary: "#F95656",
        category: "Dark",
    },
    {
        name: "Sapphire Night",
        primary: "#0C0E13",
        secondary: "#008CFF",
        ternary: "#34A3FA",
        category: "Dark",
    },

    // Gaming & Tech
    {
        name: "Neo Tokyo",
        primary: "#111418",
        secondary: "#FF0080",
        ternary: "#00FFFF",
        category: "Gaming",
    },
    {
        name: "Matrix",
        primary: "#000000",
        secondary: "#00FF41",
        ternary: "#008F11",
        category: "Gaming",
    },
    {
        name: "Tron Legacy",
        primary: "#0A0A0A",
        secondary: "#6FC3DF",
        ternary: "#FFF200",
        category: "Gaming",
    },
    {
        name: "Cyberpunk",
        primary: "#1A0B33",
        secondary: "#E842A5",
        ternary: "#42E8E8",
        category: "Gaming",
    },

    // Luxury & Premium
    {
        name: "Royal Depth",
        primary: "#0A0B0F",
        secondary: "#4B0082",
        ternary: "#9370DB",
        category: "Luxury",
    },
    {
        name: "Gold Standard",
        primary: "#1A1516",
        secondary: "#FFD700",
        ternary: "#CD7F32",
        category: "Luxury",
    },
    {
        name: "Platinum Elite",
        primary: "#2A2A2A",
        secondary: "#E5E4E2",
        ternary: "#C0C0C0",
        category: "Luxury",
    },
    {
        name: "Rose Gold",
        primary: "#1E1E1E",
        secondary: "#E8B4B8",
        ternary: "#F7CAC9",
        category: "Luxury",
    },
]

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    blurBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        paddingTop: 60,
    },
    modalTitle: {
        color: Colors.text_light,
        fontSize: 18,
        fontWeight: "bold",
    },
    closeButton: {
        padding: 8,
    },
    settingsContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    content: {
        flex: 1,
        padding: 15,
    },
    profileSection: {
        flex: 1,
    },
    profileCard: {
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 25,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    profileContent: {
        padding: 20,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    signedAsText: {
        color: "#fff",
        fontSize: 25,
        fontWeight: "bold",
    },
    emailText: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 5,
    },
    themeSection: {
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    themeSectionContent: {
        padding: 20,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    themeSectionTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 20,
    },
    categoryHeader: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: 14,
        fontWeight: "600",
        marginTop: 15,
        marginBottom: 10,
        textTransform: "uppercase",
    },
    paletteGrid: {
        marginBottom: 20,
    },
    paletteRow: {
        justifyContent: "space-around",
        marginBottom: 8,
    },
    paletteItem: {
        width: 150,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "transparent",
        height: 80,
    },
    selectedPalette: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 20,
    },
    paletteContent: {
        padding: 8,
        height: "100%",
        justifyContent: "space-between",
    },
    paletteName: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "600",
        marginBottom: 10,
    },
    colorSwatch: {
        flexDirection: "row",
        gap: 3,
    },
    colorCircle: {
        width: 40,
        height: 40,
        borderRadius: 40,
        borderWidth: 0.5,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    signoutButtonContainer: {
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 0, 0, 0.3)",
    },
})

interface SettingsModalProps {
    visible: boolean
    onClose: () => void
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
    const { removeUser, user } = useUser()
    const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null)

    const handleSignout = async () => {
        await removeUser()

        let keys = await AsyncStorage.getAllKeys()
        keys = keys.filter((key) => !key.startsWith("color_scheme"))
        await AsyncStorage.multiRemove(keys)

        onClose()
    }

    const setCustomTheme = async (palette: ColorPalette) => {
        await SecureStore.setItemAsync("color_scheme_primary", palette.primary)
        await SecureStore.setItemAsync("color_scheme_secondary", palette.secondary)
        await SecureStore.setItemAsync("color_scheme_ternary", palette.ternary)
        await reloadAppAsync()
    }

    const handleClose = () => {
        Feedback.trigger("impactLight")
        onClose()
    }

    const handleApplyTheme = async () => {
        if (selectedPalette) {
            Feedback.trigger("impactMedium")
            await setCustomTheme(selectedPalette)
        }
    }

    const handlePaletteSelect = (palette: ColorPalette) => {
        Feedback.trigger("selection")
        setSelectedPalette(palette)
    }

    const groupedPalettes = colorPalettes.reduce(
        (acc, palette) => {
            if (!acc[palette.category]) {
                acc[palette.category] = []
            }
            acc[palette.category].push(palette)
            return acc
        },
        {} as Record<string, ColorPalette[]>,
    )

    const renderPaletteItem = ({ item }: { item: ColorPalette }) => (
        <Ripple
            onPress={() => handlePaletteSelect(item)}
            style={[styles.paletteItem, selectedPalette?.name === item.name && styles.selectedPalette]}
        >
            <View style={styles.paletteContent}>
                <Text style={styles.paletteName} numberOfLines={2}>
                    {item.name}
                </Text>
                <View style={styles.colorSwatch}>
                    <View style={[styles.colorCircle, { backgroundColor: item.primary }]} />
                    <View style={[styles.colorCircle, { backgroundColor: item.secondary }]} />
                    <View style={[styles.colorCircle, { backgroundColor: item.ternary }]} />
                </View>
            </View>
        </Ripple>
    )

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="overFullScreen"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalContainer}>
                <BlurView intensity={80} tint="dark" style={styles.blurBackground} />
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Settings</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <AntDesign name="close" size={24} color={Colors.text_light} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.settingsContainer}>
                        <ScrollView
                            style={styles.content}
                            showsVerticalScrollIndicator={false}
                            keyboardDismissMode={"on-drag"}
                        >
                            <View style={styles.profileSection}>
                                <View style={styles.profileCard}>
                                    <BlurView intensity={60} tint="dark">
                                        <View style={styles.profileContent}>
                                            <Text style={styles.signedAsText}>Signed as</Text>
                                            <Text style={styles.emailText}>{user?.email}</Text>
                                        </View>
                                    </BlurView>
                                </View>

                                <View style={styles.themeSection}>
                                    <BlurView intensity={60} tint="dark">
                                        <View style={styles.themeSectionContent}>
                                            <Text style={styles.themeSectionTitle}>Choose Color Palette</Text>

                                            <View style={styles.paletteGrid}>
                                                {Object.entries(groupedPalettes).map(([category, palettes]) => (
                                                    <View key={category}>
                                                        <Text style={styles.categoryHeader}>{category}</Text>
                                                        <FlatList
                                                            horizontal
                                                            data={palettes}
                                                            renderItem={renderPaletteItem}
                                                            keyExtractor={(item) => item.name}
                                                            showsVerticalScrollIndicator={false}
                                                        />
                                                    </View>
                                                ))}
                                            </View>

                                            <Button
                                                style={{ marginTop: 20 }}
                                                onPress={handleApplyTheme}
                                                disabled={!selectedPalette}
                                            >
                                                Apply Selected Palette
                                            </Button>
                                        </View>
                                    </BlurView>
                                </View>

                                <Button
                                    fontStyle={{ fontSize: 16 }}
                                    onPress={handleSignout}
                                    style={{
                                        marginTop: 30,
                                        backgroundColor: "rgba(220, 53, 69, 0.8)",
                                    }}
                                >
                                    Signout 👋
                                </Button>

                                <View style={{ padding: 30 }} />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    )
}
