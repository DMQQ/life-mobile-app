import { View, StyleSheet, Text } from "react-native";
import Colors from "../../../../constants/Colors";
import Color from "color";
import { useAppSelector } from "../../../../utils/redux";
import { useDispatch } from "react-redux";
import ExerciseTile from "../../../../components/Exercise/ExerciseTile/ExerciseTile";
import Ripple from "react-native-material-ripple";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: Color(Colors.primary).lighten(0.5).string(),
    marginTop: 15,
  },
  title: {
    color: Colors.secondary,
    fontWeight: "bold",
    fontSize: 25,
  },
});

export default function WorkoutWidget() {
  const capitalize = (t: string) => t[0].toLocaleUpperCase() + t.slice(1);

  const workout = useAppSelector((s) => s.workout);

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "column" }}>
        <Text style={styles.title}>{capitalize(workout.title)}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={{ color: "lightgreen", fontSize: 12, fontWeight: "bold" }}
          >
            PENDING WORKOUT
          </Text>
          <Text
            style={{ color: "lightgreen", fontSize: 12, fontWeight: "bold" }}
          >
            {workout.activeExerciseIndex} out of {workout.exercises.length}
          </Text>
        </View>
      </View>

      <ExerciseTile
        tileIndex={0}
        {...workout.currentExercise}
        onPress={() => {}}
      />

      <Ripple
        onPress={() =>
          (navigation as any).navigate("WorkoutScreens", {
            screen: "PendingWorkout",
            params: {
              workoutId: workout.workoutId,
              delayTimerStart: 0,
              exerciseId: workout.currentExercise.exerciseId,
            },
          })
        }
        style={{
          padding: 7.5,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            color: Colors.secondary,
            textAlign: "center",
            fontSize: 18,
          }}
        >
          Continue workout
        </Text>
      </Ripple>
    </View>
  );
}
