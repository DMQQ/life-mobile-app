import { View, StyleSheet, Text } from "react-native";
import Colors, { randColor } from "../../../../constants/Colors";
import Color from "color";
import { useAppSelector } from "../../../../utils/redux";
import { useDispatch } from "react-redux";
import ExerciseTile, {
  ExerciseIcon,
} from "../../../../components/Exercise/ExerciseTile/ExerciseTile";
import Ripple from "react-native-material-ripple";
import { useNavigation } from "@react-navigation/native";
import { Padding, Rounded } from "../../../../constants/Layout";
import { AntDesign } from "@expo/vector-icons";

const bg = "#FF1A56";

const styles = StyleSheet.create({
  container: {
    padding: Padding.xxl,
    borderRadius: Rounded.xxl,
    backgroundColor: bg,
    marginTop: 15,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 30,
  },
  button: {
    marginTop: Padding.md,
    padding: Padding.xl,
    backgroundColor: "#fff",
    borderRadius: Rounded.xxl,
  },
  buttonText: {
    fontWeight: "bold",
    color: bg,
    textAlign: "center",
    fontSize: 18,
  },
});

export default function WorkoutWidget() {
  const capitalize = (t: string) => t[0].toLocaleUpperCase() + t.slice(1);

  const workout = useAppSelector((s) => s.workout);

  const navigation = useNavigation();

  const navigateWorkout = () =>
    (navigation as any).navigate("WorkoutScreens", {
      screen: "PendingWorkout",
      params: {
        workoutId: workout.workoutId,
        delayTimerStart: 0,
        exerciseId: workout.currentExercise.exerciseId,
      },
    });

  const exercise = workout.currentExercise;

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "column", marginBottom: 10 }}>
        <Text style={styles.title}>Active workout</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
            {capitalize(workout.title)}
          </Text>
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
            {workout.activeExerciseIndex + 1} out of {workout.exercises.length}
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: "#ffffff25",
          borderRadius: Rounded.xxl,
          padding: Padding.md,
          flexDirection: "row",
        }}
      >
        <ExerciseIcon name={exercise.title as any} />
        <View style={{ paddingHorizontal: Padding.md, flex: 1 }}>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
            {exercise.title}
          </Text>
          <Text style={{ color: "#fff", fontWeight: "400", fontSize: 14 }}>
            {exercise.muscleGroup}
          </Text>
        </View>
        <View style={{ justifyContent: "center" }}>
          <Ripple
            onPress={navigateWorkout}
            style={{
              borderRadius: 100,
              marginRight: 5,
            }}
          >
            <AntDesign name="play" color={"#fff"} size={45} />
          </Ripple>
        </View>
      </View>
    </View>
  );
}
