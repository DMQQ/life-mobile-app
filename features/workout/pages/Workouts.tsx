import { View, Text, FlatList, ScrollView, StyleSheet } from "react-native";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import { WorkoutScreenProps } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import L from "@/constants/Layout";
import { useAppSelector } from "@/utils/redux";
import { useNavigation } from "@react-navigation/native";
import WorkoutTile from "../components/WorkoutTile";
import useGetWorkoutsQuery from "../hooks/useGetWorkouts";
import Menu from "../components/Menu";
import { Workout } from "@/types";

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 70,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workoutButton: {
    padding: 10,
    backgroundColor: "#00BB69",
    borderRadius: 100,
    paddingHorizontal: 15,
  },

  menuButton: {
    padding: 15,
    borderRadius: 100,
    backgroundColor: Colors.secondary,
    marginBottom: 15,
    position: "absolute",
    right: 15,
    bottom: 20,
  },
});

const SearchTab = (props: { onPress: Function }) => {
  const { title, isWorkoutPending, workoutId, currentExercise } = useAppSelector((s) => s.workout);

  const navigation = useNavigation<any>();

  const onPress = () => {
    navigation.navigate("PendingWorkout", {
      workoutId,
      delayTimerStart: 0,
      exerciseId: currentExercise.exerciseId,
    });
  };

  return (
    <View style={styles.header}>
      <View>
        {isWorkoutPending && (
          <Ripple onPress={onPress} style={styles.workoutButton}>
            <Text style={{ color: Colors.text_light }}>Active workout ({title.trim()})</Text>
          </Ripple>
        )}
      </View>

      <Ripple style={{ padding: 10 }} onPress={() => props.onPress()}>
        <Ionicons name="options" size={24} color={Colors.secondary} />
      </Ripple>
    </View>
  );
};

export default function Workouts({ navigation }: WorkoutScreenProps<"Workouts">) {
  const query = useGetWorkoutsQuery();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <SearchTab onPress={() => setIsVisible((p) => !p)} />

      <ScrollView horizontal pagingEnabled scrollEnabled={false}>
        <WorkoutsList navigation={navigation} workouts={query.data?.workouts || []} />
        <View style={{ width: L.screen.width, backgroundColor: "#fff" }}></View>
      </ScrollView>

      <Menu isVisible={isVisible} navigation={navigation} setIsVisible={setIsVisible} />

      {!isVisible && (
        <Ripple onPress={() => setIsVisible((p) => !p)} style={styles.menuButton}>
          <Ionicons color={"#fff"} size={30} name={"menu"} />
        </Ripple>
      )}
    </ScreenContainer>
  );
}

const WorkoutsList = (props: { workouts: Workout[]; navigation: any }) => (
  <View style={{ width: L.screen.width }}>
    <FlatList
      contentContainerStyle={{ paddingHorizontal: 10 }}
      ListFooterComponentStyle={{
        marginTop: 20,
      }}
      data={props.workouts}
      keyExtractor={(item) => item.workoutId}
      renderItem={({ item }) => <WorkoutTile navigation={props.navigation} key={item.workoutId} {...item} />}
    />
  </View>
);
