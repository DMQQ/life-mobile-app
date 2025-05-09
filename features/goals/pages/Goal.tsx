import { View, Text, StyleSheet, FlatList } from "react-native";
import moment from "moment";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Header from "@/components/ui/Header/Header";
import Input from "@/components/ui/TextInput/TextInput";
import { useMemo, useState } from "react";
import IconButton from "@/components/ui/IconButton/IconButton";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useGetGoal, useGoal } from "../hooks/hooks";
import Layout from "@/constants/Layout";
import Colors, { secondary_candidates } from "@/constants/Colors";
import Color from "color";
import DayEntry from "../components/GoalEntry";
import Button from "@/components/ui/Button/Button";
import GitHubActivityGrid from "../components/StatGrid";

// Updated Goal component
export default function Goal({ route, navigation }: any) {
  const { id } = route.params;
  const { data: goalData } = useGetGoal(id);

  const goal = goalData?.goal || {};

  const data = useMemo(() => {
    const hasTodayEntry = goal?.entries?.some((entry) => moment(entry.date).isSame(moment(), "day"));

    if (!hasTodayEntry) {
      return [
        {
          id: "new",
          date: moment().toISOString(),
          value: "0",
        },
        ...(goal?.entries || []),
      ];
    }

    return goal?.entries;
  }, [goal]);

  const contributionData = useMemo(() => {
    return goal?.entries?.map((entry) => ({
      date: entry.date,
      count: entry.value,
    }));
  }, [goal.entries]);

  return (
    <View style={{ padding: 0, flex: 1, paddingVertical: 15, paddingBottom: 25 }}>
      <Header goBack />
      <View style={{ paddingHorizontal: 15, flex: 1, paddingTop: 15 }}>
        <View style={{ padding: 10, backgroundColor: Colors.primary_lighter, borderRadius: 10, marginBottom: 15 }}>
          <GitHubActivityGrid contributionData={contributionData} primaryColor={secondary_candidates[0]} goalThreshold={goal.target} />
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <DayEntry index={index} entry={{ ...item, ...goal }} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ marginBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Text style={{ fontSize: 24, fontWeight: "600", color: "#fff" }}>{goal?.name}</Text>
                <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", marginTop: 5 }}>{goal?.description}</Text>
              </View>

              <View style={{ padding: 10, borderRadius: 100, backgroundColor: Colors.secondary }}>
                <MaterialCommunityIcons name={goal?.icon} size={30} color="#fff" style={{ marginLeft: "auto" }} />
              </View>
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
    </View>
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
