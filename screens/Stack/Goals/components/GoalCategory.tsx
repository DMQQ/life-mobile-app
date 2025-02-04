import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";
import Color from "color";
import Ripple from "react-native-material-ripple";
import DayEntry from "./GoalEntry";

interface GoalCategoryProps {
  id: string;
  name: string;
  icon: string;
  description: string;
  onPress?: () => void;
  entries?: {
    id: string;
    value: number;
    date: string;
  }[];
}

export const GoalCategory = ({ name, icon, description, entries = [], onPress, ...rest }: GoalCategoryProps) => {
  const latestValue = entries[entries.length - 1]?.value;

  return (
    <Ripple onPress={onPress} style={styles.container}>
      <View
        style={[
          styles.header,
          latestValue
            ? {
                marginBottom: 15,
              }
            : {},
        ]}
      >
        <Text style={styles.icon}>
          <MaterialCommunityIcons name={icon as any} size={24} color="#fff" />
        </Text>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      <DayEntry entry={{ id: "", value: latestValue || 0, date: new Date().toISOString(), ...rest }} />
    </Ripple>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Color(Colors.primary_lighter).lighten(1).hex(),
    backgroundColor: Colors.primary_lighter,
    padding: 15,
    gap: 15,

    marginBottom: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  icon: {
    fontSize: 24,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  description: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});
