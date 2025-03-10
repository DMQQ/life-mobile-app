import { View, Text, StyleSheet, FlatList } from "react-native";
import moment from "moment";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Header from "@/components/ui/Header/Header";
import Input from "@/components/ui/TextInput/TextInput";
import { useMemo, useState } from "react";
import IconButton from "@/components/ui/IconButton/IconButton";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useGoal } from "../hooks/hooks";
import Layout from "@/constants/Layout";
import Colors from "@/constants/Colors";
import Color from "color";
import DayEntry from "../components/GoalEntry";
import Button from "@/components/ui/Button/Button";

// Updated Goal component
export default function Goal({ route, navigation }: any) {
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

  const data = useMemo(() => {
    const hasTodayEntry = goal?.entries.some((entry) => moment(entry.date).isSame(moment(), "day"));

    if (!hasTodayEntry) {
      return [
        {
          id: "new",
          date: moment().toISOString(),
          value: "0",
        },
        ...goal?.entries,
      ];
    }

    return goal?.entries;
  }, [goals]);

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <Header goBack />
      <View style={{ paddingHorizontal: 15, flex: 1, paddingTop: 15 }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={goal?.icon || "close"} size={90} color={Colors.secondary} />
          </View>
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <DayEntry index={index} entry={{ ...item, ...goal }} />}
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
        <Button
          onPress={() => {
            navigation.navigate("UpdateGoalEntry", { id });
          }}
          style={{ borderRadius: 100, marginTop: 15 }}
        >
          Update today's entry
        </Button>
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

  iconContainer: {
    padding: 20,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary_lighter,
    marginBottom: 20,
    width: 130,
    height: 130,
  },
});
