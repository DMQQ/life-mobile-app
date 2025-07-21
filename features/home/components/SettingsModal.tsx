import { AnimatedSelector, TextInput } from "@/components"
import Button from "@/components/ui/Button/Button"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
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
    foreground: string
    category: string
}

const colorPalettes: ColorPalette[] = [
    {
        name: "Classic Money",
        primary: "#0D1421",
        secondary: "#00C896",
        ternary: "#FFA726",
        foreground: "#FFFFFF",
        category: "Finance",
    },
    {
        name: "Neon Crypto",
        primary: "#0A0A0A",
        secondary: "#FF0080",
        ternary: "#00FFFF",
        foreground: "#F0F0F0",
        category: "Finance",
    },
    {
        name: "Ocean Savings",
        primary: "#0F1B2E",
        secondary: "#87CEEB",
        ternary: "#FF69B4",
        foreground: "#E8F4F8",
        category: "Finance",
    },
    {
        name: "Purple Wealth",
        primary: "#1A0D1F",
        secondary: "#9D4EDD",
        ternary: "#FFD60A",
        foreground: "#F5F0FF",
        category: "Finance",
    },
    {
        name: "Frost Finance",
        primary: "#0C1618",
        secondary: "#00E5FF",
        ternary: "#B39DDB",
        foreground: "#E0F7FF",
        category: "Finance",
    },
    {
        name: "Ruby Budget",
        primary: "#1F0B0B",
        secondary: "#FF6B6B",
        ternary: "#4ECDC4",
        foreground: "#FFE8E8",
        category: "Finance",
    },
    {
        name: "Gold Standard",
        primary: "#1A1516",
        secondary: "#FFD700",
        ternary: "#CD7F32",
        foreground: "#FFF8DC",
        category: "Finance",
    },
    {
        name: "Mint Minimalist",
        primary: "#151B19",
        secondary: "#98FB98",
        ternary: "#F0E68C",
        foreground: "#F0FFF0",
        category: "Finance",
    },
    {
        name: "Coral Expense",
        primary: "#1A1111",
        secondary: "#FF7F7F",
        ternary: "#40E0D0",
        foreground: "#FFF5F5",
        category: "Finance",
    },
    {
        name: "Steel Money",
        primary: "#1C1C1C",
        secondary: "#B0C4DE",
        ternary: "#FFA500",
        foreground: "#F0F8FF",
        category: "Finance",
    },
    {
        name: "Electric Blue",
        primary: "#0B0F1A",
        secondary: "#1E90FF",
        ternary: "#FFB347",
        foreground: "#E6F3FF",
        category: "Finance",
    },
    {
        name: "Sunset Budget",
        primary: "#1F1611",
        secondary: "#FF8C69",
        ternary: "#20B2AA",
        foreground: "#FFF8F0",
        category: "Finance",
    },
    {
        name: "Emerald Bank",
        primary: "#0F1A0F",
        secondary: "#50C878",
        ternary: "#DA70D6",
        foreground: "#F0FFF4",
        category: "Finance",
    },
    {
        name: "Lavender Ledger",
        primary: "#1A1624",
        secondary: "#E6E6FA",
        ternary: "#FF6347",
        foreground: "#FAF0FF",
        category: "Finance",
    },
    {
        name: "Silver Stack",
        primary: "#181818",
        secondary: "#C0C0C0",
        ternary: "#32CD32",
        foreground: "#F5F5F5",
        category: "Finance",
    },
    {
        name: "Peachy Pay",
        primary: "#1A1613",
        secondary: "#FFCBA4",
        ternary: "#9370DB",
        foreground: "#FFF8F0",
        category: "Finance",
    },
    {
        name: "Turquoise Tracker",
        primary: "#0D1A1A",
        secondary: "#40E0D0",
        ternary: "#F08080",
        foreground: "#F0FFFF",
        category: "Finance",
    },
    {
        name: "Rose Gold Pro",
        primary: "#1F1719",
        secondary: "#E8B4B8",
        ternary: "#87CEEB",
        foreground: "#FFF0F5",
        category: "Finance",
    },
    {
        name: "Amber Account",
        primary: "#1A1608",
        secondary: "#FFBF00",
        ternary: "#8A2BE2",
        foreground: "#FFFBF0",
        category: "Finance",
    },
    {
        name: "Slate Saver",
        primary: "#2F4F4F",
        secondary: "#98FB98",
        ternary: "#FFB6C1",
        foreground: "#F8F8FF",
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
        fontSize: 14,
        fontWeight: "600",
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
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "transparent",
        height: 200,
        width: 60,
    },
    selectedPalette: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 100,
    },
    paletteContent: {
        padding: 8,
        height: "100%",
        justifyContent: "space-between",
    },
    paletteName: {
        color: "#fff",
        fontSize: 9,
        fontWeight: "600",
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
        fontSize: 12,
        fontWeight: "600",
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
        fontSize: 12,
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
                <Text style={styles.paletteName} numberOfLines={1}>
                    {item.name}
                </Text>
                <View style={styles.colorSwatch}>
                    <View style={[styles.colorCircle, { backgroundColor: item.primary }]} />
                    <View style={[styles.colorCircle, { backgroundColor: item.secondary }]} />
                    <View style={[styles.colorCircle, { backgroundColor: item.ternary }]} />
                    <View style={[styles.colorCircle, { backgroundColor: item.foreground }]} />
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

                                            {/* <View style={styles.themeToggle}>
                                                <TouchableOpacity
                                                    style={[styles.toggleButton, !isCustomMode && styles.activeToggle]}
                                                    onPress={() => handleModeToggle(false)}
                                                >
                                                    <Text style={styles.toggleText}>Presets</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.toggleButton, isCustomMode && styles.activeToggle]}
                                                    onPress={() => handleModeToggle(true)}
                                                >
                                                    <Text style={styles.toggleText}>Custom</Text>
                                                </TouchableOpacity>
                                            </View> */}

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
                                            ) : (
                                                <View style={styles.customColorSection}>
                                                    {/* <View style={styles.colorTypeSelector}>
                                                        {(
                                                            ["primary", "secondary", "ternary", "foreground"] as const
                                                        ).map((type) => (
                                                            <TouchableOpacity
                                                                key={type}
                                                                style={[
                                                                    styles.colorTypeButton,
                                                                    activeColorType === type && styles.activeColorType,
                                                                ]}
                                                                onPress={() => setActiveColorType(type)}
                                                            >
                                                                <Text style={styles.colorTypeText}>
                                                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View> */}
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
                                                            <Text style={styles.colorLabel}>Primary</Text>
                                                        </View>
                                                        <View style={{ alignItems: "center" }}>
                                                            <View
                                                                style={[
                                                                    styles.previewColor,
                                                                    { backgroundColor: customColors.secondary },
                                                                ]}
                                                            />
                                                            <Text style={styles.colorLabel}>Secondary</Text>
                                                        </View>
                                                        <View style={{ alignItems: "center" }}>
                                                            <View
                                                                style={[
                                                                    styles.previewColor,
                                                                    { backgroundColor: customColors.ternary },
                                                                ]}
                                                            />
                                                            <Text style={styles.colorLabel}>Ternary</Text>
                                                        </View>
                                                        <View style={{ alignItems: "center" }}>
                                                            <View
                                                                style={[
                                                                    styles.previewColor,
                                                                    { backgroundColor: customColors.foreground },
                                                                ]}
                                                            />
                                                            <Text style={styles.colorLabel}>Foreground</Text>
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
