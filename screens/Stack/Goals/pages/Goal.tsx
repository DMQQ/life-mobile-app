import { View, Text, StyleSheet, FlatList } from "react-native";
import moment from "moment";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Header from "@/components/ui/Header/Header";
import Input from "@/components/ui/TextInput/TextInput";
import { useState } from "react";
import IconButton from "@/components/ui/IconButton/IconButton";
import { AntDesign } from "@expo/vector-icons";
import { useGoal } from "../hooks/hooks";
import Layout from "@/constants/Layout";
import Colors from "@/constants/Colors";
import Color from "color";
import DayEntry from "../components/GoalEntry";

// Updated Goal component
export default function Goal({ route, navigation }) {
  const { id } = route.params;
  const { goals, upsertStats } = useGoal();
  const goal = goals.find((goal) => goal.id === id);
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value) return;

    upsertStats({
      variables: {
        goalsId: id,
        value: parseFloat(value),
        date: moment().toISOString(),
      },
    });
    setValue("");
  };

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <Header goBack />
      <View style={{ padding: 15, flex: 1 }}>
        <View style={styles.inputContainer}>
          <Input
            placeholder="Update your stats"
            style={{ flex: 1, width: Layout.screen.width - 30 }}
            label="Update your stats"
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            right={<IconButton icon={<AntDesign name="plus" size={24} color="#fff" />} onPress={handleSubmit} />}
          />
        </View>

        <FlatList
          data={goal?.entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DayEntry entry={{ ...item, ...goal }} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 24, fontWeight: "600", color: "#fff" }}>{goal?.name}</Text>
              <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", marginTop: 5 }}>{goal?.description}</Text>
            </View>
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No entries yet</Text>}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 20,
  },
  list: {
    gap: 12,
  },
  dayContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Color(Colors.primary_lighter).lighten(1).hex(),
    backgroundColor: Colors.primary_lighter,
  },
  dateSection: {
    alignItems: "center",
    minWidth: 50,
  },
  day: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  currentDay: {
    color: "#2196F3",
  },
  month: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  valueContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  value: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});
