import { AnimatedSelector, TextInput } from "@/components"
import Button from "@/components/ui/Button/Button"
import Text from "@/components/ui/Text/Text"
import Colors, { defaultColors } from "@/constants/Colors"
import Layout from "@/constants/Layout"
import useUser from "@/utils/hooks/useUser"
import { AntDesign } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { reloadAppAsync } from "expo"
import { BlurView } from "expo-blur"
import * as SecureStore from "expo-secure-store"
import { useState } from "react"
import { FlatList, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Ripple from "react-native-material-ripple"

interface ColorPalette {
    name: string
    primary: string
    secondary: string
    ternary: string
    foreground: string
    category: string
}

const colorPalettes: ColorPalette[] = [
    {
        name: "Default (Dark Mode)",
        primary: defaultColors.primary,
        secondary: defaultColors.secondary,
        ternary: defaultColors.ternary,
        foreground: defaultColors.foreground,
        category: "Finance",
    },
    {
        name: "DMQ dark",
        primary: "#111111",
        secondary: "#00a97f",
        ternary: "#8685ef",
        foreground: "#faf8ff",
        category: "Finance",
    },
    {
        name: "DMQ2 dark",
        primary: "#00001E",
        secondary: "#7985ff",
        ternary: "#128583",
        foreground: "#faf8ff",
        category: "Finance",
    },
    {
        name: "Charcoal Mint",
        primary: "#0D1B1E",
        secondary: "#00FFB3",
        ternary: "#F7C948",
        foreground: "#E6FFF9",
        category: "Finance",
    },
    {
        name: "Noir Emerald",
        primary: "#101415",
        secondary: "#50FA7B",
        ternary: "#FF79C6",
        foreground: "#F8FFF8",
        category: "Finance",
    },
    {
        name: "Graphite Mint",
        primary: "#1A1C1D",
        secondary: "#A3FFD6",
        ternary: "#FFD580",
        foreground: "#F1FFF8",
        category: "Finance",
    },
    {
        name: "Velvet Night",
        primary: "#140D1C",
        secondary: "#C084FC",
        ternary: "#FFD6A5",
        foreground: "#FAF5FF",
        category: "Finance",
    },
    {
        name: "Deep Jade",
        primary: "#0E1A17",
        secondary: "#00DFA2",
        ternary: "#FF9B85",
        foreground: "#E6FFF6",
        category: "Finance",
    },
    {
        name: "Midnight Raven",
        primary: "#08090A",
        secondary: "#FF4C61",
        ternary: "#3DDC97",
        foreground: "#E1E1E1",
        category: "Finance",
    },

    {
        name: "Abyssal Blue",
        primary: "#001526", // very dark blue
        secondary: "#005F8A", // deep cerulean
        ternary: "#00B4EF", // bright sky blue
        foreground: "#E8F9FD", // almost-white cyan
        category: "Finance",
    },

    {
        name: "Neptune Depths",
        primary: "#001F3F", // classic navy-black
        secondary: "#0074D9", // royal blue
        ternary: "#7FDBFF", // light cyan
        foreground: "#ECF7FF", // pale blue-white
        category: "Finance",
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
    },
    emailText: {
        color: "rgba(255,255,255,0.6)",
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
        marginBottom: 20,
    },
    themeToggle: {
        flexDirection: "row",
        marginBottom: 20,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
    },
    activeToggle: {
        backgroundColor: Colors.primary_lighter,
    },
    toggleText: {
        color: "#fff",
    },
    categoryHeader: {
        color: "rgba(255, 255, 255, 0.7)",
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
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "transparent",
        height: 200,
    },
    selectedPalette: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
    },
    paletteContent: {
        padding: 8,
        height: "100%",
        justifyContent: "space-between",
    },
    paletteName: {
        color: "#fff",
        marginBottom: 10,
    },
    colorSwatch: {
        flexDirection: "column",
        gap: 3,
    },
    colorCircle: {
        width: 35,
        height: 35,
        borderRadius: 35,
        borderWidth: 0.5,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    customColorSection: {
        marginBottom: 20,
    },
    colorPickerContainer: {
        marginBottom: 20,
    },
    colorTypeSelector: {
        flexDirection: "row",
        marginBottom: 15,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 8,
        padding: 2,
    },
    colorTypeButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: "center",
    },
    activeColorType: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    colorTypeText: {
        color: "#fff",
    },
    colorPicker: {
        marginBottom: 15,
    },
    colorInput: {},
    quickColors: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 15,
    },
    quickColorItem: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    selectedQuickColor: {
        borderColor: "#fff",
        borderWidth: 3,
    },
    customPreview: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    previewColor: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    colorLabel: {
        color: "rgba(255, 255, 255, 0.7)",
        textAlign: "center",
        marginTop: 5,
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
    const [isCustomMode, setIsCustomMode] = useState(false)
    const [customColors, setCustomColors] = useState({
        primary: "#0D1421",
        secondary: "#00C896",
        ternary: "#FFA726",
        foreground: "#FFFFFF",
    })
    const [activeColorType, setActiveColorType] = useState<"primary" | "secondary" | "ternary" | "foreground">(
        "primary",
    )

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
        await SecureStore.setItemAsync("color_scheme_foreground", palette.foreground)
        await reloadAppAsync()
    }

    const handleClose = () => {
        Feedback.trigger("impactLight")
        onClose()
    }

    const handleApplyTheme = async () => {
        if (isCustomMode) {
            Feedback.trigger("impactMedium")
            await setCustomTheme({
                name: "Custom",
                primary: customColors.primary,
                secondary: customColors.secondary,
                ternary: customColors.ternary,
                foreground: customColors.foreground,
                category: "Custom",
            })
        } else if (selectedPalette) {
            Feedback.trigger("impactMedium")
            await setCustomTheme(selectedPalette)
        }
    }

    const handlePaletteSelect = (palette: ColorPalette) => {
        Feedback.trigger("selection")
        setSelectedPalette(palette)
        setIsCustomMode(false)
    }

    const handleColorChange = (color: string) => {
        setCustomColors((prev) => ({
            ...prev,
            [activeColorType]: color,
        }))
    }

    const isValidHex = (color: string) => {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
    }

    const getQuickColors = () => {
        if (activeColorType === "primary") {
            return ["#0D1421", "#1A1A1A", "#121212", "#0F1419", "#1E1E1E", "#2F2F2F", "#1C1C1C", "#0A0A0A"]
        } else if (activeColorType === "secondary") {
            return ["#00C896", "#FF0080", "#87CEEB", "#9D4EDD", "#00E5FF", "#FF6B6B", "#FFD700", "#98FB98"]
        } else if (activeColorType === "ternary") {
            return ["#FFA726", "#00FFFF", "#FF69B4", "#FFD60A", "#B39DDB", "#4ECDC4", "#CD7F32", "#F0E68C"]
        } else {
            return ["#FFFFFF", "#F5F5F5", "#F0F0F0", "#E8E8E8", "#FAF8FF", "#F8F8FF", "#FFF8F0", "#F0FFF0"]
        }
    }

    const handleModeToggle = (isCustom: boolean) => {
        Feedback.trigger("selection")
        setIsCustomMode(isCustom)
        if (isCustom) {
            setSelectedPalette(null)
        }
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
                <Text variant="caption" style={styles.paletteName} numberOfLines={1}>
                    {item.name}
                </Text>
                <View style={styles.colorSwatch}>
                    {Object.entries(item)
                        .slice(1, 5)
                        .map(([key, value]) => (
                            <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }} key={key}>
                                <View style={[styles.colorCircle, { backgroundColor: value }]} />
                                <Text variant="caption" style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
                                    {value}
                                </Text>
                            </View>
                        ))}
                </View>
            </View>
        </Ripple>
    )

    const canApply = isCustomMode || selectedPalette !== null

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="overFullScreen"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalContainer}>
                <BlurView intensity={40} tint="dark" style={styles.blurBackground} />
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text variant="body" style={styles.modalTitle}>
                            Settings
                        </Text>
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
                                    <BlurView intensity={20} tint="dark">
                                        <View style={styles.profileContent}>
                                            <Text variant="title" style={styles.signedAsText}>
                                                Signed as
                                            </Text>
                                            <Text variant="subheading" style={styles.emailText}>
                                                {user?.email}
                                            </Text>
                                        </View>
                                    </BlurView>
                                </View>

                                <EnabledNotifications />

                                <View style={styles.themeSection}>
                                    <BlurView intensity={20} tint="dark">
                                        <View style={styles.themeSectionContent}>
                                            <Text variant="body" style={styles.themeSectionTitle}>
                                                Choose Color Palette
                                            </Text>

                                            <AnimatedSelector
                                                items={["Presets", "Custom"]}
                                                selectedItem={isCustomMode ? "Custom" : "Presets"}
                                                onItemSelect={(item) => {
                                                    handleModeToggle(item === "Custom")
                                                }}
                                                containerStyle={{
                                                    width: Layout.screen.width - 60,
                                                    backgroundColor: "transparent",
                                                    marginBottom: 20,
                                                }}
                                                buttonWidth={(Layout.screen.width - 70) / 2}
                                                buttonStyle={{ backgroundColor: undefined }}
                                            />

                                            {!isCustomMode ? (
                                                <View style={styles.paletteGrid}>
                                                    {Object.entries(groupedPalettes).map(([category, palettes]) => (
                                                        <View key={category}>
                                                            <Text variant="caption" style={styles.categoryHeader}>
                                                                {category}
                                                            </Text>
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
                                            ) : (
                                                <View style={styles.customColorSection}>
                                                    <AnimatedSelector
                                                        items={["primary", "secondary", "ternary", "foreground"]}
                                                        selectedItem={activeColorType}
                                                        onItemSelect={(item) => setActiveColorType(item as any)}
                                                        containerStyle={{
                                                            width: Layout.screen.width - 60,
                                                            backgroundColor: "transparent",
                                                            marginBottom: 20,
                                                        }}
                                                        buttonWidth={(Layout.screen.width - 70) / 4}
                                                        buttonStyle={{ backgroundColor: undefined }}
                                                        textStyle={{ fontSize: 10 }}
                                                    />

                                                    <View style={styles.colorPickerContainer}>
                                                        <TextInput
                                                            label={`${activeColorType.charAt(0).toUpperCase() + activeColorType.slice(1)} Color`}
                                                            value={customColors[activeColorType]}
                                                            onChangeText={handleColorChange}
                                                            style={styles.colorInput}
                                                        />

                                                        <View style={styles.quickColors}>
                                                            {getQuickColors().map((color) => (
                                                                <TouchableOpacity
                                                                    key={color}
                                                                    style={[
                                                                        styles.quickColorItem,
                                                                        { backgroundColor: color },
                                                                        customColors[activeColorType] === color &&
                                                                            styles.selectedQuickColor,
                                                                    ]}
                                                                    onPress={() => handleColorChange(color)}
                                                                />
                                                            ))}
                                                        </View>
                                                    </View>

                                                    <View style={styles.customPreview}>
                                                        <View style={{ alignItems: "center" }}>
                                                            <View
                                                                style={[
                                                                    styles.previewColor,
                                                                    { backgroundColor: customColors.primary },
                                                                ]}
                                                            />
                                                            <Text variant="caption" style={styles.colorLabel}>
                                                                Primary
                                                            </Text>
                                                        </View>
                                                        <View style={{ alignItems: "center" }}>
                                                            <View
                                                                style={[
                                                                    styles.previewColor,
                                                                    { backgroundColor: customColors.secondary },
                                                                ]}
                                                            />
                                                            <Text variant="caption" style={styles.colorLabel}>
                                                                Secondary
                                                            </Text>
                                                        </View>
                                                        <View style={{ alignItems: "center" }}>
                                                            <View
                                                                style={[
                                                                    styles.previewColor,
                                                                    { backgroundColor: customColors.ternary },
                                                                ]}
                                                            />
                                                            <Text variant="caption" style={styles.colorLabel}>
                                                                Ternary
                                                            </Text>
                                                        </View>
                                                        <View style={{ alignItems: "center" }}>
                                                            <View
                                                                style={[
                                                                    styles.previewColor,
                                                                    { backgroundColor: customColors.foreground },
                                                                ]}
                                                            />
                                                            <Text variant="caption" style={styles.colorLabel}>
                                                                Foreground
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}

                                            <Button
                                                style={{ marginTop: 20 }}
                                                onPress={handleApplyTheme}
                                                disabled={!canApply}
                                            >
                                                {isCustomMode ? "Apply Custom Colors" : "Apply Selected Palette"}
                                            </Button>
                                        </View>
                                    </BlurView>
                                </View>

                                <UpdateButton />

                                <Button2 onPress={handleSignout} color="error" style={{ marginTop: 30 }}>
                                    Signout 👋
                                </Button2>

                                <View style={{ padding: 30 }} />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

import Button2 from "@/components/ui/Button/Button2"
import { useExpoUpdates } from "@/utils/hooks/useExpoUpdate"
import React, { useEffect } from "react"
import EnabledNotifications from "./EnabledNotifications"

export const UpdateButton: React.FC = () => {
    const { isUpdateAvailable, isDownloading, checkForUpdate, downloadAndRestart } = useExpoUpdates()

    useEffect(() => {
        checkForUpdate()
    }, [])

    if (!isUpdateAvailable) return null

    return (
        <Button2 icon="download" onPress={downloadAndRestart} disabled={isDownloading}>
            {isDownloading ? "Updating..." : "Update App"}
        </Button2>
    )
}
