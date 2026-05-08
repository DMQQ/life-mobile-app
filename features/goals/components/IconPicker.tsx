import React from "react"
import { FlatList, StyleSheet, Dimensions } from "react-native"
import { Feather } from "@expo/vector-icons"
import Colors from "@/constants/Colors"
import Ripple from "react-native-material-ripple"
import Text from "@/components/ui/Text/Text"

const ICON_SIZE = 30
const COLUMNS = 4
const windowWidth = Dimensions.get("window").width
const CONTAINER_PADDING = 16
const ITEM_SPACING = 12
const ITEM_SIZE = (windowWidth - CONTAINER_PADDING * 2 - ITEM_SPACING * (COLUMNS - 1)) / COLUMNS

export const goalIcons = [
    "target",
    "activity",
    "book-open",
    "book",
    "music",
    "camera",
    "film",
    "phone",
    "users",
    "coffee",
    "home",
    "heart",
    "clock",
    "code",
    "dollar-sign",
    "moon",
    "sun",
    "droplet",
    "briefcase",
    "shopping-bag",
    "compass",
    "gift",
    "star",
    "award",
    "flag",
    "cloud",
    "smile",
    "tool",
    "zap",
    "anchor",
    "box",
    "shield",
    "thermometer",
    "watch",
    "trending-up",
    "pie-chart",
    "bar-chart-2",
    "clipboard",
    "check-circle",
    "edit",
    "play",
    "stop-circle",
    "map-pin",
    "globe",
    "speaker",
    "key",
] as const

export type GoalIcon = (typeof goalIcons)[number]

interface IconPickerProps {
    value: string
    onChange: (icon: GoalIcon) => void
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
    return (
        <FlatList
            data={goalIcons}
            numColumns={COLUMNS}
            contentContainerStyle={styles.container}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
                <Ripple
                    onPress={() => onChange(item)}
                    style={[styles.iconButton, value === item && styles.selectedIconButton]}
                >
                    <Feather
                        name={item}
                        size={ICON_SIZE}
                        color={value === item ? Colors.foreground : Colors.secondary}
                    />
                    <Text variant="caption" style={{ marginTop: 10, color: Colors.secondary_light_2 }}>
                        {item.replaceAll("-", " ").split(" ").slice(0, 3).join(" ")}
                    </Text>
                </Ripple>
            )}
            keyExtractor={(item) => item}
        />
    )
}

const styles = StyleSheet.create({
    container: {
        padding: CONTAINER_PADDING,
    },
    row: {
        justifyContent: "flex-start",
        marginBottom: ITEM_SPACING,
    },
    iconButton: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        borderRadius: 12,
        backgroundColor: Colors.primary_lighter,
        justifyContent: "center",
        alignItems: "center",
        marginRight: ITEM_SPACING,
    },
    selectedIconButton: {
        backgroundColor: Colors.secondary,
    },
})

export const isValidGoalIcon = (icon: string): icon is GoalIcon => {
    return goalIcons.includes(icon as GoalIcon)
}
