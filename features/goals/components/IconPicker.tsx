import React from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, Dimensions, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";

const ICON_SIZE = 30;
const COLUMNS = 4;
const windowWidth = Dimensions.get("window").width;
const CONTAINER_PADDING = 16;
const ITEM_SPACING = 12;
const ITEM_SIZE = (windowWidth - CONTAINER_PADDING * 2 - ITEM_SPACING * (COLUMNS - 1)) / COLUMNS;

export const goalIcons = [
  "target",
  "dumbbell",
  "run",
  "bike",
  "meditation",
  "food-apple",
  "water",
  "book-open-page-variant",
  "brain",
  "cash",
  "heart-pulse",
  "clock-time-four",
  "bed-clock",
  "language-javascript",
  "code-tags",
  "palette",
  "music",
  "camera",
  "movie",
  "phone",
  "email",
  "account-group",
  "coffee",
  "smoking-off",
  "weight",
  "yoga",
  "pill",
  "home",
  "lightbulb",
  "school",
  "guitar",
  "dog",
  "cat",
  "swim",
  "basketball",
  "soccer",
] as const;

export type GoalIcon = (typeof goalIcons)[number];

interface IconPickerProps {
  value: string;
  onChange: (icon: GoalIcon) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <FlatList
      data={goalIcons}
      numColumns={COLUMNS}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <Ripple onPress={() => onChange(item)} style={[styles.iconButton, value === item && styles.selectedIconButton]}>
          <MaterialCommunityIcons name={item as any} size={ICON_SIZE} color={value === item ? Colors.foreground : Colors.secondary} />
          <Text style={{ marginTop: 10, color: Colors.secondary_light_2, fontSize: 13, textAlign: "center" }}>
            {item.replaceAll("-", " ").split(" ").slice(0, 3).join(" ")}
          </Text>
        </Ripple>
      )}
      keyExtractor={(item) => item}
    />
  );
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
    backgroundColor: "#3b82f6", // You can change this to match your theme
  },
});

// Helper function for validation
export const isValidGoalIcon = (icon: string): icon is GoalIcon => {
  return goalIcons.includes(icon as GoalIcon);
};
