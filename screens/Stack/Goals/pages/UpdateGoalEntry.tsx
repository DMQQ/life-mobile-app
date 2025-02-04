import Button from "@/components/ui/Button/Button";
import Header from "@/components/ui/Header/Header";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput } from "react-native";
import { View } from "react-native";
import { useGoal } from "../hooks/hooks";
import { useState } from "react";
import Colors from "@/constants/Colors";
import Layout from "@/constants/Layout";
import IconButton from "@/components/ui/IconButton/IconButton";
import moment from "moment";

const quickActions = {
  target: [{ label: "1 goal", value: 1 }],
  dumbbell: [
    { label: "30 mins", value: 30 },
    { label: "1 hour", value: 60 },
    { label: "100 reps", value: 100 },
  ],
  run: [
    { label: "2km", value: 2 },
    { label: "5km", value: 5 },
    { label: "10km", value: 10 },
  ],
  bike: [
    { label: "5km", value: 5 },
    { label: "10km", value: 10 },
    { label: "20km", value: 20 },
  ],
  meditation: [
    { label: "10 min", value: 10 },
    { label: "20 min", value: 20 },
    { label: "30 min", value: 30 },
  ],
  "food-apple": [
    { label: "Snack", value: 200 },
    { label: "Meal", value: 600 },
    { label: "Day", value: 2000 },
  ],
  water: [
    { label: "Cup", value: 250 },
    { label: "500ml", value: 500 },
    { label: "1L", value: 1000 },
  ],
  "book-open-page-variant": [
    { label: "10 pages", value: 10 },
    { label: "Chapter", value: 25 },
    { label: "Hour", value: 60 },
  ],
  brain: [
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "1 hour", value: 60 },
  ],
  cash: [
    { label: "$10", value: 10 },
    { label: "$50", value: 50 },
    { label: "$100", value: 100 },
  ],
  "heart-pulse": [
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "60 min", value: 60 },
  ],
  "bed-clock": [
    { label: "7h", value: 7 },
    { label: "8h", value: 8 },
    { label: "9h", value: 9 },
  ],
  "language-javascript": [
    { label: "30 min", value: 30 },
    { label: "1h", value: 60 },
    { label: "Problem", value: 1 },
  ],
  "code-tags": [
    { label: "Bug fix", value: 1 },
    { label: "Feature", value: 1 },
    { label: "Hour", value: 60 },
  ],
  music: [
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "Song", value: 1 },
  ],
  coffee: [
    { label: "Cup", value: 1 },
    { label: "ml", value: 200 },
  ],
  "smoking-off": [
    { label: "Day", value: 1 },
    { label: "Week", value: 7 },
  ],
  weight: [
    { label: "-0.5kg", value: -0.5 },
    { label: "-1kg", value: -1 },
  ],
  yoga: [
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "1h", value: 60 },
  ],
  pill: [
    { label: "Dose", value: 1 },
    { label: "Day", value: 1 },
  ],
} as const;
export default function AddGoalEntry({ route, navigation }: any) {
  const { id } = route.params;
  const { goals, upsertStats } = useGoal();
  const goal = goals.find((goal) => goal.id === id);
  const [value, setValue] = useState("");

  // @ts-ignore
  const quickValues = quickActions[goal?.icon as any] || [];

  const handleSubmit = () => {
    if (!goal || !value) return;

    upsertStats({
      variables: {
        goalsId: goal.id,
        value: +value,
        date: moment().format("YYYY-MM-DD"),
      },
      refetchQueries: ["GetGoals"],
      onError: (error) => console.error(JSON.stringify(error, null, 2)),
      onCompleted: () => navigation.goBack(),
    });
  };

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <Header goBack title="Add Entry" />

      <View style={styles.container}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ width: Layout.screen.width, justifyContent: "center", alignItems: "center" }}>
            <View
              style={{
                padding: 20,
                borderRadius: 100,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors.primary_lighter,
                marginBottom: 20,
                width: 130,
                height: 130,
              }}
            >
              <MaterialCommunityIcons name={goal?.icon || "close"} size={90} color={Colors.secondary} style={styles.icon} />
            </View>
          </View>

          <View style={{ marginBottom: 30 }}>
            <Text style={styles.title}>{goal?.name}</Text>
            <Text style={[styles.unit, { textAlign: "center" }]}>{goal?.unit}</Text>
          </View>

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: Colors.primary_lighter,
                borderRadius: 60,
                borderWidth: 2,
                borderColor: Colors.secondary,
                position: "relative",
              },
            ]}
          >
            <TextInput
              placeholderTextColor={Colors.secondary}
              placeholder="Enter value"
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              style={{
                width: Layout.screen.width / 1.8,
                fontSize: 18,
                textAlign: "center",
                padding: 15,
                color: Colors.secondary,
              }}
            />
            <IconButton
              style={{ backgroundColor: Colors.secondary, padding: 10, borderRadius: 100, position: "absolute", right: 0 }}
              icon={<AntDesign size={30} name="save" color="#fff" />}
            />
          </View>

          <View style={styles.quickValues}>
            {quickValues.map((item) => (
              <Button key={item.label} onPress={() => setValue(item.value.toString())} variant="primary" style={styles.quickButton}>
                {item.label}
              </Button>
            ))}
          </View>
        </View>

        <Button onPress={handleSubmit} style={styles.button}>
          Save Entry
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // ... previous styles
  quickValues: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
    width: "100%",
  },
  quickButton: {
    borderRadius: 15,
    backgroundColor: Colors.primary_lighter,
    padding: 15,
  },
  container: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {},
  title: {
    fontSize: 30,
    fontWeight: "600",
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  unit: {
    color: "#fff",
    fontSize: 16,
    zIndex: 10,
  },
  button: {
    marginTop: 20,
    width: "100%",
    borderRadius: 100,
    padding: 17.5,
  },
});
